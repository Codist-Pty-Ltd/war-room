export type PatternProgress = {
  problems_attempted: number;
  problems_solved: number;
  mastery_level: number;
  last_drilled: string | null;
};

export type PatternListItem = {
  id: string;
  name: string;
  order: number;
  recognitionTrigger: string;
  problemCount: number;
  progress: PatternProgress;
};

export type PatternWorkedExample = {
  title: string;
  platform: string;
  difficulty: string;
  description: string;
  example: string;
  solution: string;
  keyInsight: string;
};

export type PatternPracticeProblem = {
  index: number;
  title: string;
  platform: string;
  difficulty: string;
  description: string;
  example: string;
  hint: string;
  solution: string;
  timeComplexity: string;
  spaceComplexity: string;
};

export type PatternDetail = {
  id: string;
  name: string;
  order: number;
  recognitionTrigger: string;
  whyItWorks: string;
  workedExample: PatternWorkedExample;
  practiceProblems: PatternPracticeProblem[];
};

export type PatternSummaryResponse = {
  stats: {
    patterns_started: number;
    patterns_today: number;
    total_attempted: number;
    total_solved: number;
    avg_mastery: number;
    solve_rate: number;
  };
  recentSessions: Array<{
    pattern_name: string;
    solved: number;
    used_hint: number;
    time_seconds: number;
    created_at: string;
  }>;
};
