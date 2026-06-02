import type {
  ChallengeApproach,
  ConsoleChallenge,
  DataSkill,
  VisualStudioStep,
} from "../../types/consoleLab";

const vs = (
  step: number,
  title: string,
  body: string,
  extra?: Partial<Pick<VisualStudioStep, "code" | "vsAction">>,
): VisualStudioStep => ({ step, title, body, ...extra });

function csvLinqVs(): VisualStudioStep[] {
  return [
    vs(1, "Usings at top of Program.cs", "Type these first — Ctrl+. fixes missing usings if you forget one.", {
      code: `using System;
using System.IO;
using System.Linq;`,
    }),
    vs(2, "File path + exists check", "Hard-code filename first; swap to args[0] later.", {
      code: `var path = "pp-monthly-update-new-version.csv";
if (!File.Exists(path))
{
    Console.WriteLine($"File not found: {path}");
    return;
}`,
    }),
    vs(3, "Read all lines", "ReadAllLines loads whole CSV — fine for ~100k rows in interview.", {
      code: `var lines = File.ReadAllLines(path);`,
    }),
    vs(4, "LINQ chain — filter, split, parse", "Col 2 = index 1, col 4 = index 3. Skip bad rows with Where.", {
      code: `var rows = lines
    .Where(l => !string.IsNullOrWhiteSpace(l))
    .Select(l => l.Split(','))
    .Where(c => c.Length >= 4)
    .Select(c => new
    {
        Price = decimal.TryParse(c[1].Trim('"'), out var p) ? p : (decimal?)null,
        Prefix = c[3].Trim('"').Split(' ')[0]
    })
    .Where(x => x.Price.HasValue && !string.IsNullOrEmpty(x.Prefix));`,
    }),
    vs(5, "GroupBy + Average + top 10", "OrderByDescending average, Take(10).", {
      code: `var top10 = rows
    .GroupBy(x => x.Prefix)
    .Select(g => new { Prefix = g.Key, Avg = g.Average(x => x.Price!.Value) })
    .OrderByDescending(x => x.Avg)
    .Take(10);`,
    }),
    vs(6, "Print numbered results", "Ctrl+F5 — verify SE15/SE12 mini-example if you have test rows.", {
      code: `int rank = 1;
foreach (var item in top10)
    Console.WriteLine($"{rank++}. {item.Prefix} — avg {item.Avg:F2}");`,
    }),
  ];
}

function csvDictionaryVs(): VisualStudioStep[] {
  return [
    vs(1, "Usings + path check", "Same setup as Approach A.", {
      code: `using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;

var path = "pp-monthly-update-new-version.csv";
if (!File.Exists(path)) { Console.WriteLine("Not found"); return; }`,
    }),
    vs(2, "Dictionary for running totals", "Key = prefix, value = (total, count) tuple.", {
      code: `var totals = new Dictionary<string, (decimal Sum, int Count)>();`,
    }),
    vs(3, "Stream with ReadLines + guards", "foreach one line — continue on bad data.", {
      code: `foreach (var line in File.ReadLines(path))
{
    if (string.IsNullOrWhiteSpace(line)) continue;
    var cols = line.Split(',');
    if (cols.Length < 4) continue;
    if (!decimal.TryParse(cols[1].Trim('"'), out var price)) continue;

    var postCode = cols[3].Trim('"');
    var space = postCode.IndexOf(' ');
    if (space <= 0) continue;
    var prefix = postCode[..space];  // BEFORE space — not Substring(space)!`,
    }),
    vs(4, "Update dictionary", "TryGetValue pattern — say this aloud in interview.", {
      code: `    if (totals.TryGetValue(prefix, out var t))
        totals[prefix] = (t.Sum + price, t.Count + 1);
    else
        totals[prefix] = (price, 1);
}`,
    }),
    vs(5, "Sort only the small result set", "LINQ on dictionary entries — not inside the loop.", {
      code: `var top10 = totals
    .Select(kv => new { Prefix = kv.Key, Avg = kv.Value.Sum / kv.Value.Count })
    .OrderByDescending(x => x.Avg)
    .Take(10);`,
    }),
    vs(6, "Print", "Ctrl+F5 and spot-check first row.", {
      code: `foreach (var x in top10)
    Console.WriteLine($"{x.Prefix} → {x.Avg:F2}");`,
    }),
  ];
}

function jsonApiLinearVs(): VisualStudioStep[] {
  return [
    vs(1, "Usings + async Main", "Top-level await works in .NET 6+ — or use static async Task Main.", {
      code: `using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text.Json;

using var client = new HttpClient();`,
    }),
    vs(2, "GET with try/catch", "Print error and return — never Environment.Exit in catch if json is used after.", {
      code: `string json;
try
{
    json = await client.GetStringAsync("https://dogapi.dog/api/v2/breeds");
}
catch (Exception ex)
{
    Console.WriteLine($"API failed: {ex.Message}");
    return;
}`,
    }),
    vs(3, "Parse root → data array", "Inspect API once in browser — JSON:API uses data[].attributes.", {
      code: `using var doc = JsonDocument.Parse(json);
var data = doc.RootElement.GetProperty("data");`,
    }),
    vs(4, "Loop and extract fields", "Tuples keep it one file without classes.", {
      code: `var breeds = new List<(string Name, int MaxLife, int MaxWeight)>();
foreach (var item in data.EnumerateArray())
{
    var a = item.GetProperty("attributes");
    var name = a.GetProperty("name").GetString() ?? "";
    var maxLife = a.GetProperty("life").GetProperty("max").GetInt32();
    var maxWeight = a.GetProperty("female_weight").GetProperty("max").GetInt32();
    breeds.Add((name, maxLife, maxWeight));
}`,
    }),
    vs(5, "First ranking — life", "OrderByDescending + ThenBy name + Take(10).", {
      code: `Console.WriteLine("Top 10 by Max Life Span");
var byLife = breeds
    .OrderByDescending(b => b.MaxLife)
    .ThenBy(b => b.Name)
    .Take(10);
int i = 1;
foreach (var b in byLife)
    Console.WriteLine($"{i++}. {b.Name} — max_lifespan={b.MaxLife}");`,
    }),
    vs(6, "Second ranking — weight", "Same list, new sort — copy-paste block and change property.", {
      code: `Console.WriteLine("\\nTop 10 by Max Female Weight");
var byWeight = breeds
    .OrderByDescending(b => b.MaxWeight)
    .ThenBy(b => b.Name)
    .Take(10);
i = 1;
foreach (var b in byWeight)
    Console.WriteLine($"{i++}. {b.Name} — max_weight={b.MaxWeight}");`,
    }),
  ];
}

function jsonApiHelpersVs(): VisualStudioStep[] {
  return [
    vs(1, "Skeleton with static helpers", "Add methods below Main — interview-friendly structure.", {
      code: `static async Task<string> LoadJsonAsync(HttpClient client, string url, string fallbackPath)
{
    try { return await client.GetStringAsync(url); }
    catch { return await File.ReadAllTextAsync(fallbackPath); }
}`,
    }),
    vs(2, "Parse method returns list", "Keeps Main readable: load → parse → rank → print.", {
      code: `static List<(string Name, int MaxLife, int MaxWeight)> ParseBreeds(string json)
{
    var list = new List<(string, int, int)>();
    using var doc = JsonDocument.Parse(json);
    foreach (var item in doc.RootElement.GetProperty("data").EnumerateArray())
    {
        var a = item.GetProperty("attributes");
        list.Add((
            a.GetProperty("name").GetString() ?? "",
            a.GetProperty("life").GetProperty("max").GetInt32(),
            a.GetProperty("female_weight").GetProperty("max").GetInt32()
        ));
    }
    return list;
}`,
    }),
    vs(3, "PrintTop10 helper", "One printer for both lists.", {
      code: `static void PrintTop10(string title, IEnumerable<(string Name, int MaxLife, int MaxWeight)> items,
    Func<(string, int, int), int> key)
{
    Console.WriteLine(title);
    int n = 1;
    foreach (var b in items.OrderByDescending(key).ThenBy(x => x.Name).Take(10))
        Console.WriteLine($"{n++}. {b.Name}");
}`,
    }),
    vs(4, "Main orchestrates", "Ctrl+F5 — add breed-data-02.json to project with Copy if newer.", {
      code: `using var client = new HttpClient();
var json = await LoadJsonAsync(client, "https://dogapi.dog/api/v2/breeds", "breed-data-02.json");
var breeds = ParseBreeds(json);
PrintTop10("Top 10 Life", breeds, b => b.MaxLife);
PrintTop10("Top 10 Weight", breeds, b => b.MaxWeight);`,
    }),
  ];
}

function spaceNewsDictVs(): VisualStudioStep[] {
  return [
    vs(1, "GET Spaceflight API", "Runtime only — no local file for this spec.", {
      code: `using var client = new HttpClient();
var url = "https://api.spaceflightnewsapi.net/v4/articles/?format=json&limit=100";
var json = await client.GetStringAsync(url);`,
    }),
    vs(2, "Navigate to results[]", "Not root array — wrapper object with results.", {
      code: `using var doc = JsonDocument.Parse(json);
var results = doc.RootElement.GetProperty("results");`,
    }),
    vs(3, "Dictionary key = month + year + site", "String key or ValueTuple — pick one and stick to it.", {
      code: `var counts = new Dictionary<string, int>();`,
    }),
    vs(4, "Loop articles", "published_at is ISO date; news_site is org name.", {
      code: `foreach (var article in results.EnumerateArray())
{
    if (!article.TryGetProperty("published_at", out var pub)) continue;
    if (!DateTime.TryParse(pub.GetString(), out var dt)) continue;
    var site = article.GetProperty("news_site").GetString() ?? "Unknown";
    var key = $"{dt:MMMM} {dt.Year} {site}";
    counts[key] = counts.GetValueOrDefault(key) + 1;
}`,
    }),
    vs(5, "Sort and print", "OrderBy year then month — or sort key strings if consistent.", {
      code: `foreach (var kv in counts.OrderBy(k => k.Key))
    Console.WriteLine($"{kv.Key} {kv.Value}");`,
    }),
  ];
}

function spaceNewsLinqVs(): VisualStudioStep[] {
  return [
    vs(1, "GET + parse results", "Same HTTP block as Approach A.", {
      code: `var json = await new HttpClient().GetStringAsync(
    "https://api.spaceflightnewsapi.net/v4/articles/?format=json&limit=100");
using var doc = JsonDocument.Parse(json);
var results = doc.RootElement.GetProperty("results");`,
    }),
    vs(2, "Project to anonymous rows", "Materialise to list so LINQ is easy.", {
      code: `var rows = results.EnumerateArray()
    .Select(a =>
    {
        var dt = DateTime.Parse(a.GetProperty("published_at").GetString()!);
        return new
        {
            Month = dt.ToString("MMMM"),
            Year = dt.Year,
            Site = a.GetProperty("news_site").GetString() ?? ""
        };
    })
    .ToList();`,
    }),
    vs(3, "GroupBy + Count", "One line aggregation after projection.", {
      code: `var grouped = rows
    .GroupBy(r => new { r.Month, r.Year, r.Site })
    .Select(g => new { g.Key.Month, g.Key.Year, g.Key.Site, Count = g.Count() })
    .OrderBy(x => x.Year).ThenBy(x => x.Month).ThenBy(x => x.Site);`,
    }),
    vs(4, "Print", "Format matches spec: Month Year Site Count.", {
      code: `foreach (var x in grouped)
    Console.WriteLine($"{x.Month} {x.Year} {x.Site} {x.Count}");`,
    }),
  ];
}

const BY_APPROACH_ID: Record<string, VisualStudioStep[]> = {
  "a-linq": csvLinqVs(),
  "b-dictionary": csvDictionaryVs(),
  "a-linear": jsonApiLinearVs(),
  "b-fallback": jsonApiHelpersVs(),
  "b-helpers": jsonApiHelpersVs(),
  "a-dictionary": spaceNewsDictVs(),
  "b-linq": spaceNewsLinqVs(),
};

function genericVs(skill: DataSkill, approachId: string): VisualStudioStep[] {
  if (BY_APPROACH_ID[approachId]) return BY_APPROACH_ID[approachId];

  switch (skill) {
    case "csv":
      return approachId.includes("dict") || approachId.includes("b-")
        ? csvDictionaryVs()
        : csvLinqVs();
    case "json-api":
      return approachId.includes("helper") || approachId.includes("b-")
        ? jsonApiHelpersVs()
        : jsonApiLinearVs();
    case "json-file":
      return [
        vs(1, "Add JSON to project", "Copy if newer in file Properties.", {
          vsAction: "Add → Existing Item → breed-data.json",
        }),
        vs(2, "Read file", "", {
          code: `var json = await File.ReadAllTextAsync("data.json");`,
        }),
        vs(3, "Same parse as API", "JsonDocument.Parse(json) — identical loop after this line."),
      ];
    case "stdin":
      return [
        vs(1, "ReadLine loop", "No file — type in console or redirect input.txt.", {
          code: `string? line;
while ((line = Console.ReadLine()) is not null)
{
    // parse line, update state
}`,
        }),
        vs(2, "Print summary", "After loop ends (Ctrl+Z or blank line).", {
          code: `Console.WriteLine($"Result: {answer}");`,
        }),
      ];
    default:
      return [
        vs(1, "Load input", "File, API, or stdin — pick one block from LEARN tab."),
        vs(2, "Transform", "LINQ or Dictionary — match Approach skeleton."),
        vs(3, "Print", "Numbered output if spec asks for ranking."),
      ];
  }
}

export function enrichApproachWithVsSteps(
  approach: ChallengeApproach,
  skill: DataSkill,
): ChallengeApproach {
  if (approach.visualStudioSteps?.length) return approach;
  return {
    ...approach,
    visualStudioSteps: genericVs(skill, approach.id),
  };
}

export function enrichChallengeApproaches(challenge: ConsoleChallenge): ConsoleChallenge {
  return {
    ...challenge,
    approaches: [
      enrichApproachWithVsSteps(challenge.approaches[0], challenge.dataSkill),
      enrichApproachWithVsSteps(challenge.approaches[1], challenge.dataSkill),
    ],
  };
}
