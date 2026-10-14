import { useState } from "react";
import { getDiffColor } from "../utils/colorUtils";
import { exportProblemMarkdown } from "../utils/export";
import { styles, ghostBtnStyle, primaryBtnStyle } from "../theme/tokens";
import ProblemHeader from "./ProblemHeader";
import ProblemDescription from "./ProblemDescription";
import LocalIdePanel from "./LocalIdePanel";
import HintDisplay from "./HintDisplay";
import { suggestedIdeMinutes } from "../utils/suggestedIdeMinutes";
import ProblemActions from "./ProblemActions";
import SolutionDetails from "./SolutionDetails";
import SeniorWisdom from "./SeniorWisdom";
import { logSession } from "../services/api";
import { useSessionStore } from "../store/sessionStore";
import type { Language, Platform, Problem } from "../types/domain";
import type { UseTimerReturn } from "../hooks/useTimer";

type ProblemViewProps = {
  problem: Problem;
  platform: Platform;
  language: Language;
  timer: UseTimerReturn;
  category: string;
  difficulty: string;
  problemId?: number;
  markSolved: () => void;
  markHinted: () => void;
  markSkipped: () => void;
  onNext: () => void;
};

export default function ProblemView({
  problem,
  platform,
  language,
  timer,
  category,
  difficulty,
  problemId,
  markSolved,
  markHinted,
  markSkipped,
  onNext,
}: ProblemViewProps) {
  const recordSolved = useSessionStore((s) => s.recordSolved);
  const recordSkipped = useSessionStore((s) => s.recordSkipped);
  const recordHint = useSessionStore((s) => s.recordHint);
  const stopSessionTimer = useSessionStore((s) => s.stopTimer);
  const endSession = useSessionStore((s) => s.endSession);
  const setCurrentProblem = useSessionStore((s) => s.setCurrentProblem);

  const [revealedHints, setRevealedHints] = useState<string[]>([]);
  const [hintIndex, setHintIndex] = useState(0);
  const [showFull, setShowFull] = useState(false);

  const sessionBase = () => ({
    platform: platform.name,
    language: language.name,
    category,
    difficulty,
    timeSeconds: timer.seconds,
    problemId,
  });

  const handleRevealHint = () => {
    const hints = problem.hints;
    if (!hints?.length) return;
    if (hintIndex >= hints.length) return;
    if (revealedHints.length === 0) {
      logSession({
        ...sessionBase(),
        outcome: "hinted",
        hintsUsed: 1,
      });
      recordHint();
      markHinted();
    }
    setRevealedHints((prev) => [...prev, hints[hintIndex]]);
    setHintIndex((i) => i + 1);
  };

  const handleSolved = () => {
    logSession({
      ...sessionBase(),
      outcome: "solved",
      hintsUsed: revealedHints.length,
    });
    recordSolved();
    stopSessionTimer();
    endSession();
    markSolved();
    setCurrentProblem({
      id: String(problemId ?? problem.title),
      title: problem.title,
      description: problem.description,
      difficulty: problem.difficulty,
      platform: platform.name,
    });
    setShowFull(true);
  };

  const handleSkip = () => {
    logSession({
      ...sessionBase(),
      outcome: "skipped",
      hintsUsed: revealedHints.length,
    });
    recordSkipped();
    stopSessionTimer();
    endSession();
    markSkipped();
    setShowFull(true);
  };

  const dc = getDiffColor(problem.difficulty);

  return (
    <main style={styles.narrowLayout}>
      <ProblemHeader
        problem={problem}
        platform={platform}
        language={language}
        timer={timer}
        diffColor={dc}
      />

      <ProblemDescription problem={problem} />

      {!showFull && (
        <div key={problem.title}>
          <LocalIdePanel
            suggestedMinutes={suggestedIdeMinutes(problem.difficulty)}
            accentColor={platform.color}
          />
        </div>
      )}

      <HintDisplay hints={revealedHints} />

      {!showFull && (
        <ProblemActions
          onSolved={handleSolved}
          onHint={handleRevealHint}
          onSkip={handleSkip}
          hintsRemaining={(problem.hints?.length || 0) - hintIndex}
        />
      )}

      {showFull && (
        <div>
          <SolutionDetails problem={problem} />
          <SeniorWisdom tip={problem.seniorTip} />
          <button
            type="button"
            onClick={() => exportProblemMarkdown(problem, platform, language)}
            style={ghostBtnStyle()}
          >
            ↓ EXPORT .MD
          </button>
          <button type="button" onClick={onNext} style={primaryBtnStyle()}>
            → NEXT PROBLEM
          </button>
        </div>
      )}

      {!showFull && (
        <div style={{ marginTop: "8px" }}>
          <div style={{ color: "#333", fontSize: "12px" }}>
            Try it yourself first. The header timer is the overall session clock; use the local IDE
            stopwatch while you code and run tests elsewhere. The full guide unlocks when you are
            ready.
          </div>
        </div>
      )}
    </main>
  );
}
