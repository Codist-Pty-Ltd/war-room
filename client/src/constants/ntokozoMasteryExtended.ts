import type { MasteryTrack } from "./ntokozoMastery";

// NTOKOZO BANDA — Extended Mastery Tracks (Codist / Billable / production)

// ═══════════════════════════════════════════════════
// TRACK 7 — PAYMENTS & FINTECH (South African context)
// Paystack, FICA, POPIA, payout logic, webhook security
// ═══════════════════════════════════════════════════

export const PAYMENTS_FINTECH_TRACK = {
  id: "PAYMENTS_FINTECH",
  title: "Payments & Fintech",
  description: "Paystack internals, webhook security, payout orchestration, FICA/POPIA compliance, fraud detection. This is where Billable and Send a Coldrink live.",
  color: "#10B981",
  drills: [
    {
      id: "pf_001",
      difficulty: "SENIOR",
      question: "You are processing a Paystack webhook. What is the first thing your handler must do before any business logic, and why?",
      answer: "Validate the HMAC-SHA512 signature using X-Paystack-Signature header against your webhook secret key. Use CryptographicOperations.FixedTimeEquals — never string equality — to prevent timing attacks. If the signature is invalid, return 401 immediately without logging the body (it may be a probe).\n\nReason: Anyone on the internet can POST to your webhook endpoint. Without signature validation, an attacker can fake a charge.success event and credit a creator's balance without paying.",
      followUp: "After HMAC validation, what is the second security check before crediting a balance?",
      followUpAnswer: "Idempotency check. Store the Paystack event ID in a processed_webhook_events table with a UNIQUE constraint. Before processing, check if that event ID exists. If it does, return 200 immediately without crediting. This prevents double-crediting if Paystack retries the webhook (which it does on non-200 responses) or if an attacker replays a captured valid webhook.",
      tags: ["paystack", "security", "webhooks", "billable"]
    },
    {
      id: "pf_002",
      difficulty: "SENIOR",
      question: "A creator on Billable has R450 in available balance but your payout job skips them. Walk me through all the eligibility checks that could block a payout.",
      answer: "In order:\n1. **Minimum balance** — R50 minimum (5000 cents). R450 passes.\n2. **FICA compliance** — fica_compliant must be true. Bank account must be verified via Paystack resolve API. If not verified, blocked.\n3. **Active fraud flag** — any active fraud_flag on the account blocks payout until admin review.\n4. **New account hold** — first payout requires 7 days account age. If created_at < 7 days ago and payout_count == 0, blocked.\n5. **Bank account change hold** — if bank_account_changed_at within last 7 days, payout_hold_until is set. Blocked until that date.\n6. **Global kill switch** — feature flag payouts.enabled must be true. If an admin suspended all payouts, blocked.\n7. **Paystack recipient validity** — verify the stored recipient_code is still valid via Paystack API before initiating transfer.",
      followUp: "Why do you hold payouts for 7 days after a bank account change?",
      followUpAnswer: "Chargebacks typically arrive within 3–5 business days. If an attacker compromises a creator account, changes the bank account, and triggers a payout — the 7-day hold means the chargeback arrives before the money leaves. The fraud is caught before it costs the platform money. Without the hold, the money is gone before the bank can reverse the transaction.",
      tags: ["paystack", "payouts", "fraud", "billable", "security"]
    },
    {
      id: "pf_003",
      difficulty: "LEAD",
      question: "Explain how you would design bi-weekly payouts with a fraud buffer. What is the relationship between payout schedule and chargeback timing?",
      answer: "Bi-weekly schedule (1st and 15th of month) creates a maximum 14-day window between tip receipt and payout. Chargebacks typically arrive in 3–5 business days.\n\n**The buffer:**\nDay 1: Attacker sends stolen card tips to their creator account\nDay 3–5: Real cardholder notices fraud, chargeback filed\nDay 3–5: Paystack notifies platform of chargeback\nDay 3–5: Fraud flag set, payout blocked\nDay 15: Payout cycle runs — creator is flagged, payout skipped\n\n**Without bi-weekly (daily payouts):**\nDay 1: Attacker tips their account\nDay 1 evening: Payout requested and processed\nDay 3: Chargeback arrives — money already gone, platform eats the loss\n\n**Implementation:** Payout job runs at 00:01 SAST on 1st and 15th. Acquires Redis distributed lock before running (prevents duplicate runs). Processes creators in batches of 10. One failure does not stop others (try-catch per creator). Sends admin alert if failure rate > 5%.",
      tags: ["payouts", "fraud", "architecture", "send-a-coldrink", "billable"]
    },
    {
      id: "pf_004",
      difficulty: "SENIOR",
      question: "What is FICA and what does it require Send a Coldrink to do before paying out to a creator?",
      answer: "FICA — Financial Intelligence Centre Act (Act 38 of 2001) — is South Africa's anti-money laundering legislation. It requires businesses that facilitate money transfers to:\n\n1. **Identify parties** — verify the identity of anyone receiving money\n2. **Keep records** — transaction records for minimum 5 years\n3. **Report suspicious transactions** — Suspicious Transaction Reports (STRs) to the FIC when patterns suggest money laundering\n4. **Threshold reporting** — cash transactions above R24,999 must be reported automatically\n\n**For Send a Coldrink specifically:**\n- Creator must provide SA ID number (hashed SHA-256 — never stored plaintext)\n- Bank account must be verified via Paystack resolve API\n- fica_compliant flag must be true before any payout\n- All transaction records retained for 5 years\n- Structuring detection: flag when many small tips arrive from same BIN/IP (below threshold amounts to avoid detection)",
      tags: ["fica", "compliance", "south-africa", "send-a-coldrink", "legal"]
    },
    {
      id: "pf_005",
      difficulty: "LEAD",
      question: "Walk me through the complete fee calculation for a R50 tip on Send a Coldrink for a free-tier creator. Show the math.",
      answer: "**Paystack fee:** 2.95% + R1.00\n= (50 × 0.0295) + 1.00\n= R1.475 + R1.00\n= R2.475 → round to R2.48\n\n**Platform fee (free tier):** 5%\n= 50 × 0.05\n= R2.50\n\n**Creator receives:**\n= R50 - R2.48 - R2.50\n= R45.02\n\n**Stored as cents in DB:**\nAmount: 5000\nPaystack fee: 248\nPlatform fee: 250\nNet: 4502\n\n**Code:**\n```csharp\nvar amountCents = 5000;\nvar paystackFeeCents = (int)Math.Round(amountCents * 0.0295 + 100);\nvar platformFeeCents = creator.Plan == Plan.Pro ? 0 : (int)Math.Round(amountCents * 0.05);\nvar netCents = amountCents - paystackFeeCents - platformFeeCents;\n```\n\n**Pro tier break-even:** Creator saving 5% of tips. R99 ÷ 0.05 = R1,980/month in tips to break even.",
      tags: ["paystack", "fees", "business-logic", "send-a-coldrink"]
    },
    {
      id: "pf_006",
      difficulty: "PRINCIPAL",
      question: "You are designing the Africa expansion for Send a Coldrink. How do you architect a payment provider abstraction that supports Paystack (SA), M-Pesa (Kenya), EcoCash (Zimbabwe), and MTN MoMo (Ghana/Zambia) without changing core business logic?",
      answer: "**Interface abstraction:**\n```csharp\npublic interface IPayoutProvider\n{\n    string CountryCode { get; }\n    Task<PayoutResult> SendAsync(PayoutRequest request);\n    Task<PayoutStatus> GetStatusAsync(string reference);\n}\n```\n\n**Provider implementations:** PaystackProvider, MPesaProvider (Daraja API), EcoCashProvider (Paynow API), MtnMomoProvider.\n\n**Factory pattern + feature flags:**\n```csharp\npublic class PayoutProviderFactory\n{\n    public IPayoutProvider GetProvider(string countryCode)\n    {\n        if (!_featureFlags.IsEnabled($\"africa.{countryCode.ToLower()}\"))\n            throw new FeatureNotAvailableException();\n        return _providers.FirstOrDefault(p => p.CountryCode == countryCode)\n            ?? throw new UnsupportedCountryException(countryCode);\n    }\n}\n```\n\n**Key design decisions:**\n1. Feature flags gate every country — deploy code before activating\n2. Separate repo (sac-africa) — Africa payment keys isolated from SA payment keys\n3. All amounts in local currency with ZAR equivalent stored\n4. Single `africa.creator_payouts_africa` table regardless of provider\n5. Mobile number encrypted at rest — only decrypted at provider call time\n6. Webhook URLs per provider registered separately",
      tags: ["architecture", "africa", "payments", "abstractions", "send-a-coldrink"]
    }
  ],
  codeDrills: [
    {
      id: "pf_code_001",
      title: "Paystack Webhook HMAC Validation",
      brief: "Write a .NET 8 Paystack webhook validator. It must: (1) validate HMAC-SHA512 using fixed-time comparison, (2) check event timestamp is less than 5 minutes old, (3) check idempotency using a DB lookup, (4) return 200 for duplicates without processing.",
      language: "csharp",
      starter: `[HttpPost("/api/webhooks/paystack")]
[AllowAnonymous]
public async Task<IActionResult> HandleWebhook(
    CancellationToken ct)
{
    // TODO: Read raw body
    // TODO: Validate HMAC-SHA512 signature
    // TODO: Parse payload
    // TODO: Validate timestamp (reject if > 5 minutes old)
    // TODO: Check idempotency (return 200 if already processed)
    // TODO: Record event and process
    return Ok();
}`,
      hints: [
        "Read the raw body with HttpContext.Request.Body — do NOT use [FromBody] as it changes the byte stream",
        "Use HMACSHA512 class with Convert.FromHexString for the expected hash",
        "Use CryptographicOperations.FixedTimeEquals — never == or string.Equals for HMAC comparison",
        "Paystack puts created_at in Unix timestamp format in the payload",
        "Catch DbUpdateException on the idempotency insert — unique constraint violation means duplicate"
      ],
      solution: `[HttpPost("/api/webhooks/paystack")]
[AllowAnonymous]
public async Task<IActionResult> HandleWebhook(CancellationToken ct)
{
    // 1. Read raw body — must be raw bytes for HMAC
    using var reader = new StreamReader(Request.Body);
    var rawBody = await reader.ReadToEndAsync(ct);
    var bodyBytes = Encoding.UTF8.GetBytes(rawBody);

    // 2. Validate HMAC-SHA512
    var signature = Request.Headers["X-Paystack-Signature"].ToString();
    var secret = _config["Paystack:WebhookSecret"]!;
    var secretBytes = Encoding.UTF8.GetBytes(secret);

    using var hmac = new HMACSHA512(secretBytes);
    var expectedBytes = hmac.ComputeHash(bodyBytes);
    var expectedHex = Convert.ToHexString(expectedBytes).ToLower();

    // Fixed-time comparison — prevents timing attacks
    var signatureBytes = Convert.FromHexString(signature);
    if (!CryptographicOperations.FixedTimeEquals(
        signatureBytes, expectedBytes))
    {
        _logger.LogWarning("Invalid Paystack webhook signature");
        return Unauthorized();
    }

    // 3. Parse payload
    var payload = JsonDocument.Parse(rawBody).RootElement;
    var eventId = payload.GetProperty("id").GetString()!;
    var eventType = payload.GetProperty("event").GetString()!;

    // 4. Validate timestamp (reject stale events)
    var createdAt = DateTimeOffset.FromUnixTimeSeconds(
        payload.GetProperty("createdAt").GetInt64());
    if (DateTimeOffset.UtcNow - createdAt > TimeSpan.FromMinutes(5))
    {
        _logger.LogWarning("Stale webhook rejected. Age: {Age}", 
            DateTimeOffset.UtcNow - createdAt);
        return Ok(); // 200 stops Paystack retrying
    }

    // 5. Idempotency check — record BEFORE processing
    try
    {
        await _db.ProcessedWebhookEvents.AddAsync(new ProcessedWebhookEvent
        {
            PaystackEventId = eventId,
            EventType = eventType,
            ProcessedAt = DateTimeOffset.UtcNow
        }, ct);
        await _db.SaveChangesAsync(ct);
    }
    catch (DbUpdateException)
    {
        // Unique constraint = already processed (duplicate or race)
        _logger.LogInformation("Duplicate webhook ignored: {Id}", eventId);
        return Ok();
    }

    // 6. Process event
    await _mediator.Send(new ProcessPaystackEventCommand(payload), ct);
    return Ok();
}`,
      takeaway: "Three layers of webhook security: HMAC (is this from Paystack?), timestamp (is this fresh?), idempotency (have we processed this exact event before?). All three are required. Missing any one creates a specific exploitable vulnerability."
    },
    {
      id: "pf_code_002",
      title: "Feature-Flagged Payment Provider Factory",
      brief: "Build a payment provider factory that selects the correct Africa payout provider based on country code, checks a feature flag before returning any provider, and throws specific typed exceptions for unsupported/disabled countries.",
      language: "csharp",
      starter: `public interface IAfricaPayoutProvider
{
    string CountryCode { get; }
    Task<AfricaPayoutResult> SendAsync(AfricaPayoutRequest request, CancellationToken ct);
}

public class AfricaPayoutProviderFactory
{
    // TODO: Constructor with IEnumerable<IAfricaPayoutProvider> and IFeatureFlagService
    // TODO: GetProvider(string countryCode) method
    //   - Check feature flag: africa.{countryCode.ToLower()}
    //   - Return matching provider
    //   - Throw typed exceptions for disabled/not found
}`,
      hints: [
        "Inject IEnumerable<IAfricaPayoutProvider> — DI container resolves all implementations",
        "Feature flag key format: africa.ke for Kenya, africa.zw for Zimbabwe",
        "Two distinct exceptions: FeatureNotAvailableException vs UnsupportedCountryException",
        "Country codes should be normalised to uppercase before matching"
      ],
      solution: `public class AfricaPayoutProviderFactory
{
    private readonly IReadOnlyDictionary<string, IAfricaPayoutProvider> _providers;
    private readonly IFeatureFlagService _flags;
    private readonly ILogger<AfricaPayoutProviderFactory> _logger;

    public AfricaPayoutProviderFactory(
        IEnumerable<IAfricaPayoutProvider> providers,
        IFeatureFlagService flags,
        ILogger<AfricaPayoutProviderFactory> logger)
    {
        _providers = providers.ToDictionary(
            p => p.CountryCode.ToUpperInvariant(), 
            StringComparer.OrdinalIgnoreCase);
        _flags = flags;
        _logger = logger;
    }

    public async Task<IAfricaPayoutProvider> GetProviderAsync(
        string countryCode, CancellationToken ct = default)
    {
        var normalised = countryCode.ToUpperInvariant();
        var flagKey = $"africa.{countryCode.ToLowerInvariant()}";

        // Check feature flag first
        var isEnabled = await _flags.IsEnabledAsync(flagKey, ct);
        if (!isEnabled)
        {
            _logger.LogInformation(
                "Africa payout not yet active for {Country}", normalised);
            throw new FeatureNotAvailableException(
                $"Payouts not yet available for {normalised}. " +
                $"Check back soon — we are rolling out country by country.");
        }

        // Find the provider
        if (!_providers.TryGetValue(normalised, out var provider))
        {
            _logger.LogWarning("No provider registered for {Country}", normalised);
            throw new UnsupportedCountryException(
                $"No payment provider configured for {normalised}");
        }

        return provider;
    }
}

// Registration in Program.cs
builder.Services.AddScoped<IAfricaPayoutProvider, MPesaProvider>();
builder.Services.AddScoped<IAfricaPayoutProvider, EcoCashProvider>();
builder.Services.AddScoped<IAfricaPayoutProvider, MtnMomoProvider>();
builder.Services.AddScoped<AfricaPayoutProviderFactory>();`,
      takeaway: "Inject IEnumerable<IInterface> to get all implementations — DI container resolves them all. Convert to dictionary for O(1) lookup. Feature flag check before provider lookup means the provider code never runs for inactive countries, even if the route is somehow reached."
    }
  ],
  definitions: [
    { term: "FICA", definition: "Financial Intelligence Centre Act (Act 38 of 2001). SA's AML/KYC legislation. Requires identity verification, 5-year record retention, suspicious transaction reporting to the FIC, and threshold reporting above R24,999." },
    { term: "POPIA", definition: "Protection of Personal Information Act (Act 4 of 2013). SA's data protection law. Equivalent to GDPR. Requires consent, data minimisation, breach notification within 72 hours to Information Regulator, and rights to access/deletion." },
    { term: "HMAC-SHA512", definition: "Hash-based Message Authentication Code using SHA-512. Used by Paystack to sign webhooks. Both sender and receiver know the secret. Attacker cannot forge the signature without the secret. Always use fixed-time comparison to prevent timing attacks." },
    { term: "Idempotency key", definition: "A unique identifier attached to a request that allows the server to safely retry operations. If the same key is seen twice, the server returns the same response without executing the operation again. Critical for webhooks and payment APIs." },
    { term: "Chargeback", definition: "A forced reversal of a payment initiated by the cardholder's bank, not the merchant. Typically arrives 3-5 business days after the transaction. The platform receives the funds back but has already potentially paid out. A bi-weekly payout schedule creates a buffer for chargebacks to arrive before payouts run." },
    { term: "Paystack Transfer API", definition: "Paystack's API for sending money to bank accounts (B2C). Requires a pre-registered recipient_code (created via /transferrecipient). Transfer initiated via /transfer. Status confirmed via transfer.success webhook. Used for all creator payouts in Billable and Send a Coldrink." },
    { term: "NUBAN", definition: "Nigeria Uniform Bank Account Number. Standard bank account format used across SA and West African banking. Required format when creating Paystack transfer recipients. 8-11 digits depending on bank." },
    { term: "3D Secure (3DS)", definition: "An authentication protocol for online card payments. Requires the cardholder to verify their identity (usually via OTP) before the transaction completes. Significantly reduces fraudulent card-not-present transactions. Configurable in Paystack settings." },
    { term: "BIN (Bank Identification Number)", definition: "First 6 digits of a card number. Identifies the issuing bank, card type, and country. Paystack returns the BIN on charge.success events. Used in fraud detection — many tips from many different BINs in a short period is a fraud signal." },
    { term: "Structuring", definition: "The practice of making multiple transactions below reporting thresholds to avoid detection. e.g. sending R999 many times instead of R25,000 once. FICA requires monitoring for structuring patterns and reporting to the FIC." }
  ]
} as MasteryTrack;

// ═══════════════════════════════════════════════════
// TRACK 8 — MULTI-TENANT SAAS ARCHITECTURE
// Codist builds multi-tenant products — Billable, Maemo, EngineIQ
// ═══════════════════════════════════════════════════

export const MULTI_TENANT_TRACK = {
  id: "MULTI_TENANT",
  title: "Multi-Tenant SaaS Architecture",
  description: "Tenant isolation, global query filters, schema separation, data leakage prevention, onboarding flows. This is the core of Billable, Maemo Compliance, and EngineIQ.",
  color: "#6366F1",
  drills: [
    {
      id: "mt_001",
      difficulty: "SENIOR",
      question: "You are building Billable — a multi-tenant SaaS where each Org must never see another Org's data. What is the simplest EF Core mechanism to enforce this at the database query level?",
      answer: "**EF Core Global Query Filters.** Applied in OnModelCreating, they add a WHERE clause automatically to every query for that entity.\n\n```csharp\nmodelBuilder.Entity<Invoice>().HasQueryFilter(\n    i => i.OrgId == _currentOrgId);\n```\n\nWhere `_currentOrgId` comes from a scoped `ICurrentOrgContext` service that reads the JWT claim.\n\n**Why this works:** The filter applies to every LINQ query — you cannot accidentally forget a WHERE clause. Even `_db.Invoices.ToListAsync()` becomes `SELECT * FROM Invoices WHERE OrgId = @orgId`.\n\n**Critical:** Disable with `IgnoreQueryFilters()` ONLY for admin queries that genuinely need cross-tenant access. Never use in user-facing endpoints.",
      followUp: "What is the risk if you use AsNoTracking() with global query filters?",
      followUpAnswer: "AsNoTracking() does NOT bypass global query filters. The filters still apply. The risk is different: AsNoTracking() means EF Core does not track the entity for change detection. If you modify it and SaveChanges(), nothing happens. This can cause silent data loss bugs. Use it only for read-only queries where you explicitly do not intend to save changes.",
      tags: ["ef-core", "multi-tenant", "billable", "security", "architecture"]
    },
    {
      id: "mt_002",
      difficulty: "LEAD",
      question: "In Maemo Compliance, the old monolith had a TenantQueryInterceptor that was never registered. What real-world consequences would this have, and how do you write an integration test that would catch this?",
      answer: "**Consequences:** Every database query runs without a tenant filter. Any authenticated user from any tenant can see any other tenant's compliance data — documents, NCRs, risks, audits. This is a critical data breach. In a GRC platform handling ISO compliance, this exposes client confidential compliance posture.\n\n**The integration test that catches it:**\n```csharp\n[Fact]\npublic async Task TenantA_CannotSeeOrModify_TenantBData()\n{\n    // Create two tenants\n    var tenantA = await CreateTenantAsync(\"Tenant A\");\n    var tenantB = await CreateTenantAsync(\"Tenant B\");\n\n    // Tenant B creates a document\n    var docId = await CreateDocumentAs(tenantB, \"Confidential Policy\");\n\n    // Tenant A tries to read all documents\n    var tokenA = await LoginAs(tenantA);\n    var response = await _client.GetAsync(\"/api/documents\",\n        bearer: tokenA);\n    var docs = await response.ReadAs<List<DocumentDto>>();\n\n    // MUST NOT contain Tenant B's document\n    docs.Should().NotContain(d => d.Id == docId);\n\n    // Tenant A tries to read Tenant B's document directly\n    var directResponse = await _client.GetAsync(\n        $\"/api/documents/{docId}\", bearer: tokenA);\n    directResponse.StatusCode.Should().Be(HttpStatusCode.NotFound);\n    // NotFound, not Forbidden — we don't reveal the document exists\n}\n```",
      tags: ["multi-tenant", "security", "maemo", "testing", "ef-core"]
    },
    {
      id: "mt_003",
      difficulty: "LEAD",
      question: "Explain the three approaches to multi-tenancy at the database level. Which did Codist choose for Billable and why?",
      answer: "**Approach 1 — Shared database, shared schema (discriminator column)**\nAll tenants in same tables. TenantId column on every row. Global query filters enforce isolation.\n✅ Simple, cheap, easy to query across tenants for analytics\n❌ Single breach exposes all tenants. Noisy neighbour problems.\n\n**Approach 2 — Shared database, separate schemas**\nOne database, one schema per tenant: `tenant_abc.invoices`, `tenant_xyz.invoices`.\n✅ Schema-level isolation. Easier to export one tenant's data.\n❌ Schema migrations are complex (must run per tenant). 1000 tenants = 1000 schema migrations.\n\n**Approach 3 — Separate database per tenant**\nFully isolated. One PostgreSQL database per tenant.\n✅ Maximum isolation. Easy backup/restore per tenant.\n❌ Extremely expensive. Connection pool exhaustion. Migration management nightmare.\n\n**Codist's choice for Billable: Approach 1 — shared schema with global query filters.**\nReason: Billable is an SME SaaS with potentially hundreds of small orgs. The cost of separate databases is prohibitive. EF Core global query filters provide reliable isolation. The risk is managed through rigorous testing (the tenant isolation integration test must pass before every deploy) and the admin panel never uses the filtered DbContext.",
      tags: ["architecture", "multi-tenant", "database", "billable"]
    },
    {
      id: "mt_004",
      difficulty: "PRINCIPAL",
      question: "EngineIQ has a tenant with 500 repositories. Their PR review jobs are flooding the RabbitMQ queue and slowing down reviews for all other tenants. How do you solve this without breaking the single-queue architecture?",
      answer: "**Option 1: Per-tenant priority queues**\nIntroduce queue priority based on tenant plan:\n- Enterprise tenants: high-priority queue\n- Growth tenants: normal queue\n- Free tenants: low-priority queue\nRabbitMQ supports priority natively (x-max-priority argument). Workers consume higher-priority messages first.\n\n**Option 2: Token bucket rate limiting per tenant**\nBefore publishing to queue, check a Redis token bucket per tenant:\n```csharp\nvar bucket = await _redis.GetAsync($\"rate:{tenantId}\");\nif (bucket.TokensRemaining <= 0)\n    throw new TenantRateLimitException(bucket.TimeUntilAvailable);\n```\nReturn 429 to GitHub webhook. GitHub will retry — this naturally smooths the burst.\n\n**Option 3: Tenant-partitioned queues**\nEach tenant gets their own queue: `pr.review.tenant.{tenantId}`. Workers round-robin across tenant queues rather than processing from a single queue. Large tenant cannot starve small tenant.\n\n**Codist recommendation for EngineIQ:** Start with Option 2 (rate limiting) as it is the simplest to add. When enterprise tenants exist, add Option 1 (priority). Option 3 only if queue count becomes operationally complex.",
      tags: ["rabbitmq", "engineiq", "multi-tenant", "rate-limiting", "architecture"]
    }
  ],
  codeDrills: [
    {
      id: "mt_code_001",
      title: "Scoped Tenant Context with EF Core Global Query Filter",
      brief: "Build a complete multi-tenant setup: ICurrentTenantContext (scoped, reads from JWT), a global query filter that uses it, and a middleware that populates it. Must handle: unauthenticated requests gracefully, admin bypass, and fail-fast if the filter is misconfigured.",
      language: "csharp",
      starter: `// TODO: Build these three components:

// 1. ICurrentTenantContext — scoped service
// 2. TenantContextMiddleware — reads JWT, sets context
// 3. BillableDbContext — global query filter using the context

// Usage should be:
// app.UseMiddleware<TenantContextMiddleware>(); // before UseAuthorization
// _db.Invoices.ToListAsync() // automatically filtered by current tenant`,
      hints: [
        "ICurrentTenantContext must be scoped (not singleton) — different per request",
        "Read OrgId from JWT claim 'org_id' or similar in the middleware",
        "Global query filter lambda must capture the service, not the value — values are set at model creation time",
        "Use Guid.Empty or null as sentinel for 'no tenant' (unauthenticated or admin)",
        "Admin controller should inject DbContext and call .IgnoreQueryFilters() explicitly"
      ],
      solution: `// 1. Current tenant context
public interface ICurrentTenantContext
{
    Guid? OrgId { get; set; }
    bool IsAdmin { get; set; }
}

public class CurrentTenantContext : ICurrentTenantContext
{
    public Guid? OrgId { get; set; }
    public bool IsAdmin { get; set; }
}

// Register as scoped:
// builder.Services.AddScoped<ICurrentTenantContext, CurrentTenantContext>();

// 2. Middleware
public class TenantContextMiddleware(
    RequestDelegate next,
    IServiceScopeFactory scopeFactory)
{
    public async Task InvokeAsync(HttpContext context)
    {
        if (context.User.Identity?.IsAuthenticated == true)
        {
            var tenantCtx = context.RequestServices
                .GetRequiredService<ICurrentTenantContext>();

            var orgIdClaim = context.User.FindFirst("org_id")?.Value;
            if (Guid.TryParse(orgIdClaim, out var orgId))
                tenantCtx.OrgId = orgId;

            tenantCtx.IsAdmin = context.User.IsInRole("admin");
        }

        await next(context);
    }
}

// 3. DbContext with global query filter
public class BillableDbContext(
    DbContextOptions<BillableDbContext> options,
    ICurrentTenantContext tenantContext)
    : DbContext(options)
{
    public DbSet<Invoice> Invoices => Set<Invoice>();
    public DbSet<Client> Clients => Set<Client>();
    public DbSet<Quote> Quotes => Set<Quote>();

    protected override void OnModelCreating(ModelBuilder mb)
    {
        // Critical: capture the SERVICE, not the value
        // Lambda re-evaluates on each query → gets current request's OrgId
        mb.Entity<Invoice>().HasQueryFilter(
            i => tenantContext.IsAdmin ||
                 (tenantContext.OrgId != null &&
                  i.OrgId == tenantContext.OrgId.Value));

        mb.Entity<Client>().HasQueryFilter(
            c => tenantContext.IsAdmin ||
                 (tenantContext.OrgId != null &&
                  c.OrgId == tenantContext.OrgId.Value));

        mb.Entity<Quote>().HasQueryFilter(
            q => tenantContext.IsAdmin ||
                 (tenantContext.OrgId != null &&
                  q.OrgId == tenantContext.OrgId.Value));
    }
}

// Admin usage (cross-tenant query):
// var allInvoices = await _db.Invoices.IgnoreQueryFilters().ToListAsync();`,
      takeaway: "The global query filter lambda must capture the service reference, not the value. If you write `i => i.OrgId == tenantContext.OrgId` where tenantContext is the object, it re-evaluates OrgId on every query. If you write `var orgId = tenantContext.OrgId; i => i.OrgId == orgId`, it captures the value at model creation time — which is Guid.Empty and never changes. The service reference approach is correct."
    }
  ],
  definitions: [
    { term: "Global Query Filter (EF Core)", definition: "A LINQ predicate applied automatically to all queries for an entity type. Defined in OnModelCreating. Cannot be accidentally omitted. Used in Codist for multi-tenancy (OrgId filter) and soft deletes (IsDeleted filter). Bypassed with .IgnoreQueryFilters() for admin operations." },
    { term: "Tenant isolation", definition: "The guarantee that one tenant's data is inaccessible to another tenant. In shared-schema SaaS, enforced via: (1) OrgId column on every entity, (2) Global query filters in EF Core, (3) Integration tests that specifically verify cross-tenant access is blocked." },
    { term: "Noisy neighbour problem", definition: "In shared infrastructure, one tenant's high usage degrades performance for all other tenants. In shared-queue architectures: one tenant with 500 repos can flood the queue. Solutions: rate limiting per tenant, priority queues, tenant-partitioned queues." },
    { term: "Row-level security (RLS)", definition: "Database-native tenant isolation enforced by PostgreSQL itself, not the application. Policies defined in SQL prevent queries from accessing rows belonging to other tenants, even if the application ORM sends the wrong query. More secure than application-level filtering but more complex to manage." },
    { term: "Scoped service lifetime", definition: "A DI lifetime where a new instance is created per HTTP request and shared within that request. Used for DbContext, ICurrentTenantContext. Cannot depend on singletons that have per-request state. If injected into a singleton — captive dependency bug." }
  ]
} as MasteryTrack;

// ═══════════════════════════════════════════════════
// TRACK 9 — DOCKER & PRODUCTION OPERATIONS
// Real production war stories from Codist's Hetzner servers
// ═══════════════════════════════════════════════════

export const DOCKER_OPS_TRACK = {
  id: "DOCKER_OPS",
  title: "Docker & Production Operations",
  description: "Real production scenarios from Codist's Hetzner servers. Data protection keys, .env reloading, CORS debugging, container networking, disk space, deployment failures. Senior engineers know this by feel.",
  color: "#F59E0B",
  drills: [
    {
      id: "do_001",
      difficulty: "SENIOR",
      question: "Every time you restart the Billable API container, users are logged out. You didn't change any code. What is the root cause and how do you fix it?",
      answer: "**Root cause:** ASP.NET Core Data Protection keys are being generated fresh on every container start and stored in memory (not persisted). JWTs and auth cookies signed with the old keys become invalid when new keys are generated.\n\n**Diagnosis:**\n```\nWARN: No XML encryptor configured. Key {guid} may be persisted\nin unencrypted form.\n```\nThis log message confirms the issue.\n\n**Fix — two parts:**\n\n1. Mount a volume for the keys:\n```bash\ndocker run -d \\\n  --name billable-api \\\n  -v /home/billable/billable/dataprotection-keys:/root/.aspnet/DataProtection-Keys \\\n  --env-file .env \\\n  ghcr.io/ntokyb/billable-api:latest\n```\n\n2. Configure the API to use that path:\n```csharp\nvar keysPath = builder.Configuration[\"DataProtection__KeysPath\"];\nif (!string.IsNullOrEmpty(keysPath))\n{\n    builder.Services.AddDataProtection()\n        .PersistKeysToFileSystem(new DirectoryInfo(keysPath))\n        .SetApplicationName(\"Billable\");\n}\n```\n\nNow keys survive container restarts. Users stay logged in.",
      followUp: "Why does `docker restart billable-api` not fix this, even after you set the correct DataProtection__KeysPath in the .env file?",
      followUpAnswer: "`docker restart` does NOT reload the .env file. It restarts the container with the same configuration it was originally started with. The .env file is read once — at `docker run` time. To apply .env changes you must: `docker stop` → `docker rm` → `docker run` with `--env-file`. This is one of the most common production mistakes with Docker.",
      tags: ["docker", "data-protection", "sessions", "billable", "production"]
    },
    {
      id: "do_002",
      difficulty: "SENIOR",
      question: "Your docker compose up fails with 'invalid reference format'. You just added GITHUB_OWNER to the compose file. What happened and how do you debug it?",
      answer: "**What happened:** The `${GITHUB_OWNER}` variable in docker-compose.yml is not being substituted. Docker Compose reads the .env file automatically from the same directory, but:\n1. The .env file has the line commented out: `#GITHUB_OWNER=ntokyb`\n2. OR you are running compose from a different directory\n3. OR the .env file has encoding issues (Windows CRLF)\n\n**Debug steps:**\n```bash\n# 1. Check if variable is in .env\ngrep 'GITHUB_OWNER' .env\n\n# 2. Check if it is commented out\ngrep 'GITHUB_OWNER' .env | grep -v '^#'\n\n# 3. Pass .env explicitly\ndocker compose -f docker-compose.prod.yml --env-file .env up -d\n\n# 4. See what Docker Compose resolves\ndocker compose config | grep image\n```\n\n**Better fix:** Hardcode the org name in compose:\n```yaml\nimage: ghcr.io/ntokyb/billable-api:latest  # not ${GITHUB_OWNER}\n```\nThe org name never changes. Variables are for secrets, not constants.",
      tags: ["docker", "compose", "debugging", "production", "billable"]
    },
    {
      id: "do_003",
      difficulty: "LEAD",
      question: "therecord.co.za shows a 502 Bad Gateway. Walk me through your complete systematic debugging process from SSH access to resolution.",
      answer: "**Step 1: SSH in**\n```bash\nssh root@162.55.188.252\n```\n\n**Step 2: Is nginx running?**\n```bash\nsystemctl status nginx\n```\nIf not: `systemctl start nginx`. 502 only appears if nginx IS running, so nginx is likely fine.\n\n**Step 3: Are containers running?**\n```bash\ndocker ps | grep therecord\n```\nIf therecord-web is missing: that is your 502. Start it.\n\n**Step 4: Check why it stopped**\n```bash\ndocker ps -a | grep therecord\n# Check exit code in STATUS column\ndocker logs therecord-web --tail 50\n```\n\n**Step 5: Is the port listening?**\n```bash\nss -tlnp | grep 3090\n```\nIf empty: container is running but not listening on port. Check startup errors.\n\n**Step 6: Test internal connection**\n```bash\ncurl -s http://localhost:3090 | head -5\n```\n\n**Step 7: Check disk space (common cause)**\n```bash\ndf -h\n```\nFull disk stops containers from writing logs → crash.\n\n**Step 8: Restart properly**\n```bash\ncd /opt/therecord/app\ndocker compose down && docker compose up -d\nsleep 30\ncurl -sI https://therecord.co.za | head -3\n```",
      tags: ["docker", "nginx", "debugging", "therecord", "production"]
    },
    {
      id: "do_004",
      difficulty: "LEAD",
      question: "You deploy a new Billable API image via CI. After deployment, EF Core throws 'column X does not exist'. The migration is in the history table. What went wrong and how do you prevent it?",
      answer: "**What went wrong:** The migration was executed in a different database than the one the API is connecting to. The `__EFMigrationsHistory` table shows the migration ran — but the columns don't exist. This happens when:\n1. The migration ran against a fresh temporary database in CI (not the real production DB)\n2. The migration command connected to localhost inside a container that has no external DB\n3. The connection string during migration was wrong (different DB name)\n\n**This exact bug happened with AddQuoteDepositFields on Billable.**\n\n**Immediate fix:** Apply the migration manually via ALTER TABLE:\n```sql\nALTER TABLE \"Quotes\"\n  ADD COLUMN IF NOT EXISTS \"DepositFixedAmount\" numeric(18,2) NULL,\n  ADD COLUMN IF NOT EXISTS \"DepositPercentage\" numeric(5,2) NULL,\n  ADD COLUMN IF NOT EXISTS \"DepositType\" integer NULL;\n```\n\n**Prevention — auto-migrate on startup:**\n```csharp\nusing var scope = app.Services.CreateScope();\nvar db = scope.ServiceProvider.GetRequiredService<BillableDbContext>();\ndb.Database.Migrate(); // applies pending migrations on startup\n```\n\nIf startup migration fails → app fails to start → deployment fails → you know immediately.",
      tags: ["ef-core", "migrations", "production", "billable", "ci-cd"]
    }
  ],
  codeDrills: [],
  definitions: [
    { term: "docker restart vs docker rm + docker run", definition: "docker restart restarts a container with the SAME configuration it was originally started with. It does NOT reload the .env file. docker rm removes the container. docker run creates a fresh container reading --env-file at start time. Any .env change requires: stop → rm → run." },
    { term: "Data Protection keys (ASP.NET Core)", definition: "Cryptographic keys used to protect sensitive data: JWT signing, cookie encryption, anti-forgery tokens. Generated on startup. If not persisted, new keys are generated on every container restart, invalidating all existing sessions and tokens. Fix: mount a volume and call PersistKeysToFileSystem()." },
    { term: "502 Bad Gateway", definition: "nginx is running but cannot reach the upstream application. Causes: application container is stopped, container is not on the correct Docker network, application port is not listening, upstream URL in nginx config is wrong." },
    { term: "504 Gateway Timeout", definition: "nginx reached the upstream application but it did not respond within the timeout. Causes: application is overloaded, slow database query, application is deadlocked, proxy_read_timeout is too low. Different from 502 — the port is open but the app is not responding." },
    { term: "Docker network", definition: "An isolated virtual network connecting Docker containers. Containers on the same network can reach each other by container name (DNS). The API container must be on the same network as the postgres container. Creating the network: docker network create billable-network." }
  ]
} as MasteryTrack;

// ═══════════════════════════════════════════════════
// TRACK 10 — SOUTH AFRICAN TECH CONTEXT
// What makes Codist different: SA-specific knowledge
// ═══════════════════════════════════════════════════

export const SA_TECH_CONTEXT_TRACK = {
  id: "SA_TECH_CONTEXT",
  title: "South African Tech Context",
  description: "Paystack vs alternatives, SA banking system, load-shedding resilience, BEE in tech procurement, Hetzner vs AWS for SA, POPIA specifics. What separates a SA senior engineer from someone who only knows US-centric content.",
  color: "#10B981",
  drills: [
    {
      id: "sa_001",
      difficulty: "SENIOR",
      question: "A client asks why Codist chose Paystack over Stripe for Billable. Give a complete technical and business answer.",
      answer: "**Technical reasons:**\n1. ZAR as native currency — no USD conversion, no FX fees, no exchange rate risk\n2. SA bank account payouts — direct EFT to FNB, ABSA, Standard Bank, Capitec, TymeBank. Same-day settlement.\n3. Capitec Pay — deeply integrated with Capitec's 22M+ SA customers. One-tap payment from the Capitec app.\n4. Instant EFT via Paystack — triggers bank login, confirms immediately. No 3-day clearing.\n5. SA-specific KYC — NUBAN format bank account verification, SA ID number validation.\n\n**Business reasons:**\n1. Stripe SA payouts land in USD → need FX account → forex fees → SARB regulations\n2. Stripe requires a registered US entity for optimal rates\n3. Paystack is FSCA-compliant in SA, handles FICA obligations\n4. No international payment fees for domestic SA transactions\n5. Paystack's developer experience is excellent — equivalent to Stripe for African markets\n\n**When to use Stripe instead:** International customers paying in USD/EUR/GBP, subscription billing with complex proration, marketplace split payments outside Africa.",
      tags: ["paystack", "south-africa", "business", "payments", "billable"]
    },
    {
      id: "sa_002",
      difficulty: "LEAD",
      question: "How would you architect a system to be resilient to South African load-shedding (scheduled power outages of 2-6 hours)?",
      answer: "**The constraints:** Hetzner servers are in Germany/Finland — not affected by load-shedding. The risk is on the client side (users without power/internet) and potentially SA-based dependencies.\n\n**Architecture responses:**\n\n1. **Offline-first mobile app (Flutter):** Use drift (SQLite) for local storage. Sync when connection restored. For Billable mobile — job cards and timesheets work offline, sync when power returns.\n\n2. **Optimistic UI in Angular:** Show changes immediately, sync in background. User doesn't know if they're offline until sync fails.\n\n3. **Queue-based operations:** Use message queues (RabbitMQ in EngineIQ) for async work. Jobs queued during load-shedding are processed when users come back online.\n\n4. **Idempotent API design:** Clients can safely retry any operation after reconnecting. Idempotency keys prevent double-processing.\n\n5. **SA payment timing:** Schedule payment processing and payout jobs to avoid peak load-shedding windows (06:00-08:00 and 17:00-19:00 SAST). Use Quartz.NET job scheduling.\n\n6. **Graceful degradation:** Show cached data when API unreachable. 'Last synced 2 hours ago' is better than a blank screen.",
      tags: ["resilience", "south-africa", "mobile", "offline", "architecture"]
    }
  ],
  codeDrills: [],
  definitions: [
    { term: "SARS", definition: "South African Revenue Service. SA's tax authority. Creators on Send a Coldrink must declare tip income. Codist provides monthly income statements. Billable handles VAT invoicing with 15% VAT for VAT-registered orgs." },
    { term: "Load-shedding", definition: "Scheduled rolling power outages by Eskom (SA power utility) to manage grid demand. Stages 1-8, typically 2-4 hours per cycle. Affects SA tech usage patterns — mobile data usage spikes during load-shedding as people use mobile internet instead of fibre. Architecture must account for intermittent connectivity." },
    { term: "SARB", definition: "South African Reserve Bank. Central bank regulating SA's financial system. Relevant for Codist's payment processing: SARB regulations govern cross-border money movement. Paying international users requires SARB-compliant forex handling." },
    { term: "Capitec Pay", definition: "Payment method unique to SA. Capitec's 22M+ customers can pay via the Capitec app directly. Paystack-integrated. Higher conversion rate for SA users than card payments because Capitec is the country's largest retail bank by customer count." },
    { term: "CIS (Collective Investment Scheme)", definition: "Regulated investment vehicle in SA (unit trusts). Relevant for The Record and EngineIQ's enterprise customers in financial services — FSCA regulates CIS and requires specific compliance record-keeping." }
  ]
} as MasteryTrack;
