import { useState } from "react";
import {
  CALM_PROTOCOLS,
  DAILY_HABITS,
  INTERVIEW_READY_CHECKLIST,
  MEMORY_TECHNIQUES,
  RESEARCH_SUMMARY,
  SPACED_SCHEDULE,
  SRTC_PROTOCOL,
  WEEKLY_PLAN,
} from "../constants/brainTraining";
import {
  habitProgress,
  loadFailureLog,
  loadHabitState,
  loadStreak,
  saveFailureLog,
  toggleHabit,
} from "../utils/brainTrainingStorage";
import { backBtnStyle, colors, sizes } from "../theme/tokens";

type Tab = "daily" | "memory" | "srtc" | "calm" | "research" | "ready";

const ACCENT = "#ff9f43";

const pill = (active: boolean): React.CSSProperties => ({
  background: active ? `${ACCENT}18` : colors.bgDark,
  border: `1px solid ${active ? ACCENT : colors.border}`,
  color: active ? ACCENT : colors.textGhost,
  borderRadius: sizes.radiusMd,
  padding: "8px 14px",
  cursor: "pointer",
  fontSize: sizes.fontXs,
  fontWeight: active ? 700 : 500,
  fontFamily: "inherit",
  letterSpacing: "1px",
});

const card: React.CSSProperties = {
  background: colors.bgCard,
  border: `1px solid ${colors.border}`,
  borderRadius: sizes.radiusLg,
  padding: sizes.spacingXl,
  marginBottom: sizes.spacingMd,
};

const categoryColor: Record<string, string> = {
  recall: colors.info,
  practice: ACCENT,
  body: "#00e5a0",
  calm: "#bf7fff",
  review: colors.yellow,
};

export default function BrainTraining({ onBack }: { onBack: () => void }) {
  const [tab, setTab] = useState<Tab>("daily");
  const [habits, setHabits] = useState(loadHabitState);
  const [streak, setStreak] = useState(loadStreak);
  const [failureLog, setFailureLog] = useState(loadFailureLog);
  const [expandedTechnique, setExpandedTechnique] = useState<string | null>(
    MEMORY_TECHNIQUES[0].id,
  );
  const [expandedCalm, setExpandedCalm] = useState<string | null>(
    CALM_PROTOCOLS[0].id,
  );
  const [readyChecked, setReadyChecked] = useState<Record<number, boolean>>({});

  const progress = habitProgress(habits.checked, DAILY_HABITS.length);

  const handleToggleHabit = (id: string) => {
    setHabits(toggleHabit(id, habits));
    setStreak(loadStreak());
  };

  const handleSaveLog = () => {
    saveFailureLog(failureLog);
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: "daily", label: "DAILY HABITS" },
    { id: "memory", label: "MEMORY TECH" },
    { id: "srtc", label: "S.R.T.C." },
    { id: "calm", label: "CALM" },
    { id: "research", label: "SCIENCE" },
    { id: "ready", label: "INTERVIEW READY" },
  ];

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: sizes.spacingXl }}>
      <div style={{ maxWidth: "920px", margin: "0 auto" }}>
        <button type="button" onClick={onBack} style={{ ...backBtnStyle, marginBottom: sizes.spacingMd }}>
          ← BACK
        </button>

        <h1 style={{ color: ACCENT, margin: "0 0 8px", letterSpacing: "3px", fontSize: sizes.fontXl }}>
          BRAIN LAB
        </h1>
        <p style={{ color: colors.textMuted, margin: "0 0 20px", lineHeight: 1.65 }}>
          Interview readiness is trained — not hoped for. Research-backed recall, daily habits, and calm
          protocols. Pair with{" "}
          <strong style={{ color: colors.text }}>Console Lab</strong> for typing reps.
        </p>

        {/* Streak bar */}
        <div
          style={{
            ...card,
            display: "flex",
            flexWrap: "wrap",
            gap: "20px",
            alignItems: "center",
            borderColor: `${ACCENT}44`,
          }}
        >
          <div>
            <div style={{ color: colors.textGhost, fontSize: sizes.fontXs, letterSpacing: "1px" }}>
              TODAY
            </div>
            <div style={{ color: ACCENT, fontSize: sizes.fontXl, fontWeight: 700 }}>
              {progress.done}/{progress.total} habits
            </div>
          </div>
          <div>
            <div style={{ color: colors.textGhost, fontSize: sizes.fontXs, letterSpacing: "1px" }}>
              STREAK (6+ habits/day)
            </div>
            <div style={{ color: colors.yellow, fontSize: sizes.fontXl, fontWeight: 700 }}>
              🔥 {streak.currentStreak} · best {streak.longestStreak}
            </div>
          </div>
          <div style={{ flex: 1, minWidth: "200px" }}>
            <div
              style={{
                height: "8px",
                background: colors.bgDark,
                borderRadius: "4px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${progress.percent}%`,
                  height: "100%",
                  background: ACCENT,
                  transition: "width 300ms ease",
                }}
              />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: sizes.spacingLg }}>
          {tabs.map((t) => (
            <button key={t.id} type="button" style={pill(tab === t.id)} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        {/* DAILY */}
        {tab === "daily" && (
          <>
            <div style={card}>
              <div style={{ color: ACCENT, fontWeight: 700, marginBottom: sizes.spacingMd, letterSpacing: "1px" }}>
                Always do these (every interview-prep day)
              </div>
              {DAILY_HABITS.map((h) => (
                <label
                  key={h.id}
                  style={{
                    display: "flex",
                    gap: "12px",
                    padding: "12px 0",
                    borderBottom: `1px solid ${colors.border}`,
                    cursor: "pointer",
                    alignItems: "flex-start",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={!!habits.checked[h.id]}
                    onChange={() => handleToggleHabit(h.id)}
                    style={{ marginTop: "4px", accentColor: ACCENT }}
                  />
                  <div>
                    <div style={{ color: colors.text, fontWeight: 600 }}>
                      {h.label}
                      {h.minutes != null && (
                        <span style={{ color: colors.textGhost, fontWeight: 400 }}>
                          {" "}
                          · ~{h.minutes}m
                        </span>
                      )}
                      <span
                        style={{
                          marginLeft: "8px",
                          fontSize: sizes.fontXs,
                          color: categoryColor[h.category],
                        }}
                      >
                        {h.category.toUpperCase()}
                      </span>
                    </div>
                    <div style={{ color: colors.textMuted, fontSize: sizes.fontSm, marginTop: "4px" }}>
                      {h.why}
                    </div>
                  </div>
                </label>
              ))}
            </div>

            <div style={card}>
              <div style={{ color: colors.error, fontWeight: 700, marginBottom: sizes.spacingSm }}>
                Failure log (1 line after each rep)
              </div>
              <p style={{ color: colors.textMuted, fontSize: sizes.fontSm, marginBottom: sizes.spacingMd }}>
                Errorful learning: name the bug once, fix it next rep. Read this tomorrow before typing.
              </p>
              <textarea
                value={failureLog}
                onChange={(e) => setFailureLog(e.target.value)}
                onBlur={handleSaveLog}
                placeholder="e.g. Forgot ThenBy for tie-break on dog breeds / Used Substring after space on postcode"
                style={{
                  width: "100%",
                  minHeight: "80px",
                  background: colors.bgDark,
                  border: `1px solid ${colors.border}`,
                  borderRadius: sizes.radiusMd,
                  color: colors.text,
                  padding: sizes.spacingMd,
                  fontFamily: "inherit",
                  fontSize: sizes.fontMd,
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div style={card}>
              <div style={{ color: colors.info, fontWeight: 700, marginBottom: sizes.spacingMd }}>
                Weekly rhythm
              </div>
              {WEEKLY_PLAN.map((d) => (
                <div key={d.day} style={{ marginBottom: sizes.spacingMd }}>
                  <div style={{ color: ACCENT, fontWeight: 600 }}>
                    {d.day} — {d.focus}
                  </div>
                  <ul style={{ color: colors.textMuted, margin: "6px 0 0", paddingLeft: "20px" }}>
                    {d.tasks.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </>
        )}

        {/* MEMORY TECH */}
        {tab === "memory" && (
          <>
            {MEMORY_TECHNIQUES.map((t) => (
              <div key={t.id} style={card}>
                <button
                  type="button"
                  onClick={() =>
                    setExpandedTechnique(expandedTechnique === t.id ? null : t.id)
                  }
                  style={{
                    background: "transparent",
                    border: "none",
                    color: ACCENT,
                    fontWeight: 700,
                    fontSize: sizes.fontLg,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    padding: 0,
                    textAlign: "left",
                    width: "100%",
                  }}
                >
                  {expandedTechnique === t.id ? "▼" : "▶"} {t.name}
                </button>
                <div style={{ color: colors.textGhost, fontSize: sizes.fontSm, marginTop: "6px" }}>
                  {t.evidence}
                </div>
                {expandedTechnique === t.id && (
                  <div style={{ marginTop: sizes.spacingMd }}>
                    <Row label="What it is" value={t.whatItIs} />
                    <Row label="For coding interviews" value={t.howToApplyTechnical} accent />
                    <Row label="Daily micro-drill (2–5 min)" value={t.dailyMicroDrill} />
                    <Row label="Avoid" value={t.avoid} warn />
                  </div>
                )}
              </div>
            ))}
          </>
        )}

        {/* S.R.T.C. */}
        {tab === "srtc" && (
          <>
            <div style={card}>
              <div style={{ color: ACCENT, fontSize: sizes.fontLg, fontWeight: 700, marginBottom: sizes.spacingMd }}>
                {SRTC_PROTOCOL.name}
              </div>
              <p style={{ color: colors.textMuted, lineHeight: 1.7 }}>
                Muscle memory = typing from blank file, not re-reading guides. Four stages:
              </p>
              {SRTC_PROTOCOL.reps.map((r) => (
                <div
                  key={r.rep}
                  style={{
                    marginTop: sizes.spacingMd,
                    padding: sizes.spacingMd,
                    background: colors.bgDark,
                    borderRadius: sizes.radiusMd,
                    borderLeft: `3px solid ${ACCENT}`,
                  }}
                >
                  <div style={{ color: ACCENT, fontWeight: 700 }}>{r.rep}</div>
                  <div style={{ color: colors.text }}>{r.action}</div>
                  <div style={{ color: colors.textGhost, fontSize: sizes.fontSm }}>Goal: {r.goal}</div>
                </div>
              ))}
              <p style={{ color: colors.yellow, marginTop: sizes.spacingMd, fontWeight: 600 }}>
                {SRTC_PROTOCOL.rule}
              </p>
            </div>

            <div style={card}>
              <div style={{ color: colors.info, fontWeight: 700, marginBottom: sizes.spacingMd }}>
                Spaced repetition schedule (same challenge)
              </div>
              {SPACED_SCHEDULE.map((s) => (
                <div
                  key={s.day}
                  style={{
                    display: "flex",
                    gap: "16px",
                    padding: "10px 0",
                    borderBottom: `1px solid ${colors.border}`,
                  }}
                >
                  <div style={{ color: ACCENT, minWidth: "70px", fontWeight: 700 }}>{s.label}</div>
                  <div style={{ color: colors.textMuted }}>{s.action}</div>
                </div>
              ))}
            </div>

            <div style={card}>
              <div style={{ color: colors.text, fontWeight: 700, marginBottom: sizes.spacingSm }}>
                Say-aloud rule (while typing)
              </div>
              <p style={{ color: colors.textMuted, lineHeight: 1.7 }}>
                For every non-obvious line, one sentence: <em>why</em> this column, <em>why</em> decimal,{" "}
                <em>why</em> ThenBy. If you can teach it while typing, you will remember under pressure.
              </p>
            </div>
          </>
        )}

        {/* CALM */}
        {tab === "calm" && (
          <>
            {CALM_PROTOCOLS.map((p) => (
              <div key={p.id} style={card}>
                <button
                  type="button"
                  onClick={() => setExpandedCalm(expandedCalm === p.id ? null : p.id)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#bf7fff",
                    fontWeight: 700,
                    fontSize: sizes.fontLg,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    padding: 0,
                    textAlign: "left",
                  }}
                >
                  {expandedCalm === p.id ? "▼" : "▶"} {p.title}
                </button>
                <div style={{ color: colors.textGhost, fontSize: sizes.fontSm, marginTop: "4px" }}>
                  When: {p.when} · ~{p.durationSeconds}s
                </div>
                {expandedCalm === p.id && (
                  <ol style={{ color: colors.textMuted, lineHeight: 1.8, marginTop: sizes.spacingMd }}>
                    {p.steps.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ol>
                )}
              </div>
            ))}
          </>
        )}

        {/* RESEARCH */}
        {tab === "research" && (
          <div style={card}>
            <div style={{ color: ACCENT, fontWeight: 700, marginBottom: sizes.spacingMd }}>
              {RESEARCH_SUMMARY.title}
            </div>
            {RESEARCH_SUMMARY.points.map((p) => (
              <div key={p.label} style={{ marginBottom: sizes.spacingLg }}>
                <div style={{ color: colors.text, fontWeight: 600 }}>{p.label}</div>
                <p style={{ color: colors.textMuted, margin: "6px 0 0", lineHeight: 1.65, fontSize: sizes.fontMd }}>
                  {p.detail}
                </p>
              </div>
            ))}
            <p style={{ color: colors.textGhost, fontSize: sizes.fontSm, marginTop: sizes.spacingMd }}>
              Sources: Roediger & Karpicke (2006) testing effect; Cepeda et al. spacing meta-analyses;
              Ebbinghaus forgetting curve; sleep & memory consolidation (PMC6671268). Applied here to
              technical interview prep — not medical advice.
            </p>
          </div>
        )}

        {/* INTERVIEW READY */}
        {tab === "ready" && (
          <div style={card}>
            <div style={{ color: ACCENT, fontWeight: 700, marginBottom: sizes.spacingMd }}>
              Am I interview-ready? (honest check)
            </div>
            <p style={{ color: colors.textMuted, marginBottom: sizes.spacingMd }}>
              Check only what is true today. If fewer than 6, you need reps not new topics.
            </p>
            {INTERVIEW_READY_CHECKLIST.map((item, i) => (
              <label
                key={item}
                style={{
                  display: "flex",
                  gap: "12px",
                  padding: "10px 0",
                  borderBottom: `1px solid ${colors.border}`,
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={!!readyChecked[i]}
                  onChange={() =>
                    setReadyChecked((prev) => ({ ...prev, [i]: !prev[i] }))
                  }
                  style={{ accentColor: ACCENT }}
                />
                <span style={{ color: colors.textMuted, lineHeight: 1.5 }}>{item}</span>
              </label>
            ))}
            <div style={{ marginTop: sizes.spacingLg, color: colors.yellow, fontWeight: 600 }}>
              {Object.values(readyChecked).filter(Boolean).length >= 6
                ? "Green light — polish calm ritual and sleep."
                : "Not yet — open Console Lab, pick one challenge, do Rep 1 blank page today."}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  accent,
  warn,
}: {
  label: string;
  value: string;
  accent?: boolean;
  warn?: boolean;
}) {
  return (
    <div style={{ marginBottom: sizes.spacingMd }}>
      <div
        style={{
          color: warn ? colors.error : accent ? colors.info : colors.textGhost,
          fontSize: sizes.fontXs,
          letterSpacing: "1px",
          marginBottom: "4px",
        }}
      >
        {label.toUpperCase()}
      </div>
      <div style={{ color: colors.textMuted, lineHeight: 1.65 }}>{value}</div>
    </div>
  );
}
