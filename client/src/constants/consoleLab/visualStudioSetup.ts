import type { VisualStudioStep } from "../../types/consoleLab";

/** Shared once per session — create & run any Investec-style console app in VS Community */
export const VISUAL_STUDIO_SETUP: VisualStudioStep[] = [
  {
    step: 1,
    title: "Open Visual Studio Community",
    vsAction: "Start menu → Visual Studio Community 2022",
    body: "Use Community edition — free, same C# compiler as interview machines. Sign in optional.",
  },
  {
    step: 2,
    title: "Create a new Console App",
    vsAction: "File → New → Project… (Ctrl+Shift+N)",
    body: "Search “Console App”, pick C# template (not “Console App (.NET Framework)”). Click Next.",
  },
  {
    step: 3,
    title: "Name the project & pick .NET 8",
    vsAction: "Project name: e.g. PostcodeLinq → Framework: .NET 8.0 → Create",
    body: "One project per approach when practising (PostcodeLinq vs PostcodeDict). Target .NET 8 unless spec says otherwise.",
  },
  {
    step: 4,
    title: "Program.cs is your whole solution",
    body: "Interview tasks are one file. Delete the default “Hello, World!” if it distracts you — or overwrite it block by block.",
  },
  {
    step: 5,
    title: "Run without debugger",
    vsAction: "Debug → Start Without Debugging (Ctrl+F5)",
    body: "Console window stays open after program ends. Use this every time you test — faster than F5.",
  },
  {
    step: 6,
    title: "Add a local CSV or JSON file (when needed)",
    vsAction: "Solution Explorer → right-click project → Add → Existing Item…",
    body: "Select the file → click it → Properties (F4) → Copy to Output Directory: Copy if newer. File lands next to .exe at runtime.",
  },
  {
    step: 7,
    title: "Set command-line args (optional)",
    vsAction: "Project → Properties → Debug → General → Open debug launch profiles UI → commandLineArgs",
    body: "Or hard-code path first, then switch to args[0] once working. Example: pp-monthly-update-new-version.csv",
  },
  {
    step: 8,
    title: "Build errors — read bottom up",
    vsAction: "View → Error List (Ctrl+\\, E)",
    body: "Fix red squiggles before running. Missing using? Add at top. Async without await? Add await or use .Result only in throwaway tests.",
  },
];
