import type { MasteryTrack } from "./ntokozoMastery";
import warroom from "./engineiq.warroom.json";

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
  id: `eiq_${card.id}`,
  difficulty: mapDifficulty(card.difficulty),
  question: card.question,
  answer: appendCodeExample(card.answer, card.codeExample),
  followUp: card.followUps?.[0],
  tags: ["engineiq", card.category],
}));

const systemDesignDrills = warroom.systemDesignTopics.map((topic, i) => ({
  id: `eiq_sd_${i + 1}`,
  difficulty: "LEAD" as const,
  question: topic.interviewQuestion,
  answer: `**Current:** ${topic.currentImplementation}\n\n**Senior insight:** ${topic.seniorInsight}`,
  tags: ["engineiq", "system-design", topic.topic.toLowerCase().replace(/\s+/g, "-")],
}));

const behaviouralDrills = warroom.behaviouralAnchors.map((anchor, i) => ({
  id: `eiq_beh_${i + 1}`,
  difficulty: "SENIOR" as const,
  question: anchor.question,
  answer: `**Situation:** ${anchor.situation}\n\n**Task:** ${anchor.task}\n\n**Action:** ${anchor.action}\n\n**Result:** ${anchor.result}\n\n**Senior signal:** ${anchor.seniorSignal}`,
  tags: ["engineiq", "behavioural", "star"],
}));

const dangerZoneDefinitions = warroom.dangerZones.map((zone) => ({
  term: zone.area,
  definition: zone.whatSeniorSays,
  example: `Junior trap: "${zone.whatJuniorSays}" — Risk: ${zone.risk}`,
}));

const product = warroom.product as WarroomPayload["product"];
const servers = product.servers as string[];

export const ENGINEIQ_TRACK: MasteryTrack = {
  id: "ENGINEIQ",
  title: "EngineIQ (AI PR Review)",
  description: `${product.oneLiner} Stack: ${product.stack.slice(0, 5).join(", ")}… — ${flashcardDrills.length} flashcards from engineiq.co.za audit.`,
  color: "#8B5CF6",
  definitions: [
    {
      term: "EngineIQ",
      definition: product.oneLiner,
      example: `Live at ${servers.slice(0, 3).join(", ")} — GitHub webhook → RabbitMQ → Claude review`,
    },
    ...dangerZoneDefinitions,
  ],
  drills: [...flashcardDrills, ...systemDesignDrills, ...behaviouralDrills],
  codeDrills: [
    {
      id: "eiq_code_001",
      title: "ReviewEnqueuePolicy — ShouldEnqueue",
      brief:
        "Implement ReviewEnqueuePolicy.ShouldEnqueue: skip enqueue when review_all_pull_requests is false, or when skip_draft_pull_requests and PR is draft. Webhook deletes queued row and returns 200 when skipped.",
      language: "csharp",
      starter: `public static bool ShouldEnqueue(
    TenantPortalPreferences preferences,
    bool isDraft,
    out string? skipReason)
{
    skipReason = null;
    // TODO: check preferences.ReviewAllPullRequests
    // TODO: check preferences.SkipDraftPullRequests && isDraft
    return true;
}`,
      hints: [
        "Return false with skipReason = \"auto_review_disabled\" when review_all_pull_requests is false",
        "Return false with skipReason = \"draft_pull_request\" when skip drafts enabled and isDraft",
        "Worker re-checks preferences — webhook and worker must share same policy",
        "Extend ReviewEnqueuePolicyTests in tests/EngineIQ.Tests.Unit/",
      ],
      solution: `public static bool ShouldEnqueue(
    TenantPortalPreferences preferences,
    bool isDraft,
    out string? skipReason)
{
    skipReason = null;

    if (!preferences.ReviewAllPullRequests)
    {
        skipReason = "auto_review_disabled";
        return false;
    }

    if (preferences.SkipDraftPullRequests && isDraft)
    {
        skipReason = "draft_pull_request";
        return false;
    }

    return true;
}

[Fact]
public void ShouldEnqueue_DraftSkipped_WhenPreferenceSet()
{
    var prefs = new TenantPortalPreferences
    {
        ReviewAllPullRequests = true,
        SkipDraftPullRequests = true,
    };

    var result = ReviewEnqueuePolicy.ShouldEnqueue(prefs, isDraft: true, out var reason);

    Assert.False(result);
    Assert.Equal("draft_pull_request", reason);
}`,
      takeaway:
        "ReviewEnqueuePolicy is pure domain logic — the first unit test you'd add before touching webhook or worker paths.",
    },
    {
      id: "eiq_code_002",
      title: "Webhook Idempotency — TryCreateQueuedJobAsync",
      brief:
        "GitHub sends X-GitHub-Delivery. Implement idempotent job creation: UNIQUE (tenant_id, github_delivery_id). On duplicate, return Created=false and webhook returns 200 without re-publishing to RabbitMQ.",
      language: "csharp",
      starter: `public async Task<(bool Created, string? BlockReason)> TryCreateQueuedJobAsync(
    Guid tenantId,
    string githubDeliveryId,
    /* ... other fields ... */,
    CancellationToken ct)
{
    // TODO: reject if tenant Status == Suspended → blockReason suspended
    // TODO: INSERT pr_review_jobs with tenant_id + github_delivery_id
    // TODO: catch unique violation → return (false, null) for duplicate delivery
    // TODO: on success return (true, null)
    throw new NotImplementedException();
}`,
      hints: [
        "Unique index: HasIndex(j => new { j.TenantId, j.GithubDeliveryId }).IsUnique()",
        "Catch DbUpdateException or Postgres 23505 on duplicate",
        "WebhookController: if !Created && BlockReason == null → log duplicate, return 200 OK",
        "Staff gap: insert before Rabbit publish without outbox — know the redelivery story",
      ],
      solution: `public async Task<(bool Created, string? BlockReason)> TryCreateQueuedJobAsync(
    Guid tenantId,
    string githubDeliveryId,
    /* job fields */,
    CancellationToken ct)
{
    var tenant = await _db.Tenants.FindAsync([tenantId], ct);
    if (tenant?.Status == TenantStatus.Suspended)
        return (false, "tenant_suspended");

    var job = new PrReviewJob
    {
        TenantId = tenantId,
        GithubDeliveryId = githubDeliveryId,
        Status = JobStatus.Queued,
        // ...
    };

    _db.PrReviewJobs.Add(job);
    try
    {
        await _db.SaveChangesAsync(ct);
        return (true, null);
    }
    catch (DbUpdateException ex) when (IsUniqueViolation(ex))
    {
        return (false, null); // duplicate X-GitHub-Delivery — idempotent 200
    }
}

// WebhookController after create:
if (blockReason == "tenant_suspended")
    return StatusCode(403, new { error = "tenant_suspended" });

if (!created)
{
    _logger.LogInformation("Duplicate delivery {DeliveryId}", deliveryId);
    return Ok();
}`,
      takeaway:
        "Idempotency is the webhook contract — duplicate delivery returns 200 without double queue publish; staff follow-up is transactional outbox if publish fails after insert.",
    },
  ],
};
