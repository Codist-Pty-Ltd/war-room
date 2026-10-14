import type { MasteryTrack } from "./ntokozoMastery";
import warroom from "./maemo.warroom.json";

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
  id: `maemo_${card.id}`,
  difficulty: mapDifficulty(card.difficulty),
  question: card.question,
  answer: appendCodeExample(card.answer, card.codeExample),
  followUp: card.followUps?.[0],
  tags: ["maemo", card.category],
}));

const systemDesignDrills = warroom.systemDesignTopics.map((topic, i) => ({
  id: `maemo_sd_${i + 1}`,
  difficulty: "LEAD" as const,
  question: topic.interviewQuestion,
  answer: `**Current:** ${topic.currentImplementation}\n\n**Senior insight:** ${topic.seniorInsight}`,
  tags: ["maemo", "system-design", topic.topic.toLowerCase().replace(/\s+/g, "-")],
}));

const behaviouralDrills = warroom.behaviouralAnchors.map((anchor, i) => ({
  id: `maemo_beh_${i + 1}`,
  difficulty: "SENIOR" as const,
  question: anchor.question,
  answer: `**Situation:** ${anchor.situation}\n\n**Task:** ${anchor.task}\n\n**Action:** ${anchor.action}\n\n**Result:** ${anchor.result}\n\n**Senior signal:** ${anchor.seniorSignal}`,
  tags: ["maemo", "behavioural", "star"],
}));

const dangerZoneDefinitions = warroom.dangerZones.map((zone) => ({
  term: zone.area,
  definition: zone.whatSeniorSays,
  example: `Junior trap: "${zone.whatJuniorSays}" — Risk: ${zone.risk}`,
}));

const product = warroom.product as WarroomPayload["product"];

export const MAEMO_TRACK: MasteryTrack = {
  id: "MAEMO",
  title: "Maemo Compliance (SaaS)",
  description: `${product.oneLiner} Stack: ${product.stack.slice(0, 5).join(", ")}… — ${flashcardDrills.length} flashcards from maemo-compliance audit.`,
  color: "#2563EB",
  definitions: [
    {
      term: "Maemo Compliance",
      definition: product.oneLiner,
      example: `Live on Hetzner — monolith :8090 + strangler split (identity, engine, workers, portal)`,
    },
    ...dangerZoneDefinitions,
  ],
  drills: [...flashcardDrills, ...systemDesignDrills, ...behaviouralDrills],
  codeDrills: [
    {
      id: "maemo_code_001",
      title: "ForTenant — Explicit Multi-Tenant Query",
      brief:
        "Maemo monolith removed EF global tenant filters. Implement QueryExtensions.ForTenant so every handler query on TenantOwnedEntity scopes to JWT tenant_id; Guid.Empty bypasses for admin/seeding only.",
      language: "csharp",
      starter: `public static IQueryable<T> ForTenant<T>(
    this IQueryable<T> query,
    ITenantProvider tenantProvider)
    where T : TenantOwnedEntity
{
    // TODO: read tenantId from tenantProvider
    // TODO: if Guid.Empty return unfiltered (admin only)
    // TODO: else filter Where(e => e.TenantId == tenantId)
    return query;
}`,
      hints: [
        "ITenantProvider.GetCurrentTenantId() comes from TenantMiddleware + JWT tenant_id claim",
        "Guid.Empty is intentional bypass — document why in code review",
        "Engine split uses EF global filters instead — know both patterns during migration",
        "Every new MediatR handler: grep for ForTenant before merge",
      ],
      solution: `public static IQueryable<T> ForTenant<T>(
    this IQueryable<T> query,
    ITenantProvider tenantProvider)
    where T : TenantOwnedEntity
{
    var tenantId = tenantProvider.GetCurrentTenantId();
    if (tenantId == Guid.Empty)
        return query;

    return query.Where(e => e.TenantId == tenantId);
}

// Usage in handler:
var doc = await _dbContext.Documents
    .ForTenant(_tenantProvider)
    .FirstOrDefaultAsync(d => d.Id == request.DocumentId, ct);`,
      takeaway:
        "Explicit ForTenant fails open if forgotten — senior answer pairs the extension with integration tests proving tenant B cannot read tenant A's row by PK.",
    },
    {
      id: "maemo_code_002",
      title: "TenantIsolation Integration Test",
      brief:
        "Write an integration test proving the compliance engine EF global filter hides tenant B's NCR when authenticated as tenant A (same primary key pattern as TenantIsolationTests).",
      language: "csharp",
      starter: `[Fact]
public async Task GetNcr_AsTenantA_DoesNotReturnTenantBRow()
{
    // TODO: seed NCR for tenant A and tenant B with known ids
    // TODO: authenticate fixture as tenant A
    // TODO: GET /engine/v1/ncrs/{tenantBId}
    // TODO: assert 404 Not Found (not 200 with wrong data)
}`,
      hints: [
        "Use WebApplicationFactory + Testcontainers.PostgreSql fixture pattern",
        "Same PK across tenants must still return 404 — filter hides row entirely",
        "Engine uses HttpTenantContext from JWT tenant_id claim",
        "This is the #1 test to add for every new tenant-owned endpoint",
      ],
      solution: `[Fact]
public async Task GetNcr_AsTenantA_DoesNotReturnTenantBRow()
{
    var tenantA = Guid.NewGuid();
    var tenantB = Guid.NewGuid();
    var ncrBId = Guid.NewGuid();

    await SeedNcr(tenantB, ncrBId, "Cross-tenant probe");

    var client = _factory.CreateClientWithTenant(tenantA);
    var response = await client.GetAsync($"/engine/v1/ncrs/{ncrBId}");

    Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
}

// Optional: prove tenant A CAN read own row
[Fact]
public async Task GetNcr_AsTenantA_ReturnsOwnRow()
{
    var tenantA = Guid.NewGuid();
    var ncrId = Guid.NewGuid();
    await SeedNcr(tenantA, ncrId, "Own NCR");

    var client = _factory.CreateClientWithTenant(tenantA);
    var response = await client.GetAsync($"/engine/v1/ncrs/{ncrId}");

    response.EnsureSuccessStatusCode();
}`,
      takeaway:
        "Multi-tenant SaaS interviews hinge on data-plane tests — not 'we use JWT' but 'prove cross-tenant PK lookup returns 404'.",
    },
  ],
};
