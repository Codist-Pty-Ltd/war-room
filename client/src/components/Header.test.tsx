import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Header from "./Header";
import {
  AuthSurfaceContext,
  type AuthSurfaceValue,
} from "../context/AuthSurfaceContext";

function renderHeader(
  auth: AuthSurfaceValue | null = null,
  overrides: Partial<Parameters<typeof Header>[0]> = {},
) {
  const props = {
    stats: { solved: 3, hinted: 1, skipped: 2, streak: 0 },
    timer: {
      seconds: 0,
      active: false,
      start: vi.fn(),
      stop: vi.fn(),
      format: () => "00:00",
    },
    showTimer: false,
    screen: "platform",
    onDashboard: vi.fn(),
    onHistory: vi.fn(),
    onHome: vi.fn(),
    onPrepGuide: vi.fn(),
    onCertifications: vi.fn(),
    onScreening: vi.fn(),
    onMock: vi.fn(),
    onBBD: vi.fn(),
    onMastery: vi.fn(),
    onConsoleLab: vi.fn(),
    onBrainLab: vi.fn(),
    onPatternDrill: vi.fn(),
    ...overrides,
  };

  return render(
    <AuthSurfaceContext.Provider value={auth}>
      <Header {...props} />
    </AuthSurfaceContext.Provider>,
  );
}

describe("Header", () => {
  it("renders the War Room logo/title", () => {
    renderHeader();
    expect(screen.getByRole("button", { name: /war room/i })).toBeInTheDocument();
    expect(screen.getByText(/⬡ WAR ROOM/)).toBeInTheDocument();
  });

  it("shows navigation links when user is authenticated", () => {
    renderHeader({
      authRequired: true,
      role: "guest",
      signOut: vi.fn().mockResolvedValue(undefined),
    });

    expect(screen.getByRole("button", { name: /dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /practice/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /screening/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign out/i })).toBeInTheDocument();
  });

  it("hides navigation links when user is not authenticated", () => {
    renderHeader(null);

    expect(screen.getByRole("button", { name: /dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /practice/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /sign out/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /guest passes/i })).not.toBeInTheDocument();
  });

  it("shows sign out button when authenticated", () => {
    const signOut = vi.fn().mockResolvedValue(undefined);
    renderHeader({
      authRequired: true,
      role: "super",
      signOut,
    });

    const signOutBtn = screen.getByRole("button", { name: /sign out/i });
    expect(signOutBtn).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /guest passes/i })).toBeInTheDocument();
  });
});
