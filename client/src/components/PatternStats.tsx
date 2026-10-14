import type { PatternSummaryResponse } from "../types/patterns";

type PatternStatsProps = {
  summary: PatternSummaryResponse | null;
  loading: boolean;
};

export default function PatternStats({ summary, loading }: PatternStatsProps) {
  if (loading) {
    return (
      <div className="pattern-stats-panel">
        <div style={{ color: "#555", fontSize: 12 }}>Loading stats…</div>
      </div>
    );
  }

  if (!summary) return null;

  const { stats, recentSessions } = summary;

  return (
    <div className="pattern-stats-panel">
      <div
        style={{
          fontSize: 11,
          color: "#444",
          letterSpacing: "3px",
          marginBottom: 16,
        }}
      >
        DRILL STATS
      </div>
      <div className="pattern-stats-grid">
        <div className="pattern-stat-item">
          <div className="pattern-stat-value">
            {`${stats.patterns_today ?? 0} / 14`}
          </div>
          <div className="pattern-stat-label">PATTERNS TODAY</div>
        </div>
        <div className="pattern-stat-item">
          <div className="pattern-stat-value">{stats.total_attempted ?? 0}</div>
          <div className="pattern-stat-label">ATTEMPTED</div>
        </div>
        <div className="pattern-stat-item">
          <div className="pattern-stat-value">{stats.total_solved ?? 0}</div>
          <div className="pattern-stat-label">SOLVED</div>
        </div>
        <div className="pattern-stat-item">
          <div className="pattern-stat-value">{stats.solve_rate ?? 0}%</div>
          <div className="pattern-stat-label">SOLVE RATE</div>
        </div>
      </div>
      {recentSessions.length > 0 && (
        <div className="pattern-recent-list">
          <div
            style={{
              fontSize: 10,
              color: "#444",
              letterSpacing: "2px",
              marginBottom: 8,
            }}
          >
            RECENT SESSIONS
          </div>
          {recentSessions.map((s, i) => (
            <div key={`${s.created_at}-${i}`} className="pattern-recent-row">
              <span>{s.pattern_name}</span>
              <span style={{ color: s.solved ? "#00ff88" : "#ff5e7a" }}>
                {s.solved ? "✓ solved" : "✗ practice"} · {s.time_seconds}s
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
