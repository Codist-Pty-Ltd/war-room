export type ChallengeLockRecord = {
  openCount: number;
  submitted: boolean;
  submittedAt?: string;
  lastCodeLength?: number;
};

const LOCK_KEY = "war-room-console-lab-locks";
const MAX_PEEKS = 2; // lock when openCount > MAX_PEEKS (i.e. 3rd open)

export function loadAllLocks(): Record<string, ChallengeLockRecord> {
  try {
    const raw = localStorage.getItem(LOCK_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveAllLocks(locks: Record<string, ChallengeLockRecord>) {
  localStorage.setItem(LOCK_KEY, JSON.stringify(locks));
}

export function getLock(id: string): ChallengeLockRecord {
  const all = loadAllLocks();
  return all[id] ?? { openCount: 0, submitted: false };
}

/** Call when user selects a console challenge */
export function recordChallengeOpen(id: string): ChallengeLockRecord {
  const all = loadAllLocks();
  const prev = all[id] ?? { openCount: 0, submitted: false };
  if (prev.submitted) return prev;

  const next: ChallengeLockRecord = {
    ...prev,
    openCount: prev.openCount + 1,
  };
  all[id] = next;
  saveAllLocks(all);
  return next;
}

export function isChallengeLocked(record: ChallengeLockRecord): boolean {
  if (record.submitted) return false;
  return record.openCount > MAX_PEEKS;
}

export function peeksRemaining(record: ChallengeLockRecord): number {
  if (record.submitted) return 999;
  return Math.max(0, MAX_PEEKS + 1 - record.openCount);
}

/** Submit sample code — unlocks challenge for future reads */
export function submitChallengeCode(
  id: string,
  code: string,
): { ok: boolean; message: string; record: ChallengeLockRecord } {
  const trimmed = code.trim();
  if (trimmed.length < 80) {
    return {
      ok: false,
      message: "Paste your full Program.cs (at least ~80 characters) before submitting.",
      record: getLock(id),
    };
  }

  const all = loadAllLocks();
  const record: ChallengeLockRecord = {
    ...(all[id] ?? { openCount: 0, submitted: false }),
    submitted: true,
    submittedAt: new Date().toISOString(),
    lastCodeLength: trimmed.length,
  };
  all[id] = record;
  saveAllLocks(all);

  return {
    ok: true,
    message: "Submitted — challenge unlocked. Keep iterating in VS and re-evaluate.",
    record,
  };
}

export function resetChallengeLock(id: string) {
  const all = loadAllLocks();
  delete all[id];
  saveAllLocks(all);
}
