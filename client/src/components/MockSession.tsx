import { useState, useEffect, useRef } from "react";
import { generateProblem } from "../services/api";
import { useSessionStore } from "../store/sessionStore";
import type { MockSessionConfig, Problem } from "../types/domain";
import MockLoadingPhase from "./MockLoadingPhase";
import MockActivePhase from "./MockActivePhase";
import MockReviewPhase from "./MockReviewPhase";

const DIFFICULTY_POOL = ["Easy", "Medium", "Hard"] as const;

export type MockSessionProblem = {
  problem: Problem;
  category: string;
  difficulty: string;
  status: string;
  timeSpent: number;
  hintsUsed: number;
};

type MockSessionProps = {
  config: MockSessionConfig;
  onFinish: () => void;
};

export default function MockSession({ config, onFinish }: MockSessionProps) {
  const { platform, language, difficulty, count, timeLimitMinutes } = config;

  const startSession = useSessionStore((s) => s.startSession);
  const recordSolved = useSessionStore((s) => s.recordSolved);
  const recordSkipped = useSessionStore((s) => s.recordSkipped);
  const recordHint = useSessionStore((s) => s.recordHint);
  const endSession = useSessionStore((s) => s.endSession);
  const resetSession = useSessionStore((s) => s.resetSession);
  const sessionStartedRef = useRef(false);

  const [problems, setProblems] = useState<MockSessionProblem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionPhase, setSessionPhase] = useState("loading");
  const [loadingProgress, setLoadingProgress] = useState(0);

  const [remaining, setRemaining] = useState(timeLimitMinutes * 60);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const problemStartRef = useRef<number | null>(null);

  const [revealedHints, setRevealedHints] = useState<string[]>([]);
  const [hintIndex, setHintIndex] = useState(0);
  const [showSolution, setShowSolution] = useState(false);

  // Load problems at session start
  useEffect(() => {
    let cancelled = false;

    async function loadProblems() {
      const loaded: MockSessionProblem[] = [];
      const categories = platform.categories;

      for (let i = 0; i < count; i++) {
        if (cancelled) return;

        const cat = categories[Math.floor(Math.random() * categories.length)];
        let diff = difficulty;
        if (diff === "Mixed") {
          diff = DIFFICULTY_POOL[
            Math.floor(Math.random() * DIFFICULTY_POOL.length)
          ] as string;
        }

        try {
          const response = await generateProblem({
            platform: platform.name,
            platformFocus: platform.focus,
            language: language.name,
            category: cat,
            difficulty: diff,
          });
          loaded.push({
            problem: response.problem,
            category: cat,
            difficulty: diff,
            status: "pending",
            timeSpent: 0,
            hintsUsed: 0,
          });
        } catch {
          loaded.push({
            problem: {
              title: `Problem ${i + 1} (failed to load)`,
              description:
                "This problem could not be generated. Skip to the next one.",
              difficulty: diff,
            },
            category: cat,
            difficulty: diff,
            status: "pending",
            timeSpent: 0,
            hintsUsed: 0,
          });
        }

        if (!cancelled) setLoadingProgress(i + 1);
      }

      if (!cancelled) {
        setProblems(loaded);
        setSessionPhase("active");
        problemStartRef.current = Date.now();
      }
    }

    loadProblems();
    return () => {
      cancelled = true;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (sessionPhase !== "active" || problems.length === 0 || sessionStartedRef.current) {
      return;
    }
    sessionStartedRef.current = true;
    startSession(`mock-${platform.id}-${Date.now()}`);
  }, [sessionPhase, problems.length, platform.id, startSession]);

  // Countdown timer
  useEffect(() => {
    if (sessionPhase !== "active") return;

    timerRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          if (timerRef.current != null) clearInterval(timerRef.current);
          endSession();
          setSessionPhase("review");
          return 0;
        }
        return r - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current != null) clearInterval(timerRef.current);
    };
  }, [sessionPhase]);

  const recordTime = () => {
    if (problemStartRef.current) {
      const elapsed = Math.floor((Date.now() - problemStartRef.current) / 1000);
      setProblems((prev) => {
        const next = [...prev];
        next[currentIndex] = { ...next[currentIndex], timeSpent: elapsed };
        return next;
      });
    }
  };

  const markStatus = (status: string) => {
    recordTime();
    setProblems((prev) => {
      const next = [...prev];
      next[currentIndex] = {
        ...next[currentIndex],
        status,
        hintsUsed: revealedHints.length,
      };
      return next;
    });
  };

  const advanceProblem = () => {
    if (currentIndex < problems.length - 1) {
      setCurrentIndex((i) => i + 1);
      setRevealedHints([]);
      setHintIndex(0);
      setShowSolution(false);
      problemStartRef.current = Date.now();
    } else {
      recordTime();
      if (timerRef.current != null) clearInterval(timerRef.current);
      endSession();
      setSessionPhase("review");
    }
  };

  const handleSolved = () => {
    recordSolved();
    markStatus("solved");
    setShowSolution(true);
  };

  const handleSkip = () => {
    recordSkipped();
    markStatus("skipped");
    setShowSolution(true);
  };

  const handleRevealHint = () => {
    const p = problems[currentIndex]?.problem;
    if (!p?.hints?.length || hintIndex >= p.hints.length) return;
    if (revealedHints.length === 0) {
      recordHint();
    }
    const hint = p.hints![hintIndex];
    setRevealedHints((prev) => [...prev, hint]);
    setHintIndex((i) => i + 1);
  };

  const handleEndEarly = () => {
    recordTime();
    if (timerRef.current != null) clearInterval(timerRef.current);
    endSession();
    setSessionPhase("review");
  };

  if (sessionPhase === "loading") {
    return <MockLoadingPhase loadingProgress={loadingProgress} count={count} />;
  }

  if (sessionPhase === "review") {
    return (
      <MockReviewPhase
        problems={problems}
        platform={platform}
        language={language}
        remaining={remaining}
        timeLimitMinutes={timeLimitMinutes}
        onFinish={() => {
          resetSession();
          onFinish();
        }}
      />
    );
  }

  return (
    <MockActivePhase
      problems={problems}
      currentIndex={currentIndex}
      remaining={remaining}
      platform={platform}
      language={language}
      revealedHints={revealedHints}
      hintIndex={hintIndex}
      showSolution={showSolution}
      onSolved={handleSolved}
      onSkip={handleSkip}
      onHint={handleRevealHint}
      onNext={advanceProblem}
      onEndEarly={handleEndEarly}
    />
  );
}
