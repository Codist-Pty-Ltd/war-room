import type { ChallengeApproach, SystemDesignChallenge, SystemDesignChallengeEnriched } from "../../types/consoleLab";

const step = (n: number, title: string, body: string) => ({ step: n, title, body });

const DEFAULT_DESIGN_APPROACHES: [ChallengeApproach, ChallengeApproach] = [
  {
    id: "rest-monolith",
    name: "Approach A — REST + PostgreSQL (monolith)",
    whenToUse: "Default interview answer — clear, ACID, easy to draw in 25 min.",
    thoughtProcess: [
      step(1, "Entities", "Users, core resources, join tables — draw ER boxes."),
      step(2, "APIs", "REST nouns, version /api/v1, JSON bodies."),
      step(3, "Concurrency", "Unique constraints + transactions for conflicts."),
      step(4, "Security", "JWT, HTTPS, authZ on own resources."),
    ],
    skeleton: ["tech stack", "tables + constraints", "REST list", "auth", "scale notes"],
  },
  {
    id: "services-events",
    name: "Approach B — Services + cache/queue",
    whenToUse: "When they ask scale, peak traffic, or async notifications.",
    thoughtProcess: [
      step(1, "Split", "2–3 bounded contexts — don't over-microservice."),
      step(2, "Async", "Queue/outbox for email, analytics, heavy work."),
      step(3, "Cache", "Redis for hot reads or short-lived holds."),
      step(4, "Tradeoff", "Strong consistency on writes; eventual on notifications."),
    ],
    skeleton: ["bounded contexts", "sync write path", "async events", "cache", "failure modes"],
  },
];

export function enrichDesignChallenge(c: SystemDesignChallenge): SystemDesignChallengeEnriched {
  if (c.approaches?.length === 2) return c as SystemDesignChallengeEnriched;
  return { ...c, approaches: DEFAULT_DESIGN_APPROACHES };
}
