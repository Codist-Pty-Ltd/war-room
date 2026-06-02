import type { ChallengeApproach, ConsoleChallenge, DataSkill } from "../../types/consoleLab";
import { enrichChallengeApproaches } from "./visualStudioSteps";

const step = (n: number, title: string, body: string) => ({ step: n, title, body });

export function buildDefaultApproaches(
  skill: DataSkill,
  title: string,
): [ChallengeApproach, ChallengeApproach] {
  switch (skill) {
    case "csv":
      return [
        {
          id: "a-linq",
          name: "Approach A — LINQ pipeline",
          whenToUse: "Fast to type in interviews; data fits in memory.",
          thoughtProcess: [
            step(1, "Read", "File.ReadAllLines or ReadLines → Where valid → Select split columns."),
            step(2, "Project", "Parse fields with TryParse; skip bad rows with Where."),
            step(3, "Aggregate", "GroupBy key → Select average/sum/count."),
            step(4, "Rank", "OrderByDescending → Take(N) → print."),
          ],
          skeleton: ["read lines", "split + parse", "GroupBy", "OrderBy Take", "print"],
        },
        {
          id: "b-dictionary",
          name: "Approach B — Dictionary + foreach",
          whenToUse: "Easier to explain step-by-step; streams with ReadLines.",
          thoughtProcess: [
            step(1, "Loop", "foreach line — guard clauses with continue."),
            step(2, "Parse", "Split, extract columns, TryParse."),
            step(3, "Dictionary", "TryGetValue → update running totals or increment count."),
            step(4, "Sort", "LINQ on dictionary only for final top-N (small result set)."),
          ],
          skeleton: ["foreach line", "guards", "Dictionary update", "sort top N", "print"],
        },
      ];
    case "json-api":
      return [
        {
          id: "a-linear",
          name: "Approach A — Linear top-to-bottom",
          whenToUse: "Simplest muscle memory — one file, four blocks (GET → parse → transform → print).",
          thoughtProcess: [
            step(1, "GET", "HttpClient + try/catch + GetStringAsync. Message and return on failure."),
            step(2, "Parse", "JsonDocument.Parse → navigate to array (data or results)."),
            step(3, "Loop", "foreach item → read fields → add to list or count in dictionary."),
            step(4, "Output", "Sort/group → numbered Console.WriteLine."),
          ],
          skeleton: ["HttpClient GET", "JsonDocument", "loop attributes", "sort print"],
        },
        {
          id: "b-helpers",
          name: "Approach B — Load / Parse / Rank helpers",
          whenToUse: "When they ask you to structure code or add fallback file later.",
          thoughtProcess: [
            step(1, "LoadJsonAsync", "One method: HTTP with catch, optional fallback path."),
            step(2, "ParseBreeds/ParseRows", "Static method returns List or tuples — testable story."),
            step(3, "Rank", "Separate print helper or generic PrintTop10(title, sorted, metric)."),
            step(4, "Main", "Main flow reads: load → parse → rank twice → print."),
          ],
          skeleton: ["LoadJsonAsync()", "ParseX(json)", "GetTop10(list, key)", "Print"],
        },
      ];
    case "json-file":
      return [
        {
          id: "a-readall",
          name: "Approach A — ReadAllText + parse",
          whenToUse: "Fallback file or offline JSON — whole file as string first.",
          thoughtProcess: [
            step(1, "Path", "File.Exists check; path relative to output or args[0]."),
            step(2, "Read", "File.ReadAllTextAsync or ReadAllText."),
            step(3, "Parse", "Same JsonDocument walk as API — identical logic after you have json string."),
            step(4, "Process", "Identical ranking/grouping as live API version."),
          ],
          skeleton: ["File.Exists", "ReadAllText", "JsonDocument", "same as API parse"],
        },
        {
          id: "b-stream",
          name: "Approach B — Utf8JsonReader stream (advanced)",
          whenToUse: "Huge JSON files — rarely needed in Investec-style 30 min tasks.",
          thoughtProcess: [
            step(1, "When", "Mention only if asked about large files."),
            step(2, "Reader", "File.OpenRead + Utf8JsonReader forward-only."),
            step(3, "Tradeoff", "More complex; JsonDocument is fine for interview datasets."),
            step(4, "Default", "Prefer ReadAllText unless file > 50MB."),
          ],
          skeleton: ["only if huge file", "else use Approach A"],
        },
      ];
    case "stdin":
      return [
        {
          id: "a-loop",
          name: "Approach A — While ReadLine loop",
          whenToUse: "Classic console stdin exercises.",
          thoughtProcess: [
            step(1, "Read", "while ((line = Console.ReadLine()) is not null) — or until empty."),
            step(2, "Process", "Parse line immediately; update state."),
            step(3, "Print", "Per line or summary at end."),
          ],
          skeleton: ["ReadLine loop", "parse", "accumulate", "print"],
        },
        {
          id: "b-batch",
          name: "Approach B — Read all then process",
          whenToUse: "When input ends with Ctrl+Z / empty line — collect List first.",
          thoughtProcess: [
            step(1, "Collect", "List<string> lines until blank or EOF."),
            step(2, "Process", "LINQ or foreach on list — same logic, cleaner separation."),
            step(3, "Benefit", "Easier to sort/group entire input at once."),
          ],
          skeleton: ["collect lines", "process batch", "print"],
        },
      ];
    default:
      return [
        {
          id: "a-declarative",
          name: "Approach A — Declarative (LINQ)",
          whenToUse: `Default for ${title} — describe transforms as chain.`,
          thoughtProcess: [
            step(1, "Input", "Load data into IEnumerable."),
            step(2, "Transform", "Select/Where/GroupBy chain."),
            step(3, "Output", "OrderBy + Take + print."),
          ],
          skeleton: ["load", "LINQ chain", "print"],
        },
        {
          id: "b-imperative",
          name: "Approach B — Imperative loop",
          whenToUse: "When explaining algorithm clearly matters more than brevity.",
          thoughtProcess: [
            step(1, "State", "Dictionary or List as explicit state."),
            step(2, "Loop", "foreach with continue guards."),
            step(3, "Finalize", "Sort and take top N."),
          ],
          skeleton: ["explicit state", "foreach", "sort print"],
        },
      ];
  }
}

export function withApproaches(
  c: Omit<ConsoleChallenge, "approaches"> & {
    approaches?: [ConsoleChallenge["approaches"][0], ConsoleChallenge["approaches"][1]];
  },
): ConsoleChallenge {
  const approaches =
    c.approaches?.length === 2 ? c.approaches : buildDefaultApproaches(c.dataSkill, c.title);
  return enrichChallengeApproaches({ ...c, approaches });
}

export const POSTCODE_CSV_URL =
  "https://prod.publicdata.landregistry.gov.uk.s3-website-eu-west-1.amazonaws.com/pp-monthly-update-new-version.csv";

export const POSTCODE_CSV_URLS = [
  POSTCODE_CSV_URL,
  "http://prod.publicdata.landregistry.gov.uk.s3-website-eu-west-1.amazonaws.com/pp-monthly-update-new-version.csv",
  "http://prod1.publicdata.landregistry.gov.uk.s3-website-eu-west-1.amazonaws.com/pp-monthly-update-new-version.csv",
];
