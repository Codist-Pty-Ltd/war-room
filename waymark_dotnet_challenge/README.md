# Waymark .NET Backend Interview — Console Practice

Practice track in **War Room → Console Lab** (source: **Waymark**).  
Dataset: `postal_codes_eng_lat_lon.csv` (59 rows, **semicolon-delimited**, header row).

## Setup

1. Copy `postal_codes_eng_lat_lon.csv` into your console project output folder.
2. **File → New → Console App** → .NET 8.
3. Open Console Lab → pick a **Waymark** challenge → **Brief / Think / VS / Submit** tabs.

## Critical trap

The interview PDF may say "CSV" generically — **this file uses `;` not `,`.**

```csharp
var cols = line.Split(';');  // correct
var cols = line.Split(',');  // wrong — breaks every column
```

## Column indices (0-based)

| Index | Field |
|------:|-------|
| 3 | place_code |
| 5 | eng |
| 17 | box_code |
| 18 | latitude |
| 19 | longitude |

## Known answers (valid rows)

| place_code | count |
|------------|------:|
| KZN263 | 7 |
| LIM334 | 7 |
| LIM352 | 4 |
| MP301 | 5 |
| DC44 | 5 |

Row **100055** is corrupted (empty place_code, bad coords) — use for data-quality challenge.

**Locale trap:** parse lat/lon with `CultureInfo.InvariantCulture` — bare `TryParse` can drop all rows on some Windows locales (exit 0, no output). See solution guides.

## Practice order (Console Lab)

1. **Core — Count per postal code** (30 min interview task)
2. Data quality audit
3. Top 5 by count
4. Towns vs municipalities split
5. Region prefix (KZN, DC, LIM, …)
6. CLI filter by code
7. Box vs street mismatch
8. Municipality roll-up
9. Geo centroid (senior)
10. Duplicate eng names
11. Towns per parent municipality
12. Export JSON (bonus)

## Approach guide — 30 min vs tech lead

| Situation | Prefer |
|-----------|--------|
| **Core 30 min timed** | LINQ `GroupBy` + `OrderBy` — fewest lines, ship fast |
| **Panel wants narration** | Dictionary + `foreach` + `continue` guards — explain each skip |
| **Data quality / audit** | Inline counters (25 min) OR `ParseRow` record (tech lead, 35 min) |
| **Bonus JSON export** | Typed `record` DTOs (lead) vs anonymous object (fast bonus) |
| **Huge file (hypothetical)** | `ReadLines` stream — for 59 rows either works; mention scale tradeoffs as lead |

## Solution guides (line-by-line walkthroughs)

Full thought process for the **core interview task** — every line explained:

- [01-core-count-linq](./solutions/01-core-count-linq/GUIDE.md) — LINQ pipeline, stage by stage
- [02-core-count-dictionary](./solutions/02-core-count-dictionary/GUIDE.md) — Dictionary + stream, guard by guard

Reference implementations: `Program.cs` in each solution folder (matches the guides).

## War Room paths

- Challenges: `client/src/constants/consoleLab/waymarkConsole.ts`
- Skill lesson: Console Lab → **Learn** → **Waymark SA Postal CSV**
