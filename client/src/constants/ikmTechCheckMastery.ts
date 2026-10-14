import type { MasteryTrack } from "./ntokozoMastery";
import warroom from "./ikmTechCheck.warroom.json";

type WarroomFlashcard = {
  id: string;
  category: string;
  exam: string;
  difficulty: string;
  question: string;
  options?: string[];
  answer: string;
  followUps?: string[];
  codeExample?: string;
};

type WarroomPayload = typeof warroom;

const mapDifficulty = (d: string): "SENIOR" | "LEAD" | "PRINCIPAL" => {
  if (d === "staff") return "LEAD";
  if (d === "principal") return "PRINCIPAL";
  return "SENIOR";
};

const formatAnswer = (card: WarroomFlashcard) => {
  const optionsBlock =
    card.options?.length &&
    `\n\n**Options:**\n${card.options.map((o) => `- ${o}`).join("\n")}`;
  const codeBlock = card.codeExample?.trim()
    ? `\n\n**Note:** \`${card.codeExample}\``
    : "";
  return `${card.answer}${optionsBlock ?? ""}${codeBlock}`;
};

const toDrill = (card: WarroomFlashcard, prefix: string) => ({
  id: `${prefix}_${card.id}`,
  difficulty: mapDifficulty(card.difficulty),
  question: card.question,
  answer: formatAnswer(card),
  followUp: card.followUps?.[0],
  tags: ["ikm", card.category, card.exam],
});

const allCards = warroom.flashcards as WarroomFlashcard[];
const csharpCards = allCards.filter(
  (c) => c.exam === "csharp" || c.category === "warmup"
);
const fullstackCards = allCards.filter((c) => c.exam === "fullstack");

const exam = warroom.exam as WarroomPayload["exam"];
const csharpTest = exam.tests.find((t) => t.id === "csharp-8")!;
const fsTest = exam.tests.find((t) => t.id === "investec-fullstack")!;

const examDefinitions = [
  {
    term: "IKM TechCheck",
    definition:
      "Timed adaptive multiple-choice screening (C# 8, Angular 17, ASP.NET MVC 5 / Web API 2, ANSI SQL, DevOps/Git).",
    example: exam.expiresNote,
  },
  {
    term: csharpTest.name,
    definition: `${csharpTest.questions} questions · ${csharpTest.timeLimitMinutes} min limit · target ${csharpTest.targetCorrect}+ correct (${csharpTest.targetPercent}%).`,
    example: "Focus: structs, LINQ, async, generics, delegates, pattern matching.",
  },
  {
    term: fsTest.name,
    definition: `${fsTest.questions} questions · ${fsTest.timeLimitMinutes} min limit · target ${fsTest.targetCorrect}+ correct (${fsTest.targetPercent}%).`,
    example: "Focus: Angular 17, MVC/Web API 2, ANSI SQL aggregates, CI/CD, Git.",
  },
  ...warroom.studyTips.map((tip, i) => ({
    term: `Study tip ${i + 1}`,
    definition: tip,
  })),
];

export const IKM_CSHARP_TRACK: MasteryTrack = {
  id: "IKM_CSHARP_8",
  title: "IKM C# 8.0 Programming",
  description: `${csharpTest.questions} Q · ${csharpTest.timeLimitMinutes} min · target ${csharpTest.targetCorrect}/39 (${csharpTest.targetPercent}%). ${csharpCards.length} War Room drills from reconstructed TechCheck bank.`,
  color: "#3B82F6",
  definitions: examDefinitions.slice(0, 3),
  drills: csharpCards.map((c) => toDrill(c, "ikm_cs")),
  codeDrills: [
    {
      id: "ikm_cs_code_01",
      title: "LINQ — Average and filtered average",
      brief:
        "Given List<Example> with fields A (string) and B (int), write expressions that store 5 in result: overall average of B, and average of B where A == \"B\".",
      language: "csharp",
      starter: `struct Example { public string A; public int B; }

List<Example> examples = /* 1..9 as in IKM Q2 */;

// TODO: two int result assignments that both equal 5
`,
      hints: [
        "Average of all B: (1+2+3+4+5+6+7+8+9)/9 = 5",
        "Where A==\"B\" gives B values 2, 5, 8 → average 5",
        "Use Convert.ToInt32 if result is int",
      ],
      solution: `int result1 = Convert.ToInt32(examples.Average(x => x.B));
int result2 = Convert.ToInt32(
    examples.Where(x => x.A == "B").Average(x => x.B));`,
      takeaway: "Median/Mode are not standard LINQ — Average + Where is a common IKM trap.",
    },
    {
      id: "ikm_cs_code_02",
      title: "Async in catch — CS4014 fix",
      brief:
        "Fix Main so MethodAsync is properly awaited without CS4014 warning.",
      language: "csharp",
      starter: `static void Main(string[] args)
{
    MethodAsync();
    Console.WriteLine("done");
}

static async Task MethodAsync()
{
    await Task.Delay(1000);
}`,
      hints: [
        "C# 7.1+: static async Task Main",
        "Alternative: .GetAwaiter().GetResult() — blocks, avoid on UI",
      ],
      solution: `static async Task Main(string[] args)
{
    await MethodAsync();
    Console.WriteLine("done");
}`,
      takeaway: "IKM tests async exception handlers and Main entry patterns together.",
    },
  ],
};

export const IKM_FULLSTACK_TRACK: MasteryTrack = {
  id: "IKM_INVESTEC_FS",
  title: "IKM Investec Full Stack",
  description: `${fsTest.questions} Q · ${fsTest.timeLimitMinutes} min · target ${fsTest.targetCorrect}/66 (${fsTest.targetPercent}%). Angular 17, MVC/Web API 2, ANSI SQL, DevOps — ${fullstackCards.length} drills.`,
  color: "#10B981",
  definitions: examDefinitions,
  drills: fullstackCards.map((c) => toDrill(c, "ikm_fs")),
  codeDrills: [
    {
      id: "ikm_fs_code_01",
      title: "ANSI SQL — GROUP BY / HAVING",
      brief:
        "Students with max score > 80: complete the query with correct clause order.",
      language: "sql",
      starter: `SELECT student_id, max(score)
FROM grades
-- TODO: filter groups where max(score) > 80
ORDER BY student_id`,
      hints: [
        "WHERE cannot use aggregate functions",
        "HAVING filters after GROUP BY",
        "Never WHERE max(score) — use HAVING",
      ],
      solution: `SELECT student_id, max(score)
FROM grades
GROUP BY student_id
HAVING max(score) > 80
ORDER BY student_id`,
      takeaway: "IKM SQL loves WHERE vs HAVING and invalid aggregate placement.",
    },
    {
      id: "ikm_fs_code_02",
      title: "Angular — unsubscribe with takeUntil",
      brief:
        "Subscribe to mouseMoves observable and clean up on destroy without memory leaks.",
      language: "csharp",
      starter: `// TypeScript — component skeleton
private readonly onDestroy$ = new Subject<void>();

ngOnInit() {
  this.mouseMoves.pipe(
    // TODO
  ).subscribe(position => console.log(position));
}

ngOnDestroy() {
  // TODO
}`,
      hints: [
        "pipe(takeUntil(this.onDestroy$))",
        "ngOnDestroy: onDestroy$.next(); onDestroy$.complete();",
      ],
      solution: `this.mouseMoves.pipe(
  takeUntil(this.onDestroy$)
).subscribe(position => console.log(position));

ngOnDestroy() {
  this.onDestroy$.next();
  this.onDestroy$.complete();
}`,
      takeaway: "takeUntil + Subject is the idiomatic Angular unsubscribe pattern on IKM.",
    },
  ],
};

/** Combined track — all IKM TechCheck drills in one place. */
export const IKM_TECHCHECK_TRACK: MasteryTrack = {
  id: "IKM_TECHCHECK",
  title: "IKM TechCheck (All Topics)",
  description: `Full reconstructed Q&A bank — ${allCards.length} drills across C# 8, Angular 17, ASP.NET MVC 5 / Web API 2, ANSI SQL, DevOps. Stack: ${exam.stack.join(", ")}.`,
  color: "#6366F1",
  definitions: examDefinitions,
  drills: allCards.map((c) => toDrill(c, "ikm")),
  codeDrills: [...IKM_CSHARP_TRACK.codeDrills, ...IKM_FULLSTACK_TRACK.codeDrills],
};
