import { useEffect, useMemo, useState } from "react";
import {
  CONSOLE_CHALLENGES,
  ENRICHED_SYSTEM_DESIGN,
  SKILL_LESSONS,
  VISUAL_STUDIO_SETUP,
} from "../constants/consoleLab";
import type { ChallengeApproach, ConsoleChallenge, VisualStudioStep } from "../types/consoleLab";
import { backBtnStyle, colors, sizes } from "../theme/tokens";
import {
  evaluateSubmission,
  loadProgress,
  saveProgress,
} from "../utils/consoleLabEvaluator";
import {
  getLock,
  isChallengeLocked,
  peeksRemaining,
  recordChallengeOpen,
  submitChallengeCode,
} from "../utils/consoleLabLock";

type LabMode = "console" | "design" | "learn";
type ConsoleTab = "brief" | "think" | "vs" | "submit";

const ACCENT = "#00e5a0";

const pill = (active: boolean, accent = ACCENT): React.CSSProperties => ({
  background: active ? `${accent}18` : colors.bgDark,
  border: `1px solid ${active ? accent : colors.border}`,
  color: active ? accent : colors.textGhost,
  borderRadius: sizes.radiusMd,
  padding: "8px 14px",
  cursor: "pointer",
  fontSize: sizes.fontXs,
  fontWeight: active ? 700 : 500,
  fontFamily: "inherit",
  letterSpacing: "1px",
  textAlign: "left",
});

const card: React.CSSProperties = {
  background: colors.bgCard,
  border: `1px solid ${colors.border}`,
  borderRadius: sizes.radiusLg,
  padding: sizes.spacingXl,
  marginBottom: sizes.spacingMd,
};

const textarea: React.CSSProperties = {
  width: "100%",
  minHeight: "320px",
  background: "#050508",
  color: "#a8d8a8",
  border: `1px solid ${colors.border}`,
  borderRadius: sizes.radiusMd,
  padding: sizes.spacingMd,
  fontFamily: "JetBrains Mono, Consolas, monospace",
  fontSize: "12px",
  lineHeight: 1.6,
  resize: "vertical",
  boxSizing: "border-box",
};

function mergeCriteria(challenge: ConsoleChallenge, approach: ChallengeApproach) {
  return [...challenge.criteria, ...(approach.criteriaExtras ?? [])];
}

export default function ConsoleLab({ onBack }: { onBack: () => void }) {
  const [mode, setMode] = useState<LabMode>("console");
  const [consoleId, setConsoleId] = useState(CONSOLE_CHALLENGES[0].id);
  const [designId, setDesignId] = useState(ENRICHED_SYSTEM_DESIGN[0].id);
  const [approachIdx, setApproachIdx] = useState(0);
  const [learnSkill, setLearnSkill] = useState(SKILL_LESSONS[0].id);
  const [tab, setTab] = useState<ConsoleTab>("brief");
  const [code, setCode] = useState("");
  const [designAnswer, setDesignAnswer] = useState("");
  const [progress, setProgress] = useState(loadProgress);
  const [locks, setLocks] = useState<Record<string, ReturnType<typeof getLock>>>({});
  const [submitMsg, setSubmitMsg] = useState<string | null>(null);
  const [result, setResult] = useState<ReturnType<typeof evaluateSubmission> | null>(null);

  const consoleChallenge = useMemo(
    () => CONSOLE_CHALLENGES.find((c) => c.id === consoleId) ?? CONSOLE_CHALLENGES[0],
    [consoleId],
  );

  const designChallenge = useMemo(
    () => ENRICHED_SYSTEM_DESIGN.find((c) => c.id === designId) ?? ENRICHED_SYSTEM_DESIGN[0],
    [designId],
  );

  const lockRecord = locks[consoleId] ?? getLock(consoleId);
  const locked = mode === "console" && isChallengeLocked(lockRecord);
  const peeksLeft = peeksRemaining(lockRecord);

  const activeApproach = useMemo(() => {
    const c = mode === "console" ? consoleChallenge : designChallenge;
    const approaches = c.approaches ?? [];
    return approaches[approachIdx] ?? approaches[0];
  }, [mode, consoleChallenge, designChallenge, approachIdx]);

  const activeId = mode === "console" ? consoleId : designId;
  const activeProgress = progress[activeId];
  const challenge = mode === "console" ? consoleChallenge : designChallenge;
  const skillLesson = SKILL_LESSONS.find((s) => s.id === learnSkill) ?? SKILL_LESSONS[0];

  useEffect(() => {
    if (mode !== "console") return;
    const rec = recordChallengeOpen(consoleId);
    setLocks((prev) => ({ ...prev, [consoleId]: rec }));
  }, [consoleId, mode]);

  useEffect(() => {
    if (locked) setTab("submit");
  }, [locked, consoleId]);

  const handleEvaluate = () => {
    const base = mode === "console" ? consoleChallenge : designChallenge;
    const criteria =
      mode === "console"
        ? mergeCriteria(consoleChallenge, activeApproach)
        : base.criteria;
    const text = mode === "console" ? code : designAnswer;
    const evalResult = evaluateSubmission(criteria, text);
    setResult(evalResult);
    setProgress(saveProgress(activeId, evalResult.percent, progress));
  };

  const handleSubmitForReview = () => {
    const res = submitChallengeCode(consoleId, code);
    setSubmitMsg(res.message);
    setLocks((prev) => ({ ...prev, [consoleId]: res.record }));
    if (res.ok) setTab("think");
  };

  const selectConsole = (id: string) => {
    setConsoleId(id);
    setApproachIdx(0);
    setTab("brief");
    setCode("");
    setResult(null);
    setSubmitMsg(null);
  };

  const selectDesign = (id: string) => {
    setDesignId(id);
    setApproachIdx(0);
    setDesignAnswer("");
    setResult(null);
  };

  const canViewBriefThink = !locked || lockRecord.submitted;

  return (
    <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
      <aside
        style={{
          width: "280px",
          borderRight: `1px solid ${colors.border}`,
          background: colors.bgDark,
          overflowY: "auto",
          padding: sizes.spacingMd,
          flexShrink: 0,
        }}
      >
        <button type="button" onClick={onBack} style={{ ...backBtnStyle, marginBottom: sizes.spacingMd }}>
          ← BACK
        </button>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: sizes.spacingMd }}>
          <button type="button" style={pill(mode === "console")} onClick={() => setMode("console")}>
            CODE ({CONSOLE_CHALLENGES.length})
          </button>
          <button type="button" style={pill(mode === "design")} onClick={() => setMode("design")}>
            DESIGN ({ENRICHED_SYSTEM_DESIGN.length})
          </button>
          <button type="button" style={pill(mode === "learn", "#00cfff")} onClick={() => setMode("learn")}>
            LEARN
          </button>
        </div>

        {mode === "learn" ? (
          SKILL_LESSONS.map((s) => (
            <button
              key={s.id}
              type="button"
              style={{ ...pill(learnSkill === s.id, "#00cfff"), display: "block", width: "100%", marginBottom: "6px" }}
              onClick={() => setLearnSkill(s.id)}
            >
              {s.title}
            </button>
          ))
        ) : (
          (mode === "console" ? CONSOLE_CHALLENGES : ENRICHED_SYSTEM_DESIGN).map((c) => {
            const rec = locks[c.id] ?? getLock(c.id);
            const isLocked = mode === "console" && isChallengeLocked(rec);
            const pct = progress[c.id]?.percent;
            return (
              <button
                key={c.id}
                type="button"
                style={{
                  ...pill(c.id === activeId),
                  display: "block",
                  width: "100%",
                  marginBottom: "6px",
                  opacity: isLocked ? 0.85 : 1,
                }}
                onClick={() => (mode === "console" ? selectConsole(c.id) : selectDesign(c.id))}
              >
                <div style={{ fontWeight: 700 }}>
                  {isLocked ? "🔒 " : rec.submitted ? "✓ " : ""}
                  {c.title}
                </div>
                <div style={{ fontSize: "10px", opacity: 0.7 }}>
                  {c.source} · {c.timeMinutes}m
                  {pct != null ? ` · ${pct}%` : ""}
                  {mode === "console" && !rec.submitted ? ` · ${peeksRemaining(rec)} peeks left` : ""}
                </div>
              </button>
            );
          })
        )}
      </aside>

      <main style={{ flex: 1, overflowY: "auto", padding: sizes.spacingXl }}>
        <div style={{ maxWidth: "920px", margin: "0 auto" }}>
          <h1 style={{ color: ACCENT, fontSize: sizes.fontXl, margin: "0 0 8px", letterSpacing: "2px" }}>
            CONSOLE LAB
          </h1>

          {mode === "learn" ? (
            <div style={card}>
              <div style={{ color: "#00cfff", fontWeight: 700, fontSize: sizes.fontLg, marginBottom: sizes.spacingMd }}>
                {skillLesson.title}
              </div>
              <p style={{ color: colors.textMuted, lineHeight: 1.7 }}>{skillLesson.intro}</p>
              <div style={{ color: colors.yellow, fontWeight: 600, marginTop: sizes.spacingMd }}>
                Must memorise
              </div>
              <ul style={{ color: colors.text, lineHeight: 1.8 }}>
                {skillLesson.mustMemorise.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
              {skillLesson.steps.map((s) => (
                <div key={s.step} style={{ marginTop: sizes.spacingMd }}>
                  <div style={{ color: colors.info, fontWeight: 600 }}>
                    Step {s.step}: {s.title}
                  </div>
                  <p style={{ color: colors.textMuted, margin: "4px 0 0" }}>{s.body}</p>
                </div>
              ))}
              <div style={{ color: ACCENT, fontWeight: 600, marginTop: sizes.spacingLg }}>
                Two approaches
              </div>
              <p style={{ color: colors.textMuted }}>
                A: {skillLesson.twoApproachesSummary.a}
                <br />
                B: {skillLesson.twoApproachesSummary.b}
              </p>
              <div style={{ color: colors.warn, fontWeight: 600, marginTop: sizes.spacingMd }}>
                Keep learning (Console Lab)
              </div>
              <ul style={{ color: colors.textMuted, paddingLeft: "20px" }}>
                {skillLesson.keepLearning.map((k) => (
                  <li key={k}>{k}</li>
                ))}
              </ul>
              <div style={{ color: "#00cfff", fontWeight: 600, marginTop: sizes.spacingLg }}>
                Visual Studio Community — setup once
              </div>
              <VisualStudioPanel steps={skillLesson.visualStudioSetup} compact />
            </div>
          ) : (
            <>
              {locked && (
                <div
                  style={{
                    ...card,
                    borderColor: colors.warn,
                    background: `${colors.warn}10`,
                  }}
                >
                  <div style={{ color: colors.warn, fontWeight: 700, marginBottom: sizes.spacingSm }}>
                    🔒 Locked — code first, then unlock
                  </div>
                  <p style={{ color: colors.textMuted, lineHeight: 1.65, margin: 0 }}>
                    You opened this challenge more than twice without submitting code. Brief and thought
                    process are hidden until you paste your <strong>Program.cs</strong> from Visual Studio
                    and click <strong>Submit for review</strong>. This forces you to type, not read.
                    {peeksLeft === 0 && " (0 peeks left)"}
                  </p>
                </div>
              )}

              {canViewBriefThink && (
                <div style={card}>
                  <div style={{ color: ACCENT, fontWeight: 700, marginBottom: "8px" }}>{challenge.title}</div>
                  <div style={{ fontSize: sizes.fontSm, color: colors.textGhost, marginBottom: sizes.spacingSm }}>
                    {challenge.source} · {challenge.difficulty} · ~{challenge.timeMinutes} min
                    {"dataSkill" in challenge && (
                      <span style={{ color: "#00cfff" }}> · {"dataSkill" in challenge ? challenge.dataSkill : ""}</span>
                    )}
                  </div>
                  {"datasetUrl" in challenge && challenge.datasetUrl && (
                    <p style={{ fontSize: sizes.fontSm, marginBottom: sizes.spacingMd }}>
                      Dataset:{" "}
                      <a href={challenge.datasetUrl} target="_blank" rel="noreferrer" style={{ color: ACCENT }}>
                        {challenge.datasetUrl}
                      </a>
                    </p>
                  )}
                  <p style={{ color: colors.text, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{challenge.prompt}</p>
                  {"exampleOutput" in challenge && challenge.exampleOutput && (
                    <>
                      <div style={{ color: colors.textGhost, fontSize: sizes.fontSm, marginTop: sizes.spacingMd }}>
                        Example output
                      </div>
                      <pre style={{ ...textarea, minHeight: "auto", marginTop: "6px" }}>
                        {challenge.exampleOutput}
                      </pre>
                    </>
                  )}
                </div>
              )}

              {/* Two approaches */}
              {(mode === "design" || canViewBriefThink) && challenge.approaches && (
                <div style={{ display: "flex", gap: "8px", marginBottom: sizes.spacingMd, flexWrap: "wrap" }}>
                  {challenge.approaches.map((a, i) => (
                    <button
                      key={a.id}
                      type="button"
                      style={pill(approachIdx === i)}
                      onClick={() => setApproachIdx(i)}
                    >
                      {a.name}
                    </button>
                  ))}
                </div>
              )}

              {mode === "console" && canViewBriefThink && (
                <div style={{ display: "flex", gap: "8px", marginBottom: sizes.spacingMd, flexWrap: "wrap" }}>
                  {(
                    [
                      ["brief", "APPROACH"],
                      ["think", "STEPS"],
                      ["vs", "VS LINES"],
                      ["submit", "PASTE CODE"],
                    ] as const
                  ).map(([t, label]) => (
                    <button key={t} type="button" style={pill(tab === t)} onClick={() => setTab(t)}>
                      {label}
                    </button>
                  ))}
                </div>
              )}

              {mode === "design" && canViewBriefThink && (
                <ApproachPanel approach={activeApproach} mistakes={challenge.commonMistakes} />
              )}

              {mode === "console" && canViewBriefThink && tab === "brief" && (
                <div style={card}>
                  <div style={{ color: ACCENT, fontWeight: 700 }}>{activeApproach.name}</div>
                  <p style={{ color: colors.textMuted, marginTop: sizes.spacingSm }}>
                    <strong style={{ color: colors.text }}>When:</strong> {activeApproach.whenToUse}
                  </p>
                  <ol style={{ color: colors.textMuted, lineHeight: 1.8 }}>
                    {activeApproach.skeleton.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ol>
                  <p style={{ color: colors.textGhost, fontSize: sizes.fontSm, marginTop: sizes.spacingMd }}>
                    Open the <strong style={{ color: ACCENT }}>VS LINES</strong> tab for line-by-line typing in Visual
                    Studio Community.
                  </p>
                </div>
              )}

              {mode === "console" && canViewBriefThink && tab === "think" && activeApproach && (
                <ApproachPanel approach={activeApproach} mistakes={challenge.commonMistakes} />
              )}

              {mode === "console" && canViewBriefThink && tab === "vs" && activeApproach && (
                <div style={card}>
                  <div style={{ color: "#00cfff", fontWeight: 700, marginBottom: sizes.spacingSm }}>
                    Visual Studio Community — {activeApproach.name}
                  </div>
                  <p style={{ color: colors.textMuted, lineHeight: 1.65, marginTop: 0 }}>
                    Do this in order. Type each code block into <strong>Program.cs</strong>, then{" "}
                    <strong>Ctrl+F5</strong> after each milestone.
                  </p>
                  <VisualStudioPanel steps={VISUAL_STUDIO_SETUP} compact title="1. Project setup (first time only)" />
                  <VisualStudioPanel
                    steps={activeApproach.visualStudioSteps ?? []}
                    title="2. Line-by-line in Program.cs"
                  />
                </div>
              )}

              {(mode === "design" || tab === "submit" || locked) && (
                <div style={card}>
                  <div style={{ color: ACCENT, fontWeight: 700, marginBottom: sizes.spacingSm }}>
                    {mode === "console"
                      ? "Paste Program.cs — then Submit for review to unlock"
                      : "Write design (required headings)"}
                  </div>
                  <textarea
                    value={mode === "console" ? code : designAnswer}
                    onChange={(e) =>
                      mode === "console" ? setCode(e.target.value) : setDesignAnswer(e.target.value)
                    }
                    placeholder={
                      mode === "console"
                        ? "// Type in Visual Studio first. Paste full solution here..."
                        : "tech:\n...\n\ndatabase:\n..."
                    }
                    style={textarea}
                    spellCheck={false}
                  />
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: sizes.spacingMd }}>
                    <button
                      type="button"
                      onClick={handleEvaluate}
                      style={{
                        background: `${ACCENT}22`,
                        border: `1px solid ${ACCENT}`,
                        color: ACCENT,
                        borderRadius: sizes.radiusMd,
                        padding: "10px 20px",
                        fontWeight: 700,
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      EVALUATE RUBRIC
                    </button>
                    {mode === "console" && (
                      <button
                        type="button"
                        onClick={handleSubmitForReview}
                        style={{
                          background: `${colors.warn}22`,
                          border: `1px solid ${colors.warn}`,
                          color: colors.warn,
                          borderRadius: sizes.radiusMd,
                          padding: "10px 20px",
                          fontWeight: 700,
                          cursor: "pointer",
                          fontFamily: "inherit",
                        }}
                      >
                        SUBMIT FOR REVIEW
                      </button>
                    )}
                    {activeProgress != null && (
                      <span style={{ color: colors.textGhost, fontSize: sizes.fontSm, alignSelf: "center" }}>
                        Last rubric: {activeProgress.percent}%
                      </span>
                    )}
                  </div>
                  {submitMsg && (
                    <p style={{ color: colors.info, marginTop: sizes.spacingSm, fontSize: sizes.fontSm }}>
                      {submitMsg}
                    </p>
                  )}
                </div>
              )}

              {result && (mode === "design" || tab === "submit" || locked) && (
                <div style={{ ...card, borderColor: result.percent >= 70 ? ACCENT : colors.warn }}>
                  <div style={{ fontWeight: 700, color: result.percent >= 70 ? ACCENT : colors.warn }}>
                    {result.percent}% — {result.summary}
                  </div>
                  <p style={{ color: colors.textGhost, fontSize: sizes.fontSm }}>
                    Approach: {activeApproach.name}. Always Ctrl+F5 in VS — rubric is pattern check only.
                  </p>
                  {result.checks.map((check) => (
                    <div key={check.id} style={{ display: "flex", gap: "10px", padding: "8px 0", borderBottom: `1px solid ${colors.border}` }}>
                      <span style={{ color: check.passed ? ACCENT : colors.error }}>{check.passed ? "✓" : "✗"}</span>
                      <div>
                        <div style={{ fontWeight: 600 }}>{check.label}</div>
                        {!check.passed && <div style={{ fontSize: sizes.fontSm, color: colors.textGhost }}>{check.hint}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function ApproachPanel({
  approach,
  mistakes,
}: {
  approach: ChallengeApproach;
  mistakes: string[];
}) {
  return (
    <div style={card}>
      <div style={{ color: ACCENT, fontWeight: 700, marginBottom: sizes.spacingMd }}>
        Thought process — {approach.name}
      </div>
      {approach.thoughtProcess.map((s) => (
        <div key={s.step} style={{ marginBottom: sizes.spacingMd }}>
          <div style={{ color: colors.info, fontWeight: 600 }}>
            Step {s.step}: {s.title}
          </div>
          <p style={{ color: colors.textMuted, margin: "6px 0 0", lineHeight: 1.65 }}>{s.body}</p>
        </div>
      ))}
      <div style={{ color: colors.error, fontWeight: 600, marginTop: sizes.spacingMd }}>Common mistakes</div>
      <ul style={{ color: colors.textMuted, paddingLeft: "20px" }}>
        {mistakes.map((m) => (
          <li key={m}>{m}</li>
        ))}
      </ul>
    </div>
  );
}

const codeBlock: React.CSSProperties = {
  background: "#050508",
  color: "#a8d8a8",
  border: `1px solid ${colors.border}`,
  borderRadius: sizes.radiusMd,
  padding: sizes.spacingMd,
  fontFamily: "JetBrains Mono, Consolas, monospace",
  fontSize: "11px",
  lineHeight: 1.55,
  overflowX: "auto",
  whiteSpace: "pre-wrap",
  margin: "8px 0 0",
};

function VisualStudioPanel({
  steps,
  title,
  compact,
}: {
  steps: VisualStudioStep[];
  title?: string;
  compact?: boolean;
}) {
  if (steps.length === 0) return null;

  return (
    <div style={{ marginTop: compact ? sizes.spacingMd : 0 }}>
      {title && (
        <div style={{ color: ACCENT, fontWeight: 600, marginBottom: sizes.spacingSm, fontSize: sizes.fontSm }}>
          {title}
        </div>
      )}
      {steps.map((s) => (
        <div
          key={s.step}
          style={{
            marginBottom: compact ? sizes.spacingSm : sizes.spacingMd,
            paddingBottom: compact ? sizes.spacingSm : sizes.spacingMd,
            borderBottom: `1px solid ${colors.border}`,
          }}
        >
          <div style={{ color: colors.info, fontWeight: 600 }}>
            {compact ? "" : `Line block ${s.step}: `}
            {s.title}
          </div>
          {s.vsAction && (
            <div style={{ color: "#00cfff", fontSize: sizes.fontSm, marginTop: "4px" }}>{s.vsAction}</div>
          )}
          <p style={{ color: colors.textMuted, margin: "6px 0 0", lineHeight: 1.65, fontSize: compact ? sizes.fontSm : undefined }}>
            {s.body}
          </p>
          {s.code && <pre style={codeBlock}>{s.code}</pre>}
        </div>
      ))}
    </div>
  );
}
