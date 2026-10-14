import { useCallback, useEffect, useState } from "react";
import { logPatternSession } from "../services/api";
import type { PatternDetail } from "../types/patterns";

type PatternPracticeProps = {
  pattern: PatternDetail;
  allPatternIds: string[];
  onBack: () => void;
  onComplete: () => void;
  onNextPattern: (nextId: string) => void;
};

function difficultyClass(d: string) {
  const lower = d.toLowerCase();
  if (lower === "easy") return "difficulty-easy";
  if (lower === "hard") return "difficulty-hard";
  return "difficulty-medium";
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function PatternPractice({
  pattern,
  allPatternIds,
  onBack,
  onComplete,
  onNextPattern,
}: PatternPracticeProps) {
  const [problemIndex, setProblemIndex] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [startTime, setStartTime] = useState(() => Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(true);
  const [usedHint, setUsedHint] = useState(false);
  const [results, setResults] = useState<Array<{ solved: boolean; time: number }>>(
    [],
  );
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const problem = pattern.practiceProblems[problemIndex];
  const totalProblems = pattern.practiceProblems.length;

  useEffect(() => {
    if (!timerRunning) return;
    const id = window.setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => window.clearInterval(id);
  }, [timerRunning, startTime]);

  const resetProblemState = useCallback(() => {
    setShowHint(false);
    setShowSolution(false);
    setUsedHint(false);
    setStartTime(Date.now());
    setElapsedSeconds(0);
    setTimerRunning(true);
  }, []);

  const handleShowHint = () => {
    setShowHint(true);
    setUsedHint(true);
  };

  const handleShowSolution = () => {
    setShowSolution(true);
    setTimerRunning(false);
  };

  const handleAssessment = async (solved: boolean) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await logPatternSession(pattern.id, {
        problemIndex: problem.index,
        solved,
        usedHint,
        timeSeconds: elapsedSeconds,
      });
    } catch {
      /* non-fatal */
    }

    const nextResults = [...results, { solved, time: elapsedSeconds }];
    setResults(nextResults);
    setSubmitting(false);

    if (problemIndex + 1 < totalProblems) {
      setProblemIndex((i) => i + 1);
      resetProblemState();
      return;
    }

    setDone(true);
  };

  const solvedCount = results.filter((r) => r.solved).length;
  const avgTime =
    results.length > 0
      ? Math.round(results.reduce((a, r) => a + r.time, 0) / results.length)
      : 0;

  const currentIdx = allPatternIds.indexOf(pattern.id);
  const nextPatternId =
    currentIdx >= 0 && currentIdx < allPatternIds.length - 1
      ? allPatternIds[currentIdx + 1]
      : null;

  const timerClass =
    elapsedSeconds > 600
      ? "problem-timer problem-timer--slow"
      : elapsedSeconds > 300
        ? "problem-timer problem-timer--warning"
        : "problem-timer";

  if (done) {
    return (
      <main className="pattern-practice-page">
        <div className="completion-panel">
          <div style={{ fontSize: 11, color: "#444", letterSpacing: 3 }}>
            DRILL COMPLETE
          </div>
          <div className="completion-score">
            {solvedCount}/{totalProblems}
          </div>
          <p style={{ color: "#888", marginBottom: 8 }}>problems self-assessed as solved</p>
          <p style={{ color: "#666", fontSize: 13 }}>
            Average time: {avgTime}s per problem
          </p>
          <div className="pattern-action-row" style={{ justifyContent: "center" }}>
            <button
              type="button"
              className="pattern-secondary-btn"
              onClick={() => {
                setDone(false);
                setResults([]);
                setProblemIndex(0);
                resetProblemState();
              }}
            >
              Practice again
            </button>
            {nextPatternId && (
              <button
                type="button"
                className="pattern-primary-btn"
                onClick={() => onNextPattern(nextPatternId)}
              >
                Next pattern →
              </button>
            )}
            <button type="button" className="pattern-secondary-btn" onClick={onComplete}>
              Back to all patterns
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (!problem) return null;

  return (
    <main className="pattern-practice-page">
      <button type="button" className="pattern-back-btn" onClick={onBack}>
        ← LEARN PHASE
      </button>

      <div style={{ fontSize: 11, color: "#444", letterSpacing: 2, marginBottom: 8 }}>
        Problem {problemIndex + 1} of {totalProblems} — {pattern.name}
      </div>

      <div className={timerClass}>{formatTime(elapsedSeconds)}</div>

      <div
        style={{
          background: "#111118",
          border: "1px solid #1e1e2e",
          borderRadius: 12,
          padding: 24,
        }}
      >
        <h2 style={{ color: "#eee", fontSize: 18, margin: "0 0 12px" }}>
          {problem.title}
        </h2>
        <div style={{ marginBottom: 16 }}>
          <span className={`difficulty-badge ${difficultyClass(problem.difficulty)}`}>
            {problem.difficulty}
          </span>
          <span className="platform-badge">{problem.platform}</span>
        </div>
        <p style={{ color: "#aaa", fontSize: 14, lineHeight: 1.6 }}>
          {problem.description}
        </p>
        <div className="example-block">{problem.example}</div>
        <p style={{ color: "#555", fontSize: 12, marginTop: 12 }}>
          Solve this in your own editor (Visual Studio / Rider). Come back when ready.
        </p>
      </div>

      <div className="pattern-action-row">
        {!showHint && (
          <button type="button" className="pattern-secondary-btn" onClick={handleShowHint}>
            Show Hint
          </button>
        )}
        {!showSolution && (
          <button type="button" className="pattern-secondary-btn" onClick={handleShowSolution}>
            Show Solution
          </button>
        )}
      </div>

      {showHint && <div className="hint-box">{problem.hint}</div>}

      {showSolution && (
        <>
          <pre className="solution-code">{problem.solution}</pre>
          <p style={{ color: "#666", fontSize: 12, marginTop: 8 }}>
            {problem.timeComplexity} · {problem.spaceComplexity}
          </p>
          <div className="self-assessment">
            <p style={{ width: "100%", color: "#888", margin: "0 0 8px" }}>
              Did you solve it?
            </p>
            <button
              type="button"
              className="btn-solved"
              disabled={submitting}
              onClick={() => void handleAssessment(true)}
            >
              ✓ Yes, I got it
            </button>
            <button
              type="button"
              className="btn-not-solved"
              disabled={submitting}
              onClick={() => void handleAssessment(false)}
            >
              ✗ Not quite
            </button>
          </div>
        </>
      )}
    </main>
  );
}
