import type { ConsoleChallenge } from "../../types/consoleLab";
import { has, hasAny } from "../../utils/consoleLabEvaluator";
import { withApproaches } from "./approachTemplates";
import {
  WAYMARK_COLUMN_REFERENCE,
  WAYMARK_CSV_FILENAME,
  WAYMARK_KNOWN_COUNTS,
} from "./waymarkCsvColumns";

const CSV_PATH_HINT = `Local file: waymark_dotnet_challenge/${WAYMARK_CSV_FILENAME}
Copy next to your .exe or set path in Program.cs.`;

const BASE_CONSTRAINTS = [
  "Console app, C# .NET 8",
  "No CsvHelper or external CSV libraries",
  "Delimiter is semicolon (;) — not comma",
  "Skip header row (id in column 0)",
  "LINQ allowed",
];

const semicolonSplit = {
  id: "split-semicolon",
  label: "Splits rows on semicolon",
  hint: "line.Split(';') — this dataset is NOT comma-separated.",
  test: hasAny(/\.Split\s*\(\s*['"];['"]\s*\)/, /\.Split\s*\(\s*";"\s*\)/),
  weight: 2,
};

const readCsv = {
  id: "read-file",
  label: "Reads CSV from disk",
  hint: "File.Exists + ReadLines or ReadAllLines.",
  test: hasAny(/File\.ReadAllLines/i, /File\.ReadLines/i, /StreamReader/i),
  weight: 1,
};

const guards = {
  id: "guards",
  label: "Skips bad rows (TryParse / empty checks / continue)",
  hint: "Empty place_code, short rows, invalid lat/lon.",
  test: hasAny(/TryParse/i, /continue/i, /\.Where\s*\(/, /IsNullOrWhiteSpace/i),
  weight: 1,
};

const placeCodeCol = {
  id: "place-code-col",
  label: "Uses place_code column (index 3)",
  hint: "cols[3] after split.",
  test: hasAny(/\[3\]/, /place_code/i, /PlaceCode/i),
  weight: 1,
};

const leadVsSpeed = (
  linqNote: string,
  dictNote: string,
): { linq: string; dict: string } => ({
  linq: `${linqNote} **30 min core:** fastest to ship. **Tech lead:** good when dataset stays tiny (59 rows) — narrate each LINQ stage aloud.`,
  dict: `${dictNote} **30 min:** ~5 extra minutes but fewer LINQ bugs under pressure. **Tech lead:** preferred when panel cares about defensive parsing, skipped-row metrics, and maintainability.`,
});

const waymarkRaw: Omit<ConsoleChallenge, "approaches">[] = [
  {
    id: "waymark-core-count",
    title: "Core — Count Locations per Postal Code",
    source: "Waymark",
    difficulty: "mid",
    timeMinutes: 30,
    dataSkill: "csv",
    referenceLinks: [`waymark_dotnet_challenge/${WAYMARK_CSV_FILENAME}`],
    prompt: `**Waymark .NET Backend Interview — core task (30 min)**

${WAYMARK_COLUMN_REFERENCE}

Parse place_code (3), eng (5), box_code (17), latitude (18), longitude (19).
Output: total count per place_code — format \`KZN263, 7\` sorted by place_code **ascending**.

${CSV_PATH_HINT}`,
    exampleOutput: `DC12, 2\nDC44, 5\nKZN263, 7\nLIM352, 4\nLIM334, 7\nMP301, 5`,
    constraints: BASE_CONSTRAINTS,
    thoughtProcess: [
      {
        step: 1,
        title: "Delimiter trap",
        body: "Split on ';' not ','. Confirm with header line.",
      },
      {
        step: 2,
        title: "Group key",
        body: "Dictionary<string,int> or GroupBy(place_code) — skip empty codes.",
      },
      {
        step: 3,
        title: "Output contract",
        body: "Ascending sort by code. Expected KZN263=7, LIM334=7, DC44=5.",
      },
    ],
    skeleton: [
      "File.Exists",
      "ReadLines + skip header",
      "Split(';') cols[3]",
      "Dictionary count++",
      "OrderBy code asc print",
    ],
    criteria: [readCsv, semicolonSplit, placeCodeCol, guards, {
      id: "group-count",
      label: "Groups/counts by place_code",
      hint: "Dictionary or GroupBy + Count.",
      test: hasAny(/GroupBy/i, /Dictionary\s*</i, /GetValueOrDefault/i),
      weight: 2,
    }, {
      id: "sort-asc",
      label: "Sorts output by postal code ascending",
      hint: "OrderBy(code) not OrderByDescending count.",
      test: hasAny(/OrderBy\s*\(/i, /OrderBy\s*\(\s*\w+\s*=>/i),
      weight: 1,
    }],
    commonMistakes: [
      "Split(',') — wrong delimiter; every column lands in one cell",
      "Sort by count desc — spec wants code asc",
      "Forgot to skip header row id;parent;...",
      "Index off-by-one: place_code is 3 not 4",
    ],
  },
  {
    id: "waymark-data-quality",
    title: "Data Quality — Skipped Row Report",
    source: "Waymark",
    difficulty: "mid",
    timeMinutes: 25,
    dataSkill: "csv",
    referenceLinks: [`waymark_dotnet_challenge/${WAYMARK_CSV_FILENAME}`],
    prompt: `Scan all rows. Classify and count **skipped** records:
1. Truncated row (fewer than 20 columns)
2. Empty place_code
3. Invalid latitude or longitude (TryParse fails)
4. Invalid place_type (not town, suburb, local_municipality, district_municipality)

Print each category count + list id + eng for invalid rows.
Expected: 1 empty place_code (id 100055), 1 bad coordinates row (same id).`,
    exampleOutput: `Empty place_code: 1\n  100055 Rgyoeijdw\nInvalid coordinates: 1\n  100055 Rgyoeijdw`,
    constraints: [...BASE_CONSTRAINTS, "Do not throw on bad rows — accumulate reasons"],
    thoughtProcess: [
      { step: 1, title: "Separate parse from validate", body: "TryParseRow returns bool + reason." },
      { step: 2, title: "Lead signal", body: "Reporting skipped rows shows production mindset." },
    ],
    skeleton: ["enum/category counts", "TryParse lat/lon", "valid place_type set", "print audit"],
    criteria: [readCsv, semicolonSplit, guards, {
      id: "audit-list",
      label: "Lists problematic row ids",
      hint: "Console.WriteLine id + eng for each skip.",
      test: hasAny(/100055/i, /WriteLine.*id/i, /skipped/i, /invalid/i),
      weight: 2,
    }],
    commonMistakes: [
      "Crash on first bad row instead of audit report",
      "Only check place_code — miss corrupt place_type Rgyoeijdw",
    ],
  },
  {
    id: "waymark-place-type-split",
    title: "Towns vs Municipalities per Code",
    source: "Waymark",
    difficulty: "mid",
    timeMinutes: 30,
    dataSkill: "csv",
    prompt: `For each place_code, output:
\`KZN263 | towns=6 | municipalities=1 | total=7\`
Count place_type: town, suburb → towns; local_municipality + district_municipality → municipalities.
Skip invalid rows. Sort by place_code asc.`,
    exampleOutput: `KZN263 | towns=6 | municipalities=1 | total=7\nLIM352 | towns=3 | municipalities=1 | total=4`,
    constraints: BASE_CONSTRAINTS,
    thoughtProcess: [
      { step: 1, title: "Nested aggregation", body: "Dictionary<string, (int towns, int munis)> or nested dict." },
    ],
    skeleton: ["parse place_type cols[2]", "bucket town vs muni", "print per code"],
    criteria: [readCsv, semicolonSplit, guards, {
      id: "place-type",
      label: "Reads place_type column (index 2)",
      hint: "",
      test: hasAny(/\[2\]/, /place_type/i, /PlaceType/i),
      weight: 1,
    }, {
      id: "dual-count",
      label: "Separate town and municipality counts",
      hint: "",
      test: hasAny(/town/i, /municip/i, /local_municipality/i),
      weight: 2,
    }],
    commonMistakes: ["Count suburb as municipality", "Forget district_municipality bucket"],
  },
  {
    id: "waymark-region-prefix",
    title: "Region Prefix Summary (KZN, LIM, DC, EC, MP)",
    source: "Waymark",
    difficulty: "mid",
    timeMinutes: 25,
    dataSkill: "csv",
    prompt: `Extract region prefix from place_code — letters before digits:
KZN263→KZN, DC44→DC, LIM352→LIM, MP301→MP, EC124→EC.
Output: \`KZN, 7\` sorted by prefix asc. Skip rows without valid place_code.`,
    exampleOutput: `DC, 28\nEC, 2\nKZN, 7\nLIM, 11\nMP, 5`,
    constraints: BASE_CONSTRAINTS,
    thoughtProcess: [
      { step: 1, title: "Prefix extraction", body: "TakeWhile(char.IsLetter) or Regex ^[A-Z]+." },
    ],
    skeleton: ["prefix helper", "group by prefix", "count", "sort print"],
    criteria: [readCsv, semicolonSplit, {
      id: "prefix",
      label: "Extracts letter prefix from place_code",
      hint: "",
      test: hasAny(/IsLetter/i, /Regex/i, /TakeWhile/i, /Substring/i, /\[0\]/i),
      weight: 2,
    }, {
      id: "aggregate",
      label: "Aggregates counts by prefix",
      hint: "",
      test: hasAny(/Dictionary/i, /GroupBy/i),
      weight: 2,
    }],
    commonMistakes: ["Use first 3 chars fixed — DC44 is 2 letters", "Include corrupted row in counts"],
  },
  {
    id: "waymark-top-codes",
    title: "Top 5 Postal Codes by Location Count",
    source: "Waymark",
    difficulty: "mid",
    timeMinutes: 20,
    dataSkill: "csv",
    prompt: `Same core parse as interview task. Print **top 5** place_codes by count **descending**.
Tie-break: place_code ascending.
Expected top: KZN263=7, LIM334=7 (tie), then LIM352=4, MP301=5, DC44=5 — verify tie-break.`,
    exampleOutput: `1. KZN263 — 7\n2. LIM334 — 7\n3. DC44 — 5\n4. MP301 — 5\n5. LIM352 — 4`,
    constraints: BASE_CONSTRAINTS,
    thoughtProcess: [
      { step: 1, title: "Two-phase", body: "Count all → OrderByDescending count ThenBy code → Take(5)." },
    ],
    skeleton: ["count dict", "OrderByDescending ThenBy", "Take(5)"],
    criteria: [readCsv, semicolonSplit, {
      id: "top5",
      label: "Takes top 5 by count",
      hint: "",
      test: hasAny(/Take\s*\(\s*5\s*\)/, /Take\(5\)/),
      weight: 2,
    }, {
      id: "tie",
      label: "Tie-break with ThenBy on code",
      hint: "",
      test: hasAny(/ThenBy/i, /OrderBy.*ThenBy/i),
      weight: 1,
    }],
    commonMistakes: ["Take(10) habit from Investec", "No tie-break — order unstable"],
  },
  {
    id: "waymark-box-code-audit",
    title: "Box Code vs Street Code Mismatch",
    source: "Waymark",
    difficulty: "mid",
    timeMinutes: 25,
    dataSkill: "csv",
    prompt: `List towns (place_type=town) where **box_code** (17) and **street_code** (16) differ when both non-empty.
Format: \`id | eng | street=6270 box=6270\`.
Also count towns where box_code is empty but street_code is not (and vice versa).
Sort by eng name asc.`,
    exampleOutput: `Adams Mission | street=4110 box=4100\nAlberton | street=1449 box=1450`,
    constraints: BASE_CONSTRAINTS,
    thoughtProcess: [
      { step: 1, title: "Compare nullable strings", body: "Both non-empty && !Equals(street, box)." },
    ],
    skeleton: ["cols[16] cols[17]", "filter town", "compare print"],
    criteria: [readCsv, semicolonSplit, {
      id: "street-box",
      label: "Uses street_code and box_code columns",
      hint: "",
      test: hasAny(/\[16\]/, /\[17\]/, /street_code/i, /box_code/i),
      weight: 2,
    }],
    commonMistakes: ["Compare when one side empty — false mismatch", "Wrong column indices"],
  },
  {
    id: "waymark-geo-centroid",
    title: "Geographic Centroid per Postal Code",
    source: "Waymark",
    difficulty: "senior",
    timeMinutes: 30,
    dataSkill: "csv",
    prompt: `For each place_code with valid coordinates, compute **average latitude** and **average longitude** across all locations in that code.
Output: \`KZN263 | lat=-28.1234 | lon=25.5678 | points=7\` (4 decimal places).
Skip invalid coords. Sort by place_code asc.`,
    exampleOutput: `KZN263 | lat=-28.xxxx | lon=25.xxxx | points=7`,
    constraints: [...BASE_CONSTRAINTS, "Use double for coordinates"],
    thoughtProcess: [
      { step: 1, title: "Running sum", body: "Dict<string,(double latSum, lonSum, int n)> then divide." },
    ],
    skeleton: ["TryParse lat/lon", "sum per code", "average print"],
    criteria: [readCsv, semicolonSplit, guards, {
      id: "avg",
      label: "Computes average lat/lon",
      hint: "",
      test: hasAny(/Average/i, /\/\s*\w+/i, /latSum/i, /count/i),
      weight: 2,
    }],
    commonMistakes: ["Average of averages across codes", "Include row 100055 with empty lat"],
  },
  {
    id: "waymark-lookup-filter",
    title: "Filter by Postal Code (CLI arg)",
    source: "Waymark",
    difficulty: "mid",
    timeMinutes: 25,
    dataSkill: "csv",
    prompt: `Accept place_code from \`args[0]\` (default KZN263 if missing).
Print all valid locations: \`eng | lat, lon | box=6270\` sorted by eng asc.
Print count at end. Exit with message if code not found.`,
    exampleOutput: `Abbotsdale | -33.4924125, 18.6687469 | box=7300\n...\nTotal: 7`,
    constraints: [...BASE_CONSTRAINTS, "args[0] for filter"],
    thoughtProcess: [
      { step: 1, title: "Filter early", body: "Where place_code equals arg after normalize." },
    ],
    skeleton: ["args[0]", "filter cols[3]", "sort eng", "print count"],
    criteria: [readCsv, semicolonSplit, {
      id: "args",
      label: "Reads command-line argument",
      hint: "",
      test: hasAny(/args\s*\[\s*0\s*\]/, /Environment\.GetCommandLineArgs/i),
      weight: 1,
    }, {
      id: "filter",
      label: "Filters by place_code",
      hint: "",
      test: hasAny(/Equals/i, /==/i, /\.Where\s*\(/i),
      weight: 2,
    }],
    commonMistakes: ["Case-sensitive match — use OrdinalIgnoreCase", "No not-found message"],
  },
  {
    id: "waymark-duplicate-eng",
    title: "Duplicate English Names Across Codes",
    source: "Waymark",
    difficulty: "senior",
    timeMinutes: 30,
    dataSkill: "csv",
    prompt: `Find eng names (case-insensitive) that appear under **more than one** place_code.
Output: \`eng | codes=DC25,DC12\` sorted by eng.
If none, print "No duplicates". (This dataset may have zero — still implement correctly.)`,
    exampleOutput: `No duplicates`,
    constraints: BASE_CONSTRAINTS,
    thoughtProcess: [
      { step: 1, title: "Invert index", body: "Dictionary<eng, HashSet<place_code>>." },
    ],
    skeleton: ["dict eng to codes", "Where Count>1", "print"],
    criteria: [readCsv, semicolonSplit, {
      id: "hashset",
      label: "Tracks multiple codes per name",
      hint: "",
      test: hasAny(/HashSet/i, /GroupBy/i, /Distinct/i),
      weight: 2,
    }],
    commonMistakes: ["Compare ids not names", "Miss case-insensitive duplicate"],
  },
  {
    id: "waymark-municipality-only",
    title: "Municipality Roll-up Report",
    source: "Waymark",
    difficulty: "mid",
    timeMinutes: 20,
    dataSkill: "csv",
    prompt: `Print only rows where place_type is local_municipality or district_municipality.
Format: \`place_code | type | eng | lat, lon\`.
Sort by place_type then eng. Print total municipality rows (expect 9).`,
    exampleOutput: `KZN263 | local_municipality | Abaqulusi | -27.84, 30.80\n...\nTotal: 9`,
    constraints: BASE_CONSTRAINTS,
    thoughtProcess: [
      { step: 1, title: "Whitelist filter", body: "HashSet of allowed place_type strings." },
    ],
    skeleton: ["filter muni types", "print fields", "count"],
    criteria: [readCsv, semicolonSplit, {
      id: "muni-filter",
      label: "Filters municipality place types",
      hint: "",
      test: hasAny(/local_municipality/i, /district_municipality/i),
      weight: 2,
    }],
    commonMistakes: ["Include town rows", "Include corrupt Rgyoeijdw type"],
  },
  {
    id: "waymark-parent-child",
    title: "Towns per Parent Municipality",
    source: "Waymark",
    difficulty: "senior",
    timeMinutes: 35,
    dataSkill: "csv",
    prompt: `Build map: parent id (col 1) → count of child **town** rows.
For each local_municipality row, print: \`eng (id) | child towns=N\`.
Use municipality's id as key; count towns whose parent equals that id.
Sort by child count desc. (Exercises graph thinking on same CSV.)`,
    exampleOutput: `Abaqulusi (100001) | child towns=6\nAganang (100008) | child towns=3`,
    constraints: BASE_CONSTRAINTS,
    thoughtProcess: [
      { step: 1, title: "Two-pass", body: "Pass 1: count towns by parent. Pass 2: join to municipality rows." },
    ],
    skeleton: ["count parent id for towns", "lookup municipality rows", "print join"],
    criteria: [readCsv, semicolonSplit, {
      id: "parent",
      label: "Uses parent column (index 1)",
      hint: "",
      test: hasAny(/\[1\]/, /parent/i),
      weight: 2,
    }, {
      id: "two-pass",
      label: "Two-pass or join logic",
      hint: "",
      test: hasAny(/foreach/i, /Join/i, /Lookup/i, /Dictionary/i),
      weight: 1,
    }],
    commonMistakes: ["Single pass without building parent index", "Count all types not just town"],
  },
  {
    id: "waymark-export-json",
    title: "Bonus — Export Summary JSON File",
    source: "Waymark",
    difficulty: "senior",
    timeMinutes: 35,
    dataSkill: "csv",
    prompt: `Core counts per place_code + write \`postal_summary.json\` using **System.Text.Json** (no Newtonsoft).
Shape: \`{ "generatedAt": "...", "codes": [ { "placeCode": "KZN263", "count": 7, "sampleEng": "Aberdeen" } ] }\`
Sorted by placeCode asc. Print "Written to postal_summary.json".`,
    exampleOutput: `Written to postal_summary.json`,
    constraints: [...BASE_CONSTRAINTS, "System.Text.Json only", "Write to output file"],
    thoughtProcess: [
      { step: 1, title: "DTO record", body: "Small record types — lead-friendly structure." },
    ],
    skeleton: ["aggregate", "define records", "JsonSerializer.Serialize", "WriteAllText"],
    criteria: [readCsv, semicolonSplit, {
      id: "json",
      label: "System.Text.Json serialization",
      hint: "",
      test: hasAny(/System\.Text\.Json/i, /JsonSerializer/i),
      weight: 2,
    }, {
      id: "writefile",
      label: "Writes JSON file",
      hint: "",
      test: hasAny(/WriteAllText/i, /WriteAsync/i, /FileStream/i),
      weight: 1,
    }],
    commonMistakes: ["Pretty print forgotten — JsonSerializerOptions WriteIndented", "Forget to skip bad rows in counts"],
  },
];

const lv = leadVsSpeed;

const waymarkApproaches: Record<string, ConsoleChallenge["approaches"]> = {
  "waymark-core-count": [
    {
      id: "a-linq",
      name: "Approach A — LINQ GroupBy (ship in 30 min)",
      whenToUse: lv(
        "Fewest lines; GroupBy(place_code).Count() after Where guards.",
        "",
      ).linq,
      thoughtProcess: [
        { step: 1, title: "Read", body: "File.ReadLines → Skip(1) → Split(';') → Where length >= 20." },
        { step: 2, title: "Project", body: "Select place_code cols[3]; Where not whitespace; TryParse lat/lon optional." },
        { step: 3, title: "Aggregate", body: "GroupBy → Count → OrderBy Key → foreach print `$\"{Key}, {Count}\"`." },
        { step: 4, title: "Tech lead vs 30 min", body: "**30 min:** default choice. **Tech lead:** add one line logging skipped count — shows ops awareness without refactor." },
      ],
      skeleton: ["ReadLines Skip header", "Split ;", "GroupBy Count", "OrderBy code print"],
      criteriaExtras: [{ id: "linq-group", label: "GroupBy + Count", hint: "", test: has(/GroupBy/i), weight: 1 }],
    },
    {
      id: "b-dictionary",
      name: "Approach B — Dictionary + foreach (explain clearly)",
      whenToUse: lv("", "Explicit TryGetValue increment; easiest to debug aloud.").dict,
      thoughtProcess: [
        { step: 1, title: "Stream", body: "StreamReader or ReadLines — skip line when cols[0]==\"id\"." },
        { step: 2, title: "Guards", body: "continue on short row, empty cols[3], failed TryParse on 18/19." },
        { step: 3, title: "Count", body: "counts[code] = counts.GetValueOrDefault(code)+1." },
        { step: 4, title: "Tech lead vs 30 min", body: "**Tech lead:** choose this when discussing idempotency of parsing or adding metrics. **30 min:** if LINQ nerves hit, this is safer." },
      ],
      skeleton: ["foreach line", "guards", "Dictionary++", "OrderBy print"],
      criteriaExtras: [
        { id: "dict", label: "Dictionary aggregation", hint: "", test: has(/Dictionary/i), weight: 1 },
        { id: "readlines", label: "File.ReadLines", hint: "", test: has(/ReadLines/i), weight: 1 },
      ],
    },
  ],
  "waymark-data-quality": [
    {
      id: "a-structured",
      name: "Approach A — ParseResult record (tech lead)",
      whenToUse:
        "**Tech lead:** ParseRow returns (bool ok, SkipReason? reason) — testable, extensible. **35 min+:** worth it. **30 min core:** skip unless they ask for clean architecture.",
      thoughtProcess: [
        { step: 1, title: "ParseRow", body: "Single method returns success or enum SkipReason." },
        { step: 2, title: "Audit", body: "List<(string id, string reason)> for invalid rows." },
        { step: 3, title: "Print report", body: "Group audit by reason → count + details." },
      ],
      skeleton: ["enum SkipReason", "ParseRow", "audit list", "report"],
      criteriaExtras: [{ id: "enum-or-record", label: "Structured parse result", hint: "", test: hasAny(/record/i, /enum/i, /ParseRow/i), weight: 1 }],
    },
    {
      id: "b-inline",
      name: "Approach B — Inline counters (fastest 25 min)",
      whenToUse:
        "**25 min:** four int counters + List for details — ship audit report fast. **Tech lead:** narrate categories; refactor to ParseRow later if asked.",
      thoughtProcess: [
        { step: 1, title: "Counters", body: "truncated++, emptyCode++, badCoord++, badType++." },
        { step: 2, title: "One loop", body: "foreach line — if fail category, add to list and continue." },
        { step: 3, title: "Print", body: "Summary counts then detail lines." },
      ],
      skeleton: ["int counters", "single loop", "print audit"],
    },
  ],
  "waymark-place-type-split": [
    {
      id: "a-nested-dict",
      name: "Approach A — Dictionary of tallies",
      whenToUse:
        "**30 min:** one dict keyed by place_code with (towns, munis) tuple — clearest to debug. **Tech lead:** explicit buckets, easy unit test.",
      thoughtProcess: [
        { step: 1, title: "Bucket", body: "IsTown(type) => town or suburb; else if muni type increment muni." },
        { step: 2, title: "Update", body: "Deconstruct tuple, increment correct counter." },
      ],
      skeleton: ["tuple value dict", "bucket place_type", "print"],
    },
    {
      id: "b-linq-group",
      name: "Approach B — LINQ GroupBy twice",
      whenToUse:
        "**30 min:** only if tuple dict feels awkward. **Tech lead:** shows LINQ fluency but harder to explain under pressure.",
      thoughtProcess: [
        { step: 1, title: "Project", body: "Anonymous { Code, IsTown }." },
        { step: 2, title: "Group", body: "GroupBy Code → sum IsTown true/false counts." },
        { step: 3, title: "30 min vs lead", body: "**30 min:** Approach A clearer. **Tech lead:** B shows LINQ fluency but harder to explain." },
      ],
      skeleton: ["Select project", "GroupBy code", "sum buckets"],
      criteriaExtras: [{ id: "groupby", label: "GroupBy", hint: "", test: has(/GroupBy/i), weight: 1 }],
    },
  ],
  "waymark-region-prefix": [
    {
      id: "a-takewhile",
      name: "Approach A — TakeWhile(IsLetter)",
      whenToUse: "**30 min:** 3-line prefix helper, no Regex. **Tech lead:** pure, readable, no magic numbers.",
      thoughtProcess: [
        { step: 1, title: "Prefix", body: "new string(code.TakeWhile(char.IsLetter).ToArray())" },
        { step: 2, title: "Count", body: "Dictionary increment by prefix." },
      ],
      skeleton: ["TakeWhile IsLetter", "dict count", "sort"],
    },
    {
      id: "b-regex",
      name: "Approach B — Regex ^[A-Z]+",
      whenToUse: "**30 min:** only if already memorized. **Tech lead:** mention validation; overkill for 59 rows.",
      thoughtProcess: [
        { step: 1, title: "Match", body: "Regex.Match(code, @\"^[A-Z]+\")" },
        { step: 2, title: "Tradeoff", body: "Slightly slower to type; same result." },
      ],
      skeleton: ["Regex prefix", "dict", "print"],
      criteriaExtras: [{ id: "regex", label: "Regex prefix", hint: "", test: has(/Regex/i), weight: 1 }],
    },
  ],
  "waymark-top-codes": [
    {
      id: "a-linq-rank",
      name: "Approach A — OrderByDescending + Take(5)",
      whenToUse: "**20 min:** count dict then LINQ sort — fastest.",
      thoughtProcess: [
        { step: 1, title: "Count", body: "Same as core task dictionary." },
        { step: 2, title: "Rank", body: "counts.OrderByDescending(kv=>kv.Value).ThenBy(kv=>kv.Key).Take(5)" },
      ],
      skeleton: ["dict count", "OrderByDescending ThenBy Take(5)"],
    },
    {
      id: "b-heap-manual",
      name: "Approach B — Manual top-5 scan",
      whenToUse: "**Tech lead:** discuss O(n) top-k without full sort when dataset huge. **This CSV:** LINQ is fine — use B only to show algorithm knowledge.",
      thoughtProcess: [
        { step: 1, title: "When", body: "59 rows — full sort is trivial. Mention scale if asked." },
        { step: 2, title: "Top-k", body: "Maintain sorted list of 5 or min-heap — optional deep dive." },
      ],
      skeleton: ["count all", "partial sort OR full OrderBy", "print numbered"],
    },
  ],
  "waymark-box-code-audit": [
    {
      id: "a-filter-linq",
      name: "Approach A — LINQ Where mismatch",
      whenToUse: "**25 min:** project rows then Where street != box.",
      thoughtProcess: [
        { step: 1, title: "Parse", body: "Parse to record with Street, Box, Eng, Type." },
        { step: 2, title: "Filter", body: "Where town && both non-empty && !Equals." },
      ],
      skeleton: ["parse records", "Where mismatch", "OrderBy eng"],
    },
    {
      id: "b-loop-list",
      name: "Approach B — List + foreach",
      whenToUse: "**Tech lead:** easier to add CSV export of mismatches later.",
      thoughtProcess: [
        { step: 1, title: "Collect", body: "List<MismatchRow> add on condition." },
        { step: 2, title: "Sort print", body: "mismatches.OrderBy(m=>m.Eng)." },
      ],
      skeleton: ["List collect", "foreach", "sort print"],
    },
  ],
  "waymark-geo-centroid": [
    {
      id: "a-dict-sum",
      name: "Approach A — Dictionary (sum, sum, count)",
      whenToUse: "**30 min senior:** running totals — precise narrative.",
      thoughtProcess: [
        { step: 1, title: "Aggregate", body: "(latSum, lonSum, n) per code." },
        { step: 2, title: "Finalize", body: "latSum/n, lonSum/n — guard n==0." },
      ],
      skeleton: ["tuple dict", "TryParse", "divide print"],
    },
    {
      id: "b-linq-avg",
      name: "Approach B — LINQ GroupBy + Average",
      whenToUse: "**25 min if comfortable:** GroupBy code, Average on lat and lon separately.",
      thoughtProcess: [
        { step: 1, title: "Project", body: "{ Code, Lat, Lon } valid only." },
        { step: 2, title: "Average", body: "GroupBy → g.Average(x=>x.Lat)." },
      ],
      skeleton: ["GroupBy", "Average lat lon", "print"],
      criteriaExtras: [{ id: "average", label: "Average", hint: "", test: has(/Average/i), weight: 1 }],
    },
  ],
  "waymark-lookup-filter": [
    {
      id: "a-filter-parse",
      name: "Approach A — Filter in parse loop",
      whenToUse: "**25 min:** if code != target continue immediately.",
      thoughtProcess: [
        { step: 1, title: "Arg", body: "var target = args.Length>0 ? args[0] : \"KZN263\";" },
        { step: 2, title: "Early continue", body: "if (!code.Equals(target, OrdinalIgnoreCase)) continue;" },
      ],
      skeleton: ["args[0]", "continue filter", "list sort print"],
    },
    {
      id: "b-parse-all-filter",
      name: "Approach B — Parse all → Where → sort",
      whenToUse: "**Tech lead:** when adding multiple filters later; **30 min:** extra pass wasteful but clear.",
      thoughtProcess: [
        { step: 1, title: "List all", body: "Parse valid rows to List<Location>." },
        { step: 2, title: "Filter", body: "locations.Where(l => l.Code equals target)." },
      ],
      skeleton: ["List parse", "Where filter", "OrderBy eng"],
    },
  ],
  "waymark-duplicate-eng": [
    {
      id: "a-dict-hashset",
      name: "Approach A — Dictionary<string, HashSet<string>>",
      whenToUse: "**Tech lead:** explicit multi-map — best explanation.",
      thoughtProcess: [
        { step: 1, title: "Add", body: "dict.GetOrAdd(eng.ToLower()).Add(place_code)." },
        { step: 2, title: "Filter", body: "Where set.Count > 1." },
      ],
      skeleton: ["HashSet per eng", "filter count>1"],
    },
    {
      id: "b-linq-group",
      name: "Approach B — GroupBy eng → count distinct codes",
      whenToUse: "**30 min:** GroupBy eng, Select distinct codes, Where Count>1.",
      thoughtProcess: [
        { step: 1, title: "Group", body: "GroupBy eng (ignore case) → Select g.Select codes Distinct." },
      ],
      skeleton: ["GroupBy eng", "Distinct codes", "Where >1"],
      criteriaExtras: [{ id: "groupby", label: "GroupBy eng", hint: "", test: has(/GroupBy/i), weight: 1 }],
    },
  ],
  "waymark-municipality-only": [
    {
      id: "a-hashset-filter",
      name: "Approach A — HashSet allowed types",
      whenToUse: "**20 min:** whitelist + print — minimal.",
      thoughtProcess: [
        { step: 1, title: "Set", body: "HashSet with two municipality strings." },
        { step: 2, title: "Filter", body: "allowed.Contains(cols[2])." },
      ],
      skeleton: ["HashSet types", "filter print"],
    },
    {
      id: "b-switch",
      name: "Approach B — switch expression on place_type",
      whenToUse: "**Tech lead:** when adding suburb tier later — switch extensibility.",
      thoughtProcess: [
        { step: 1, title: "Switch", body: "place_type switch { local_municipality => ..., district_municipality => ..., _ => skip }." },
      ],
      skeleton: ["switch type", "print row"],
    },
  ],
  "waymark-parent-child": [
    {
      id: "a-two-pass",
      name: "Approach A — Two-pass (count then join)",
      whenToUse: "**Tech lead default:** clear phases, easy to test each pass.",
      thoughtProcess: [
        { step: 1, title: "Pass 1", body: "Count towns grouped by parent id." },
        { step: 2, title: "Pass 2", body: "Foreach municipality row lookup count by id." },
      ],
      skeleton: ["dict parent->count", "join muni rows", "print"],
    },
    {
      id: "b-linq-lookup",
      name: "Approach B — LINQ Lookup + join",
      whenToUse: "**35 min if LINQ-strong:** towns.ToLookup(t=>t.Parent) join munis.",
      thoughtProcess: [
        { step: 1, title: "Lookup", body: "Build Lookup parentId -> towns count." },
        { step: 2, title: "Join", body: "Municipalities select lookup[id].Count." },
      ],
      skeleton: ["ToLookup", "join", "OrderByDescending count"],
      criteriaExtras: [{ id: "lookup", label: "Lookup/Join", hint: "", test: hasAny(/Lookup/i, /Join/i), weight: 1 }],
    },
  ],
  "waymark-export-json": [
    {
      id: "a-records",
      name: "Approach A — Records + JsonSerializer (tech lead)",
      whenToUse: "**Tech lead / bonus 35 min:** typed SummaryRoot + CodeEntry records; serializable contract.",
      thoughtProcess: [
        { step: 1, title: "DTOs", body: "record CodeEntry(string PlaceCode, int Count, string SampleEng);" },
        { step: 2, title: "Serialize", body: "JsonSerializer.Serialize(root, new JsonSerializerOptions { WriteIndented = true })." },
      ],
      skeleton: ["records", "aggregate", "Serialize WriteAllText"],
    },
    {
      id: "b-anonymous",
      name: "Approach B — Anonymous object graph",
      whenToUse: "**30 min bonus:** faster to type; less lead polish but acceptable for time box.",
      thoughtProcess: [
        { step: 1, title: "Anonymous", body: "new { generatedAt = DateTime.UtcNow, codes = list }." },
        { step: 2, title: "Tradeoff", body: "Lead would refactor to records for API contract stability." },
      ],
      skeleton: ["anonymous object", "JsonSerializer", "WriteAllText"],
    },
  ],
};

export const WAYMARK_CONSOLE_CHALLENGES: ConsoleChallenge[] = waymarkRaw.map((c) =>
  withApproaches({
    ...c,
    approaches: waymarkApproaches[c.id] ?? undefined,
  }),
);

export const WAYMARK_CHALLENGE_COUNT = WAYMARK_CONSOLE_CHALLENGES.length;

/** Quick reference for UI / README */
export const WAYMARK_PRACTICE_ORDER = [
  "waymark-core-count",
  "waymark-data-quality",
  "waymark-top-codes",
  "waymark-place-type-split",
  "waymark-region-prefix",
  "waymark-lookup-filter",
  "waymark-box-code-audit",
  "waymark-municipality-only",
  "waymark-geo-centroid",
  "waymark-duplicate-eng",
  "waymark-parent-child",
  "waymark-export-json",
];

export const WAYMARK_KNOWN_ANSWERS = WAYMARK_KNOWN_COUNTS;
