# .NET Playbook — Repeatable Practice Methodology (Start → Code → Answers)

**Companion to:** [`senior_backend_technical_lead_dotnet_interview_playbook.md`](./senior_backend_technical_lead_dotnet_interview_playbook.md)

**Purpose:** Run the same **12 challenges** over and over with a fixed ritual: clarify → scaffold → implement in file order → test → narrate → score. No guessing what to do next.

**Repo layout (create once):**

```text
interview_prep/
├── senior_backend_technical_lead_dotnet_interview_playbook.md
├── dotnet_challenges_practice_methodology.md   ← this file
└── challenges/
    ├── 01-idempotent-payment-api/
    ├── 02-rate-limiter/
    … (one folder per challenge after first run)
```

---

## Part 0 — Every practice session (same ritual)

| Step | Time | Action |
|------|------|--------|
| 1 | 2 min | Read challenge section in playbook only (no solution hunting) |
| 2 | 5 min | **Clarify + assumptions** out loud (Part 1 template) |
| 3 | 5 min | **Scaffold** project (Part 2 commands) |
| 4 | 50–150 min | **Implement** using that challenge’s file order |
| 5 | 15 min | **Tests** green |
| 6 | 10 min | **README**: run, test, trade-offs, “next 2 hours” |
| 7 | 10 min | **5-min presentation** + Q&A from model answers |
| 8 | 5 min | **Self-score** rubric (0–2 per row, target ≥10/12) |

**Rules for muscle memory:**

- Timer on; stop when box ends.
- First run: **no AI**. Second run: hints only after 30 min stuck.
- `git init` at start; commit at end with message that states scope cut if any.
- Say decisions while typing (interview habit).

---

## Part 1 — Universal clarify script (say before coding)

1. **Scale?** RPS, data size, multi-instance?
2. **Consistency?** Strong vs eventual for reads?
3. **Sync vs async?** HTTP now + queue later?
4. **Compliance?** POPIA, audit, PII in logs?
5. **Failure that matters?** Duplicate pay, oversell, lost message?
6. **Deploy?** Rolling deploy, N replicas, no migrate-on-startup?

**Default assumptions (if silent interviewer):**

> Single region, 3–10 API instances, PostgreSQL or SQL Server, at-least-once messaging, p99 &lt; 500ms for sync paths, POPIA-aware logging (mask/hash identifiers), idempotency required for money/inventory.

---

## Part 2 — Universal project bootstrap (every coding challenge)

Replace `{Name}` with `Payments`, `Inventory`, `Orders`, etc.

### Step B1 — Solution skeleton

```bash
cd interview_prep/challenges
mkdir -p 01-idempotent-payment-api && cd 01-idempotent-payment-api
git init

dotnet new sln -n {Name}
dotnet new webapi -n {Name}.Api -f net8.0
dotnet new classlib -n {Name}.Domain -f net8.0
dotnet new classlib -n {Name}.Application -f net8.0
dotnet new classlib -n {Name}.Infrastructure -f net8.0
dotnet new xunit -n {Name}.UnitTests -f net8.0
dotnet new xunit -n {Name}.IntegrationTests -f net8.0

dotnet sln add {Name}.Api {Name}.Domain {Name}.Application {Name}.Infrastructure {Name}.UnitTests {Name}.IntegrationTests

dotnet add {Name}.Api reference {Name}.Application {Name}.Infrastructure
dotnet add {Name}.Application reference {Name}.Domain
dotnet add {Name}.Infrastructure reference {Name}.Application {Name}.Domain
dotnet add {Name}.UnitTests reference {Name}.Domain {Name}.Application
dotnet add {Name}.IntegrationTests reference {Name}.Api

dotnet add {Name}.Infrastructure package Microsoft.EntityFrameworkCore
dotnet add {Name}.Infrastructure package Npgsql.EntityFrameworkCore.PostgreSQL
# OR: Microsoft.EntityFrameworkCore.SqlServer

dotnet add {Name}.IntegrationTests package Microsoft.AspNetCore.Mvc.Testing
dotnet add {Name}.IntegrationTests package Testcontainers.PostgreSql
```

### Step B2 — Reference hygiene

- **Domain:** no ASP.NET, no EF packages.
- **Application:** interfaces, handlers, validators; references Domain only.
- **Infrastructure:** EF, HTTP clients, Redis; implements Application interfaces.
- **Api:** `Program.cs`, endpoints, middleware, DI registration only.

### Step B3 — Api `Program.cs` baseline (always start here)

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddProblemDetails();
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddOpenApi();
// Register Application + Infrastructure extension methods here

var app = builder.Build();
app.UseExceptionHandler();
if (app.Environment.IsDevelopment()) app.MapOpenApi();
// Map endpoints
app.Run();

public partial class Program { } // for WebApplicationFactory
```

### Step B4 — Standard file order (any challenge)

1. Domain entities / value objects / `Result<T>`
2. Application interface + handler/service
3. Infrastructure (DbContext, repositories, HTTP clients)
4. Api endpoints + middleware
5. Unit tests (domain + handler)
6. Integration tests (`WebApplicationFactory`)

---

# Challenge 01 — Idempotent Payment API (90–120 min)

**Playbook:** §9

## C01 — Clarify & assumptions

- **Functional:** POST payment with `Idempotency-Key`; same key + same body → same response; same key + different body → 409/422.
- **Non-functional:** `decimal` money; unique constraint is source of truth; provider timeout handled.
- **Assumption:** PostgreSQL, 3 API instances, client retries on timeout.

## C01 — Scaffold

Use Part 2 with `{Name} = Payments`. Add:

```bash
dotnet add Payments.Api package FluentValidation.DependencyInjectionExtensions
dotnet add Payments.Infrastructure package Microsoft.Extensions.Http.Resilience
```

## C01 — File order & implementation steps

### Step 1 — `Payments.Domain/Payment.cs`

```csharp
namespace Payments.Domain;

public enum PaymentStatus { Pending, Succeeded, Failed }

public sealed class Payment
{
    public Guid Id { get; private set; }
    public string CustomerId { get; private set; } = "";
    public decimal Amount { get; private set; }
    public string Currency { get; private set; } = "";
    public PaymentStatus Status { get; private set; }
    public string IdempotencyKey { get; private set; } = "";
    public string RequestHash { get; private set; } = "";
    public string? ProviderReference { get; private set; }
    public DateTimeOffset CreatedAt { get; private set; }
    public DateTimeOffset UpdatedAt { get; private set; }

    public static Payment CreatePending(string customerId, decimal amount, string currency,
        string idempotencyKey, string requestHash)
    {
        if (amount <= 0) throw new ArgumentOutOfRangeException(nameof(amount));
        var now = DateTimeOffset.UtcNow;
        return new Payment
        {
            Id = Guid.NewGuid(),
            CustomerId = customerId,
            Amount = amount,
            Currency = currency,
            Status = PaymentStatus.Pending,
            IdempotencyKey = idempotencyKey,
            RequestHash = requestHash,
            CreatedAt = now,
            UpdatedAt = now
        };
    }

    public void MarkSucceeded(string providerReference)
    {
        Status = PaymentStatus.Succeeded;
        ProviderReference = providerReference;
        UpdatedAt = DateTimeOffset.UtcNow;
    }
}
```

### Step 2 — `Payments.Infrastructure/PaymentsDbContext.cs`

```csharp
public sealed class PaymentsDbContext : DbContext
{
    public DbSet<Payment> Payments => Set<Payment>();

    public PaymentsDbContext(DbContextOptions<PaymentsDbContext> options) : base(options) { }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Payment>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Amount).HasPrecision(18, 2);
            e.HasIndex(x => x.IdempotencyKey).IsUnique();
        });
    }
}
```

**Say:** Unique index = concurrency control; not `if (!exists)`.

### Step 3 — `Payments.Application/CreatePaymentHandler.cs`

Logic order:

1. Validate body (FluentValidation: amount &gt; 0, currency, customerId).
2. Require header `Idempotency-Key`.
3. Compute `requestHash` (SHA256 of normalized JSON).
4. Try insert payment `Pending` in transaction.
5. On unique violation (`23505` / 2627): load existing by key; if hash mismatch → 409; else return stored response.
6. Call `IPaymentProvider.ChargeAsync(idempotencyKey, ...)` with resilience.
7. Update status; return 201 + body.

**Request hash helper:**

```csharp
public static string HashRequest(string customerId, decimal amount, string currency)
{
    var payload = $"{customerId}|{amount}|{currency}";
    return Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(payload)));
}
```

### Step 4 — `Payments.Api` endpoint

```csharp
group.MapPost("/payments", async (
    CreatePaymentRequest body,
    HttpContext http,
    CreatePaymentHandler handler,
    CancellationToken ct) =>
{
    if (!http.Request.Headers.TryGetValue("Idempotency-Key", out var key) || string.IsNullOrWhiteSpace(key))
        return TypedResults.Problem(statusCode: 400, title: "Idempotency-Key required");

    var result = await handler.HandleAsync(key.ToString(), body, ct);
    return result; // TypedResults union
});
```

### Step 5 — Tests

**Unit:** hash mismatch logic, amount validation.  
**Integration:** two parallel POSTs same key → one row; Testcontainers Postgres.

## C01 — Model answers (follow-ups)

| Question | Answer |
|----------|--------|
| Two simultaneous same key? | Both try INSERT; one wins; other gets unique violation → SELECT and return winner’s row. |
| Check-then-insert enough? | **No** — race between check and insert. |
| Crash after provider success, before DB? | Reconciliation job; provider idempotency key; status `Pending` + query provider by key. |
| Distributed lock? | Usually **no** — DB unique constraint enough. |
| Client disconnect mid-pay? | `CancellationToken`; may still complete provider call — document idempotency. |

---

# Challenge 02 — Distributed Rate Limiter (60–90 min)

**Playbook:** §10

## C02 — Steps

1. **Domain:** none — interface in Application.
2. **`IRateLimiter`** in `Application/Abstractions/IRateLimiter.cs`.
3. **V1:** `InMemoryRateLimiter` — `ConcurrentDictionary<string, Window>` + per-key lock or `Interlocked` sliding window.
4. **V2:** `RedisRateLimiter` — Lua script INCR + EXPIRE or sorted-set sliding window.
5. **Api:** middleware or endpoint filter calling `AllowAsync(clientId)`.
6. **Headers on 429:** `Retry-After`, optional `RateLimit-Remaining`.

**Implementation sketch (fixed window, in-memory):**

```csharp
public sealed class InMemoryRateLimiter : IRateLimiter
{
    private readonly ConcurrentDictionary<string, (long Window, int Count)> _counts = new();
    private readonly int _limit;
    private readonly TimeSpan _window;

    public ValueTask<bool> AllowAsync(string clientId, CancellationToken ct = default)
    {
        var nowWindow = DateTimeOffset.UtcNow.ToUnixTimeSeconds() / (long)_window.TotalSeconds;
        var entry = _counts.AddOrUpdate(clientId,
            _ => (nowWindow, 1),
            (_, old) => old.Window == nowWindow ? (old.Window, old.Count + 1) : (nowWindow, 1));
        return ValueTask.FromResult(entry.Count <= _limit);
    }
}
```

## C02 — Model answers

| Question | Answer |
|----------|--------|
| Why not lock whole Dictionary? | Contention across all clients; per-key or sharded locks. |
| 20 instances? | In-memory is per-node — need Redis/APIM or accept approximate global limit. |
| Redis down? | Fail-open (allow) vs fail-closed (429) — product decision; document. |
| vs `AddRateLimiter`? | Built-in is per-instance unless Redis store configured. |

---

# Challenge 03 — Inventory Reservation (90–120 min)

**Playbook:** §11

## C03 — Steps

1. **Domain:** `Reservation` state machine (`Active`, `Expired`, `Committed`).
2. **Table:** `stock(sku, available)` + `reservations(id, sku, qty, expires_at, idempotency_key UNIQUE)`.
3. **Reserve handler:**
   - Start transaction.
   - `UPDATE stock SET available = available - @q WHERE sku = @sku AND available >= @q`
   - If rows affected = 0 → 409 insufficient stock.
   - Insert reservation.
   - Commit.
4. **`BackgroundService`:** expire reservations (`UPDATE stock ...` + mark expired); use `FOR UPDATE SKIP LOCKED` on reservation rows for multi-instance.
5. **Idempotency:** same as payments on `Idempotency-Key`.

## C03 — Model answer (killer question)

> Two users, last item: both run conditional UPDATE; **one** gets `rows=1`, other gets `rows=0`. Database serializes row updates — no oversell without app-level lock.

---

# Challenge 04 — Event Processing (90–120 min)

**Playbook:** §12

## C04 — Steps

1. **`ProcessedEvent`** table: `event_id UNIQUE`, status, processed_at.
2. **`BackgroundService`** consumer loop: read message → begin transaction → insert processed (or skip if exists) → handle → commit → complete/ack.
3. **Retry:** Polly or manual exponential backoff + jitter on transient exceptions.
4. **DLQ:** after N attempts, move to dead-letter table/topic.
5. **Metrics:** `Meter` for lag, success, failure (`System.Diagnostics.Metrics`).

## C04 — Model answers

| Question | Answer |
|----------|--------|
| Crash after process, before ack? | At-least-once redelivery → idempotent insert on `event_id`. |
| Out of order? | Design handlers to tolerate; or partition by key for ordering. |

---

# Challenge 05 — Order Service (120–180 min)

**Playbook:** §13

## C05 — Steps

1. Domain: `Order`, `OrderLine`, methods `Cancel()`, `MarkPaid()` — invalid transition → `Result` or exception only for programmer errors.
2. EF Core aggregates + transactions per use case.
3. JWT auth + policy `Orders.Read`, `Orders.Write`.
4. POST `/orders` creates + reserves inventory (call handler or domain service).
5. Integration tests per endpoint.

**State transitions:** encode in `Order` methods, not controller `if` chains.

---

# Challenge 06 — Schema Migration Under Load (90–120 min)

**Playbook:** §14

## C06 — Steps (expand/contract — no long code session)

1. Migration 1: add nullable `full_name`.
2. Deploy app v2: write both columns.
3. SQL backfill batched: `UPDATE ... WHERE id BETWEEN @a AND @b` throttle.
4. Deploy app v3: read `full_name`.
5. Deploy app v4: stop writing `name`, `surname`.
6. Migration 2: drop old columns.

**EF:** `dotnet ef migrations script --idempotent` or **migration bundle** in CI — **never** `Database.Migrate()` on startup with N pods.

## C06 — Model answers

| Question | Answer |
|----------|--------|
| 500M rows? | Batch + off-peak + avoid table scan locks; online rebuild where supported. |
| Rolling deploy? | Old code must tolerate new column null; new code tolerates old column until cutover. |

---

# Challenge 07 — Notification Platform (120–180 min)

**Playbook:** §15

## C07 — Steps

1. POST `/notifications` → persist request + **outbox row** (same transaction).
2. MassTransit or `BackgroundService` publisher to Service Bus/Kafka.
3. Separate consumers: Email, Sms, Push — each with resilience handler per provider.
4. Idempotency key on notification; template engine (Scriban) in worker.

---

# Challenge 08 — File Processing Pipeline (120–180 min)

**Playbook:** §16

## C08 — Steps

1. POST upload → store blob (Azure Blob/S3) + job row `Queued`.
2. Queue message with job id.
3. Worker: stream CSV (`CsvHelper`, `IAsyncEnumerable`), validate rows, bulk insert good rows, write error report blob.
4. GET `/jobs/{id}` status + error report URL.
5. Bounded `Channel<T>` if in-process pipeline demo.

**Say:** never load entire file into memory.

---

# Challenge 09 — URL Shortener (90–120 min)

**Playbook:** §17

## C09 — Steps

1. POST generates short code (random + unique index retry, or Base62 from sequence).
2. GET `/{code}` → 302 (analytics) or 301 (permanent) — **302** if you track clicks.
3. Redis/`HybridCache` for hot reads; async write analytics queue.
4. Index on `short_code` unique.

---

# Challenge 10 — Ledger (120–180 min)

**Playbook:** §18

## C10 — Steps

1. Tables: `accounts(id, balance numeric(18,4), rowversion)`, `entries(id, account_id, amount, type, correlation_id)` append-only.
2. **Transfer:** transaction — lock accounts in **id order** (deadlock avoidance); debit A, credit B; check balance non-negative via conditional update or constraint.
3. **Idempotency:** `correlation_id UNIQUE` per client operation.
4. Use **`decimal`** everywhere.

## C10 — Model answer

> A debited, B not credited **cannot happen** inside one DB transaction — rollback all. Across services → saga + reconciliation.

---

# Challenge 11 — Transactional Outbox (90–150 min)

**Playbook:** §19

## C11 — Steps

1. `OutboxMessage(id, payload, created_at, processed_at null)` in same DbContext as business entity.
2. Handler saves order + outbox in **one** `SaveChangesAsync`.
3. `OutboxPublisherService` : `BackgroundService` — poll `WHERE processed_at IS NULL FOR UPDATE SKIP LOCKED`, publish, mark processed.
4. Consumer: **inbox** table with unique `message_id`.

## C11 — Model answer

> Exactly-once **business effect** = at-least-once delivery + idempotent consumer + outbox/inbox — not broker guarantee alone.

---

# Challenge 12 — Production Debugging (60–90 min)

**Playbook:** §20 — **no coding**; spoken methodology.

## C12 — Step-by-step investigation script

1. **Scope:** endpoints, regions, customers, start time.
2. **Changes:** deploy, config, feature flag, traffic spike.
3. **Split:** app vs DB vs broker (symptoms: DB CPU 92% → DB first).
4. **Traces:** slowest spans in App Insights / OTel.
5. **SQL:** top queries, blocking, missing index, parameter sniffing.
6. **.NET:** `dotnet-counters` — thread-pool queue, GC, Kestrel queue, connection pool.
7. **Broker:** consumer lag, DLQ depth.
8. **Mitigate:** scale **only if** not DB-saturated; else throttle, cache, fix query, rollback.
9. **Verify:** p95/5xx back to SLO.
10. **RCA:** five whys + action items.

## C12 — Model answer (DB CPU high, app CPU low)

> Likely **DB-bound** — more pods worsen connection pool pressure. Fix query/index first; consider read replica for read-heavy endpoints.

---

# Part 3 — Theory questions: short model answers

Use with playbook §4–§8. Practise **one section per day**.

### Async (§4.2)

| # | Answer |
|---|--------|
| Compiler async | State machine struct with `MoveNext`, builder, awaiters |
| `.Result` | Blocks thread; pool starvation in ASP.NET; use `await` |
| Thread-pool starvation | Low CPU, high latency, growing queue — sync-over-async |
| `ConfigureAwait(false)` | Irrelevant in ASP.NET Core app code; **yes** in library code |
| `HttpClient` | Use `IHttpClientFactory`; avoid `new HttpClient()` per request |

### ASP.NET / EF (§5)

| # | Answer |
|---|--------|
| Captive dependency | Singleton holds scoped `DbContext` — use `ValidateScopes`, fix lifetimes |
| N+1 | Eager load `Include`, projection `Select`, split query |
| Retry + manual transaction | Wrap in `CreateExecutionStrategy().ExecuteAsync(...)` |
| Migrate on startup | Bad with N replicas — use bundle/script in pipeline |

### Messaging (§8)

| # | Answer |
|---|--------|
| Ordering | Partition key / Service Bus session |
| Exactly-once effect | Outbox + idempotent consumer |
| Poison message | Retry limit → DLQ, alert, manual replay |

---

# Part 4 — Cursor prompts (when to use which)

| Goal | Playbook § |
|------|------------|
| Timed mock coding interview | §48 |
| Review your submission | §49 |
| System design only | §50 |
| Terraform / Azure | §51 |
| Incident tabletop | §52 |
| Legacy .NET Framework migration | §53 |

**Practice loop with Cursor:** Run challenge **without** §48 first; then paste your repo summary into §49.

---

# Part 5 — 4-week rotation (repeat forever)

| Week | Focus |
|------|--------|
| 1 | C01 + C03 (money + concurrency) |
| 2 | C04 + C11 (events + outbox) |
| 3 | C05 + C10 (orders + ledger) |
| 4 | C12 + system design §21 #1 Payment platform |

Re-do **C01 from memory** every week — it covers 80% of senior signals.

---

# Part 6 — Self-score rubric (each run /12)

| Area | 0 | 1 | 2 |
|------|---|---|---|
| Clarify / assumptions | Skipped | Partial | Clear + written in README |
| Structure | Monolith Program.cs | Some layers | Domain/App/Infra/Api |
| Correctness | Broken | Main path | Edge cases + concurrency |
| Tests | None | Unit only | Unit + integration |
| Security | Secrets in code | Partial | Auth, validation, no PII logs |
| Narration | Silent | What | Why + trade-offs + next steps |

---

*Start with **Challenge 01** using Part 2 + C01 steps. When C01 completes in under 90 min twice, move to C02.*
