import { useCallback, useEffect, useState } from "react";
import {
  fetchPattern,
  fetchPatternSummary,
  fetchPatterns,
} from "../services/api";
import type {
  PatternDetail,
  PatternListItem,
  PatternSummaryResponse,
} from "../types/patterns";
import PatternLearn from "./PatternLearn";
import PatternPractice from "./PatternPractice";
import PatternStats from "./PatternStats";
import "./PatternDrill.css";

type View = "list" | "learn" | "practice";

type PatternDrillProps = {
  onBack: () => void;
};

function MasteryStars({ level }: { level: number }) {
  return (
    <div className="mastery-stars">
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= level ? "star" : "star star--empty"}>
          ★
        </span>
      ))}
    </div>
  );
}

export default function PatternDrill({ onBack }: PatternDrillProps) {
  const [patterns, setPatterns] = useState<PatternListItem[]>([]);
  const [summary, setSummary] = useState<PatternSummaryResponse | null>(null);
  const [selectedPattern, setSelectedPattern] = useState<PatternDetail | null>(
    null,
  );
  const [view, setView] = useState<View>("list");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [list, stats] = await Promise.all([
        fetchPatterns(),
        fetchPatternSummary(),
      ]);
      setPatterns(list.sort((a, b) => a.order - b.order));
      setSummary(stats);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load patterns");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadList();
  }, [loadList]);

  const startDrill = async (id: string) => {
    setError(null);
    try {
      const detail = await fetchPattern(id);
      setSelectedPattern(detail);
      setView("learn");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load pattern");
    }
  };

  const handleBackToList = () => {
    setSelectedPattern(null);
    setView("list");
    void loadList();
  };

  const patternIds = patterns.map((p) => p.id);

  if (view === "learn" && selectedPattern) {
    return (
      <PatternLearn
        pattern={selectedPattern}
        onBack={handleBackToList}
        onStartPractice={() => setView("practice")}
      />
    );
  }

  if (view === "practice" && selectedPattern) {
    return (
      <PatternPractice
        pattern={selectedPattern}
        allPatternIds={patternIds}
        onBack={() => setView("learn")}
        onComplete={handleBackToList}
        onNextPattern={async (nextId) => {
          await startDrill(nextId);
        }}
      />
    );
  }

  return (
    <main className="pattern-drill-page">
      <button type="button" className="pattern-back-btn" onClick={onBack}>
        ← PLATFORMS
      </button>

      <div className="pattern-drill-header">
        <h1>14 Pattern Drills</h1>
        <p>
          Master pattern recognition — 14 patterns, 42 curated problems (3 per
          pattern). Full C# solutions:{" "}
          <code style={{ color: "#00ff88", fontSize: 12 }}>
            pattern_drills/CODING_PATTERNS_REFERENCE.md
          </code>
        </p>
      </div>

      <PatternStats summary={summary} loading={loading} />

      {error && (
        <div style={{ color: "#ff5e7a", marginBottom: 16, fontSize: 13 }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ color: "#555" }}>Loading patterns…</div>
      ) : (
        <div className="pattern-grid">
          {patterns.map((p) => {
            const notStarted = p.progress.problems_attempted === 0;
            const completed = p.progress.mastery_level >= 4;
            return (
              <div
                key={p.id}
                className={`pattern-card${completed ? " pattern-card--completed" : ""}${notStarted ? " pattern-card--priority" : ""}`}
              >
                {notStarted && (
                  <span className="pattern-priority-badge">PRIORITISE</span>
                )}
                <div className="pattern-order">
                  #{String(p.order).padStart(2, "0")}
                </div>
                <div className="pattern-name">{p.name}</div>
                <div className="recognition-trigger">{p.recognitionTrigger}</div>
                <MasteryStars level={p.progress.mastery_level} />
                <div className="pattern-progress-text">
                  {p.progress.problems_solved} solved · {p.progress.problems_attempted}{" "}
                  attempted
                </div>
                <button
                  type="button"
                  className="pattern-start-btn"
                  onClick={() => void startDrill(p.id)}
                >
                  START DRILL
                </button>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
