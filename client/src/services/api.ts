// All HTTP calls live here — never fetch() directly in components

import type {
  Problem,
  ProblemDetailResponse,
  ProblemListRow,
  ScreeningDetailResponse,
  ScreeningListRow,
  ScreeningQuestion,
} from "../types/domain";

const STATUS_MESSAGES: Partial<Record<number, string>> = {
  400: "Bad request — check your input",
  401: "Unauthorized — sign in again or check VITE_WAR_ROOM_API_KEY matches server",
  404: "Not found",
  422: "The model returned an unexpected format — try again",
  429: "Rate limited — slow down",
  500: "Server error — try again",
  502: "Server unreachable",
  503: "Service unavailable — try again later",
};

export class ApiError extends Error {
  status: number;
  url: string;

  constructor(status: number, statusText: string, url: string, detail?: string) {
    const fallback =
      STATUS_MESSAGES[status] || `Request failed (${status} ${statusText})`;
    super(typeof detail === "string" && detail.trim() ? detail : fallback);
    this.status = status;
    this.url = url;
  }
}

function buildAuthHeaders(): Record<string, string> {
  const key = import.meta.env.VITE_WAR_ROOM_API_KEY;
  if (!key) return {};
  return { Authorization: `Bearer ${key}` };
}

let unauthorizedHandler: (() => void) | null = null;

/** Clears app shell to login when a protected API returns 401 (session expired). */
export function setUnauthorizedHandler(fn: (() => void) | null) {
  unauthorizedHandler = fn;
}

export type AuthStatusResponse = {
  authRequired: boolean;
  authenticated: boolean;
  username?: string;
  role?: "super" | "guest";
};

export async function fetchAuthStatus(): Promise<AuthStatusResponse> {
  return request<AuthStatusResponse>("/api/auth/status");
}

export async function loginWarRoom(
  username: string,
  password: string,
): Promise<{ role: "super" | "guest" }> {
  const auth = buildAuthHeaders();
  const headers = new Headers({ "Content-Type": "application/json" });
  for (const [k, v] of Object.entries(auth)) {
    headers.set(k, v);
  }
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers,
    credentials: "include",
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    let detail: string | undefined;
    try {
      const body: unknown = await res.json();
      if (
        body &&
        typeof body === "object" &&
        "error" in body &&
        typeof (body as { error: unknown }).error === "string"
      ) {
        detail = (body as { error: string }).error;
      }
    } catch {
      /* non-JSON */
    }
    throw new ApiError(res.status, res.statusText, "/api/auth/login", detail);
  }
  const data = (await res.json()) as { role?: string };
  const role = data.role === "guest" ? "guest" : "super";
  return { role };
}

export async function logoutWarRoom(): Promise<void> {
  const auth = buildAuthHeaders();
  const headers = new Headers();
  for (const [k, v] of Object.entries(auth)) {
    headers.set(k, v);
  }
  const res = await fetch("/api/auth/logout", {
    method: "POST",
    headers,
    credentials: "include",
  });
  if (!res.ok) {
    throw new ApiError(res.status, res.statusText, "/api/auth/logout");
  }
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const auth = buildAuthHeaders();
  const headers = new Headers(options?.headers);
  for (const [k, v] of Object.entries(auth)) {
    if (!headers.has(k)) headers.set(k, v);
  }

  const res = await fetch(url, { ...options, headers, credentials: "include" });
  if (!res.ok) {
    const isAuthProbe = url.includes("/auth/status") || url.includes("/auth/login");
    if (res.status === 401 && !isAuthProbe) {
      unauthorizedHandler?.();
    }
    let detail: string | undefined;
    try {
      const body: unknown = await res.json();
      if (
        body &&
        typeof body === "object" &&
        "error" in body &&
        typeof (body as { error: unknown }).error === "string"
      ) {
        detail = (body as { error: string }).error;
      }
    } catch {
      /* non-JSON body */
    }
    throw new ApiError(res.status, res.statusText, url, detail);
  }
  return res.json() as Promise<T>;
}

export type GenerateProblemResponse = {
  problem: Problem;
  cached: boolean;
  id: number;
};

export async function generateProblem(params: {
  platform: string;
  platformFocus?: string;
  language: string;
  category: string;
  difficulty: string;
  forceNew?: boolean;
}): Promise<GenerateProblemResponse> {
  return request<GenerateProblemResponse>("/api/problem", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
}

export async function getProblems(
  filters: Record<string, string> = {},
): Promise<{ problems: ProblemListRow[]; total: number }> {
  const params = new URLSearchParams(filters).toString();
  return request(`/api/problems?${params}`);
}

export async function getProblemById(
  id: number | string,
): Promise<ProblemDetailResponse> {
  return request(`/api/problems/${encodeURIComponent(String(id))}`);
}

export type GenerateScreeningResponse = {
  question: ScreeningQuestion;
  cached: boolean;
  id: number;
};

export async function generateScreening(params: {
  category: string;
  topic: string;
  type: string;
  difficulty: string;
  forceNew?: boolean;
}): Promise<GenerateScreeningResponse> {
  return request<GenerateScreeningResponse>("/api/screening", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
}

export async function getScreenings(
  filters: Record<string, string> = {},
): Promise<{ questions: ScreeningListRow[]; total: number }> {
  const params = new URLSearchParams(filters).toString();
  return request(`/api/screenings?${params}`);
}

export async function getScreeningById(
  id: number | string,
): Promise<ScreeningDetailResponse> {
  return request(`/api/screenings/${encodeURIComponent(String(id))}`);
}

export type SessionOutcome = "solved" | "skipped" | "hinted";

export type LogSessionPayload = {
  platform: string;
  language: string;
  category: string;
  difficulty: string;
  outcome: SessionOutcome;
  hintsUsed: number;
  timeSeconds: number;
  problemId?: number;
};

/** Fire-and-forget — never throws to callers; failures are logged only */
export async function logSession(payload: LogSessionPayload): Promise<void> {
  try {
    const auth = buildAuthHeaders();
    const headers = new Headers({ "Content-Type": "application/json" });
    for (const [k, v] of Object.entries(auth)) {
      headers.set(k, v);
    }
    const res = await fetch("/api/sessions", {
      method: "POST",
      headers,
      credentials: "include",
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      console.warn("[Session] Failed to log session", res.status);
    }
  } catch {
    console.warn("[Session] Failed to log session");
  }
}

export type SessionSummaryResponse = {
  total: number;
  solved: number;
  skipped: number;
  hinted: number;
  avg_time_seconds: number;
  last_activity: string | null;
  streak: number;
};

export async function fetchSummary(): Promise<SessionSummaryResponse> {
  return request<SessionSummaryResponse>("/api/sessions/summary");
}

export type DashboardResponse = {
  summary: SessionSummaryResponse;
  byPlatform: Array<{
    platform: string;
    total: number;
    solved: number;
    skipped: number;
    avg_time_seconds: number;
    solve_rate: number;
  }>;
  byCategory: Array<{
    category: string;
    platform: string;
    total: number;
    solved: number;
    solve_rate: number;
  }>;
  weakSpots: Array<{
    category: string;
    platform: string;
    total: number;
    solved: number;
    solve_rate: number;
  }>;
  dailyActivity: Array<{ date: string; total: number; solved: number }>;
  recent: Array<{
    id: number;
    platform: string;
    language: string;
    category: string;
    difficulty: string;
    outcome: SessionOutcome;
    hints_used: number;
    time_seconds: number;
    problem_id: number | null;
    created_at: string;
  }>;
};

export async function fetchDashboard(): Promise<DashboardResponse> {
  return request<DashboardResponse>("/api/sessions/dashboard");
}

export type GuestPassRow = {
  username: string;
  expires_at: string;
  created_at: string;
};

export async function fetchGuestPasses(): Promise<{ guests: GuestPassRow[] }> {
  return request<{ guests: GuestPassRow[] }>("/api/auth/guests");
}

export async function createGuestPass(body?: {
  username?: string;
  password?: string;
}): Promise<{ username: string; password: string; expiresAt: string }> {
  return request("/api/auth/guests", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body ?? {}),
  });
}

export async function revokeGuestPass(username: string): Promise<void> {
  await request<{ ok: boolean }>(
    `/api/auth/guests/${encodeURIComponent(username)}`,
    { method: "DELETE" },
  );
}

export type {
  PatternDetail,
  PatternListItem,
  PatternSummaryResponse,
} from "../types/patterns";

export async function fetchPatterns(): Promise<
  import("../types/patterns").PatternListItem[]
> {
  return request("/api/patterns");
}

export async function fetchPattern(
  id: string,
): Promise<import("../types/patterns").PatternDetail> {
  return request(`/api/patterns/${encodeURIComponent(id)}`);
}

export async function fetchPatternSummary(): Promise<
  import("../types/patterns").PatternSummaryResponse
> {
  return request("/api/patterns/stats/summary");
}

export async function logPatternSession(
  patternId: string,
  body: {
    problemIndex: number;
    solved: boolean;
    usedHint: boolean;
    timeSeconds: number;
  },
): Promise<void> {
  await request(`/api/patterns/${encodeURIComponent(patternId)}/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}
