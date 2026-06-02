import type { SkillLesson } from "../../types/consoleLab";
import { VISUAL_STUDIO_SETUP } from "./visualStudioSetup";

export const SKILL_LESSONS: SkillLesson[] = [
  {
    id: "csv",
    title: "CSV in C# (no library)",
    intro:
      "Investec-style tasks: no CsvHelper NuGet. You Split, parse, guard. Column numbers are 1-based in spec but 0-based in code.",
    visualStudioSetup: VISUAL_STUDIO_SETUP,
    mustMemorise: [
      "Col 2 in spec = index 1, col 4 = index 3",
      "line.Split(',') then Trim('\"') on fields",
      "decimal.TryParse for money — never double",
      "File.ReadLines = stream; ReadAllLines = all in RAM",
      "Guard: empty line, cols.Length, TryParse fail → continue",
    ],
    steps: [
      {
        step: 1,
        title: "Open file safely",
        body: "const path = \"file.csv\"; if (!File.Exists(path)) { message; return; }",
      },
      {
        step: 2,
        title: "Read",
        body: "foreach (var line in File.ReadLines(path)) — one row at a time.",
      },
      {
        step: 3,
        title: "Split & parse",
        body: "var cols = line.Split(','); if (cols.Length < N) continue; decimal.TryParse(cols[1].Trim('\"'), out var price)",
      },
      {
        step: 4,
        title: "Aggregate",
        body: "Dictionary for running totals OR GroupBy after projecting to objects/tuples.",
      },
      {
        step: 5,
        title: "Rank & print",
        body: "OrderByDescending → Take(10). Test with spec mini-example on paper first.",
      },
    ],
    twoApproachesSummary: {
      a: "LINQ pipeline after ReadAllLines — fastest to type.",
      b: "Dictionary + foreach + ReadLines — best to explain aloud.",
    },
    keepLearning: [
      "Postcode prefix challenge (Investec #1) — both approaches",
      "csv-sales-by-region, bank-running-balance, csv-date-filter",
      "Practice: wrong column index once on purpose, then fix — builds memory",
    ],
  },
  {
    id: "json-api",
    title: "Consuming Web APIs (HttpClient + System.Text.Json)",
    intro:
      "No Newtonsoft. HttpClient for GET, JsonDocument to walk JSON. Real APIs use wrappers (data[], results[]) and snake_case.",
    visualStudioSetup: VISUAL_STUDIO_SETUP,
    mustMemorise: [
      "using var client = new HttpClient(); json = await client.GetStringAsync(url);",
      "try/catch — print message, return or fallback file",
      "JsonDocument.Parse(json) → RootElement.GetProperty(\"data\" or \"results\")",
      "GetProperty(\"name\").GetString() — check null with ?? \"\"",
      "Objects: .GetProperty(\"life\").GetProperty(\"max\").GetInt32()",
      "Tie-break sort: OrderByDescending(...).ThenBy(name).Take(10)",
    ],
    steps: [
      {
        step: 1,
        title: "GET at runtime",
        body: "Spec often forbids local file — must call URL in interview.",
      },
      {
        step: 2,
        title: "Inspect shape first",
        body: "Browser or curl once: root array vs { results: [] } vs JSON:API data[].attributes.",
      },
      {
        step: 3,
        title: "Parse loop",
        body: "foreach (var item in array.EnumerateArray()) { var a = item.GetProperty(\"attributes\"); ... }",
      },
      {
        step: 4,
        title: "Extract & store",
        body: "List<(string Name, int MaxLife, int MaxWeight)> — tuples avoid boilerplate.",
      },
      {
        step: 5,
        title: "Rank twice if needed",
        body: "Same list, two OrderBy chains — life then weight.",
      },
    ],
    twoApproachesSummary: {
      a: "Linear 4-block file — best for muscle memory.",
      b: "LoadJson + Parse + Print helpers — when they want structure.",
    },
    keepLearning: [
      "Dog breeds API (Investec #2) — Approach A linear",
      "Space news API (Investec #3) — results[] + published_at + news_site",
      "api-pagination-total — follow next URL loop",
      "http-retry — Task.Delay between attempts",
    ],
  },
  {
    id: "json-file",
    title: "JSON from local file (fallback)",
    intro:
      "Same parse logic as API — only loading differs. ReadAllText → identical JsonDocument path.",
    visualStudioSetup: VISUAL_STUDIO_SETUP,
    mustMemorise: [
      "Copy JSON to project → Copy to Output Directory: Copy if newer",
      "json = await File.ReadAllTextAsync(\"breed-data-02.json\");",
      "catch block in API version: fallback before return",
      "Never use file as primary if spec says runtime API only",
    ],
    steps: [
      {
        step: 1,
        title: "Primary vs fallback",
        body: "try API → catch → ReadAllText fallback — spec allows for dog breeds, not space news.",
      },
      {
        step: 2,
        title: "Same parser",
        body: "One ParseX(json) method used by both paths — DRY without OO ceremony.",
      },
      {
        step: 3,
        title: "Offline practice",
        body: "Use file when training on plane; use API when simulating interview.",
      },
    ],
    twoApproachesSummary: {
      a: "ReadAllText + JsonDocument — always use this in interview.",
      b: "Utf8JsonReader — mention only for huge files.",
    },
    keepLearning: [
      "Dog breeds with breed-data-02.json fallback",
      "json-join-orders — two files or one combined JSON",
      "nested-json-sum — recursive JsonElement walk",
    ],
  },
];

export const SKILL_BY_ID = Object.fromEntries(SKILL_LESSONS.map((s) => [s.id, s])) as Record<
  string,
  SkillLesson
>;
