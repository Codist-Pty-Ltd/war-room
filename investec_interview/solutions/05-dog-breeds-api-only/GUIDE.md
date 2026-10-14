# Dog Breeds — Simplest version (first-time friendly)

**One file. Top to bottom. Four blocks.** No `record`, no helper methods.

Open [Program.cs](./Program.cs) — **~50 lines**, reads like a story.

---

## The whole thing in 4 sentences (memorise this)

1. **GET** the API → `json` string  
2. **Parse** `data[]` → list of `(name, maxLife, maxWeight)`  
3. **Sort** by max life desc, name asc → print 10  
4. **Sort** by max weight desc, name asc → print 10  

---

## Block 1 — Get JSON (lines 6–17)

```csharp
string json;
try
{
    using var client = new HttpClient();
    json = await client.GetStringAsync("https://dogapi.dog/api/v2/breeds");
}
catch (Exception ex)
{
    Console.WriteLine("API error: " + ex.Message);
    return;
}
```

**Why:** Spec wants HTTP + graceful failure. `return` stops the program if API fails.

---

## Block 2 — Parse (lines 19–31)

```csharp
using var doc = JsonDocument.Parse(json);
var breeds = new List<(string Name, int MaxLife, int MaxWeight)>();

foreach (var item in doc.RootElement.GetProperty("data").EnumerateArray())
{
    var a = item.GetProperty("attributes");
    breeds.Add((
        a.GetProperty("name").GetString() ?? "",
        a.GetProperty("life").GetProperty("max").GetInt32(),
        a.GetProperty("female_weight").GetProperty("max").GetInt32()
    ));
}
```

**Why each line:**

| Piece | Meaning |
|-------|---------|
| `data` | Array of breeds in JSON:API |
| `attributes` | Where `name`, `life`, `female_weight` live |
| `life.max` | Ranking uses **max** only |
| `(string, int, int)` | Tuple — no need for a class or record |

---

## Block 3 — Life ranking (lines 33–41)

```csharp
Console.WriteLine("Top 10 by Max Life Span");
int rank = 1;
foreach (var b in breeds.OrderByDescending(x => x.MaxLife).ThenBy(x => x.Name).Take(10))
{
    Console.WriteLine($"{rank}. {b.Name} — max_lifespan={b.MaxLife}");
    rank++;
}
```

**Why:** `OrderByDescending` = highest first. `ThenBy` = tie-break name ascending. `Take(10)` = top 10.

---

## Block 4 — Weight ranking (lines 43–51)

Same pattern, swap `MaxLife` → `MaxWeight` and title/metric text.

---

## What we removed (and why it's OK)

| Removed | Why simpler is fine |
|---------|-------------------|
| `ParseBreeds()` method | One file, read top-down — easier first time |
| `PrintTop10()` helper | Copy-paste loop twice — less abstraction to remember |
| `record BreedRow` | Tuple `(Name, MaxLife, MaxWeight)` is enough |
| `Timeout = 15s` | Optional; add if they mention timeouts |
| Fallback JSON file | Add later if they ask "what if API is down?" |

---

## Type order in Visual Studio (practice)

| Step | Type this | Run? |
|------|-----------|------|
| 1 | Block 1 only + `Console.WriteLine(json.Length);` | ✓ proves API works |
| 2 | Add Block 2 + `Console.WriteLine(breeds.Count);` | ✓ proves parse works |
| 3 | Add Block 3 | ✓ first list |
| 4 | Add Block 4 | ✓ done |

**Incremental runs = calm.** You never debug 50 lines at once.

---

## If they ask for more

**Fallback file** — inside `catch`, before `return`:

```csharp
json = await File.ReadAllTextAsync("breed-data-02.json");
```

**Timeout** — change client line to:

```csharp
using var client = new HttpClient { Timeout = TimeSpan.FromSeconds(15) };
```

---

## S.R.T.C. skeleton (sticky note)

```
GET → parse data[].attributes → list of tuples
foreach sort life → print 10
foreach sort weight → print 10
```
