# Investec Interview Prep — until 1:00 PM

Three tasks in this folder:

| # | Task | Source file |
|---|------|-------------|
| 1 | **Postcode prefixes** — top 10 by average price | `PostCode Question.pdf` |
| 2 | **Dog breeds** — top 10 by max life & max female weight | `coding_exercise.txt` |
| 3 | **Cinema booking** — system design (no payments) | `design_solution.jpeg` |

Each task has **two approaches** under `solutions/` with step-by-step MD guides.

---

## Cram schedule (adjust start time)

| Block | Time | Do this |
|-------|------|---------|
| A | 45 min | **Postcode Approach A** — type from memory, run |
| B | 45 min | **Postcode Approach B** — type from memory, run |
| C | 40 min | **Dog Breeds Approach A** — type from memory, run |
| D | 40 min | **Dog Breeds Approach B** — type from memory, run |
| E | 30 min | Read **Cinema Design A** aloud; sketch on paper |
| F | 30 min | Read **Cinema Design B** aloud; compare trade-offs |
| G | 20 min | Random pick: blank VS project, 25 min timed postcode OR dog |

**Minimum before 1 PM:** one postcode + one dog approach cold, both design outlines.

---

## Visual Studio setup (once)

1. **File → New → Project → Console App** → .NET 8 → name e.g. `InvestecPostcode`
2. For postcode: copy CSV path from `..\..\codings\invrstec_2.0\pp-monthly-update-new-version.csv` or copy file into project
3. For dog breeds: copy `breed-data-02.json` into project → **Copy to Output Directory: Copy if newer**
4. **Ctrl+F5** after each paste from a guide

---

## Also in War Room app

Open **CONSOLE LAB** in the header (green) — 30 console + 30 system design challenges with:
- Thought process only (no solution code shown)
- Paste your `Program.cs` or design answer → **Evaluate** rubric
- Progress saved in browser localStorage

Investec challenges are #1–3 in the console list.

### Exercise 1 — Postcode
- [01-postcode-linq/GUIDE.md](./solutions/01-postcode-linq/GUIDE.md)
- [02-postcode-dictionary/GUIDE.md](./solutions/02-postcode-dictionary/GUIDE.md)

### Exercise 2 — Dog breeds
- [05-dog-breeds-api-only/GUIDE.md](./solutions/05-dog-breeds-api-only/GUIDE.md) ← **start here (simplest)**
- [03-dog-breeds-linq/GUIDE.md](./solutions/03-dog-breeds-linq/GUIDE.md) — API + fallback + optional string ranges
- [04-dog-breeds-jsondocument/GUIDE.md](./solutions/04-dog-breeds-jsondocument/GUIDE.md) — manual sort variant

### Design — Cinema booking
- [05-cinema-design-rest/GUIDE.md](./solutions/05-cinema-design-rest/GUIDE.md)
- [06-cinema-design-event-driven/GUIDE.md](./solutions/06-cinema-design-event-driven/GUIDE.md)

---

## Critical bugs to avoid (postcode)

```csharp
// WRONG — suffix after space
postCode.Substring(postCode.IndexOf(" ")).Trim();

// RIGHT — prefix before space
postCode[..postCode.IndexOf(' ')];
```

## Critical rules (dog breeds)

- Tie-break: same max → **name ascending**
- Output labels: `max_lifespan=` and `max_female_weight=`
- No NuGet — only `HttpClient` + `System.Text.Json`
