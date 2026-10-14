import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { Language, Platform, Problem } from "../types/domain";

export interface StoreProblem {
  id: string;
  title: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard" | string;
  platform: string;
}

export type PracticeMeta = {
  platform: Platform;
  language: Language;
  category: string;
  difficulty: string;
  problemId?: number;
};

export interface SessionState {
  currentProblem: StoreProblem | null;
  setCurrentProblem: (problem: StoreProblem | null) => void;
  problemDetail: Problem | null;
  practiceMeta: PracticeMeta | null;
  setPracticeProblem: (
    problem: Problem,
    platform: Platform,
    language: Language,
    category: string,
    difficulty: string,
    problemId?: number,
  ) => void;
  clearPracticeProblem: () => void;

  sessionId: string | null;
  solvedCount: number;
  skippedCount: number;
  hintCount: number;
  startedAt: Date | null;

  elapsedSeconds: number;
  isTimerRunning: boolean;
  startTimer: () => void;
  stopTimer: () => void;
  resetTimer: () => void;
  tickTimer: () => void;

  startSession: (sessionId: string) => void;
  recordSolved: () => void;
  recordSkipped: () => void;
  recordHint: () => void;
  endSession: () => void;
  resetSession: () => void;
}

function toStoreProblem(
  problem: Problem,
  platform: Platform,
  problemId?: number,
): StoreProblem {
  return {
    id: String(problemId ?? problem.title),
    title: problem.title,
    description: problem.description,
    difficulty: problem.difficulty,
    platform: platform.name,
  };
}

export const useSessionStore = create<SessionState>()(
  devtools(
    (set) => ({
      currentProblem: null,
      setCurrentProblem: (problem) => set({ currentProblem: problem }),

      problemDetail: null,
      practiceMeta: null,
      setPracticeProblem: (problem, platform, language, category, difficulty, problemId) =>
        set({
          currentProblem: toStoreProblem(problem, platform, problemId),
          problemDetail: problem,
          practiceMeta: { platform, language, category, difficulty, problemId },
        }),
      clearPracticeProblem: () =>
        set({
          currentProblem: null,
          problemDetail: null,
          practiceMeta: null,
        }),

      sessionId: null,
      solvedCount: 0,
      skippedCount: 0,
      hintCount: 0,
      startedAt: null,

      elapsedSeconds: 0,
      isTimerRunning: false,
      startTimer: () => set({ isTimerRunning: true }),
      stopTimer: () => set({ isTimerRunning: false }),
      resetTimer: () => set({ elapsedSeconds: 0, isTimerRunning: false }),
      tickTimer: () =>
        set((state) => ({
          elapsedSeconds: state.isTimerRunning
            ? state.elapsedSeconds + 1
            : state.elapsedSeconds,
        })),

      startSession: (sessionId) =>
        set({
          sessionId,
          startedAt: new Date(),
          solvedCount: 0,
          skippedCount: 0,
          hintCount: 0,
          elapsedSeconds: 0,
          isTimerRunning: true,
        }),
      recordSolved: () => set((state) => ({ solvedCount: state.solvedCount + 1 })),
      recordSkipped: () => set((state) => ({ skippedCount: state.skippedCount + 1 })),
      recordHint: () => set((state) => ({ hintCount: state.hintCount + 1 })),
      endSession: () => set({ isTimerRunning: false }),
      resetSession: () =>
        set({
          currentProblem: null,
          problemDetail: null,
          practiceMeta: null,
          sessionId: null,
          solvedCount: 0,
          skippedCount: 0,
          hintCount: 0,
          startedAt: null,
          elapsedSeconds: 0,
          isTimerRunning: false,
        }),
    }),
    { name: "war-room-session" },
  ),
);
