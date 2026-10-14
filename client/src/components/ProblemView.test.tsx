import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import ProblemView from "./ProblemView";
import { logSession } from "../services/api";
import type { Language, Platform, Problem } from "../types/domain";
import type { UseTimerReturn } from "../hooks/useTimer";

vi.mock("../services/api", () => ({
  logSession: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../utils/export", () => ({
  exportProblemMarkdown: vi.fn(),
}));

const mockLogSession = vi.mocked(logSession);

const platform: Platform = {
  id: "codility",
  name: "Codility",
  color: "#00c2ff",
  icon: "⚙",
  focus: "Performance",
  categories: ["Arrays"],
};

const language: Language = {
  id: "csharp",
  name: "C#",
  icon: "⬡",
  color: "#00ff88",
};

const problem: Problem = {
  title: "Sum Two Arrays",
  description: "Return the element-wise sum of two integer arrays.",
  difficulty: "Medium",
  hints: ["Use a single loop", "Watch index bounds"],
  seniorTip: "Mention overflow only if constraints require it.",
  steps: [],
};

function createTimer(overrides: Partial<UseTimerReturn> = {}): UseTimerReturn {
  return {
    seconds: 0,
    active: true,
    start: vi.fn(),
    stop: vi.fn(),
    format: () => "00:00",
    ...overrides,
  };
}

function renderProblemView(timer = createTimer(), extra = {}) {
  const markSolved = vi.fn();
  const markHinted = vi.fn();
  const markSkipped = vi.fn();

  const view = render(
    <ProblemView
      problem={problem}
      platform={platform}
      language={language}
      timer={timer}
      category="Arrays"
      difficulty="Medium"
      problemId={42}
      markSolved={markSolved}
      markHinted={markHinted}
      markSkipped={markSkipped}
      onNext={vi.fn()}
      {...extra}
    />,
  );

  return { ...view, markSolved, markHinted, markSkipped };
}

describe("ProblemView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the problem title and description", () => {
    renderProblemView();
    expect(screen.getByText("Sum Two Arrays")).toBeInTheDocument();
    expect(
      screen.getByText(/element-wise sum of two integer arrays/i),
    ).toBeInTheDocument();
  });

  it("shows the hint button when hints are available", () => {
    renderProblemView();
    expect(screen.getByRole("button", { name: /hint \(2 left\)/i })).toBeInTheDocument();
  });

  it("marks problem as solved when solve button is clicked", async () => {
    const user = userEvent.setup();
    const { markSolved } = renderProblemView();

    await user.click(screen.getByRole("button", { name: /i solved it/i }));

    expect(markSolved).toHaveBeenCalledTimes(1);
    expect(mockLogSession).toHaveBeenCalledWith(
      expect.objectContaining({
        outcome: "solved",
        problemId: 42,
        category: "Arrays",
      }),
    );
  });

  it("shows timer counting up during active session", () => {
    let seconds = 0;
    const timer = createTimer({
      active: true,
      get seconds() {
        return seconds;
      },
      format: () =>
        `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`,
    });

    const { rerender } = renderProblemView(timer);
    const sessionBlock = screen.getByText("SESSION").parentElement;
    expect(sessionBlock).toHaveTextContent("00:00");

    seconds = 61;
    rerender(
      <ProblemView
        problem={problem}
        platform={platform}
        language={language}
        timer={timer}
        category="Arrays"
        difficulty="Medium"
        problemId={42}
        markSolved={vi.fn()}
        markHinted={vi.fn()}
        markSkipped={vi.fn()}
        onNext={vi.fn()}
      />,
    );

    expect(screen.getByText("SESSION").parentElement).toHaveTextContent("01:01");
  });

  it("disables solve button after problem is marked solved", async () => {
    const user = userEvent.setup();
    renderProblemView();

    await user.click(screen.getByRole("button", { name: /i solved it/i }));

    await waitFor(() => {
      expect(screen.queryByRole("button", { name: /i solved it/i })).not.toBeInTheDocument();
    });

    expect(screen.getByRole("button", { name: /next problem/i })).toBeInTheDocument();
  });
});
