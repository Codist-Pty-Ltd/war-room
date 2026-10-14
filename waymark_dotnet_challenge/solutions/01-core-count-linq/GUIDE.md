# Core Count — Approach A (LINQ)

**Task:** Count locations per `place_code`, output `KZN263, 7`, sort by code **ascending**.

Alternative: [Approach B (Dictionary + stream)](../02-core-count-dictionary/GUIDE.md) — same output, better when narrating bad-data handling.

---

## When to use

| Situation | Guidance |
|-----------|----------|
| **30 min interview** | **Best default** — type fast, fewer moving parts |
| **Tech lead** | Fine for 59 rows; mention skipped-row handling aloud; extract `ParseLocation()` if they ask about tests |

---

## Opening pitch (say before you type)

> “I’ll stream lines with `ReadLines`, split on **semicolon**, filter invalid rows, group by `place_code`, sort ascending, and print `code, count`. LINQ keeps the pipeline short — each stage is one interview talking point.”

---

## Full reference (`Program.cs`) — production

**Use `CultureInfo.InvariantCulture` for lat/lon** — see [Troubleshooting](#troubleshooting-exit-0-but-no-output) below.

```csharp
using System.Globalization;

const string path = @"C:\path\to\postal_codes_eng_lat_lon.csv";
const int PlaceCode = 3, Lat = 18, Lon = 19, MinCols = 20;

static bool TryCoord(string? s, out double value) =>
    double.TryParse(s, NumberStyles.Float, CultureInfo.InvariantCulture, out value);

if (!File.Exists(path))
{
    Console.WriteLine($"File not found: {Path.GetFullPath(path)}");
    return;
}

Console.WriteLine("=== Waymark Core Count (LINQ) ===");

var rows = File.ReadLines(path)
    .Where(l => !string.IsNullOrWhiteSpace(l))
    .Select(l => l.Split(';'))
    .Where(c => c.Length >= MinCols && !c[0].Equals("id", StringComparison.OrdinalIgnoreCase))
    .Select(c => new
    {
        Code = c[PlaceCode].Trim(),
        Ok = TryCoord(c[Lat], out _) && TryCoord(c[Lon], out _),
    })
    .Where(x => !string.IsNullOrWhiteSpace(x.Code) && x.Ok)
    .GroupBy(x => x.Code, StringComparer.OrdinalIgnoreCase)
    .OrderBy(g => g.Key, StringComparer.OrdinalIgnoreCase);

var results = rows.ToList();
Console.WriteLine($"Distinct postal codes: {results.Count}");

foreach (var g in results)
    Console.WriteLine($"{g.Key}, {g.Count()}");

Console.WriteLine($"Total valid locations: {results.Sum(g => g.Count())}");
```

---

## Troubleshooting: exit 0 but no output

Your program **found the file** (no “File not found”) but printed **nothing** before exit. That means the `foreach` ran over **zero groups** — every row was filtered out.

### Most likely cause: `TryParse` + Windows locale

Coordinates in the file use a **dot** decimal: `-27.8471729`.

```csharp
double.TryParse(c[Lat], out _)  // uses CurrentCulture — can fail on many locales
```

On locales where `,` is the decimal separator (e.g. `fr-FR`, `de-DE`), **every lat/lon fails** → `Ok` is always `false` → **zero output**, exit code still 0.

**Fix:**

```csharp
double.TryParse(s, NumberStyles.Float, CultureInfo.InvariantCulture, out _)
```

Or use the `TryCoord` helper in the production sample above.

### Other checks

| Symptom | Cause | Fix |
|---------|--------|-----|
| All rows dropped at split | Used `Split(',')` on semicolon file | `Split(';')` |
| All rows “too short” | Wrong file / one column per line | Open CSV in Notepad; count `;` on row 2 (expect 20) |
| Stale build | Old `.exe` without `foreach` | **Build → Rebuild Solution** |
| Wrong file path | Empty or different CSV at path | Log `File.ReadAllLines(path).Length` (expect **60**) |
| Output before window closes | VS auto-closes console | Add `Console.ReadLine();` at end while debugging |

### Quick sanity print (paste at top after `File.Exists`)

```csharp
Console.WriteLine($"Culture: {CultureInfo.CurrentCulture.Name}");
Console.WriteLine($"Lines in file: {File.ReadAllLines(path).Length}");
Console.WriteLine($"First data row cols: {File.ReadLines(path).Skip(1).First().Split(';').Length}");
```

Expected: `Lines in file: 60`, `First data row cols: 21`.

---

## Debug build — checkpoints + breakpoints

Use this **while learning**. Materialize each stage with `.ToList()` and print counts. Set breakpoints on lines marked **🔴 BP**.

```csharp
using System.Globalization;

const string filePath = @"C:\all_things_coding\waymark_dotnet_challenge\postal_codes_eng_lat_lon.csv";
const int PlaceCode = 3, Lat = 18, Lon = 19, MinCols = 20;

static bool TryCoord(string? s, out double value) =>
    double.TryParse(s, NumberStyles.Float, CultureInfo.InvariantCulture, out value);

// ── Step 0: startup ─────────────────────────────────────────────
Console.WriteLine("STEP 0: program started");
Console.WriteLine($"  Culture = {CultureInfo.CurrentCulture.Name} (lat/lon must use InvariantCulture to parse)");

if (!File.Exists(filePath))
{
    Console.WriteLine($"STEP 0 FAIL: file not found → {Path.GetFullPath(filePath)}");
    return;
}
Console.WriteLine($"STEP 0 OK: file exists → {filePath}");  // 🔴 BP0

// ── Step 1: read raw lines ──────────────────────────────────────
var lines = File.ReadLines(filePath)
    .Where(l => !string.IsNullOrWhiteSpace(l))
    .ToList();
Console.WriteLine($"STEP 1: non-blank lines = {lines.Count}");  // expect 60 — 🔴 BP1

// ── Step 2: split ───────────────────────────────────────────────
var split = lines.Select(l => l.Split(';')).ToList();
Console.WriteLine($"STEP 2: split rows = {split.Count}");
Console.WriteLine($"STEP 2: first row col count = {split[0].Length}");  // header: 21 — 🔴 BP2
if (split.Count > 1)
    Console.WriteLine($"STEP 2: row2 col count = {split[1].Length}, place_code = '{split[1][PlaceCode]}'");

// ── Step 3: structural filter ───────────────────────────────────
var structural = split
    .Where(c => c.Length >= MinCols && !c[0].Equals("id", StringComparison.OrdinalIgnoreCase))
    .ToList();
Console.WriteLine($"STEP 3: after length/header filter = {structural.Count}");  // expect 59 — 🔴 BP3
if (structural.Count == 0)
    Console.WriteLine("STEP 3 FAIL: every row dropped — check Split(';') and MinCols");

// ── Step 4: project + coordinate parse ──────────────────────────
var projected = structural.Select(c => new
{
    Code = c[PlaceCode].Trim(),
    LatText = c[Lat],
    LonText = c[Lon],
    LatOk = TryCoord(c[Lat], out _),
    LonOk = TryCoord(c[Lon], out _),
}).ToList();

var parseOk = projected.Count(x => x.LatOk && x.LonOk);
var parseFail = projected.Count(x => !x.LatOk || !x.LonOk);
Console.WriteLine($"STEP 4: coord parse OK = {parseOk}, FAIL = {parseFail}");  // OK 58, FAIL 1 — 🔴 BP4
if (parseOk == 0)
{
    var sample = projected.First();
    Console.WriteLine($"STEP 4 FAIL: TryParse never succeeded. Sample lat='{sample.LatText}' lon='{sample.LonText}'");
    Console.WriteLine("  → Add CultureInfo.InvariantCulture (see Troubleshooting)");
}

// ── Step 5: semantic filter ─────────────────────────────────────
var valid = projected
    .Where(x => !string.IsNullOrWhiteSpace(x.Code) && x.LatOk && x.LonOk)
    .ToList();
Console.WriteLine($"STEP 5: valid rows = {valid.Count}");  // expect 58 — 🔴 BP5

// ── Step 6: group + sort ────────────────────────────────────────
var groups = valid
    .GroupBy(x => x.Code, StringComparer.OrdinalIgnoreCase)
    .OrderBy(g => g.Key, StringComparer.OrdinalIgnoreCase)
    .ToList();
Console.WriteLine($"STEP 6: distinct codes = {groups.Count}");  // expect 30 — 🔴 BP6

// ── Step 7: final output ────────────────────────────────────────
Console.WriteLine("STEP 7: results");
foreach (var g in groups)
    Console.WriteLine($"  {g.Key}, {g.Count()}");

Console.WriteLine($"STEP 7 DONE: total locations = {groups.Sum(g => g.Count())}");  // expect 58
Console.WriteLine("Press Enter to exit...");
Console.ReadLine();
```

### Breakpoint map (Visual Studio)

| Breakpoint | After line | Inspect in Locals / Immediate |
|------------|------------|-------------------------------|
| **BP0** | file exists log | `filePath`, `File.ReadAllLines(filePath).Length` → **60** |
| **BP1** | `lines` materialized | `lines.Count` → **60** |
| **BP2** | `split` materialized | `split[1].Length` → **21**, `split[1][3]` → **KZN263** |
| **BP3** | structural filter | `structural.Count` → **59** (if **0** → delimiter wrong) |
| **BP4** | projected list | `parseOk` → **58** (if **0** → InvariantCulture) |
| **BP5** | valid rows | `valid.Count` → **58** |
| **BP6** | groups | `groups.Count` → **30**, `groups.First(g=>g.Key==\"KZN263\").Count()` → **7** |
| **BP7** | inside foreach | `g.Key`, `g.Count()` |

### Expected console output (debug build)

```
STEP 0: program started
  Culture = en-ZA
STEP 0 OK: file exists → ...
STEP 1: non-blank lines = 60
STEP 2: split rows = 60
STEP 2: first row col count = 21
STEP 2: row2 col count = 21, place_code = 'KZN263'
STEP 3: after length/header filter = 59
STEP 4: coord parse OK = 58, FAIL = 1
STEP 5: valid rows = 58
STEP 6: distinct codes = 30
STEP 7: results
  DC12, 2
  ...
  KZN263, 7
  ...
STEP 7 DONE: total locations = 58
```

When all steps pass, remove debug prints and keep `TryCoord` + final loop (production sample at top).

---

## Part 0 — Path guard

| Line | Thought process |
|------|-----------------|
| `const string path = "postal_codes_eng_lat_lon.csv";` | Single filename constant; copy CSV to output folder or adjust path once. |
| `if (!File.Exists(path))` | Fail fast with a clear message before building the pipeline. |
| `Path.GetFullPath(path)` | Shows exactly where you looked — debug aid for wrong working directory. |
| `return` | Exit without printing empty or wrong results. |

---

## Step 1 — Column constants

```csharp
const int PlaceCode = 3, Lat = 18, Lon = 19, MinCols = 20;
```

| Piece | Thought process |
|-------|-----------------|
| `PlaceCode = 3` | Grouping key — `place_code` column (0-based). |
| `Lat = 18`, `Lon = 19` | Validate coordinates; excludes corrupt row **100055**. |
| `MinCols = 20` | Must reach index 19; rows shorter than 20 columns are dropped in the next `Where`. |
| Note vs Approach B | This minimal LINQ version omits `eng` and `box_code` for speed. Mention aloud that you’d add them if the panel enforces the full five-field spec — B parses them explicitly. |

---

## Step 2 — LINQ pipeline (stage by stage)

Think of the chain as **layers**: load → shape → validate → group → sort.

### Stage 1 — Load lines

```csharp
File.ReadLines(path)
    .Where(l => !string.IsNullOrWhiteSpace(l))
```

| Piece | Thought process |
|-------|-----------------|
| `ReadLines` | Deferred enumeration — file read as the pipeline executes, not necessarily all at once upfront. |
| `Where` non-blank | Drops empty lines before split — same guard as B’s first `continue`. |

### Stage 2 — Split rows

```csharp
    .Select(l => l.Split(';'))
```

| Piece | Thought process |
|-------|-----------------|
| `Split(';')` | **Semicolon delimiter** — the #1 trap in this interview. Comma split breaks all column indices. |
| `Select` | Transform each line string → `string[]` columns. |

### Stage 3 — Structural filter

```csharp
    .Where(c => c.Length >= MinCols && !c[0].Equals("id", StringComparison.OrdinalIgnoreCase))
```

| Piece | Thought process |
|-------|-----------------|
| `c.Length >= MinCols` | Same as B’s truncated-row guard — need index 19 for longitude. |
| `!c[0].Equals("id", ...)` | Skip header row — first cell is `"id"`. |
| Combined in one `Where` | Fewer lines than B; harder to attach a `skipped` counter without a side effect. |

### Stage 4 — Project to { Code, Ok }

```csharp
    .Select(c => new
    {
        Code = c[PlaceCode].Trim(),
        Ok = TryCoord(c[Lat], out _) && TryCoord(c[Lon], out _),
    })
```

Use `TryCoord` with **`CultureInfo.InvariantCulture`** — bare `TryParse` can fail on your Windows locale and drop **all** rows (see Troubleshooting).

| Piece | Thought process |
|-------|-----------------|
| Anonymous type | Lightweight DTO for the next filters — no class boilerplate in a 30 min task. |
| `Code = c[PlaceCode].Trim()` | Extract postal code from index 3. |
| `Ok = TryParse lat && TryParse lon` | Both coordinates must parse with **InvariantCulture**; `&&` short-circuits if lat fails. |
| `out _` | Discard parsed values — counting only needs validity. |

### Stage 5 — Semantic filter

```csharp
    .Where(x => !string.IsNullOrWhiteSpace(x.Code) && x.Ok)
```

| Piece | Thought process |
|-------|-----------------|
| Non-empty `Code` | Drops row **100055** (empty `place_code`). |
| `x.Ok` | Drops rows with invalid lat/lon. |
| Equivalent to B’s | Empty-code `continue` + two `TryParse` continues. |

### Stage 6 — Group

```csharp
    .GroupBy(x => x.Code, StringComparer.OrdinalIgnoreCase)
```

| Piece | Thought process |
|-------|-----------------|
| `GroupBy` | Replaces B’s `Dictionary` increment — one group per distinct postal code. |
| `StringComparer.OrdinalIgnoreCase` | Same case-insensitive key behaviour as the dictionary. |
| Each group | All valid rows sharing one `place_code` — `Count()` = location count. |

### Stage 7 — Sort

```csharp
    .OrderBy(g => g.Key, StringComparer.OrdinalIgnoreCase);
```

| Piece | Thought process |
|-------|-----------------|
| `OrderBy(g => g.Key, ...)` | Sort by **postal code ascending** — spec/bonus requirement. |
| **Not** `OrderByDescending(g => g.Count())` | Sorting by count is a different challenge (Top 5). |
| Semicolon ends statement | Pipeline is assigned to `rows`; execution is deferred until `foreach`. |

---

## Step 3 — Print

```csharp
foreach (var g in rows)
    Console.WriteLine($"{g.Key}, {g.Count()}");
```

| Piece | Thought process |
|-------|-----------------|
| `foreach` | **Forces execution** of the lazy LINQ chain — file is read here. |
| `g.Key` | Postal code for this group. |
| `g.Count()` | Number of valid locations in the group — e.g. **7** for `KZN263`. |
| Format | `KZN263, 7` — matches expected output. |

---

## Mental pipeline diagram

```
ReadLines
  → drop blank lines
  → Split(';')
  → drop short rows + header
  → project { Code, Ok } with TryParse lat/lon
  → drop empty Code or !Ok
  → GroupBy Code
  → OrderBy Code asc
  → foreach print Key, Count
```

---

## Verify after run

| Check | Expected |
|-------|----------|
| `KZN263, 7` | Seven locations |
| `LIM334, 7` | Seven locations |
| Sum of all counts | **58** (one bad row **100055** excluded) |
| `Skipped` line | Not printed in this version — mention verbally or switch to Approach B for metrics |

---

## Approach A vs B

| | **A — LINQ (this guide)** | **B — Dictionary** |
|---|---------------------------|---------------------|
| **30 min** | **Fastest to ship** | ~5 min more typing |
| **Lines of code** | Fewer | More, but clearer guards |
| **Skip metrics** | Awkward without side effects | Natural `skipped++` |
| **Full spec fields** | Omits `eng` / `box_code` in minimal version | Parses all five fields |
| **Tech lead** | “I’d extract `ParseLocation(string[] cols)`” | Guards visible in one loop |

---

## Tech lead talking points

- Call out **semicolon** delimiter explicitly before typing `Split`.
- Use **`InvariantCulture`** for geographic decimals — data file uses `.` not `,`.
- Row **100055** excluded by empty `place_code` and/or failed coordinate parse.
- Deferred execution: nothing hits the disk until `.ToList()` or `foreach` — use debug checkpoints while learning.
- If file or team grows: replace anonymous projection with `record LocationRow` + unit tests on `ParseLocation`.
- If panel asks about skip audit: “I’d switch to Approach B or add a `ParseResult` enum — counting skips in LINQ `Where` is a code smell.”

---

Next: [../02-core-count-dictionary/GUIDE.md](../02-core-count-dictionary/GUIDE.md)
