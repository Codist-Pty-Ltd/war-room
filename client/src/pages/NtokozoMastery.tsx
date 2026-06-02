import { useMemo, useState } from "react";
import {
  NTOKOZO_TRACKS,
  type CodeDrill,
  type MasteryDefinition,
  type MasteryDifficulty,
  type MasteryDrill,
  type MasteryTrack,
} from "../constants/ntokozoMastery";
import { backBtnStyle, colors, sizes } from "../theme/tokens";

type SubTab = "definitions" | "drills" | "code";
type DifficultyFilter = "all" | "senior" | "lead" | "principal";

const ACCENT = "#bf7fff";

const trackPillStyle = (active: boolean): React.CSSProperties => ({
  background: active ? `${ACCENT}18` : colors.bgDark,
  border: `1px solid ${active ? ACCENT : colors.border}`,
  color: active ? ACCENT : colors.textGhost,
  borderRadius: sizes.radiusMd,
  padding: "10px 14px",
  cursor: "pointer",
  fontSize: sizes.fontSm,
  fontWeight: active ? 700 : 500,
  fontFamily: "inherit",
  letterSpacing: "1px",
  textAlign: "left",
  transition: "all 120ms ease",
});

const subTabStyle = (active: boolean): React.CSSProperties => ({
  background: "transparent",
  border: "none",
  color: active ? ACCENT : colors.textGhost,
  fontSize: sizes.fontSm,
  letterSpacing: "2px",
  cursor: "pointer",
  padding: "10px 14px",
  fontWeight: active ? 700 : 400,
  fontFamily: "inherit",
  borderBottom: active ? `2px solid ${ACCENT}` : "2px solid transparent",
});

const difficultyPill = (active: boolean, color: string): React.CSSProperties => ({
  background: active ? `${color}20` : colors.bgDark,
  border: `1px solid ${active ? color : colors.border}`,
  color: active ? color : colors.textFaint,
  borderRadius: sizes.radiusSm,
  padding: "4px 10px",
  fontSize: sizes.fontXs,
  cursor: "pointer",
  fontFamily: "inherit",
  letterSpacing: "1px",
  fontWeight: active ? 700 : 500,
});

const normalizeDifficulty = (d: MasteryDifficulty) =>
  d.toLowerCase() as "senior" | "lead" | "principal";

const difficultyColor = (d: MasteryDifficulty) => {
  switch (normalizeDifficulty(d)) {
    case "senior":
      return colors.info;
    case "lead":
      return colors.yellow;
    case "principal":
      return colors.error;
  }
};

const cardStyle: React.CSSProperties = {
  background: colors.bgCard,
  border: `1px solid ${colors.border}`,
  borderRadius: sizes.radiusLg,
  padding: sizes.spacingXl,
  marginBottom: sizes.spacingMd,
};

const codeBlockStyle: React.CSSProperties = {
  background: "#050508",
  color: "#a8d8a8",
  border: "1px solid #1a1a2e",
  borderRadius: "6px",
  padding: "16px",
  fontSize: "12px",
  lineHeight: 1.7,
  whiteSpace: "pre",
  overflowX: "auto",
  marginTop: sizes.spacingMd,
  fontFamily: "JetBrains Mono, Consolas, monospace",
};

function renderAnswerText(text: string) {
  // Render simple markdown-ish: paragraphs, bold (**...**), inline code (`...`)
  const paragraphs = text.split(/\n\n+/);
  return paragraphs.map((p, i) => {
    const lines = p.split("\n");
    const isList = lines.every((l) => l.trim().startsWith("- ") || l.trim().startsWith("* "));
    if (isList) {
      return (
        <ul key={i} style={{ margin: `${sizes.spacingSm} 0`, paddingLeft: "22px", color: colors.textMuted }}>
          {lines.map((l, j) => (
            <li key={j} style={{ marginBottom: "6px" }}>
              {renderInline(l.replace(/^[-*]\s/, ""))}
            </li>
          ))}
        </ul>
      );
    }
    return (
      <p
        key={i}
        style={{
          margin: `${sizes.spacingSm} 0`,
          color: colors.textMuted,
          lineHeight: 1.7,
          fontSize: sizes.fontMd,
        }}
      >
        {renderInline(p)}
      </p>
    );
  });
}

function renderInline(text: string): React.ReactNode {
  // Split on `code` and **bold**
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let lastIdx = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIdx) parts.push(text.slice(lastIdx, match.index));
    const m = match[0];
    if (m.startsWith("**")) {
      parts.push(
        <strong key={key++} style={{ color: colors.primary, fontWeight: 700 }}>
          {m.slice(2, -2)}
        </strong>,
      );
    } else if (m.startsWith("`")) {
      parts.push(
        <code
          key={key++}
          style={{
            background: "#050508",
            color: "#ffe066",
            padding: "1px 6px",
            borderRadius: "3px",
            fontFamily: "JetBrains Mono, Consolas, monospace",
            fontSize: "11px",
          }}
        >
          {m.slice(1, -1)}
        </code>,
      );
    }
    lastIdx = match.index + m.length;
  }
  if (lastIdx < text.length) parts.push(text.slice(lastIdx));
  return parts;
}

function DefinitionCard({ def }: { def: MasteryDefinition }) {
  return (
    <div style={cardStyle}>
      <div
        style={{
          color: ACCENT,
          fontSize: sizes.fontMd,
          fontWeight: 700,
          marginBottom: sizes.spacingXs,
          letterSpacing: "1px",
        }}
      >
        {def.term}
      </div>
      <div style={{ color: colors.textMuted, fontSize: sizes.fontMd, lineHeight: 1.7 }}>
        {renderInline(def.definition)}
      </div>
      {def.example && (
        <div
          style={{
            marginTop: sizes.spacingMd,
            padding: sizes.spacingSm,
            background: colors.bgDark,
            borderLeft: `2px solid ${ACCENT}`,
            color: colors.textFaint,
            fontSize: sizes.fontSm,
            fontStyle: "italic",
          }}
        >
          Example: {renderInline(def.example)}
        </div>
      )}
    </div>
  );
}

function DrillCard({ drill }: { drill: MasteryDrill }) {
  const [open, setOpen] = useState(false);
  const [showFollowUp, setShowFollowUp] = useState(false);
  const diffColor = difficultyColor(drill.difficulty);

  return (
    <div style={cardStyle}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: sizes.spacingMd,
        }}
      >
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: sizes.fontMd,
              color: colors.text,
              fontWeight: 600,
              lineHeight: 1.5,
              marginBottom: sizes.spacingSm,
            }}
          >
            {drill.question}
          </div>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            <span
              style={{
                fontSize: sizes.fontXs,
                padding: "2px 8px",
                borderRadius: sizes.radiusSm,
                background: `${diffColor}20`,
                color: diffColor,
                fontWeight: 700,
                letterSpacing: "1px",
              }}
            >
              {normalizeDifficulty(drill.difficulty).toUpperCase()}
            </span>
            {(drill.tags ?? []).map((t) => (
              <span
                key={t}
                style={{
                  fontSize: sizes.fontXs,
                  padding: "2px 8px",
                  borderRadius: sizes.radiusSm,
                  background: colors.bgDark,
                  color: colors.textFaint,
                  letterSpacing: "1px",
                }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          style={{
            background: open ? `${ACCENT}18` : "transparent",
            border: `1px solid ${ACCENT}`,
            color: ACCENT,
            padding: "8px 14px",
            borderRadius: sizes.radiusMd,
            cursor: "pointer",
            fontSize: sizes.fontSm,
            fontWeight: 700,
            letterSpacing: "1px",
            fontFamily: "inherit",
            whiteSpace: "nowrap",
          }}
        >
          {open ? "HIDE" : "REVEAL"}
        </button>
      </div>

      {open && (
        <div
          style={{
            marginTop: sizes.spacingLg,
            paddingTop: sizes.spacingLg,
            borderTop: `1px solid ${colors.border}`,
          }}
        >
          {renderAnswerText(drill.answer)}

          {drill.followUp && (
            <div style={{ marginTop: sizes.spacingLg }}>
              <button
                type="button"
                onClick={() => setShowFollowUp((f) => !f)}
                style={{
                  background: "transparent",
                  border: `1px dashed ${colors.borderLight}`,
                  color: colors.warn,
                  padding: "8px 12px",
                  borderRadius: sizes.radiusSm,
                  fontSize: sizes.fontSm,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  letterSpacing: "1px",
                }}
              >
                {showFollowUp ? "▲ FOLLOW-UP" : "▼ FOLLOW-UP"}
              </button>
              {showFollowUp && (
                <div
                  style={{
                    marginTop: sizes.spacingSm,
                    padding: sizes.spacingMd,
                    background: colors.bgDark,
                    borderLeft: `3px solid ${colors.warn}`,
                    color: colors.text,
                    fontSize: sizes.fontMd,
                    lineHeight: 1.6,
                  }}
                >
                  {drill.followUpAnswer ? (
                    <>
                      <div
                        style={{
                          color: colors.warn,
                          fontWeight: 600,
                          marginBottom: sizes.spacingSm,
                        }}
                      >
                        {renderInline(drill.followUp)}
                      </div>
                      {renderAnswerText(drill.followUpAnswer)}
                    </>
                  ) : (
                    renderInline(drill.followUp)
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CodeDrillCard({ drill }: { drill: CodeDrill }) {
  const [showSolution, setShowSolution] = useState(false);
  const [showHints, setShowHints] = useState(false);

  return (
    <div style={cardStyle}>
      <div
        style={{
          color: ACCENT,
          fontSize: sizes.fontLg,
          fontWeight: 700,
          marginBottom: sizes.spacingSm,
          letterSpacing: "1px",
        }}
      >
        {drill.title}
      </div>
      <div
        style={{
          color: colors.textMuted,
          fontSize: sizes.fontMd,
          lineHeight: 1.6,
          marginBottom: sizes.spacingMd,
        }}
      >
        {drill.brief}
      </div>

      <div style={{ ...codeBlockStyle, opacity: 0.85 }}>{drill.starter}</div>

      <div style={{ display: "flex", gap: sizes.spacingSm, marginTop: sizes.spacingMd, flexWrap: "wrap" }}>
        {drill.hints && drill.hints.length > 0 && (
          <button
            type="button"
            onClick={() => setShowHints((h) => !h)}
            style={{
              background: showHints ? `${colors.warn}18` : "transparent",
              border: `1px solid ${colors.warn}`,
              color: colors.warn,
              padding: "8px 14px",
              borderRadius: sizes.radiusMd,
              cursor: "pointer",
              fontSize: sizes.fontSm,
              fontWeight: 700,
              letterSpacing: "1px",
              fontFamily: "inherit",
            }}
          >
            {showHints ? "HIDE HINTS" : "💡 HINTS"}
          </button>
        )}
        <button
          type="button"
          onClick={() => setShowSolution((s) => !s)}
          style={{
            background: showSolution ? `${ACCENT}18` : "transparent",
            border: `1px solid ${ACCENT}`,
            color: ACCENT,
            padding: "8px 14px",
            borderRadius: sizes.radiusMd,
            cursor: "pointer",
            fontSize: sizes.fontSm,
            fontWeight: 700,
            letterSpacing: "1px",
            fontFamily: "inherit",
          }}
        >
          {showSolution ? "HIDE SOLUTION" : "REVEAL SOLUTION"}
        </button>
      </div>

      {showHints && drill.hints && (
        <ul
          style={{
            marginTop: sizes.spacingMd,
            padding: sizes.spacingMd,
            paddingLeft: "32px",
            background: colors.bgDark,
            borderLeft: `3px solid ${colors.warn}`,
            color: colors.textMuted,
            fontSize: sizes.fontSm,
            lineHeight: 1.7,
          }}
        >
          {drill.hints.map((h, i) => (
            <li key={i} style={{ marginBottom: "6px" }}>
              {renderInline(h)}
            </li>
          ))}
        </ul>
      )}

      {showSolution && (
        <>
          <div style={codeBlockStyle}>{drill.solution}</div>
          <div
            style={{
              marginTop: sizes.spacingMd,
              padding: sizes.spacingMd,
              background: "#0d1200",
              border: `1px solid ${colors.primary}30`,
              borderRadius: sizes.radiusLg,
              color: colors.primary,
              fontSize: sizes.fontMd,
              lineHeight: 1.7,
            }}
          >
            <div
              style={{
                fontSize: sizes.fontXs,
                color: colors.primary,
                letterSpacing: "2px",
                marginBottom: sizes.spacingXs,
                fontWeight: 700,
              }}
            >
              🎖 TAKEAWAY
            </div>
            {renderInline(drill.takeaway)}
          </div>
        </>
      )}
    </div>
  );
}

export default function NtokozoMastery({ onBack }: { onBack: () => void }) {
  const [trackId, setTrackId] = useState<string>(NTOKOZO_TRACKS[0].id);
  const [subTab, setSubTab] = useState<SubTab>("drills");
  const [difficulty, setDifficulty] = useState<DifficultyFilter>("all");

  const track = useMemo<MasteryTrack>(
    () => NTOKOZO_TRACKS.find((t) => t.id === trackId) ?? NTOKOZO_TRACKS[0],
    [trackId],
  );

  const filteredDrills = useMemo(() => {
    if (difficulty === "all") return track.drills;
    return track.drills.filter(
      (d) => normalizeDifficulty(d.difficulty) === difficulty,
    );
  }, [track.drills, difficulty]);

  return (
    <div
      style={{
        maxWidth: "1280px",
        margin: "0 auto",
        padding: `${sizes.spacing3xl} ${sizes.spacing2xl}`,
        color: colors.text,
        display: "flex",
        flexDirection: "column",
        flex: 1,
      }}
    >
      <button type="button" onClick={onBack} style={backBtnStyle()}>
        ← BACK
      </button>

      <header style={{ marginBottom: sizes.spacing3xl }}>
        <div
          style={{
            fontSize: sizes.fontXs,
            letterSpacing: "4px",
            color: ACCENT,
            marginBottom: sizes.spacingSm,
            fontWeight: 700,
          }}
        >
          ◇ MASTERY DRILL
        </div>
        <div
          style={{
            fontSize: sizes.fontHero,
            color: colors.text,
            fontWeight: 700,
            letterSpacing: "2px",
            marginBottom: sizes.spacingSm,
          }}
        >
          NTOKOZO BANDA
        </div>
        <div
          style={{
            color: colors.textFaint,
            fontSize: sizes.fontMd,
            maxWidth: "780px",
            lineHeight: 1.6,
          }}
        >
          Hard questions and code drills calibrated to your profile: Senior C# / .NET engineer with banking-grade
          experience. Bridge the gap to Lead and Principal-level conversations. Click <strong style={{ color: ACCENT }}>REVEAL</strong> only
          after you've talked through an answer in your head — that's where the drill lives.
        </div>
      </header>

      <div style={{ display: "flex", gap: sizes.spacing2xl, flex: 1 }}>
        {/* LEFT RAIL — track picker */}
        <aside
          style={{
            width: "240px",
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            gap: sizes.spacingXs,
          }}
        >
          <div
            style={{
              fontSize: sizes.fontXs,
              color: colors.textGhost,
              letterSpacing: "2px",
              marginBottom: sizes.spacingSm,
              fontWeight: 700,
            }}
          >
            ◢ TRACKS
          </div>
          {NTOKOZO_TRACKS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setTrackId(t.id);
                setSubTab("drills");
                setDifficulty("all");
              }}
              style={trackPillStyle(t.id === trackId)}
            >
              <div style={{ fontWeight: 700 }}>{t.title}</div>
              <div
                style={{
                  fontSize: sizes.fontXs,
                  color: colors.textGhost,
                  marginTop: "4px",
                  fontWeight: 400,
                  letterSpacing: "0.5px",
                }}
              >
                {t.drills.length} drill{t.drills.length === 1 ? "" : "s"} ·{" "}
                {t.codeDrills.length} code · {t.definitions.length} terms
              </div>
            </button>
          ))}
        </aside>

        {/* RIGHT — content */}
        <main style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              borderBottom: `1px solid ${colors.border}`,
              marginBottom: sizes.spacingXl,
              paddingBottom: sizes.spacingSm,
            }}
          >
            <div
              style={{
                color: ACCENT,
                fontSize: sizes.fontXl,
                fontWeight: 700,
                letterSpacing: "1px",
              }}
            >
              {track.title}
            </div>
            <div
              style={{
                color: colors.textFaint,
                fontSize: sizes.fontSm,
                marginTop: sizes.spacingSm,
                lineHeight: 1.6,
              }}
            >
              {track.description}
            </div>
          </div>

          {/* Sub-tabs */}
          <div
            style={{
              display: "flex",
              gap: sizes.spacingMd,
              marginBottom: sizes.spacingXl,
              borderBottom: `1px solid ${colors.border}`,
            }}
          >
            <button
              type="button"
              onClick={() => setSubTab("drills")}
              style={subTabStyle(subTab === "drills")}
            >
              DRILLS ({track.drills.length})
            </button>
            <button
              type="button"
              onClick={() => setSubTab("code")}
              style={subTabStyle(subTab === "code")}
              disabled={track.codeDrills.length === 0}
            >
              CODE ({track.codeDrills.length})
            </button>
            <button
              type="button"
              onClick={() => setSubTab("definitions")}
              style={subTabStyle(subTab === "definitions")}
            >
              DEFINITIONS ({track.definitions.length})
            </button>
          </div>

          {/* Difficulty filter (drills only) */}
          {subTab === "drills" && (
            <div
              style={{
                display: "flex",
                gap: sizes.spacingSm,
                marginBottom: sizes.spacingXl,
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontSize: sizes.fontXs,
                  color: colors.textGhost,
                  letterSpacing: "2px",
                  marginRight: sizes.spacingSm,
                }}
              >
                FILTER:
              </span>
              {(["all", "senior", "lead", "principal"] as DifficultyFilter[]).map((d) => {
                const color =
                  d === "all"
                    ? ACCENT
                    : d === "senior"
                      ? colors.info
                      : d === "lead"
                        ? colors.yellow
                        : colors.error;
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDifficulty(d)}
                    style={difficultyPill(difficulty === d, color)}
                  >
                    {d.toUpperCase()}
                  </button>
                );
              })}
              <span
                style={{
                  marginLeft: "auto",
                  fontSize: sizes.fontXs,
                  color: colors.textFaint,
                }}
              >
                showing {filteredDrills.length} of {track.drills.length}
              </span>
            </div>
          )}

          {/* Content */}
          {subTab === "drills" && (
            <div>
              {filteredDrills.length === 0 ? (
                <div
                  style={{
                    color: colors.textFaint,
                    padding: sizes.spacing2xl,
                    textAlign: "center",
                    fontSize: sizes.fontSm,
                  }}
                >
                  No drills at this difficulty in this track yet.
                </div>
              ) : (
                filteredDrills.map((d) => <DrillCard key={d.id} drill={d} />)
              )}
            </div>
          )}

          {subTab === "code" && (
            <div>
              {track.codeDrills.length === 0 ? (
                <div
                  style={{
                    color: colors.textFaint,
                    padding: sizes.spacing2xl,
                    textAlign: "center",
                    fontSize: sizes.fontSm,
                  }}
                >
                  No code drills in this track yet.
                </div>
              ) : (
                track.codeDrills.map((c) => <CodeDrillCard key={c.id} drill={c} />)
              )}
            </div>
          )}

          {subTab === "definitions" && (
            <div>
              {track.definitions.map((d) => (
                <DefinitionCard key={d.term} def={d} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
