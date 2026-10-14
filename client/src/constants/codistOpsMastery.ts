import type { MasteryTrack } from "./ntokozoMastery";
import warroom from "./codistOps.warroom.json";

type WarroomFlashcard = {
  id: string;
  category: string;
  difficulty: string;
  question: string;
  answer: string;
  followUps?: string[];
  codeExample?: string;
};

type WarroomPayload = typeof warroom;

const mapDifficulty = (d: string): "SENIOR" | "LEAD" | "PRINCIPAL" => {
  if (d === "staff") return "LEAD";
  if (d === "principal") return "PRINCIPAL";
  return "SENIOR";
};

const appendCodeExample = (answer: string, codeExample?: string) => {
  if (!codeExample?.trim()) return answer;
  return `${answer}\n\n**Code:** \`${codeExample}\``;
};

const flashcardDrills = (warroom.flashcards as WarroomFlashcard[]).map((card) => ({
  id: `ops_${card.id}`,
  difficulty: mapDifficulty(card.difficulty),
  question: card.question,
  answer: appendCodeExample(card.answer, card.codeExample),
  followUp: card.followUps?.[0],
  tags: ["codist-ops", card.category],
}));

const systemDesignDrills = warroom.systemDesignTopics.map((topic, i) => ({
  id: `ops_sd_${i + 1}`,
  difficulty: "LEAD" as const,
  question: topic.interviewQuestion,
  answer: `**Current:** ${topic.currentImplementation}\n\n**Senior insight:** ${topic.seniorInsight}`,
  tags: ["codist-ops", "system-design", topic.topic.toLowerCase().replace(/\s+/g, "-")],
}));

const behaviouralDrills = warroom.behaviouralAnchors.map((anchor, i) => ({
  id: `ops_beh_${i + 1}`,
  difficulty: "SENIOR" as const,
  question: anchor.question,
  answer: `**Situation:** ${anchor.situation}\n\n**Task:** ${anchor.task}\n\n**Action:** ${anchor.action}\n\n**Result:** ${anchor.result}\n\n**Senior signal:** ${anchor.seniorSignal}`,
  tags: ["codist-ops", "behavioural", "star"],
}));

const dangerZoneDefinitions = warroom.dangerZones.map((zone) => ({
  term: zone.area,
  definition: zone.whatSeniorSays,
  example: `Junior trap: "${zone.whatJuniorSays}" — Risk: ${zone.risk}`,
}));

const product = warroom.product as WarroomPayload["product"];

export const CODIST_OPS_TRACK: MasteryTrack = {
  id: "CODIST_OPS",
  title: "Codist Ops (DevOps Portal)",
  description: `${product.oneLiner} Stack: ${product.stack.slice(0, 6).join(", ")}… — ${flashcardDrills.length} flashcards from ops.codist.co.za audit.`,
  color: "#F59E0B",
  definitions: [
    {
      term: "Codist Ops",
      definition: product.oneLiner,
      example: `Live at ops.codist.co.za — SSH control plane for ${product.servers.map((s) => s.name).join(" + ")}`,
    },
    ...dangerZoneDefinitions,
  ],
  drills: [...flashcardDrills, ...systemDesignDrills, ...behaviouralDrills],
  codeDrills: [
    {
      id: "ops_code_001",
      title: "Deployment Success Rate — SQL Refactor",
      brief:
        "GetSuccessRateLast30DaysAsync loads all completed deployments into memory. Refactor to compute success rate with two SQL CountAsync calls (or one grouped query) without materializing rows.",
      language: "csharp",
      starter: `public async Task<double?> GetSuccessRateLast30DaysAsync(
    CancellationToken cancellationToken = default)
{
    var cutoff = DateTime.UtcNow.AddDays(-30);
    var completed = await _dbContext.Deployments
        .AsNoTracking()
        .Where(d => d.StartedAt >= cutoff &&
            (d.Status == DeploymentStatus.Success ||
             d.Status == DeploymentStatus.Failed))
        .ToListAsync(cancellationToken);

    if (completed.Count == 0) return null;

    var success = completed.Count(d => d.Status == DeploymentStatus.Success);
    return success / (double)completed.Count;
}`,
      hints: [
        "Use CountAsync twice on the same filtered query — still O(1) memory",
        "Filter Status IN (Success, Failed) only — exclude Queued/Building",
        "Return null when total count is 0",
        "Optional: single query with conditional Sum in Select",
      ],
      solution: `public async Task<double?> GetSuccessRateLast30DaysAsync(
    CancellationToken cancellationToken = default)
{
    var cutoff = DateTime.UtcNow.AddDays(-30);
    var baseQuery = _dbContext.Deployments
        .AsNoTracking()
        .Where(d => d.StartedAt >= cutoff &&
            (d.Status == DeploymentStatus.Success ||
             d.Status == DeploymentStatus.Failed));

    var total = await baseQuery.CountAsync(cancellationToken);
    if (total == 0) return null;

    var success = await baseQuery
        .CountAsync(d => d.Status == DeploymentStatus.Success, cancellationToken);

    return success / (double)total;
}`,
      takeaway:
        "Dashboard metrics at scale belong in SQL aggregation — client-side Count after ToListAsync is an MVP smell that breaks with deployment history growth.",
    },
    {
      id: "ops_code_002",
      title: "DeploymentWorkflowMapper Unit Test",
      brief:
        "Write an xUnit test for DeploymentWorkflowMapper.MapWorkflowStatus — GitHub workflow conclusion maps to DeploymentStatus.Success with CompletedAt set.",
      language: "csharp",
      starter: `[Fact]
public void MapWorkflowStatus_CompletedSuccess_ReturnsSuccess()
{
    // TODO: call DeploymentWorkflowMapper.MapWorkflowStatus
    // Assert DeploymentStatus.Success and CompletedAt not null
}`,
      hints: [
        "GitHub status string is \"completed\", conclusion is \"success\"",
        "Mapper returns tuple (DeploymentStatus status, DateTime? completedAt)",
        "Use Assert.Equal for enum, Assert.NotNull for completedAt",
      ],
      solution: `[Fact]
public void MapWorkflowStatus_CompletedSuccess_ReturnsSuccess()
{
    var completedAt = DateTime.UtcNow;

    var (status, completed) = DeploymentWorkflowMapper.MapWorkflowStatus(
        "completed", "success", completedAt);

    Assert.Equal(DeploymentStatus.Success, status);
    Assert.Equal(completedAt, completed);
}

[Fact]
public void MapWorkflowStatus_CompletedFailure_ReturnsFailed()
{
    var (status, completed) = DeploymentWorkflowMapper.MapWorkflowStatus(
        "completed", "failure", DateTime.UtcNow);

    Assert.Equal(DeploymentStatus.Failed, status);
    Assert.NotNull(completed);
}`,
      takeaway:
        "DeploymentWorkflowMapper is the first test you'd add to Codist Ops — pure function, no SSH/DB, guards the GitHub→DB sync path.",
    },
  ],
};
