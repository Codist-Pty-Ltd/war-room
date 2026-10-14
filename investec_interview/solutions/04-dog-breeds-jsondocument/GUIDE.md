# Exercise 2 — Dog Breeds (Approach B: Manual JsonDocument + List.Sort)

**Same task as Approach A** — two top-10 lists — with **explicit loops** and **`List.Sort`** instead of LINQ for ranking.

---

## Why this approach?

| Principle | How it shows here |
|-----------|-------------------|
| **No LINQ magic on data** | Parse loop is plain C# — easy to debug in interview |
| **Explicit tie-break** | Comparator shows you understand sort semantics |
| **Same resilience** | Shared API/fallback pattern |
| **Interview narrative** | "I'll parse JSON manually, sort with a comparator, take first 10" |

**Pick this when:** Interviewer asks "walk me through without LINQ" or you want to show comparator logic.

---

## Visual Studio — Step 0

Same as Approach A: Console App, `breed-data-02.json` copied to output.

---

## Step 1 — Load helper (async extracted)

```csharp
string json = await LoadJsonAsync(ApiUrl, FallbackFile);
```

```csharp
static async Task<string> LoadJsonAsync(string apiUrl, string fallbackFile)
{
    try
    {
        using var client = new HttpClient { Timeout = TimeSpan.FromSeconds(15) };
        return await client.GetStringAsync(apiUrl);
    }
    catch (Exception ex)
    {
        Console.WriteLine($"API failed: {ex.Message}. Using {fallbackFile}.");
        if (!File.Exists(fallbackFile))
        {
            Console.Error.WriteLine("Fallback file missing.");
            Environment.Exit(1);
        }
        return await File.ReadAllTextAsync(fallbackFile);
    }
}
```

**Why extract?** `Main` flow stays readable; error handling in one place (**Single Responsibility**).

---

## Step 2 — Manual parse with for-loop

```csharp
var breeds = ParseBreedsManual(json);
```

```csharp
static List<BreedRow> ParseBreedsManual(string json)
{
    var breeds = new List<BreedRow>();
    using var doc = JsonDocument.Parse(json);

    JsonElement data = doc.RootElement.GetProperty("data");
    for (int i = 0; i < data.GetArrayLength(); i++)
    {
        JsonElement attributes = data[i].GetProperty("attributes");
        string name = attributes.GetProperty("name").GetString() ?? "";
        int maxLife = ExtractMax(attributes.GetProperty("life"));
        int maxFemaleWeight = ExtractMax(attributes.GetProperty("female_weight"));

        if (name.Length == 0) continue;
        breeds.Add(new BreedRow(name, maxLife, maxFemaleWeight));
    }

    return breeds;
}
```

| Line | Why |
|------|-----|
| `for` + `GetArrayLength()` | Index loop — some interviewers prefer over `foreach` on JSON |
| `ExtractMax` | Same object/string logic as Approach A |

---

## Step 3 — GetTop10 with explicit comparator

```csharp
var topLife = GetTop10(breeds, b => b.MaxLife, b => b.Name);
var topWeight = GetTop10(breeds, b => b.MaxFemaleWeight, b => b.Name);
```

```csharp
static List<BreedRow> GetTop10(
    List<BreedRow> breeds,
    Func<BreedRow, int> keySelector,
    Func<BreedRow, string> tieBreak)
{
    breeds.Sort((a, b) =>
    {
        int cmp = keySelector(b).CompareTo(keySelector(a)); // descending
        if (cmp != 0) return cmp;
        return string.Compare(tieBreak(a), tieBreak(b), StringComparison.Ordinal);
    });

    int take = Math.Min(10, breeds.Count);
    return breeds.GetRange(0, take);
}
```

| Line | Why |
|------|-----|
| `keySelector(b).CompareTo(keySelector(a))` | **Descending** int sort (b before a) |
| `string.Compare` | Tie-break name **ascending** |
| `GetRange(0, take)` | Top 10 without LINQ `Take` |
| **Caution** | `Sort` mutates the list — for second ranking, pass a **copy**: see below |

### Important fix for two rankings

`Sort` modifies `breeds` in place. For two lists:

```csharp
var topLife = GetTop10(breeds.ToList(), b => b.MaxLife, b => b.Name);
var topWeight = GetTop10(breeds.ToList(), b => b.MaxFemaleWeight, b => b.Name);
```

Or clone inside `GetTop10`:

```csharp
var copy = new List<BreedRow>(breeds);
copy.Sort(...);
```

**Why:** After sorting for life, the list order is wrong for weight.

---

## Step 4 — Print

```csharp
PrintRanked("Top 10 by Max Life Span", topLife, b => $"max_lifespan={b.MaxLife}");
PrintRanked("Top 10 Heaviest Female Breeds", topWeight, b => $"max_female_weight={b.MaxFemaleWeight}");
```

---

## Full file

See [Program.cs](./Program.cs) — update with `.ToList()` copy if you use one list twice.

---

## Approach A vs B

| | A (LINQ) | B (this) |
|--|----------|----------|
| Sort | `OrderByDescending().ThenBy()` | `List.Sort` comparator |
| Parse | `foreach` on JSON array | `for` index loop |
| Readability | Shorter | More verbose, more control |
| Copy list for 2 sorts | Not needed | **Required** |

---

## Practice drill (20 min)

1. Type `LoadJsonAsync` + `ParseBreedsManual`
2. Type comparator — test tie: two breeds same max life, names `Aardvark` vs `Zulu`
3. Run — compare top line with Approach A

Previous: [../03-dog-breeds-linq/GUIDE.md](../03-dog-breeds-linq/GUIDE.md)
