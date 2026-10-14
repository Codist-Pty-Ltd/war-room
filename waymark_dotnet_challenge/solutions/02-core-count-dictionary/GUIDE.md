# Core Count — Approach B (Dictionary + stream)

**Task:** Count locations per `place_code`, output `KZN263, 7`, sort by code **ascending**.

**Same output as [Approach A (LINQ)](../01-core-count-linq/GUIDE.md)** — choose B when the panel cares about **how you handle bad data**.

---

## When to use

| Situation | Guidance |
|-----------|----------|
| **30 min interview** | ~5 min more typing than LINQ; safer if long chains make you nervous under pressure |
| **Tech lead** | **Preferred** — visible guards, skip metrics, easy to extend into a data-quality audit |

---

## Opening pitch (say before you type)

> “I’ll stream the file one line at a time, split on **semicolon**, validate each row, skip bad data without crashing, count valid rows per `place_code` in a dictionary, then print sorted ascending. I’m using a dictionary so each guard is visible and I can report how many rows I skipped.”

---

## Full reference (`Program.cs`)

Uses `TryCoord` + `InvariantCulture` — same fix as [Approach A troubleshooting](../01-core-count-linq/GUIDE.md#troubleshooting-exit-0-but-no-output).

```csharp
using System.Globalization;

const string path = "postal_codes_eng_lat_lon.csv";
const int PlaceCode = 3, Eng = 5, Box = 17, Lat = 18, Lon = 19, MinCols = 20;

static bool TryCoord(string? s, out double value) =>
    double.TryParse(s, NumberStyles.Float, CultureInfo.InvariantCulture, out value);

if (!File.Exists(path)) { Console.WriteLine($"Not found: {Path.GetFullPath(path)}"); return; }

Console.WriteLine("=== Waymark Core Count (Dictionary) ===");

var counts = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);
var skipped = 0;

foreach (var line in File.ReadLines(path))
{
    if (string.IsNullOrWhiteSpace(line)) continue;
    var cols = line.Split(';');
    if (cols.Length < MinCols) { skipped++; continue; }
    if (cols[0].Equals("id", StringComparison.OrdinalIgnoreCase)) continue;

    var code = cols[PlaceCode].Trim();
    if (string.IsNullOrWhiteSpace(code)) { skipped++; continue; }

    _ = cols[Eng].Trim();
    _ = cols[Box].Trim();

    if (!TryCoord(cols[Lat], out _)) { skipped++; continue; }
    if (!TryCoord(cols[Lon], out _)) { skipped++; continue; }

    counts[code] = counts.GetValueOrDefault(code) + 1;
}

foreach (var code in counts.Keys.OrderBy(k => k, StringComparer.OrdinalIgnoreCase))
    Console.WriteLine($"{code}, {counts[code]}");

Console.WriteLine($"\nSkipped: {skipped}");
Console.WriteLine($"Total valid locations: {counts.Values.Sum()}");
```

Debug checkpoints for the loop: add `Console.WriteLine` after each `continue` block with a counter, or use the step-by-step debug build in the [LINQ guide](../01-core-count-linq/GUIDE.md#debug-build--checkpoints--breakpoints) (same filters, dictionary output).

---

## Part 0 — Path guard

| Line | Thought process |
|------|-----------------|
| `const string path = "postal_codes_eng_lat_lon.csv";` | Single place to change the filename. `const` prevents accidental reassignment. Relative path works when the CSV is copied to the output folder next to the `.exe`. |
| `if (!File.Exists(path))` | Fail fast before opening the file — clearer than an exception mid-loop. |
| `Path.GetFullPath(path)` | Shows the **absolute** path you tried — fixes “wrong working directory” confusion in the interview. |
| `return` | Top-level program exits cleanly; no partial or misleading output after a missing file. |

---

## Step 1 — Constants + counters

```csharp
const int PlaceCode = 3, Eng = 5, Box = 17, Lat = 18, Lon = 19, MinCols = 20;
var counts = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);
var skipped = 0;
```

| Piece | Thought process |
|-------|-----------------|
| `PlaceCode = 3` | Spec: `place_code` is column index **3** (0-based). Values like `KZN263`, `DC44` — this is the **grouping key**. |
| `Eng = 5` | Spec requires parsing `eng`. Not printed in core output, but you touch it to show you read the full brief. |
| `Box = 17` | Spec requires `box_code`. Parsed for completeness; ready for follow-up questions or bonus tasks. |
| `Lat = 18`, `Lon = 19` | Validate coordinates so corrupted rows (e.g. **100055**) do not silently pollute counts. |
| `MinCols = 20` | Need indices **0–19** to read `longitude` at 19. Spec has 21 columns (0–20); `last_modified` at 20 is optional for counting. `cols.Length < 20` → truncated/corrupt row. |
| Named constants | Tech-lead signal: if column order changes, update one line — not magic numbers scattered through the file. |
| `Dictionary<string, int>` | Key = postal code, value = location count. O(1) average update per valid row. |
| `StringComparer.OrdinalIgnoreCase` | `kzn263` and `KZN263` merge — defensive even though data is mostly uppercase. |
| `skipped = 0` | Tracks rejected rows. Not required in core output format, but strong senior signal. Bridges to the **Data Quality** Console Lab challenge. |

---

## Step 2 — Stream loop (line by line)

### Loop header

| Line | Thought process |
|------|-----------------|
| `foreach (var line in File.ReadLines(path))` | **Lazy stream** — one line in memory at a time. For 59 rows either works; for large files this is the production story. |

### Guard: blank line

| Line | Thought process |
|------|-----------------|
| `if (string.IsNullOrWhiteSpace(line)) continue;` | Skip empty/whitespace lines. **Guard clause** — reject early, avoid nested `if` pyramids. |
| No `skipped++` | Blank lines are not corrupted records — do not inflate skip metrics. |

### Split

| Line | Thought process |
|------|-----------------|
| `var cols = line.Split(';');` | **Critical trap:** delimiter is **`;`**, not `,`. Wrong delimiter → one giant column → every index wrong. |

### Guard: truncated row

| Line | Thought process |
|------|-----------------|
| `if (cols.Length < MinCols) { skipped++; continue; }` | Must reach index 19 before reading lon. Prevents `IndexOutOfRangeException`. Truncated row = bad data → count and skip. |

### Guard: header row

| Line | Thought process |
|------|-----------------|
| `if (cols[0].Equals("id", ...)) continue;` | First data column on header row is literally `"id"`. Skip without counting as data. |
| No `skipped++` | Header is expected, not corruption. |

### Extract place_code

| Line | Thought process |
|------|-----------------|
| `var code = cols[PlaceCode].Trim();` | Index **3** → postal code string. `.Trim()` removes stray spaces. |
| `if (string.IsNullOrWhiteSpace(code)) { skipped++; continue; }` | Spec warns of missing codes. Row **100055** has empty `place_code` — cannot group → skip and audit. |

### Parse spec fields (not all used in output)

| Line | Thought process |
|------|-----------------|
| `_ = cols[Eng].Trim();` | Read `eng` (index 5) — matches full spec’s five required fields. |
| `_ = cols[Box].Trim();` | Read `box_code` (index 17). |
| `_ = ...` | “I read this column on purpose; value not needed for counting yet.” Upgrade path: `var eng = ...` or a `Location` record. |

### Guard: coordinates

| Line | Thought process |
|------|-----------------|
| `if (!double.TryParse(cols[Lat], out _)) { skipped++; continue; }` | Validates latitude at index **18**. `TryParse` never throws — production-style. Row 100055 has empty lat. |
| `if (!double.TryParse(cols[Lon], out _)) { skipped++; continue; }` | Same for longitude at **19**. Both must pass for a geo dataset row to count. |
| `out _` | Only success/failure matters for counting; use `out var lat` when a later challenge needs the value. |

### Increment count

| Line | Thought process |
|------|-----------------|
| `counts[code] = counts.GetValueOrDefault(code) + 1;` | All guards passed → increment this code’s tally. `GetValueOrDefault` returns 0 for new keys — no `ContainsKey` boilerplate. Seventh valid `KZN263` row → stored value **7**. |

---

## Step 3 — Print sorted

| Line | Thought process |
|------|-----------------|
| `counts.Keys.OrderBy(k => k, StringComparer.OrdinalIgnoreCase)` | Sort by **postal code ascending** (`DC12` before `KZN263`) — **not** by count descending (common mistake). |
| LINQ here only | ~30 distinct codes — sorting keys once is cheap. OK to use LINQ for presentation even in the “dictionary approach”. |
| `Console.WriteLine($"{code}, {counts[code]}");` | Required format: `KZN263, 7` — code, comma, space, count. |
| `Console.WriteLine($"\nSkipped: {skipped}");` | Expect **1** for this file. Proves guards fired. Optional under strict time — but keep the logic and mention skip count aloud. |

---

## Mental flowchart

```
For each line
  → blank? skip (no skipped++)
  → split on ;
  → too few columns? skipped++, skip
  → header "id"? skip (no skipped++)
  → empty place_code? skipped++, skip
  → read eng, box_code
  → bad lat? skipped++, skip
  → bad lon? skipped++, skip
  → counts[code]++
Print codes A→Z
Print Skipped: N
```

---

## Verify after run

| Check | Expected |
|-------|----------|
| `KZN263, 7` | Seven locations |
| `LIM334, 7` | Seven locations |
| `Skipped: 1` | Row **100055** |
| Sum of all counts | **58** (59 data lines − 1 bad; header not counted) |

---

## Approach A vs B

| | **A — LINQ** | **B — Dictionary (this guide)** |
|---|--------------|----------------------------------|
| **30 min** | Less typing, one pipeline | ~5 min more; safer under stress |
| **Tech lead** | Extract `ParseLocation` if it grows | **Preferred** — guards + metrics visible |
| **Bad data** | Hidden in `.Where(...)` | Each `continue` is a story |
| **Skip count** | Side effect in `Where` is awkward | `skipped++` is natural |

---

## Tech lead talking points

- Parsed `eng` and `box_code` even though core output only prints counts — matches full spec.
- `skipped` counter leads naturally into the **Data Quality** Console Lab challenge.
- `ReadLines` scales; for 59 rows `ReadAllLines` would also be fine — mention tradeoff if asked.
- If they push on `_ = cols[Eng]`: *“Brief asked for five fields; counting only needs `place_code`, but I read the rest so I can extend to detail/JSON without rewriting the loop.”*

---

Previous: [../01-core-count-linq/GUIDE.md](../01-core-count-linq/GUIDE.md)
