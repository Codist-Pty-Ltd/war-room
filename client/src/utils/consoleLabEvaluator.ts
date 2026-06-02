import type { EvaluationResult } from "../types/consoleLab";
import type { EvalCriterion } from "../types/consoleLab";

export function evaluateSubmission(
  criteria: EvalCriterion[],
  text: string,
): EvaluationResult {
  const normalized = text.trim();
  if (!normalized) {
    return {
      score: 0,
      maxScore: criteria.reduce((s, c) => s + c.weight, 0),
      percent: 0,
      checks: criteria.map((c) => ({
        id: c.id,
        label: c.label,
        passed: false,
        hint: c.hint,
      })),
      summary: "Paste your solution first — then click Evaluate.",
    };
  }

  let score = 0;
  const maxScore = criteria.reduce((s, c) => s + c.weight, 0);
  const checks = criteria.map((c) => {
    const passed = c.test(normalized);
    if (passed) score += c.weight;
    return { id: c.id, label: c.label, passed, hint: c.hint };
  });

  const percent = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  const passedCount = checks.filter((c) => c.passed).length;

  let summary: string;
  if (percent >= 85) {
    summary = `Strong submission (${percent}%) — ${passedCount}/${checks.length} criteria. Run in VS to confirm output.`;
  } else if (percent >= 55) {
    summary = `Partial (${percent}%) — review failed checks below, then re-run locally.`;
  } else {
    summary = `Keep going (${percent}%) — use the thought process steps and skeleton, then evaluate again.`;
  }

  return { score, maxScore, percent, checks, summary };
}

/** Shared regex helpers for C# console submissions */
export const has = (pattern: RegExp) => (code: string) => pattern.test(code);
export const hasAny = (...patterns: RegExp[]) => (code: string) =>
  patterns.some((p) => p.test(code));

export const STORAGE_KEY = "war-room-console-lab-progress";

export function loadProgress(): Record<string, { evaluatedAt: string; percent: number }> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveProgress(
  id: string,
  percent: number,
  progress: Record<string, { evaluatedAt: string; percent: number }>,
) {
  const next = { ...progress, [id]: { evaluatedAt: new Date().toISOString(), percent } };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}
