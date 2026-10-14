const Database = require("better-sqlite3");
const path = require("path");

const DB_PATH = path.join(__dirname, "..", "data", "warroom.db");

let db;

function getDb() {
  if (!db) {
    const fs = require("fs");
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
  }
  return db;
}

function initDb() {
  const db = getDb();

  db.exec(`
    CREATE TABLE IF NOT EXISTS problems (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      platform TEXT NOT NULL,
      language TEXT NOT NULL,
      category TEXT NOT NULL,
      difficulty TEXT NOT NULL,
      prompt_hash TEXT NOT NULL,
      title TEXT,
      response_json TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_problems_hash ON problems(prompt_hash);
    CREATE INDEX IF NOT EXISTS idx_problems_lookup ON problems(platform, language, category, difficulty);

    CREATE TABLE IF NOT EXISTS screening (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL,
      topic TEXT NOT NULL,
      type TEXT NOT NULL,
      difficulty TEXT NOT NULL,
      prompt_hash TEXT NOT NULL,
      title TEXT,
      response_json TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_screening_hash ON screening(prompt_hash);
    CREATE INDEX IF NOT EXISTS idx_screening_lookup ON screening(category, type, difficulty);

    CREATE TABLE IF NOT EXISTS sessions (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      platform     TEXT NOT NULL,
      language     TEXT NOT NULL,
      category     TEXT NOT NULL,
      difficulty   TEXT NOT NULL,
      outcome      TEXT NOT NULL CHECK(outcome IN ('solved','skipped','hinted')),
      hints_used   INTEGER NOT NULL DEFAULT 0,
      time_seconds INTEGER NOT NULL DEFAULT 0,
      problem_id   INTEGER,
      created_at   TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_sessions_platform    ON sessions(platform);
    CREATE INDEX IF NOT EXISTS idx_sessions_difficulty   ON sessions(difficulty);
    CREATE INDEX IF NOT EXISTS idx_sessions_created_at  ON sessions(created_at);
    CREATE INDEX IF NOT EXISTS idx_sessions_outcome     ON sessions(outcome);

    CREATE TABLE IF NOT EXISTS app_guest_users (
      username      TEXT PRIMARY KEY,
      password_hash TEXT NOT NULL,
      expires_at    TEXT NOT NULL,
      created_at    TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_app_guest_users_expires ON app_guest_users(expires_at);

    CREATE TABLE IF NOT EXISTS pattern_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pattern_id TEXT NOT NULL,
      pattern_name TEXT NOT NULL,
      problem_index INTEGER NOT NULL,
      solved INTEGER DEFAULT 0,
      used_hint INTEGER DEFAULT 0,
      time_seconds INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS pattern_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pattern_id TEXT NOT NULL UNIQUE,
      problems_attempted INTEGER DEFAULT 0,
      problems_solved INTEGER DEFAULT 0,
      last_drilled DATETIME,
      mastery_level INTEGER DEFAULT 0
    );

    CREATE INDEX IF NOT EXISTS idx_pattern_sessions_pattern ON pattern_sessions(pattern_id);
    CREATE INDEX IF NOT EXISTS idx_pattern_sessions_created ON pattern_sessions(created_at);
  `);

  try {
    db.prepare(`DELETE FROM app_guest_users WHERE datetime(expires_at) <= datetime('now')`).run();
  } catch {
    /* non-fatal */
  }

  console.log("Database initialized at", DB_PATH);
}

module.exports = { getDb, initDb };
