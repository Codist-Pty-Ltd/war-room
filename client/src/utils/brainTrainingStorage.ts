const HABITS_KEY = "brain-lab-habits";
const STREAK_KEY = "brain-lab-streak";
const FAILURE_LOG_KEY = "brain-lab-failure-log";

export type HabitDayState = {
  date: string; // YYYY-MM-DD
  checked: Record<string, boolean>;
};

export type StreakState = {
  lastCompletedDate: string | null;
  currentStreak: number;
  longestStreak: number;
};

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function loadHabitState(): HabitDayState {
  const state = readJson<HabitDayState | null>(HABITS_KEY, null);
  const today = todayStr();
  if (!state || state.date !== today) {
    return { date: today, checked: {} };
  }
  return state;
}

export function saveHabitState(state: HabitDayState) {
  localStorage.setItem(HABITS_KEY, JSON.stringify(state));
}

export function toggleHabit(id: string, state: HabitDayState): HabitDayState {
  const next = {
    ...state,
    date: todayStr(),
    checked: { ...state.checked, [id]: !state.checked[id] },
  };
  saveHabitState(next);
  updateStreak(next);
  return next;
}

export function loadStreak(): StreakState {
  return readJson<StreakState>(STREAK_KEY, {
    lastCompletedDate: null,
    currentStreak: 0,
    longestStreak: 0,
  });
}

function updateStreak(state: HabitDayState) {
  const total = Object.keys(state.checked).filter((k) => state.checked[k]).length;
  const threshold = 6; // 6+ habits = "good day"
  if (total < threshold) return;

  const today = todayStr();
  const streak = loadStreak();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  let current = streak.currentStreak;
  if (streak.lastCompletedDate === yesterdayStr) {
    current += 1;
  } else if (streak.lastCompletedDate !== today) {
    current = 1;
  }

  const next: StreakState = {
    lastCompletedDate: today,
    currentStreak: current,
    longestStreak: Math.max(streak.longestStreak, current),
  };
  localStorage.setItem(STREAK_KEY, JSON.stringify(next));
}

export function loadFailureLog(): string {
  return localStorage.getItem(FAILURE_LOG_KEY) ?? "";
}

export function saveFailureLog(text: string) {
  localStorage.setItem(FAILURE_LOG_KEY, text);
}

export function habitProgress(checked: Record<string, boolean>, total: number) {
  const done = Object.values(checked).filter(Boolean).length;
  return { done, total, percent: total > 0 ? Math.round((done / total) * 100) : 0 };
}
