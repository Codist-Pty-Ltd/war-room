export type MemoryTechnique = {
  id: string;
  name: string;
  evidence: string;
  whatItIs: string;
  howToApplyTechnical: string;
  dailyMicroDrill: string;
  avoid: string;
};

export type DailyHabit = {
  id: string;
  label: string;
  why: string;
  minutes?: number;
  category: "recall" | "practice" | "body" | "calm" | "review";
};

export type CalmProtocol = {
  id: string;
  title: string;
  when: string;
  steps: string[];
  durationSeconds: number;
};

export type WeeklyPlanDay = {
  day: string;
  focus: string;
  tasks: string[];
};

export const RESEARCH_SUMMARY = {
  title: "What actually works (cognitive science)",
  points: [
    {
      label: "Active recall (testing effect)",
      detail:
        "Retrieving from memory beats re-reading. Roediger & Karpicke (2006): retrieval practice produced ~13% forgetting vs ~56% for re-study after 2 days. Effect size d ≈ 0.81 vs d ≈ 0.13 for passive review.",
    },
    {
      label: "Spaced repetition (spacing effect)",
      detail:
        "Same material spread over days beats one cram session. Cepeda et al. meta-analyses: spaced practice d ≈ 0.74. Schedule: Day 0 → 1 → 3 → 7 → 14 → 30.",
    },
    {
      label: "Fluency illusion",
      detail:
        "Re-reading guides feels like mastery because text is familiar — recognition ≠ recall. Interviews require recall under pressure, not recognition with notes open.",
    },
    {
      label: "Sleep consolidates motor & declarative memory",
      detail:
        "Sleep after practice accelerates working-memory and skill consolidation (PMC6671268). All-nighters before interviews destroy recall — sleep is prep, not lost time.",
    },
    {
      label: "Interleaving beats blocking",
      detail:
        "Mixing problem types (postcode + dog API + design) in one session improves discrimination vs doing 10 of the same type. Harder in the moment, better retention.",
    },
    {
      label: "What is weak or mixed evidence",
      detail:
        "Dual n-back 'IQ boost' — transfer to real coding is disputed. Brain-training games without retrieval practice rarely help interviews. Passive video tutorials without typing = low yield.",
    },
  ],
};

export const MEMORY_TECHNIQUES: MemoryTechnique[] = [
  {
    id: "active-recall",
    name: "Active Recall",
    evidence: "Testing effect — strongest single technique for retention (d ≈ 0.81).",
    whatItIs:
      "Close all notes. Write or say the answer from memory. Check only after attempting.",
    howToApplyTechnical:
      "Blank Program.cs: write postcode skeleton from memory. Before opening a guide, list the 7 skeleton lines on paper.",
    dailyMicroDrill: "2 min: write Investec postcode prefix rule without looking.",
    avoid: "Re-reading the MD guide and calling it practice.",
  },
  {
    id: "spaced-repetition",
    name: "Spaced Repetition",
    evidence: "Spacing effect d ≈ 0.74 — same minutes spread over days beat one long block.",
    whatItIs:
      "Revisit the same challenge at increasing intervals: today, tomorrow, +3 days, +7 days.",
    howToApplyTechnical:
      "Console Lab progress % is a cue. Re-do any challenge under 85% on day 3 and day 7.",
    dailyMicroDrill: "Open one challenge you scored <70% last week — blank-page rep only.",
    avoid: "Only ever doing new challenges and never revisiting.",
  },
  {
    id: "elaboration",
    name: "Elaborative Interrogation",
    evidence: "Explaining 'why' links new info to existing knowledge — improves long-term storage.",
    whatItIs: "For every line you type, answer 'why this and not something else?' out loud.",
    howToApplyTechnical:
      "Why decimal not double? Why Split(' ')[0] not Substring after space? Say it while typing.",
    dailyMicroDrill: "Explain one bug (postcode suffix) to an imaginary junior in 60 sec.",
    avoid: "Silent copy-paste from reference Program.cs.",
  },
  {
    id: "chunking",
    name: "Chunking (Skeleton First)",
    evidence: "Working memory holds ~4 chunks; experts store patterns as single chunks.",
    whatItIs:
      "Memorise 5–7 verbal chunks before details. 'GET → parse → group → sort → print' is one program.",
    howToApplyTechnical:
      "One sticky note per exercise with skeleton only. Details come from chunks, not 50 lines.",
    dailyMicroDrill: "Recite dog API 4-block skeleton from memory before opening VS.",
    avoid: "Trying to memorise 50 lines as 50 separate facts.",
  },
  {
    id: "interleaving",
    name: "Interleaving",
    evidence: "Mixed practice improves transfer and problem-type discrimination vs blocked practice.",
    whatItIs: "Alternate types in one session: CSV → API JSON → design → CSV again.",
    howToApplyTechnical:
      "25 min postcode, 25 min dog API, 15 min cinema design — not 2 hours postcode only.",
    dailyMicroDrill: "Pick 2 random Console Lab challenges in one sitting.",
    avoid: "Blocking: five repeats of the same exercise back-to-back then never again.",
  },
  {
    id: "failure-log",
    name: "Errorful Learning + Failure Log",
    evidence: "Correcting your own mistakes strengthens memory more than errorless study.",
    whatItIs: "After each timed rep, one line: what broke. Next rep fixes only that.",
    howToApplyTechnical:
      "Notes app: 'Forgot ThenBy tie-break' / 'Used Substring after space'. Read before next rep.",
    dailyMicroDrill: "Write yesterday's #1 mistake before today's first keystroke.",
    avoid: "Repeating the same bug three sessions in a row without naming it.",
  },
  {
    id: "feynman",
    name: "Feynman Technique",
    evidence: "Teaching exposes gaps; elaboration + retrieval combined.",
    whatItIs: "Explain the solution simply in plain English as if to a non-dev. Fix gaps where you stumble.",
    howToApplyTechnical:
      "Record 90 sec voice note: 'How I'd build space news grouping.' Listen — where did you pause?",
    dailyMicroDrill: "Explain cinema seat uniqueness without saying 'database' jargon first.",
    avoid: "Using acronyms to hide that you don't know the flow.",
  },
  {
    id: "mental-rehearsal",
    name: "Mental Rehearsal (Process Not Code)",
    evidence: "Motor and procedural memory benefit from mental walk-through (sports psychology + memory research).",
    whatItIs:
      "Eyes closed: see yourself opening VS, typing line 1, running Ctrl+F5. Reduces startup anxiety.",
    howToApplyTechnical:
      "Before sleep: walk through 60-sec ritual — breathe, restate problem, skeleton, first line of code.",
    dailyMicroDrill: "30 sec eyes-closed: first 3 lines you'd type for today's challenge.",
    avoid: "Only visualising success without the actual typing reps.",
  },
];

export const DAILY_HABITS: DailyHabit[] = [
  {
    id: "sleep-plan",
    label: "Plan 7+ hours sleep tonight",
    why: "Sleep consolidates what you practiced today — strongest biological memory enhancer.",
    category: "body",
  },
  {
    id: "movement",
    label: "20 min walk or movement",
    why: "Exercise supports sleep quality and next-day encoding. No need for extreme HIIT daily.",
    minutes: 20,
    category: "body",
  },
  {
    id: "hydrate",
    label: "Water before deep work (not only coffee)",
    why: "Mild dehydration impairs attention and working memory during coding sessions.",
    category: "body",
  },
  {
    id: "failure-log-read",
    label: "Read yesterday's failure log (1 line)",
    why: "Targets today's rep at your actual weak point — errorful learning.",
    minutes: 1,
    category: "review",
  },
  {
    id: "skeleton-recall",
    label: "Write one skeleton from memory (no screen)",
    why: "Active recall chunk — 2 min on paper beats 20 min re-reading.",
    minutes: 2,
    category: "recall",
  },
  {
    id: "say-aloud",
    label: "Say-aloud while coding (one session)",
    why: "Elaboration + motor memory — hand, mouth, brain together.",
    minutes: 25,
    category: "practice",
  },
  {
    id: "blank-page-rep",
    label: "Blank-page rep: one Console Lab challenge",
    why: "S.R.T.C. Rep 1 or 2 — type without guide, run in VS, paste & evaluate.",
    minutes: 25,
    category: "practice",
  },
  {
    id: "spaced-revisit",
    label: "Revisit challenge from 3+ days ago",
    why: "Spacing effect — same skill at day 1, 3, 7 locks it in.",
    minutes: 20,
    category: "recall",
  },
  {
    id: "design-aloud",
    label: "One design prompt spoken aloud (5 min)",
    why: "Interview design is verbal — train the mouth, not only fingers.",
    minutes: 5,
    category: "practice",
  },
  {
    id: "no-passive",
    label: "No tutorial without typing after",
    why: "Fluency illusion — if you watched/read only, do 10 min recall immediately after.",
    category: "review",
  },
  {
    id: "pre-interview-ritual",
    label: "Practice 60-sec calm ritual once",
    why: "Condition the same start sequence so interview start isn't novel stress.",
    minutes: 1,
    category: "calm",
  },
  {
    id: "interleave",
    label: "Mix 2 different challenge types today",
    why: "Interleaving — CSV + API or code + design in one day.",
    category: "practice",
  },
];

export const CALM_PROTOCOLS: CalmProtocol[] = [
  {
    id: "pre-code-60",
    title: "60-Second Pre-Code Ritual",
    when: "Before every blank-page rep or live interview coding",
    durationSeconds: 60,
    steps: [
      "One slow breath in (4 sec), out (6 sec).",
      "Restate the problem in one sentence out loud.",
      "Recite the skeleton (5–7 words) from memory.",
      "Say the first line you will type (e.g. 'const string ApiUrl' or 'file path check').",
      "Start typing — do not wait for perfect clarity.",
    ],
  },
  {
    id: "box-breathing",
    title: "Box Breathing (Waiting Room)",
    when: "5 min before interview, anxiety rising",
    durationSeconds: 120,
    steps: [
      "In 4 sec → hold 4 sec → out 4 sec → hold 4 sec.",
      "Repeat 4 cycles.",
      "Whisper skeleton of your strongest exercise — not full code.",
    ],
  },
  {
    id: "stuck-protocol",
    title: "When Mind Goes Blank Mid-Code",
    when: "You freeze and forget the next line",
    durationSeconds: 30,
    steps: [
      "Stop typing. Do not panic-delete working code.",
      "Say aloud: 'Next I need to ___' (parse / group / print).",
      "Write a comment line describing the next step — then code it.",
      "If still stuck: implement happy path only, say you'll add guards after.",
    ],
  },
  {
    id: "night-before",
    title: "Night Before Interview",
    when: "Evening before — not cramming new material",
    durationSeconds: 300,
    steps: [
      "Skeleton recall only — no new exercises.",
      "Pack: water, quiet space, VS tested, API/csv paths known.",
      "Set sleep alarm — 7+ hours non-negotiable.",
      "Mental rehearsal: 60 sec walk-through of calm ritual only.",
      "Failure log closed — tomorrow is retrieval, not new learning.",
    ],
  },
];

export const SRTC_PROTOCOL = {
  name: "S.R.T.C. — Skeleton · Reps · Test · Calm",
  reps: [
    {
      rep: "Rep 3",
      action: "Type with guide nearby — typing not copy-paste",
      goal: "Learn finger paths",
    },
    {
      rep: "Rep 2",
      action: "Guide folded — glance only when stuck",
      goal: "Reduce dependency",
    },
    {
      rep: "Rep 1",
      action: "Blank file, 25 min timer, no guide",
      goal: "Exam simulation — you 'know' it when this runs",
    },
  ],
  rule: "You don't know it until Rep 1 prints correct output in Visual Studio.",
};

export const SPACED_SCHEDULE = [
  { day: 0, label: "Learn", action: "Rep 3 + Rep 2 same day" },
  { day: 1, label: "Day 1", action: "Rep 1 timed blank page" },
  { day: 3, label: "Day 3", action: "Rep 1 again — no guide" },
  { day: 7, label: "Day 7", action: "Rep 1 + evaluate in Console Lab" },
  { day: 14, label: "Day 14", action: "Interleaved with different challenge" },
  { day: 30, label: "Day 30", action: "Maintenance rep — 20 min" },
];

export const WEEKLY_PLAN: WeeklyPlanDay[] = [
  {
    day: "Mon",
    focus: "New challenge + skeleton",
    tasks: ["Console Lab new brief", "Rep 3", "Failure log entry"],
  },
  {
    day: "Tue",
    focus: "Blank page",
    tasks: ["Rep 1 timed", "Evaluate paste", "Design prompt 5 min aloud"],
  },
  {
    day: "Wed",
    focus: "Spaced revisit",
    tasks: ["Monday's challenge Rep 1 again", "Interleave second type"],
  },
  {
    day: "Thu",
    focus: "Design depth",
    tasks: ["System design Console Lab", "Draw 3 boxes on paper", "Feynman 90 sec"],
  },
  {
    day: "Fri",
    focus: "Mixed mock",
    tasks: ["Random Console Lab pick", "25 min timer", "Calm ritual before start"],
  },
  {
    day: "Sat",
    focus: "Weak points",
    tasks: ["Lowest % challenge", "Target failed rubric checks only"],
  },
  {
    day: "Sun",
    focus: "Rest + consolidate",
    tasks: ["Skeleton recall only", "Sleep plan", "No new material"],
  },
];

export const INTERVIEW_READY_CHECKLIST = [
  "I can recite skeleton for postcode, dog API, and one design without notes",
  "I did Rep 1 blank-page on at least 2 console challenges this week",
  "I know my first line of code for each (same 60-sec ritual every time)",
  "I ran Ctrl+F5 locally — rubric is extra, running code is truth",
  "I sleep 7+ hours the night before — not negotiating",
  "I can explain WHY prefix is before space and WHY ThenBy name — not only HOW",
  "I have failure log entries and fixed each at least once",
  "I practiced saying design out loud, not only typing",
];
