# Exercise 2 — Dog Breeds (Approach A: LINQ + JsonDocument)

**Task:** Call `GET https://dogapi.dog/api/v2/breeds` (or fallback `breed-data-02.json`), output:

1. **Top 10 by max life span** (desc), tie → name asc  
2. **Top 10 by max female weight** (desc), tie → name asc  

**No NuGet.** Use `HttpClient` + `System.Text.Json` only.

---

## Why this approach?

| Principle | How it shows here |
|-----------|-------------------|
| **Resilience** | API first, file fallback — graceful degradation |
| **Parse flexible JSON** | `JsonElement` handles object `{min,max}` OR optional string ranges |
| **DRY ranking** | One `PrintTop10` helper, two sort keys |
| **LINQ for ordering** | `OrderByDescending` + `ThenBy` = tie-break in one line |

**Pick this when:** You want the fastest correct solution under time pressure.

---

## Visual Studio — Step 0

1. **Console App .NET 8** → name `InvestecDogBreedsLinq`
2. Copy `breed-data-02.json` from `investec_interview\` into project
3. Right-click JSON → **Properties → Copy to Output Directory: Copy if newer**
4. Replace `Program.cs` with steps below

---

## Step 1 — Constants

```csharp
const string ApiUrl = "https://dogapi.dog/api/v2/breeds";
const string FallbackFile = "breed-data-02.json";
```

Single source of truth for URLs/paths.

---

## Step 2 — Load JSON (API → fallback)

```csharp
string json;
try
{
    using var client = new HttpClient { Timeout = TimeSpan.FromSeconds(15) };
    json = await client.GetStringAsync(ApiUrl);
    Console.WriteLine("Loaded breeds from API.\n");
}
catch (Exception ex)
{
    Console.WriteLine($"API failed ({ex.Message}). Using fallback file.\n");
    if (!File.Exists(FallbackFile))
    {
        Console.Error.WriteLine($"Fallback not found: {FallbackFile}");
        Environment.Exit(1);
    }
    json = await File.ReadAllTextAsync(FallbackFile);
}
```

| Line | Why |
|------|-----|
| `Timeout = 15s` | Spec: handle timeouts — don't hang forever |
| `try/catch` | HTTP failures must not crash unhandled |
| `Environment.Exit(1)` | Non-zero exit when no data at all (spec allows) |
| `await` | Top-level async in .NET 6+ console — no `Main` boilerplate |

---

## Step 3 — Parse breeds

```csharp
var breeds = ParseBreeds(json);
```

Add helper at bottom of file:

```csharp
static List<BreedRow> ParseBreeds(string json)
{
    using var doc = JsonDocument.Parse(json);
    var list = new List<BreedRow>();

    foreach (var item in doc.RootElement.GetProperty("data").EnumerateArray())
    {
        var attrs = item.GetProperty("attributes");
        var name = attrs.GetProperty("name").GetString() ?? "";
        var maxLife = ParseMax(attrs.GetProperty("life"));
        var maxWeight = ParseMax(attrs.GetProperty("female_weight"));

        if (string.IsNullOrWhiteSpace(name)) continue;
        list.Add(new BreedRow(name, maxLife, maxWeight));
    }

    return list;
}
```

| Line | Why |
|------|-----|
| `JsonDocument.Parse` | Built-in; no Newtonsoft |
| `data` array | JSON:API shape from spec |
| `attributes.name/life/female_weight` | Exact fields required |
| `ParseMax` | Handles object **or** optional string range |

---

## Step 4 — ParseMax (object + optional string)

```csharp
static int ParseMax(JsonElement element)
{
    if (element.ValueKind == JsonValueKind.Object &&
        element.TryGetProperty("max", out var maxProp) &&
        maxProp.TryGetInt32(out var n))
        return n;

    if (element.ValueKind == JsonValueKind.String)
        return ParseRangeStringMax(element.GetString() ?? "");

    return 0;
}

static int ParseRangeStringMax(string text)
{
    var numbers = Regex.Matches(text, @"\d+")
        .Select(m => int.Parse(m.Value))
        .ToList();
    return numbers.Count == 0 ? 0 : numbers.Max();
}
```

Add at top: `using System.Text.RegularExpressions;`

| Line | Why |
|------|-----|
| `ValueKind == Object` | Normal API: `{ "min": 14, "max": 16 }` |
| `TryGetProperty("max")` | Ranking uses **max** only |
| String branch | Optional spec: `"10 - 12"`, `"20 - 25 kg"` → take max digit |
| `Regex` | Built-in; not an external library |

---

## Step 5 — Rank and print (LINQ tie-break)

```csharp
PrintTop10(
    "Top 10 by Max Life Span",
    breeds.OrderByDescending(b => b.MaxLife).ThenBy(b => b.Name).Take(10),
    b => $"max_lifespan={b.MaxLife}");

PrintTop10(
    "Top 10 Heaviest Female Breeds",
    breeds.OrderByDescending(b => b.MaxFemaleWeight).ThenBy(b => b.Name).Take(10),
    b => $"max_female_weight={b.MaxFemaleWeight}");
```

| Line | Why |
|------|-----|
| `OrderByDescending` | Higher max first |
| `ThenBy(b => b.Name)` | **Tie-breaker:** name ascending |
| `Take(10)` | Exactly 10 when enough data |
| Output format | Matches spec: `1. Breed — max_lifespan=20` |

Helper:

```csharp
static void PrintTop10(string title, IEnumerable<BreedRow> rows, Func<BreedRow, string> metric)
{
    Console.WriteLine(title);
    int rank = 1;
    foreach (var row in rows)
    {
        Console.WriteLine($"{rank}. {row.Name} — {metric(row)}");
        rank++;
    }
    Console.WriteLine();
}

record BreedRow(string Name, int MaxLife, int MaxFemaleWeight);
```

| Line | Why |
|------|-----|
| `record` | Immutable row; minimal typing |
| `Func<...> metric` | Same printer for life vs weight |

---

## Expected output (sample)

```
Top 10 by Max Life Span
1. Caucasian Shepherd Dog — max_lifespan=20
...

Top 10 Heaviest Female Breeds
1. Saint Bernard — max_female_weight=110
...
```

---

## Full file

See [Program.cs](./Program.cs).

---

## Practice drill (20 min)

1. Type Step 2 (HTTP + fallback) first — run with Wi‑Fi off to test fallback
2. Type `ParseBreeds` + `ParseMax`
3. Type ranking + print
4. Say aloud: *"Descending by max, ThenBy name for ties"*

Next: [../04-dog-breeds-jsondocument/GUIDE.md](../04-dog-breeds-jsondocument/GUIDE.md)
