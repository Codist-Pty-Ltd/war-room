import { useEffect } from "react";
import { useSessionStore } from "../store/sessionStore";
import type { UseTimerReturn } from "./useTimer";

/** Practice/screening session clock backed by Zustand sessionStore */
export function usePracticeTimer(): UseTimerReturn {
  const elapsedSeconds = useSessionStore((s) => s.elapsedSeconds);
  const isTimerRunning = useSessionStore((s) => s.isTimerRunning);
  const startTimer = useSessionStore((s) => s.startTimer);
  const stopTimer = useSessionStore((s) => s.stopTimer);
  const resetTimer = useSessionStore((s) => s.resetTimer);
  const tickTimer = useSessionStore((s) => s.tickTimer);

  useEffect(() => {
    if (!isTimerRunning) return;
    const id = setInterval(tickTimer, 1000);
    return () => clearInterval(id);
  }, [isTimerRunning, tickTimer]);

  const start = () => {
    resetTimer();
    startTimer();
  };

  const stop = () => stopTimer();

  const format = () =>
    `${String(Math.floor(elapsedSeconds / 60)).padStart(2, "0")}:${String(elapsedSeconds % 60).padStart(2, "0")}`;

  return {
    seconds: elapsedSeconds,
    active: isTimerRunning,
    start,
    stop,
    format,
  };
}
