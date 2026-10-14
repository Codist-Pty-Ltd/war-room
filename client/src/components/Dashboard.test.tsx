import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import Dashboard from "../pages/Dashboard";
import { fetchDashboard } from "../services/api";
import type { DashboardResponse } from "../services/api";

vi.mock("../services/api", () => ({
  fetchDashboard: vi.fn(),
}));

const mockFetchDashboard = vi.mocked(fetchDashboard);

function emptyDashboard(): DashboardResponse {
  return {
    summary: {
      total: 0,
      solved: 0,
      skipped: 0,
      hinted: 0,
      streak: 0,
      avg_time_seconds: 0,
      last_activity: null,
    },
    byPlatform: [],
    byCategory: [],
    weakSpots: [],
    dailyActivity: [],
    recent: [],
  };
}

function populatedDashboard(): DashboardResponse {
  return {
    summary: {
      total: 12,
      solved: 8,
      skipped: 2,
      hinted: 2,
      streak: 3,
      avg_time_seconds: 540,
      last_activity: new Date().toISOString(),
    },
    byPlatform: [
      {
        platform: "codility",
        total: 12,
        solved: 8,
        skipped: 2,
        avg_time_seconds: 540,
        solve_rate: 67,
      },
    ],
    byCategory: [],
    weakSpots: [],
    dailyActivity: [],
    recent: [
      {
        id: 1,
        platform: "codility",
        language: "C#",
        category: "Arrays",
        difficulty: "Medium",
        outcome: "solved",
        hints_used: 0,
        time_seconds: 600,
        problem_id: 1,
        created_at: new Date().toISOString(),
      },
    ],
  };
}

describe("Dashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading state while fetching stats", () => {
    mockFetchDashboard.mockReturnValue(new Promise(() => undefined));
    render(<Dashboard onNavigate={vi.fn()} />);
    expect(screen.getByText(/loading dashboard/i)).toBeInTheDocument();
  });

  it("renders session count when data loads", async () => {
    mockFetchDashboard.mockResolvedValue(populatedDashboard());
    render(<Dashboard onNavigate={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText("PROGRESS DASHBOARD")).toBeInTheDocument();
    });

    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("SOLVED")).toBeInTheDocument();
    expect(screen.getByText("TOTAL ATTEMPTED")?.parentElement?.textContent).toContain("12");
    expect(screen.getByText(/RECENT ATTEMPTS/i)).toBeInTheDocument();
    expect(screen.getByText("Arrays")).toBeInTheDocument();
  });

  it("renders error message when API call fails", async () => {
    mockFetchDashboard.mockRejectedValue(new Error("network"));
    render(<Dashboard onNavigate={vi.fn()} />);

    await waitFor(() => {
      expect(
        screen.getByText(/could not load dashboard/i),
      ).toBeInTheDocument();
    });
  });

  it("shows zero stats correctly without breaking layout", async () => {
    mockFetchDashboard.mockResolvedValue(emptyDashboard());
    render(<Dashboard onNavigate={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText("PROGRESS DASHBOARD")).toBeInTheDocument();
    });

    expect(screen.getAllByText("0").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText(/no problems attempted yet/i)).toBeInTheDocument();
    expect(screen.getByText(/no sessions logged yet/i)).toBeInTheDocument();
    expect(screen.getByText(/no weak spots yet/i)).toBeInTheDocument();
  });
});
