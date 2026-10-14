const { getDb } = require("../config/db");
const { PATTERNS } = require("../data/patterns");

function computeMastery(attempted, solved) {
  if (!attempted) return 0;
  return Math.min(5, Math.floor((solved / attempted) * 5));
}

exports.listPatterns = (_req, res) => {
  const db = getDb();
  const progress = db.prepare("SELECT * FROM pattern_progress").all();
  const progressMap = {};
  progress.forEach((p) => {
    progressMap[p.pattern_id] = p;
  });

  const result = PATTERNS.map((p) => ({
    id: p.id,
    name: p.name,
    order: p.order,
    recognitionTrigger: p.recognitionTrigger,
    problemCount: p.practiceProblems.length,
    progress: progressMap[p.id]
      ? {
          problems_attempted: progressMap[p.id].problems_attempted,
          problems_solved: progressMap[p.id].problems_solved,
          mastery_level: progressMap[p.id].mastery_level,
          last_drilled: progressMap[p.id].last_drilled,
        }
      : {
          problems_attempted: 0,
          problems_solved: 0,
          mastery_level: 0,
          last_drilled: null,
        },
  }));

  res.json(result);
};

exports.getPattern = (req, res) => {
  const pattern = PATTERNS.find((p) => p.id === req.params.id);
  if (!pattern) {
    res.status(404).json({ error: "Pattern not found" });
    return;
  }
  res.json(pattern);
};

exports.logSession = (req, res) => {
  const db = getDb();
  const { problemIndex, solved, usedHint, timeSeconds } = req.body;
  const pattern = PATTERNS.find((p) => p.id === req.params.id);
  if (!pattern) {
    res.status(404).json({ error: "Pattern not found" });
    return;
  }

  const idx = Number(problemIndex);
  if (!Number.isInteger(idx) || idx < 0) {
    res.status(400).json({ error: "Invalid problemIndex" });
    return;
  }

  const wasSolved = solved ? 1 : 0;
  const hintUsed = usedHint ? 1 : 0;
  const seconds = Number(timeSeconds) >= 0 ? Number(timeSeconds) : 0;

  db.prepare(
    `INSERT INTO pattern_sessions
      (pattern_id, pattern_name, problem_index, solved, used_hint, time_seconds)
    VALUES (?, ?, ?, ?, ?, ?)`,
  ).run(req.params.id, pattern.name, idx, wasSolved, hintUsed, seconds);

  const existing = db
    .prepare("SELECT * FROM pattern_progress WHERE pattern_id = ?")
    .get(req.params.id);

  if (existing) {
    const attempted = existing.problems_attempted + 1;
    const solvedCount = existing.problems_solved + wasSolved;
    db.prepare(
      `UPDATE pattern_progress SET
        problems_attempted = ?,
        problems_solved = ?,
        last_drilled = CURRENT_TIMESTAMP,
        mastery_level = ?
      WHERE pattern_id = ?`,
    ).run(attempted, solvedCount, computeMastery(attempted, solvedCount), req.params.id);
  } else {
    db.prepare(
      `INSERT INTO pattern_progress
        (pattern_id, problems_attempted, problems_solved, last_drilled, mastery_level)
      VALUES (?, 1, ?, CURRENT_TIMESTAMP, ?)`,
    ).run(req.params.id, wasSolved, computeMastery(1, wasSolved));
  }

  res.json({ success: true });
};

exports.getSummary = (_req, res) => {
  const db = getDb();
  const stats = db
    .prepare(
      `SELECT
        COUNT(DISTINCT pattern_id) as patterns_started,
        COALESCE(SUM(problems_attempted), 0) as total_attempted,
        COALESCE(SUM(problems_solved), 0) as total_solved,
        COALESCE(AVG(mastery_level), 0) as avg_mastery
      FROM pattern_progress`,
    )
    .get();

  const patternsToday = db
    .prepare(
      `SELECT COUNT(DISTINCT pattern_id) as count
       FROM pattern_sessions
       WHERE date(created_at) = date('now')`,
    )
    .get();

  const recentSessions = db
    .prepare(
      `SELECT pattern_name, solved, used_hint, time_seconds, created_at
       FROM pattern_sessions
       ORDER BY created_at DESC
       LIMIT 10`,
    )
    .all();

  res.json({
    stats: {
      ...stats,
      patterns_today: patternsToday?.count ?? 0,
      solve_rate:
        stats.total_attempted > 0
          ? Math.round((stats.total_solved / stats.total_attempted) * 100)
          : 0,
    },
    recentSessions,
  });
};
