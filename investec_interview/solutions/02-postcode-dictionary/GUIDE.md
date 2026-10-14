# Exercise 1 — Postcode Prefixes (Approach B: Dictionary + Loop)

**Same task as Approach A** — top 10 prefixes by average price — implemented **imperatively**.

---

## Why this approach?

| Principle | How it shows here |
|-----------|-------------------|
| **Explicit algorithm** | Interviewer sees exactly how aggregation works |
| **O(n) aggregation** | Dictionary lookup O(1) per row — fixes v1's O(n²) `Where().FirstOrDefault()` |
| **Separation of concerns** | Loop = aggregate; LINQ (optional) = sort top 10 only |
| **Stream-friendly** | Swap `ReadAllLines` → `ReadLines` for one-line-at-a-time |

**Pick this when:** They ask you to avoid LINQ, or you want to narrate each step while typing.

---

## Visual Studio — Step 0

Same as Approach A: **Console App .NET 8**, CSV in project folder.

---

## Step 1 — Path guard

```csharp
const string filePath = "pp-monthly-update-new-version.csv";

if (!File.Exists(filePath))
{
    Console.WriteLine($"File not found: {Path.GetFullPath(filePath)}");
    return;
}
```

---

## Step 2 — Dictionary for running totals

```csharp
var stats = new Dictionary<string, (decimal Total, int Count)>();
```

| Line | Why |
|------|-----|
| `Dictionary<string, ...>` | Key = prefix (`SE15`) |
| `(decimal Total, int Count)` | Average later = `Total / Count`; tuple avoids a custom class (spec: no OO required) |
| `decimal` | Money precision |

---

## Step 3 — Process each line

```csharp
foreach (var line in File.ReadLines(filePath))
{
    if (string.IsNullOrWhiteSpace(line))
        continue;

    var cols = line.Split(',');
    if (cols.Length < 4)
        continue;

    if (!decimal.TryParse(cols[1].Trim('"'), out var price))
        continue;

    var postCode = cols[3].Trim('"').Trim();
    if (string.IsNullOrWhiteSpace(postCode))
        continue;

    int space = postCode.IndexOf(' ');
    if (space <= 0)
        continue;

    string prefix = postCode[..space];

    if (stats.TryGetValue(prefix, out var existing))
        stats[prefix] = (existing.Total + price, existing.Count + 1);
    else
        stats[prefix] = (price, 1);
}
```

### Line-by-line

| Line | Why |
|------|-----|
| `ReadLines` | Streams file; lower peak memory than `ReadAllLines` |
| `continue` pattern | Guard clauses — skip bad data, don't nest deeply |
| `cols[1]` | Price = 2nd column |
| `cols[3]` | Postcode = 4th column |
| `IndexOf(' ')` | UK postcodes: `OUTWARD INWARD` |
| `space <= 0` | No space → not valid for this task |
| `postCode[..space]` | **Prefix before space** — the critical fix |
| `TryGetValue` | One hash lookup; update or insert |

---

## Step 4 — Rank and print

```csharp
Console.WriteLine("Top 10 postcode prefixes by average price:\n");

int rank = 1;
foreach (var row in stats
    .Select(kv => new { Prefix = kv.Key, Average = kv.Value.Total / kv.Value.Count })
    .OrderByDescending(x => x.Average)
    .Take(10))
{
    Console.WriteLine($"{rank,2}. {row.Prefix,-8} {row.Average,12:0}");
    rank++;
}
```

| Line | Why |
|------|-----|
| LINQ only here | Dictionary is small (~few thousand prefixes); sorting 10 is cheap |
| `Total / Count` | Explicit average formula — easy to explain |

**Pure loop alternative (no LINQ at all):** sort a `List<(string Prefix, decimal Avg)>` with `list.Sort((a,b) => b.Avg.CompareTo(a.Avg))` — see Approach A guide.

---

## Full file

See [Program.cs](./Program.cs).

---

## Trace on paper (spec example)

| Postcode | Price | Prefix |
|----------|-------|--------|
| SE15 2TH | 100 | SE15 |
| SE15 5NY | 200 | SE15 |
| SE12 8TW | 33 | SE12 |

After loop:
- `SE15` → Total=300, Count=2 → Avg=**150**
- `SE12` → Total=33, Count=1 → Avg=**33**

Output order: SE15 first, then SE12.

---

## Practice drill (15 min)

1. Type Steps 2–3 from memory
2. Before Step 4, `Console.WriteLine(stats.Count)` to prove aggregation ran
3. Compare output with Approach A — must match

Previous: [../01-postcode-linq/GUIDE.md](../01-postcode-linq/GUIDE.md)
