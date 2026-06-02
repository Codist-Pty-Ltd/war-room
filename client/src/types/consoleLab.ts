export type ThoughtStep = {
  step: number;
  title: string;
  body: string;
};

export type VisualStudioStep = {
  step: number;
  title: string;
  body: string;
  /** Code to type in Program.cs — shown in monospace */
  code?: string;
  /** VS menu action e.g. File → New → Project */
  vsAction?: string;
};

export type EvalCriterion = {
  id: string;
  label: string;
  hint: string;
  test: (text: string) => boolean;
  weight: number;
};

export type ChallengeApproach = {
  id: string;
  name: string;
  whenToUse: string;
  thoughtProcess: ThoughtStep[];
  skeleton: string[];
  /** Line-by-line Visual Studio Community walkthrough for this approach */
  visualStudioSteps?: VisualStudioStep[];
  criteriaExtras?: EvalCriterion[];
};

export type DataSkill = "csv" | "json-api" | "json-file" | "stdin" | "mixed";

export type ConsoleChallenge = {
  id: string;
  title: string;
  source: string;
  difficulty: "junior" | "mid" | "senior";
  timeMinutes: number;
  prompt: string;
  exampleInput?: string;
  exampleOutput?: string;
  constraints: string[];
  dataSkill: DataSkill;
  datasetUrl?: string;
  referenceLinks?: string[];
  thoughtProcess: ThoughtStep[];
  skeleton: string[];
  approaches: [ChallengeApproach, ChallengeApproach];
  criteria: EvalCriterion[];
  commonMistakes: string[];
};

export type SystemDesignChallenge = {
  id: string;
  title: string;
  source: string;
  difficulty: "mid" | "senior" | "lead";
  timeMinutes: number;
  prompt: string;
  functionalRequirements: string[];
  outOfScope?: string[];
  requiredSections: string[];
  thoughtProcess: ThoughtStep[];
  skeleton: string[];
  approaches?: [ChallengeApproach, ChallengeApproach];
  criteria: EvalCriterion[];
  commonMistakes: string[];
};

export type SystemDesignChallengeEnriched = SystemDesignChallenge & {
  approaches: [ChallengeApproach, ChallengeApproach];
};

export type EvaluationResult = {
  score: number;
  maxScore: number;
  percent: number;
  checks: { id: string; label: string; passed: boolean; hint: string }[];
  summary: string;
};

export type SkillLesson = {
  id: string;
  title: string;
  intro: string;
  mustMemorise: string[];
  steps: ThoughtStep[];
  twoApproachesSummary: { a: string; b: string };
  keepLearning: string[];
  /** One-time VS Community project setup — same for all C# console tasks */
  visualStudioSetup: VisualStudioStep[];
};
