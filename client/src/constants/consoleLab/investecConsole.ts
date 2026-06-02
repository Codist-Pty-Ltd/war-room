import type { ConsoleChallenge } from "../../types/consoleLab";
import { has, hasAny } from "../../utils/consoleLabEvaluator";
import { POSTCODE_CSV_URL, withApproaches } from "./approachTemplates";

const investecRaw: Omit<ConsoleChallenge, "approaches">[] = [
  {
    id: "investec-postcode",
    title: "Top 10 Postcode Prefixes by Average Price",
    source: "Investec",
    difficulty: "mid",
    timeMinutes: 35,
    dataSkill: "csv",
    datasetUrl: POSTCODE_CSV_URL,
    referenceLinks: [
      POSTCODE_CSV_URL,
      "https://www.gov.uk/government/statistical-data-sets/price-paid-data-downloads",
    ],
    prompt: `UK Land Registry CSV (no headers). Column 2 = price, column 4 = postcode.
Prefix = part BEFORE the space (SE16 7TG → SE16).
Find the 10 prefixes with the highest AVERAGE price.

Download CSV (runtime or local copy):
${POSTCODE_CSV_URL}

Console app, .NET 8, no CSV NuGet, LINQ allowed.`,
    exampleInput: `SE15 2TH, 100\nSE15 5NY, 200\nSE12 8TW, 33`,
    exampleOutput: `SE15 → 150\nSE12 → 33`,
    constraints: [
      "Console app, C# .NET 8",
      "No external CSV libraries",
      "LINQ is allowed",
      "No headers in CSV",
    ],
    thoughtProcess: [
      {
        step: 1,
        title: "Restate the problem",
        body: "Average price per prefix, top 10 descending. Prefix = before space, not suffix.",
      },
    ],
    skeleton: [
      "file path + exists check",
      "read lines",
      "parse col[1] price, col[3] postcode",
      "prefix before space",
      "average per prefix",
      "top 10 print",
    ],
    criteria: [
      {
        id: "read-file",
        label: "Reads CSV (File.ReadAllLines or ReadLines)",
        hint: "Use System.IO — no CSV package.",
        test: hasAny(/File\.ReadAllLines/i, /File\.ReadLines/i),
        weight: 1,
      },
      {
        id: "split",
        label: "Splits rows into columns",
        hint: "line.Split(',') — col 2 = index 1, col 4 = index 3.",
        test: has(/\.Split\s*\(\s*['"],['"]\s*\)/),
        weight: 1,
      },
      {
        id: "decimal",
        label: "Uses decimal for money",
        hint: "decimal.TryParse or decimal in aggregation.",
        test: hasAny(/decimal/i),
        weight: 1,
      },
      {
        id: "prefix",
        label: "Extracts prefix BEFORE space (not after)",
        hint: "IndexOf(' ') + range before, or Split(' ')[0].",
        test: hasAny(/IndexOf\s*\(\s*['"]\s['"]\s*\)/, /\.Split\s*\(\s*['"]\s['"]\s*\)\s*\[\s*0\s*\]/, /\[\s*\.\.\s*\w+\s*\]/),
        weight: 2,
      },
      {
        id: "aggregate",
        label: "Groups or aggregates by prefix",
        hint: "Dictionary or GroupBy + Average.",
        test: hasAny(/GroupBy/i, /Dictionary\s*</i),
        weight: 2,
      },
      {
        id: "top10",
        label: "Takes top 10 by average descending",
        hint: "OrderByDescending + Take(10).",
        test: hasAny(/OrderByDescending/i, /Take\s*\(\s*10\s*\)/),
        weight: 1,
      },
      {
        id: "guards",
        label: "Skips bad rows (TryParse or null checks)",
        hint: "TryParse, continue, or Where filters.",
        test: hasAny(/TryParse/i, /continue/i, /\.Where\s*\(/),
        weight: 1,
      },
    ],
    commonMistakes: [
      "Substring after space → suffix 7TG not SE16",
      "double instead of decimal",
      "O(n²) Where().FirstOrDefault() per row",
    ],
  },
  {
    id: "investec-dog-breeds",
    title: "Dog Breeds — Top 10 Life & Weight",
    source: "Investec",
    difficulty: "mid",
    timeMinutes: 30,
    dataSkill: "json-api",
    datasetUrl: "https://dogapi.dog/api/v2/breeds",
    referenceLinks: ["https://dogapi.dog/api/v2/breeds"],
    prompt: `GET https://dogapi.dog/api/v2/breeds
Parse data[*].attributes: name, life.max, female_weight.max
Two top-10 lists (desc by max, tie-break name asc).
Fallback file breed-data-02.json if API down (optional in interview).
.NET 8 console, no NuGet, LINQ OK.`,
    exampleOutput: `Top 10 by Max Life Span\n1. Breed — max_lifespan=20`,
    constraints: ["HttpClient + System.Text.Json", "Handle errors", "ThenBy name on tie"],
    thoughtProcess: [
      { step: 1, title: "Four blocks", body: "GET → parse data[] → sort life → sort weight." },
    ],
    skeleton: ["GET", "parse attributes", "sort life", "sort weight"],
    criteria: [
      { id: "http", label: "HttpClient", hint: "GetStringAsync", test: hasAny(/HttpClient/i, /GetStringAsync/i), weight: 2 },
      { id: "json", label: "JsonDocument", hint: "", test: hasAny(/JsonDocument/i), weight: 2 },
      { id: "data-path", label: "data + attributes", hint: "", test: hasAny(/["']data["']/i, /attributes/i), weight: 2 },
      { id: "sort-tie", label: "OrderByDescending + ThenBy", hint: "", test: hasAny(/OrderByDescending/i, /ThenBy/i), weight: 2 },
      { id: "error", label: "try/catch", hint: "", test: hasAny(/try/i, /catch/i), weight: 1 },
    ],
    commonMistakes: ["min not max", "no ThenBy", "wrong JSON path"],
  },
  {
    id: "investec-space-news",
    title: "Space News — Articles per Org per Month",
    source: "Investec",
    difficulty: "mid",
    timeMinutes: 35,
    dataSkill: "json-api",
    datasetUrl:
      "https://api.spaceflightnewsapi.net/v4/articles/?format=json&limit=100",
    referenceLinks: [
      "https://api.spaceflightnewsapi.net/v4/articles/?format=json&limit=100",
    ],
    prompt: `GET https://api.spaceflightnewsapi.net/v4/articles/?format=json&limit=100
Count articles per news organisation per calendar month.
Output: Month Year NewsSite Count
Runtime API only — no local JSON file.`,
    exampleOutput: `June 2021 SpaceNews 1\nJuly 2021 Spaceflight Now 2`,
    constraints: ["Runtime API", "results[] wrapper", "snake_case fields"],
    thoughtProcess: [
      { step: 1, title: "Group key", body: "(month name, year, news_site) → count++." },
    ],
    skeleton: ["GET", "results[]", "parse date", "dictionary count", "sort print"],
    criteria: [
      { id: "http-api", label: "Spaceflight API URL", hint: "", test: hasAny(/spaceflightnewsapi/i), weight: 2 },
      { id: "results", label: "results array", hint: "", test: has(/results/i), weight: 2 },
      { id: "date", label: "DateTime parse", hint: "published_at", test: hasAny(/published_at/i, /DateTime/i), weight: 2 },
      { id: "count", label: "Dictionary/GroupBy count", hint: "", test: hasAny(/Dictionary/i, /GroupBy/i), weight: 2 },
    ],
    commonMistakes: ["root array not results", "forget month+year+site", "local file primary"],
  },
];

const investecApproaches: Record<string, ConsoleChallenge["approaches"]> = {
  "investec-postcode": [
    {
      id: "a-linq",
      name: "Approach A — LINQ pipeline",
      whenToUse: "Fastest in a timed interview when CSV fits in memory (~107k rows OK).",
      thoughtProcess: [
        { step: 1, title: "Read", body: "File.ReadAllLines(path) → Where not empty → Select Split(',') → Where length >= 4." },
        { step: 2, title: "Project", body: "TryParse cols[1] to decimal?; postcode cols[3]; prefix Split(' ')[0]." },
        { step: 3, title: "Aggregate", body: "GroupBy prefix → Average(price) → OrderByDescending → Take(10)." },
        { step: 4, title: "Print", body: "Numbered lines — verify SE15 avg 150 on spec example." },
      ],
      skeleton: ["ReadAllLines", "Split parse", "GroupBy Average", "Take(10)"],
      criteriaExtras: [
        { id: "linq-group", label: "GroupBy + Average", hint: "", test: has(/GroupBy/i), weight: 1 },
      ],
    },
    {
      id: "b-dictionary",
      name: "Approach B — Dictionary + ReadLines",
      whenToUse: "Easier to narrate; streams one line at a time.",
      thoughtProcess: [
        { step: 1, title: "Stream", body: "foreach (line in File.ReadLines(path)) — lower peak memory." },
        { step: 2, title: "Guards", body: "continue on bad rows — cols, TryParse, blank postcode, no space." },
        { step: 3, title: "Prefix", body: "postCode[..postCode.IndexOf(' ')] — NEVER Substring after space." },
        { step: 4, title: "Dict", body: "Dictionary<string,(decimal Total,int Count)> TryGetValue update." },
        { step: 5, title: "Rank", body: "LINQ on dictionary only: Total/Count, OrderByDescending, Take(10)." },
      ],
      skeleton: ["ReadLines", "guards", "dict tuple", "sort top 10"],
      criteriaExtras: [
        { id: "dict", label: "Dictionary aggregation", hint: "", test: has(/Dictionary/i), weight: 1 },
        { id: "readlines", label: "File.ReadLines", hint: "", test: has(/ReadLines/i), weight: 1 },
      ],
    },
  ],
  "investec-dog-breeds": [
    {
      id: "a-linear",
      name: "Approach A — Linear 4-block (API only)",
      whenToUse: "Muscle memory — ~50 lines top to bottom, no helper methods.",
      thoughtProcess: [
        { step: 1, title: "GET", body: "try { HttpClient GetStringAsync } catch { message; return }." },
        { step: 2, title: "Parse", body: "JsonDocument → data[] → attributes → name, life.max, female_weight.max → list of tuples." },
        { step: 3, title: "Life top 10", body: "OrderByDescending MaxLife.ThenBy Name.Take(10) → print max_lifespan=" },
        { step: 4, title: "Weight top 10", body: "Same list, OrderByDescending MaxWeight..." },
      ],
      skeleton: ["GET json", "parse loop", "sort life", "sort weight"],
    },
    {
      id: "b-fallback",
      name: "Approach B — API + file fallback + optional ParseMax",
      whenToUse: "Full Investec spec — API primary, breed-data-02.json in catch, string ranges optional.",
      thoughtProcess: [
        { step: 1, title: "Load", body: "try API → catch ReadAllTextAsync('breed-data-02.json')." },
        { step: 2, title: "ParseMax helper", body: "JsonElement: if object read max; if string regex digits take max." },
        { step: 3, title: "ParseBreeds(json)", body: "Extract method — returns List for two ranking passes." },
        { step: 4, title: "PrintTop10 helper", body: "Reuse printer for both lists — DRY without OO overkill." },
      ],
      skeleton: ["LoadJson", "ParseMax", "ParseBreeds", "PrintTop10 x2"],
      criteriaExtras: [
        { id: "fallback", label: "JSON fallback file", hint: "ReadAllText json in catch", test: hasAny(/ReadAllText/i, /breed-data/i, /\.json/i), weight: 1 },
      ],
    },
  ],
  "investec-space-news": [
    {
      id: "a-dictionary",
      name: "Approach A — Dictionary composite key",
      whenToUse: "Clear counting story for (month, year, site).",
      thoughtProcess: [
        { step: 1, title: "GET", body: "HttpClient — runtime only, no file." },
        { step: 2, title: "Navigate", body: "Root → results[] — NOT root array." },
        { step: 3, title: "Key", body: "Parse published_at → month name + year; news_site field." },
        { step: 4, title: "Count", body: "Dictionary key → increment; skip bad rows." },
        { step: 5, title: "Sort print", body: "OrderBy year, month, site — format 'June 2021 SpaceNews 1'." },
      ],
      skeleton: ["GET", "results loop", "DateTime", "dict++", "sort print"],
    },
    {
      id: "b-linq",
      name: "Approach B — LINQ GroupBy after projection",
      whenToUse: "When comfortable projecting to anonymous { Month, Year, Site } first.",
      thoughtProcess: [
        { step: 1, title: "Project", body: "Select each article to { MonthName, Year, Site } from results." },
        { step: 2, title: "Group", body: "GroupBy (Year, Month, Site) → Count()." },
        { step: 3, title: "Sort", body: "OrderBy year then month number then site." },
        { step: 4, title: "Pagination note", body: "Mention following next URL for all 34k articles — optional." },
      ],
      skeleton: ["GET", "Select project", "GroupBy Count", "OrderBy print"],
      criteriaExtras: [
        { id: "groupby-count", label: "GroupBy + Count", hint: "", test: hasAny(/GroupBy/i, /\.Count\s*\(/i), weight: 1 },
      ],
    },
  ],
};

export const INVESTEC_CONSOLE_CHALLENGES: ConsoleChallenge[] = investecRaw.map((c) =>
  withApproaches({
    ...c,
    approaches: investecApproaches[c.id],
  }),
);
