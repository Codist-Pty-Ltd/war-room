import { useState } from "react";
import type { PatternDetail } from "../types/patterns";

type PatternLearnProps = {
  pattern: PatternDetail;
  onBack: () => void;
  onStartPractice: () => void;
};

function difficultyClass(d: string) {
  const lower = d.toLowerCase();
  if (lower === "easy") return "difficulty-easy";
  if (lower === "hard") return "difficulty-hard";
  return "difficulty-medium";
}

export default function PatternLearn({
  pattern,
  onBack,
  onStartPractice,
}: PatternLearnProps) {
  const ex = pattern.workedExample;
  const [showSolution, setShowSolution] = useState(false);

  return (
    <main className="pattern-learn-page">
      <button type="button" className="pattern-back-btn" onClick={onBack}>
        ← ALL PATTERNS
      </button>

      <div className="pattern-order">PATTERN {pattern.order} / 14</div>
      <h1 className="pattern-name" style={{ fontSize: 24 }}>
        {pattern.name}
      </h1>

      <div className="recognition-box">
        <div className="recognition-box-label">RECOGNITION TRIGGER — MEMORISE</div>
        <div style={{ color: "#a0ffa0", fontSize: 14, lineHeight: 1.5 }}>
          {pattern.recognitionTrigger}
        </div>
      </div>

      <p className="why-box">{pattern.whyItWorks}</p>

      <div style={{ height: 1, background: "#1e1e2e", margin: "24px 0" }} />

      <h2 style={{ color: "#ccc", fontSize: 16, marginBottom: 12 }}>
        Worked example: {ex.title}
      </h2>
      <div>
        <span className={`difficulty-badge ${difficultyClass(ex.difficulty)}`}>
          {ex.difficulty}
        </span>
        <span className="platform-badge">{ex.platform}</span>
      </div>
      <p style={{ color: "#aaa", fontSize: 14, lineHeight: 1.6, marginTop: 12 }}>
        {ex.description}
      </p>
      <div className="example-block">{ex.example}</div>

      <p style={{ color: "#666", fontSize: 13, fontStyle: "italic", margin: "16px 0" }}>
        Attempt it yourself in your editor for 20 minutes before revealing the
        solution. Stuck after 10 minutes? Read the hint only first.
      </p>

      <button
        type="button"
        className="pattern-secondary-btn"
        onClick={() => setShowSolution((v) => !v)}
      >
        {showSolution ? "Hide Solution" : "Show Solution"}
      </button>

      {showSolution && (
        <>
          <pre className="solution-code">{ex.solution}</pre>
          <div className="key-insight">
            <strong style={{ color: "#00ff88" }}>Key insight: </strong>
            {ex.keyInsight}
          </div>
        </>
      )}

      <div className="pattern-action-row">
        <button type="button" className="pattern-primary-btn" onClick={onStartPractice}>
          Start Practice Problems →
        </button>
      </div>
    </main>
  );
}
