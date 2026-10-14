# Exercise 1 — Postcode Prefixes (Approach A: LINQ Pipeline)

**Task:** From UK Land Registry CSV, find the **10 postcode prefixes** with the highest **average** sale price.

**Example:** `SE15` with sales 100 + 200 → average **150**.

---

## Why this approach?

| Principle | How it shows here |
|-----------|-------------------|
| **Declarative over imperative** | You describe *what* (group, average, top 10), not every loop step |
| **Single responsibility per LINQ step** | Parse → filter → project → group → rank |
| **Fail fast with guards** | `Where` clauses drop bad rows early |
| **Financial correctness** | `decimal` not `double` for money |

**Pick this in the interview when:** You want speed and readability; dataset fits in memory (~107k rows).

---

## Visual Studio — Step 0 (2 min)

1. **File → New → Project → Console App** → `.NET 8` → name `InvestecPostcodeLinq`
2. Copy CSV into project OR use path to `codings\invrstec_2.0\pp-monthly-update-new-version.csv`
3. Open `Program.cs`, delete template, follow steps below

---

## Step 1 — File path and guard

```csharp
const string filePath = "pp-monthly-update-new-version.csv";

if (!File.Exists(filePath))
{
    Console.WriteLine($"File not found: {Path.GetFullPath(filePath)}");
    return;
}
```

| Line | Why |
|------|-----|
| `const string filePath` | One place to change; relative path works if CSV is copied to output folder |
| `File.Exists` | Clear error beats `FileNotFoundException` mid-pipeline |
| `Path.GetFullPath` | Shows interviewer exactly where you looked |
| `return` | Top-level program exits cleanly |

---

## Step 2 — Header line

```csharp
Console.WriteLine("Top 10 postcode prefixes by average price:\n");
```

Confirms the app ran before any heavy work.

---

## Step 3 — The LINQ pipeline (core)

Type this as **one chain**; explain each stage aloud:

```csharp
var top10 = File.ReadAllLines(filePath)
    .Where(line => !string.IsNullOrWhiteSpace(line))
    .Select(line => line.Split(','))
    .Where(cols => cols.Length >= 4)
    .Select(cols => new
    {
        Price = decimal.TryParse(cols[1].Trim('"'), out var p) ? p : (decimal?)null,
        PostCode = cols[3].Trim('"').Trim()
    })
    .Where(x => x.Price is not null && !string.IsNullOrWhiteSpace(x.PostCode))
    .Select(x => new
    {
        Prefix = x.PostCode!.Split(' ')[0],
        Price = x.Price!.Value
    })
    .Where(x => !string.IsNullOrWhiteSpace(x.Prefix))
    .GroupBy(x => x.Prefix)
    .Select(g => new { Prefix = g.Key, Average = g.Average(x => x.Price) })
    .OrderByDescending(x => x.Average)
    .Take(10);
```

### Line-by-line

| Step | Code | Why |
|------|------|-----|
| Read | `ReadAllLines` | Spec: no CSV library; simple split is OK for fixed columns |
| Filter 1 | `!IsNullOrWhiteSpace(line)` | Skip blank lines |
| Split | `line.Split(',')` | Row → columns; col **2** = index **1**, col **4** = index **3** |
| Filter 2 | `cols.Length >= 4` | Need postcode column |
| Parse price | `TryParse(cols[1].Trim('"'), ...)` | Column 2; quotes stripped; invalid → null |
| Postcode | `cols[3].Trim('"').Trim()` | Column 4 |
| Filter 3 | price not null, postcode not empty | Spec: blank postcode is rare but real |
| **Prefix** | `Split(' ')[0]` | `SE16 7TG` → **`SE16`** — **NOT** `Substring(IndexOf(" "))` (that gives `7TG`) |
| Filter 4 | prefix not empty | Safety |
| Group | `GroupBy(x => x.Prefix)` | One bucket per outward code |
| Average | `g.Average(x => x.Price)` | Sum ÷ count per prefix |
| Rank | `OrderByDescending` + `Take(10)` | Top 10 most expensive **on average** |

---

## Step 4 — Print results

```csharp
int rank = 1;
foreach (var row in top10)
{
    Console.WriteLine($"{rank,2}. {row.Prefix,-8} {row.Average,12:0}");
    rank++;
}
```

| Line | Why |
|------|-----|
| `rank,2` | Numbered from 1 |
| `:0` | Whole pounds (matches spec example style) |

---

## Full file

See [Program.cs](./Program.cs) in this folder.

---

## Say this in the interview

> "I'll read the CSV without a library, take column 2 as price and column 4 as postcode, extract the outward code before the space, group by prefix, average, sort descending, take 10. I use decimal for money and skip malformed rows."

---

## Practice drill (15 min)

1. Blank `Program.cs` → type Steps 1–4 without looking
2. **Ctrl+F5** — must print 10 rows
3. Debugger: breakpoint on `GroupBy`, inspect one row → prefix must be like `SE16`, not `7TG`

---

## Compare to Approach B

| | Approach A (this) | Approach B (dictionary) |
|--|-------------------|-------------------------|
| Style | LINQ chain | Explicit loop + dictionary |
| Best for | Fast to write | Explaining algorithm step-by-step |
| Memory | All lines in RAM | Can use `ReadLines` in B |

Next: [../02-postcode-dictionary/GUIDE.md](../02-postcode-dictionary/GUIDE.md)
