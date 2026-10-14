# Senior Backend / Technical Lead Interview & Assessment Playbook — .NET Edition
## C# • .NET 8/9 • ASP.NET Core • EF Core • Distributed Systems • Azure/AWS • Kubernetes • IaC • SQL • Messaging • CI/CD • Technical Leadership

**Target candidate:** Senior .NET Engineer / Senior Backend Engineer / Technical Lead / Staff-leaning Engineer
**Experience target:** 8–15+ years
**Typical assessment duration:** 60–180 minutes
**Primary implementation language:** C# (.NET 8 LTS / .NET 9)
**Primary backend stack:** ASP.NET Core (Minimal APIs + Controllers), EF Core, Dapper, PostgreSQL / SQL Server
**Cloud emphasis:** Azure first (the natural .NET home), AWS second — know both
**Infrastructure emphasis:** Terraform (and Bicep) + Docker + Kubernetes (AKS/EKS) + CI/CD
**Assessment philosophy:** production engineering, not puzzle solving

---

## 0. How to use this file in Cursor

Use this repository as a **deliberate interview-training environment**.

```text
interview-prep-dotnet/
├── README.md
├── interview-playbook.md
├── challenges/
│   ├── 01-idempotent-payment-api/
│   ├── 02-rate-limiter/
│   ├── 03-order-service/
│   ├── 04-event-processing/
│   ├── 05-inventory-concurrency/
│   ├── 06-schema-migration/
│   ├── 07-notification-platform/
│   ├── 08-file-processing/
│   ├── 09-url-shortener/
│   ├── 10-ledger/
│   ├── 11-outbox/
│   └── 12-production-debugging/
├── system-design/
├── iac/
├── kubernetes/
├── sql/
└── leadership/
```

Suggested solution layout for each challenge (Clean/Vertical-slice, keep it light):

```text
src/
  Payments.Api/            # ASP.NET Core host, endpoints, DI, middleware
  Payments.Application/    # use cases, handlers, validation
  Payments.Domain/         # entities, state machines, invariants
  Payments.Infrastructure/ # EF Core, Dapper, Kafka/Service Bus, HTTP clients
tests/
  Payments.UnitTests/
  Payments.IntegrationTests/   # WebApplicationFactory + Testcontainers
```

**Step-by-step practice (start → code → model answers):** see [`dotnet_challenges_practice_methodology.md`](./dotnet_challenges_practice_methodology.md) — universal scaffold, all 12 challenges in file order, and interview Q&A.

For every challenge, practise in this order:

1. Clarify requirements.
2. State assumptions.
3. Define functional requirements.
4. Define non-functional requirements.
5. Estimate scale.
6. Propose a simple design first.
7. Identify bottlenecks and failure modes.
8. Choose data structures and algorithms.
9. Implement the smallest production-quality version.
10. Add tests (xUnit + WebApplicationFactory + Testcontainers).
11. Explain security.
12. Explain observability.
13. Explain deployment.
14. Explain scaling.
15. Explain rollback/recovery.
16. Explain what you would change with another 2 hours.
17. Explain why you rejected alternatives.

**Golden rule:** At senior/lead level, the interviewer is evaluating *how you think*, not only whether the final code passes tests.

---

# 1. Market signal (.NET, Gauteng + remote)

South African .NET senior roles strongly overlap around:

- C# / modern .NET (8/9), legacy .NET Framework migration
- ASP.NET Core Web API, Minimal APIs, gRPC
- Entity Framework Core, Dapper, ADO.NET
- SQL Server, PostgreSQL, sometimes Oracle
- Azure (App Service, AKS, Functions, Service Bus, Key Vault, Entra ID) and/or AWS
- Microservices and event-driven architecture (Azure Service Bus, RabbitMQ, Kafka, MassTransit)
- Docker/Kubernetes, Azure DevOps / GitHub Actions
- Terraform / Bicep / ARM
- Security: OAuth2/OIDC/JWT, Entra ID, TLS
- Observability: OpenTelemetry, Application Insights, Serilog, Seq, ELK
- Banking/fintech/insurance/retail/logistics domains
- Legacy modernisation: .NET Framework → .NET 8, WCF/SOAP → REST/gRPC, monolith → modular monolith/services
- Often with a front-end flavour (Angular/React) for full-stack roles

Search starting points:

- LinkedIn: "Senior .NET Developer Gauteng", "Senior C# Developer Johannesburg", "Technical Lead .NET Remote"
- PNet, CareerJunction, Indeed ZA, IT-Online job board
- Specialist recruiters: e-Merge IT Recruitment, Network Recruitment, Michael Page, Hire Resolve, Unique Personnel
- Remote: Arc.dev, Turing, Toptal, We Work Remotely, Himalayas, LinkedIn Remote (EMEA time zones)

Positioning keywords: **Senior .NET Engineer / Technical Lead — C#, ASP.NET Core, Azure/AWS, Kubernetes, Terraform, SQL, messaging, CI/CD.**

---

# 2. Interview model you should expect

| Stage | Typical duration | What is tested |
|---|---:|---|
| Recruiter screen | 20–30m | Experience, communication, availability |
| Technical screen | 45–60m | C#/.NET/backend fundamentals |
| Coding | 60–120m | Implementation, tests, reasoning |
| Practical assessment | 90–180m | Real backend problem (take-home or live) |
| System design | 60–90m | Architecture and trade-offs |
| Cloud/IaC | 45–90m | Azure/AWS/Terraform/Kubernetes |
| Production/debugging | 30–60m | Incident reasoning |
| Technical leadership | 30–60m | Mentoring, decisions, delivery |
| Final/architecture | 45–90m | Ownership and technical strategy |

Common platforms: HackerRank, Codility, TestGorilla, CodeSignal, take-home repos (GitHub), live pairing on Rider/VS/VS Code. .NET assessments commonly give a Web API project to extend, a failing xUnit suite to fix, a slow EF Core query to optimise, or a legacy controller to refactor.

---

# 3. Senior interview answer methodology

## A. Clarify
- Expected scale? Latency requirements (p95/p99)?
- Consistency vs availability?
- Sync or async?
- Security/compliance (POPIA, PCI-DSS, SARB, GDPR)?
- Failure scenarios that matter?
- Deployment environment (Azure, AWS, on-prem, hybrid)?
- Existing systems to integrate with (legacy SQL Server, SOAP, mainframe)?

## B. State assumptions
> "I'll assume 10 million users, 100k requests/sec at peak, p99 under 300ms, multi-AZ deployment, and eventual consistency is acceptable for reporting."

## C. Separate requirements
**Functional:** what it must do.
**Non-functional:** availability, latency, throughput, scalability, consistency, durability, security, maintainability, observability, cost.

## D. Design the simplest viable system

```text
Client -> API -> Service -> Database
```
Evolve only when scale or reliability requires it. A **modular monolith** is often the right first answer in .NET.

## E. Explain trade-offs
> "I chose X because..., but the trade-off is..."

Examples: PostgreSQL vs SQL Server vs Cosmos DB • REST vs Service Bus/Kafka • AKS vs App Service/Container Apps • EF Core vs Dapper • MediatR vs plain handlers • monolith vs microservices • Terraform vs Bicep • multi-region vs multi-AZ.

---

# 4. C# / .NET senior-level preparation

## 4.1 Core C# and the runtime

Be able to explain deeply:

- CLR architecture, JIT (tiered compilation, PGO), AOT / ReadyToRun
- Stack vs heap, value types vs reference types, boxing/unboxing
- `struct` vs `class` vs `record` vs `record struct`
- Garbage collector: generations (0/1/2), LOH/POH, workstation vs server GC, concurrent GC, GC settings in containers
- `IDisposable`, `IAsyncDisposable`, finalizers, `using` declarations
- `Span<T>`, `Memory<T>`, `ArrayPool<T>`, `stackalloc`
- Nullable reference types
- Pattern matching, switch expressions, primary constructors, collection expressions
- Generics, variance (`in`/`out`), constraints
- `IEnumerable` vs `IQueryable` vs `IAsyncEnumerable`, deferred execution
- LINQ pitfalls (multiple enumeration, closures, N+1 via lazy evaluation)
- `equals`/`GetHashCode`, `IEquatable<T>`, record equality
- Collections: `List<T>`, `Dictionary<K,V>` internals, `HashSet<T>`, `ConcurrentDictionary`, `ImmutableArray`, `FrozenDictionary`, `Channel<T>`
- Exceptions: when to throw, exception filters, `ExceptionDispatchInfo`, cost of exceptions
- Reflection, source generators, expression trees, attributes
- Delegates, events, `Func`/`Action`, closures

## 4.2 Async and concurrency (heavily tested)

- `async`/`await` state machine; what actually happens at an `await`
- `Task` vs `ValueTask`; when `ValueTask` is wrong
- `SynchronizationContext` and `ConfigureAwait(false)` (and why ASP.NET Core has no sync context)
- Sync-over-async deadlocks (`.Result`, `.Wait()`), thread pool starvation
- `Task.Run` in ASP.NET Core — when it's an anti-pattern
- `CancellationToken` propagation end to end; request aborted tokens
- `Task.WhenAll` / `WhenAny`, exception aggregation
- `lock`, `Monitor`, `SemaphoreSlim` (async-friendly), `Interlocked`, `ReaderWriterLockSlim`
- `volatile`, memory model basics
- `System.Threading.Channels`, `Parallel.ForEachAsync`, `PLINQ` risks
- `BackgroundService` / `IHostedService`, graceful shutdown, `StopAsync`
- Thread pool injection rate, `ThreadPool.SetMinThreads`
- `async void` (why never, except event handlers)
- Fire-and-forget: how to do it safely

### Questions

1. How does `Dictionary<TKey,TValue>` work internally? What happens on hash collisions?
2. Why must `Equals` and `GetHashCode` agree?
3. `class` vs `struct` vs `record` — when each in a production service?
4. What does the compiler generate for an `async` method?
5. What is thread-pool starvation, and how do you diagnose it in production?
6. Why is `.Result` dangerous? When does it deadlock and when does it merely starve?
7. `ConfigureAwait(false)` — relevant in ASP.NET Core? In a shared library?
8. `Task` vs `ValueTask`?
9. `lock` vs `SemaphoreSlim` vs `Interlocked` — when to use which?
10. Why can't you `await` inside a `lock`?
11. How would you diagnose a .NET memory leak? (`dotnet-dump`, `dotnet-gcdump`, `dotnet-counters`, event handlers, static caches, `HttpClient` misuse)
12. How would you investigate high GC pause times? Gen2 collections? LOH fragmentation?
13. Explain a race condition and a deadlock; how do you prevent each?
14. What is backpressure and how does `Channel<T>` bounded mode help?
15. How do you size/limit concurrency for outbound calls?
16. What happens when downstream services are slower than your incoming traffic?
17. `IEnumerable` vs `IQueryable` — what's the production bug when you mix them?
18. How does `HttpClient` fail when misused (`new HttpClient()` per request → socket exhaustion; singleton → DNS staleness)? How does `IHttpClientFactory` fix it?

---

# 5. ASP.NET Core senior-level interview

## 5.1 Hosting, DI, and the pipeline

- Generic Host, `WebApplicationBuilder`, Kestrel, reverse proxies (YARP, nginx, ALB/App Gateway), forwarded headers
- Middleware pipeline order (exception handling → HTTPS → routing → CORS → authentication → authorization → rate limiting → endpoints)
- Filters vs middleware vs endpoint filters
- Minimal APIs vs Controllers — when each
- Model binding, validation (FluentValidation vs DataAnnotations), `ProblemDetails` (RFC 9457), `IExceptionHandler`
- Options pattern (`IOptions`, `IOptionsSnapshot`, `IOptionsMonitor`), validation on start
- Configuration providers, user secrets, Key Vault / Secrets Manager
- Health checks (liveness vs readiness), `/health` endpoints
- Response caching, output caching, `HybridCache`, `IMemoryCache`, `IDistributedCache`
- Built-in rate limiting middleware (`Microsoft.AspNetCore.RateLimiting`)
- API versioning (`Asp.Versioning`), OpenAPI/Swagger
- gRPC, SignalR (basics), WebSockets

## 5.2 Dependency injection

- Lifetimes: transient / scoped / singleton
- **Captive dependency** (singleton capturing scoped) — classic interview trap
- Constructor injection vs service locator
- Keyed services, `IServiceScopeFactory` in background services
- Open generics, decorator pattern (Scrutor)
- Why `DbContext` is scoped and why it's not thread-safe
- Circular dependencies

## 5.3 EF Core / data access

- Change tracker, `AsNoTracking`, identity resolution
- Lazy vs eager vs explicit loading; N+1; `Include`, `AsSplitQuery`, cartesian explosion
- Projections (`Select`) vs entity loading
- Compiled queries, `ExecuteUpdate` / `ExecuteDelete`
- Concurrency tokens (`rowversion`, `xmin` in Postgres), `DbUpdateConcurrencyException`
- Transactions: `SaveChanges` is transactional; explicit `BeginTransactionAsync`; execution strategies and retry (`EnableRetryOnFailure`) — and why user-initiated transactions need `CreateExecutionStrategy`
- Migrations: bundles, idempotent scripts, why not `Database.Migrate()` at app startup in multi-instance deployments
- EF Core vs Dapper vs raw ADO.NET — when each
- Global query filters (soft delete, multi-tenancy)
- Connection pooling, `DbContext` pooling, pool exhaustion
- Value converters, owned types, TPH/TPT inheritance

### Questions

1. Request lifecycle through ASP.NET Core?
2. Middleware vs filters?
3. Constructor injection benefits? What is a captive dependency and how do you detect it (`ValidateScopes`)?
4. Why is `DbContext` scoped? What breaks if it's registered as a singleton?
5. Lazy vs eager loading — which do you use by default and why?
6. Explain the N+1 problem and 3 ways to fix it in EF Core.
7. How does the change tracker work, and when do you disable it?
8. Optimistic vs pessimistic concurrency in EF Core?
9. Transaction isolation levels and defaults (SQL Server READ COMMITTED vs RCSI; PostgreSQL READ COMMITTED)?
10. What actually happens during `SaveChangesAsync`?
11. Why does `EnableRetryOnFailure` break manual transactions unless wrapped in an execution strategy?
12. How do you handle cancellation and timeouts in data access?
13. How do you do validation, and where (API boundary, domain, DB)?
14. How do you return consistent errors? (`ProblemDetails`)
15. How do you implement pagination (offset vs keyset)?

## 5.4 Security in ASP.NET Core

```text
Client
  |
Bearer JWT (Entra ID / Keycloak / Auth0 / IdentityServer / Duende)
  |
API Gateway / YARP / APIM
  |
Authentication middleware (JwtBearer)
  |
Authorization (policies, requirements, handlers)
  |
Endpoint
```

Questions:

1. Authentication vs authorization in ASP.NET Core?
2. OAuth2 vs OpenID Connect?
3. JWT structure; how is the signature validated (JWKS, issuer, audience, lifetime, clock skew)?
4. JWT vs reference (opaque) tokens?
5. Policy-based vs role-based vs resource-based authorization (`IAuthorizationHandler`)?
6. Claims transformation?
7. Service-to-service authentication (client credentials, managed identity, mTLS)?
8. How do you rotate secrets/signing keys?
9. How do you revoke a JWT?
10. How do you prevent IDOR / privilege escalation?
11. How do you protect an internal API?
12. Data Protection API — what is it, why does key-ring sharing matter behind multiple instances?
13. CORS, CSRF, cookies (`SameSite`, `HttpOnly`) for BFF patterns?
14. How do you secure configuration (Key Vault, managed identity, no secrets in appsettings)?

---

# 6. REST API challenge questions

Know: HTTP methods • idempotency • status codes • pagination • filtering • sorting • versioning • ETags/`If-Match` • caching • retries • rate limiting • optimistic concurrency • API gateway • authN/authZ • validation • correlation IDs • `ProblemDetails`.

### Senior questions

> Why is PUT idempotent but POST normally isn't?
> How would you make `POST /payments` idempotent in ASP.NET Core? (middleware/filter + `Idempotency-Key` table with unique index)
> How do you prevent duplicate requests when a client retries after a timeout?
> How do you version a public API without breaking 500 clients?
> What should a 429 response contain? (`Retry-After`, `ProblemDetails`)
> Minimal API vs controller: how do you keep a large Minimal API codebase organised? (endpoint groups, `IEndpointRouteBuilder` extensions, endpoint filters)

---

# 7. SQL / database preparation

You must be comfortable writing SQL without an ORM (T-SQL and PostgreSQL).

## Topics

joins • aggregation • window functions • CTEs (incl. recursive) • indexes • composite/covering/filtered indexes • query plans • transactions • isolation (incl. RCSI/snapshot on SQL Server) • deadlocks • optimistic/pessimistic locking (`UPDLOCK`, `SELECT ... FOR UPDATE`, `SKIP LOCKED`) • normalization/denormalization • partitioning • replication/read replicas • connection pooling • migrations • parameter sniffing (SQL Server) • statistics

## Questions

1. Why is the query slow despite an index? (parameter sniffing, implicit conversion, non-SARGable predicate, stale stats, key lookups)
2. How does a composite index work? Column order?
3. What is index selectivity?
4. Explain execution plans (`SET STATISTICS IO`, actual plan; `EXPLAIN ANALYZE` on Postgres).
5. How do transactions work? ACID.
6. READ COMMITTED vs REPEATABLE READ vs SERIALIZABLE vs SNAPSHOT.
7. What causes deadlocks, and how do you retry safely in .NET?
8. How would you migrate a 500GB table without downtime?
9. How do you handle schema changes with rolling deployments?
10. Top-N per group (`ROW_NUMBER() OVER (PARTITION BY ...)`)?
11. When would you denormalize?
12. SQL Server vs PostgreSQL vs Cosmos DB/DynamoDB?
13. How do connection pools fail under load, and how do you detect it in .NET (`Max Pool Size`, timeouts)?
14. Dapper vs EF Core for a hot read path?

---

# 8. Messaging / event-driven systems (Kafka, Azure Service Bus, RabbitMQ)

.NET libraries to know: **Confluent.Kafka**, **MassTransit**, **NServiceBus**, **Azure.Messaging.ServiceBus**, **RabbitMQ.Client**, **Wolverine**, **CAP**.

Know (Kafka): topic • partition • offset • consumer group • ordering • retention • replication/ISR • delivery semantics • idempotent producer • transactions • rebalancing • consumer lag • DLQ • schema registry/evolution.
Know (Service Bus): queues vs topics/subscriptions • sessions (ordered processing) • peek-lock • lock duration/renewal • delivery count + DLQ • duplicate detection • scheduled messages.

## Senior questions

1. How do you guarantee ordering? (Kafka partition key; Service Bus sessions)
2. How do you achieve "exactly-once" business effects?
3. Transport delivery semantics vs business idempotency?
4. What causes consumer lag? How do you scale consumers?
5. What happens during a rebalance?
6. How do you retry failed messages (immediate, delayed, exponential backoff, retry topics)?
7. What is a poison message and how do you handle it?
8. How do you evolve event schemas (Avro/Protobuf/JSON + compatibility rules)?
9. What happens if the broker is unavailable? (outbox, local buffering, circuit breaking)
10. How do you guarantee DB + broker consistency? → Transactional outbox
11. Explain the outbox pattern (MassTransit EF outbox, Wolverine, CAP, hand-rolled).
12. Kafka vs Service Bus vs SQS vs RabbitMQ — when each?
13. How do you structure a `BackgroundService` consumer for graceful shutdown and cancellation?

---

# 9. Coding Challenge 01 — Idempotent Payment API
## Difficulty: Senior | Time: 90–120 minutes

### Problem

```http
POST /payments
Idempotency-Key: abc-123
```

```json
{ "customerId": "C100", "amount": 1500.00, "currency": "ZAR" }
```

Requirements:

- Validate request (FluentValidation or manual).
- Reject negative/zero amounts; use `decimal`, never `double`.
- Require an idempotency key.
- Same key must not create two payments.
- Retry with same key returns the original result (same status code + body).
- Same key with a *different* payload → `409`/`422`.
- Persist payment state (`Pending → Succeeded/Failed`).
- Simulate an external payment provider via `IHttpClientFactory` typed client.
- Handle provider timeout (Polly / `Microsoft.Extensions.Http.Resilience`).
- Tests: xUnit + `WebApplicationFactory` + Testcontainers (PostgreSQL/SQL Server).
- Correct HTTP statuses and `ProblemDetails` errors.

### Expected senior design

```text
payments
---------
id
customer_id
amount            numeric(18,2)
currency
status
idempotency_key   UNIQUE
request_hash
provider_reference
created_at
updated_at
```

Key point: **the unique constraint is the concurrency control**, not an `if (!exists)` check. Insert first (or `INSERT ... ON CONFLICT`), catch the unique-violation (`DbUpdateException` → `PostgresException.SqlState == "23505"` / SQL Server error 2627/2601), then load and return the existing record.

### Interview follow-ups

- Two simultaneous requests with the same key — exactly what happens?
- Is check-then-insert enough? (No — race.)
- Process crashes after provider success but before DB update?
- How do you reconcile payments with the provider?
- Distributed lock needed? (Usually no — DB constraint suffices.)
- How do you make the provider call itself idempotent (pass your key through)?
- Retry policy: which errors are retryable? Why must POST retries to a non-idempotent provider be careful?
- Kafka/Service Bus involvement? Outbox for the "PaymentCompleted" event?
- Audit trail for financial changes?
- `CancellationToken` behaviour when the client disconnects mid-payment?

### What the interviewer evaluates

concurrency • transactions • idempotency • API design • failure handling • DB constraints • testing • production thinking

---

# 10. Coding Challenge 02 — Distributed Rate Limiter
## Difficulty: Senior/Lead | Time: 60–90 minutes

Implement:

```csharp
public interface IRateLimiter
{
    ValueTask<bool> AllowAsync(string clientId, CancellationToken ct = default);
}
```

- 100 requests/minute/client. Thread-safe. Efficient. Multiple app instances.

### Levels

1. **In-memory**, thread-safe (`ConcurrentDictionary` + per-key lock / `Interlocked`).
2. **Sliding window** (log or sliding-window-counter); compare fixed window, token bucket, leaky bucket.
3. **Redis-backed** via `StackExchange.Redis` with a Lua script (atomic) or sorted sets.
4. Discuss distributed consistency and failure behaviour (fail-open vs fail-closed).
5. Compare with built-in `System.Threading.RateLimiting` / `AddRateLimiter` middleware (what it does and doesn't give you across instances).

### Follow-ups

- Why not a `lock` around a `Dictionary`?
- 20 instances — what changes?
- Redis down?
- Thundering herd at window boundaries?
- Memory growth for millions of client ids (eviction/TTL)?
- Where should it live: CDN/WAF, API gateway (APIM/YARP), or app?
- Return headers: `Retry-After`, `RateLimit-*`.

---

# 11. Coding Challenge 03 — Inventory Reservation
## Difficulty: Senior | Time: 90–120 minutes

```http
POST /inventory/{sku}/reserve
```

- Reserve inventory; **never oversell**.
- Reservation expires in 15 minutes.
- Concurrent users.
- Idempotent.
- Expired reservations released (`BackgroundService` / Hangfire / Quartz).

### Required discussion

- Optimistic concurrency (`rowversion` / `xmin` concurrency token) with retry loop
- Pessimistic (`UPDLOCK, ROWLOCK` / `FOR UPDATE`)
- Atomic conditional update: `UPDATE stock SET available = available - @q WHERE sku=@sku AND available >= @q` and check rows affected — often the best answer
- DB check constraints (`available >= 0`)
- Reservation state machine
- Distributed locking (Redis/Redlock) — and why it's usually unnecessary here
- Scheduled cleanup, multi-instance safety (`SKIP LOCKED`, leader election)
- Eventual consistency

### Key question

Two users request the last item at the same instant. Explain precisely how correctness is guaranteed.

---

# 12. Coding Challenge 04 — Event Processing
## Difficulty: Senior | Time: 90–120 minutes

```json
{ "eventId": "E123", "customerId": "C123", "type": "ORDER_CREATED", "timestamp": "2026-01-01T12:00:00Z" }
```

Implement a consumer (`BackgroundService`) that:

- processes events
- ignores duplicates (processed-events table with unique `eventId`)
- retries transient failures (exponential backoff + jitter)
- moves permanently failing messages to DLQ
- records processing status
- exposes metrics (`System.Diagnostics.Metrics` → OpenTelemetry)

### Follow-ups

- Out-of-order events?
- Crash after processing, before offset commit/complete?
- Idempotent processing — how, exactly?
- Replaying events?
- Monitoring lag?
- Schema evolution?
- Graceful shutdown with in-flight messages?

---

# 13. Coding Challenge 05 — Order Service
## Difficulty: Senior/Lead | Time: 120–180 minutes

```http
POST /orders
GET  /orders/{id}
GET  /orders?customerId=&status=
POST /orders/{id}/cancel
```

Requirements: customer, order, items, inventory, payment, order state, validation, authentication (JWT), authorization (policies/resource-based), persistence (EF Core), tests.

### State machine

```text
CREATED -> PAYMENT_PENDING -> PAID -> FULFILLED
CREATED -> CANCELLED
PAYMENT_PENDING -> CANCELLED
PAID -> REFUND_PENDING
```

Encode transitions in the domain (`Order.Cancel()` throws/returns result on invalid transition), not in controllers.

### Senior expectations

- Transaction boundaries and aggregate boundaries (DDD)
- Sync vs async operations
- Retries, idempotency
- Outbox, messaging
- Eventual consistency, saga/compensation (MassTransit state machines)
- Observability, security
- Testing strategy (domain unit tests, API integration tests)

---

# 14. Coding Challenge 06 — Schema Migration Under Load
## Difficulty: Senior/Lead | Time: 90–120 minutes

`customers(id, name, surname)` → `full_name`, zero downtime.

### Expand/contract

```text
1 add full_name (nullable)
2 app writes both
3 backfill (batched)
4 validate
5 app reads new column
6 stop writing old columns
7 drop old columns
```

### .NET-specific points

- EF Core migrations: generate **idempotent SQL scripts** or **migration bundles** (`dotnet ef migrations bundle`) and run as a pipeline/init-container step — not on app startup across N replicas
- Backward-compatible model during rolling deploy (old + new app versions running together)
- Batched backfill with `ExecuteUpdateAsync` or SQL, throttled
- Avoiding long locks (`ALTER TABLE` behaviour per engine; online index builds)

### Follow-ups

- Backfill 500M rows? Avoid table locks? Roll back?
- Deploy app + DB safely?
- Old instances during rolling deployment?

---

# 15. Coding Challenge 07 — Notification Platform
## Difficulty: Senior | Time: 120–180 minutes

EMAIL / SMS / PUSH with async processing, retries, provider failure handling, idempotency, priority, templates, rate limits, DLQ.

```text
API -> Notification Service -> Outbox -> Broker (Kafka / Service Bus)
                                           |
                              +------------+------------+
                            Email         SMS         Push
```

### .NET building blocks

- MassTransit consumers with retry/redelivery/DLQ policies
- `Microsoft.Extensions.Http.Resilience` (retry, circuit breaker, timeout, bulkhead) per provider
- Template rendering (Scriban/RazorLight/Fluid)
- Per-provider rate limiting (`System.Threading.RateLimiting`)

### Follow-ups

- Why a broker rather than a DB queue? (and when a DB queue is fine)
- Guarantee delivery? Prevent duplicates?
- Exponential backoff with jitter?
- Provider rate limits? Monitoring delivery success?

---

# 16. Coding Challenge 08 — File Processing Pipeline
## Difficulty: Senior | Time: 120–180 minutes

Large CSV uploads: upload, validate, async process, progress, retries, reject invalid rows, downloadable error report.

```text
Client -> API -> Blob/S3 -> Queue -> Workers -> Database
```

Discuss: streaming (`IAsyncEnumerable`, `CsvHelper`, never `ReadAllText`) • `Channel<T>` bounded pipeline • memory • chunking • backpressure • bulk insert (`SqlBulkCopy`, `COPY`, EFCore.BulkExtensions) • idempotency • virus scanning • SAS/pre-signed URLs • `IFormFile` limits and `MultipartReader` streaming • authorization • observability.

---

# 17. Coding Challenge 09 — URL Shortener
## Difficulty: Senior | Time: 90–120 minutes

```text
POST /urls
GET  /{shortCode}
```

Unique codes, redirect (`301` vs `302`), expiry, analytics, high read traffic.

Discuss: ID generation (counter + Base62, hash, Snowflake-style) • collision handling • Redis / `HybridCache` • DB indexes • hot keys • async analytics (don't write on the redirect path) • horizontal scaling • abuse/rate limiting.

---

# 18. Coding Challenge 10 — Ledger
## Difficulty: Lead | Time: 120–180 minutes

```text
Credit(account, amount) / Debit(account, amount) / Transfer(from, to, amount)
```

- No negative balance • atomic transfer • immutable history • idempotency • audit trail
- Use `decimal` / `numeric(18,4)`; never floating point
- Double-entry thinking (every transfer = two entries summing to zero)
- Consistent lock ordering (lock lower account id first) to avoid deadlocks
- Atomic conditional update or `SERIALIZABLE`/retry; `rowversion` concurrency token
- Append-only entries table; balances derived or maintained transactionally

### Killer question

> What happens if account A is debited but B is not credited?

Answer: it can't within a single DB transaction; across systems, discuss saga/compensation, reconciliation jobs, and immutable audit trail.

---

# 19. Coding Challenge 11 — Transactional Outbox
## Difficulty: Lead | Time: 90–150 minutes

```text
Order Service -> orders + outbox_events (same transaction)
Publisher (BackgroundService) -> broker
```

Implement with plain EF Core first (one `SaveChangesAsync` writes order + outbox row), then compare with MassTransit's EF Core outbox / Wolverine / CAP.

Discuss: polling publisher (`SKIP LOCKED` for multi-instance) • CDC/Debezium • duplicate publication • consumer idempotency (inbox table) • ordering • retries • cleanup • monitoring • poison events.

### Critical question

Can you guarantee exactly-once business effects? Explain why transport-level "exactly once" ≠ business-level exactly once → at-least-once delivery + idempotent consumers.

---

# 20. Coding Challenge 12 — Production Debugging
## Difficulty: Lead | Time: 60–90 minutes

Normal p95 = 100ms. Now:

```text
p95 = 1.8s   p99 = 6s   5xx = 4%
CPU = 35%    Memory = 65%
DB CPU = 92% Broker lag increasing
```

### Expected sequence

1. Scope the incident (who/what/since when).
2. Recent deployments / config / feature flags.
3. Traffic changes.
4. Latency by endpoint.
5. Distributed traces (OpenTelemetry / Application Insights).
6. DB query latency; slow queries; missing index / plan regression / parameter sniffing.
7. Connection pool state (`dotnet-counters`: pool usage, thread pool queue length).
8. Locks/blocking (`sys.dm_exec_requests`, `pg_stat_activity`).
9. Consumer lag.
10. Downstream dependencies.
11. Mitigate (rollback, shed load, disable feature, scale *only if* not DB-bound).
12. Confirm recovery.
13. RCA, then prevent recurrence.

### .NET diagnostic toolbox

`dotnet-counters` • `dotnet-trace` • `dotnet-dump` / `dotnet-gcdump` • `dotnet-monitor` • PerfView • Application Insights Live Metrics • EF Core logging with sensitive data off • `EXPLAIN`/execution plans.

### Follow-ups

- Restart pods? Scale horizontally? When does scaling worsen it (more app instances → more DB connections)?
- DB saturation vs app saturation?
- Thread pool starvation signature: low CPU, high latency, growing thread-pool queue.
- Safe rollback.

---

# 21. System design exercises

Practise repeatedly:

1. **Payment platform** — 1M tx/day, correctness, idempotency, reconciliation, audit.
2. **Banking transaction API** — isolation, ledger, DR, encryption.
3. **High-volume customer data platform** — billions of events/day, Kafka, stream processing.
4. **Notification platform** — multi-channel, retries, dedup.
5. **API gateway** — routing, authN/Z, rate limiting, circuit breakers (YARP/APIM/Kong).
6. **Distributed file processing** — blob storage, queues, autoscaling workers (KEDA).
7. **E-commerce checkout** — cart → checkout → payment → inventory → order → fulfilment; saga/compensation.
8. **Legacy modernisation** — .NET Framework monolith → .NET 8: strangler fig, anti-corruption layer, YARP façade, parallel run, data migration.
9. **Multi-tenant SaaS** — tenant isolation (schema/DB/row), noisy-neighbour, per-tenant config.

---

# 22. System-design scoring rubric

Score 0–5: Requirements • Scale • Architecture • Data • Concurrency • Failure handling • Security • Observability • Scalability • Cost • Communication.
Target: **40+/55**.

---

# 23. Cloud interview preparation — Azure first, AWS second

## Azure (know deeply)

| Area | Services |
|---|---|
| Compute | App Service, Container Apps, AKS, Functions, VMs/VMSS |
| Networking | VNet, subnets, NSG, UDR, NAT Gateway, Private Link/Private Endpoints, Front Door, Application Gateway, Load Balancer, Azure DNS, APIM |
| Storage | Blob, Files, Managed Disks |
| Data | Azure SQL, SQL Managed Instance, PostgreSQL Flexible Server, Cosmos DB, Redis |
| Messaging | Service Bus, Event Hubs (Kafka-compatible), Event Grid, Storage Queues |
| Security | Entra ID, Managed Identity, RBAC, Key Vault, Defender for Cloud, WAF, Azure Policy |
| Observability | Azure Monitor, Application Insights, Log Analytics, KQL |
| DevOps | Azure DevOps Pipelines, GitHub Actions, ACR, Bicep/Terraform |

## AWS equivalents (be able to map)

EC2/ECS/EKS/Lambda • VPC/ALB/NLB/API Gateway/CloudFront/Route 53 • S3/EBS/EFS • RDS/Aurora/DynamoDB/ElastiCache • SQS/SNS/EventBridge/MSK • IAM/KMS/Secrets Manager/WAF • CloudWatch/X-Ray.

Use the **Well-Architected Framework** (both clouds): operational excellence, security, reliability, performance efficiency, cost optimisation, sustainability.

---

# 24. Cloud senior questions

1. Design a highly available ASP.NET Core API on Azure (and again on AWS).
2. App Service vs Container Apps vs AKS vs Functions?
3. Azure SQL vs Cosmos DB vs PostgreSQL?
4. Service Bus vs Event Hubs vs Kafka vs Storage Queues?
5. Front Door vs Application Gateway vs APIM?
6. When use private endpoints / private subnets?
7. NSG vs firewall vs WAF?
8. Managed Identity vs service principal + secret — why prefer MI?
9. How do you rotate secrets (Key Vault references, rotation policies)?
10. Multi-AZ vs multi-region design; paired regions.
11. Zero-downtime deployment: slots, blue/green, canary, rolling.
12. How do you reduce cloud cost (right-sizing, reservations/savings plans, autoscaling, storage tiers)?
13. Investigate a latency incident using Application Insights + KQL.
14. Disaster recovery; RTO vs RPO; backup/restore tests.
15. Secure a storage account/bucket; prevent public exposure.
16. Least-privilege RBAC/IAM.
17. Monitor an AKS workload.
18. Pods restarting repeatedly — diagnosis.
19. Secrets in Kubernetes (CSI Secret Store, Workload Identity).
20. Hybrid connectivity to on-prem SQL Server (VPN/ExpressRoute).
21. Lift-and-shift vs re-platform vs refactor for a .NET Framework app.
22. Data residency/POPIA considerations — South Africa North/West regions, af-south-1.

---

# 25. IaaS / Infrastructure interview preparation

```text
Region -> Availability Zones -> VNet/VPC -> Subnets -> Routing -> Security
-> Load Balancer -> Compute -> Storage -> Database -> Observability
```

### Networking

VNet/VPC • public vs private subnet • routing • NAT • internet gateway • NSG/security group • NACL • CIDR • DNS (private zones) • TCP vs UDP • TLS handshake • what happens when a browser calls an HTTPS API • MTU • connection timeout vs reset • SNAT port exhaustion (classic Azure/.NET `HttpClient` issue).

### Compute

VM vs container vs serverless • stateless vs stateful • autoscaling • load balancing • health checks • connection draining • graceful shutdown (`IHostApplicationLifetime`, `ShutdownTimeout`) • immutable infrastructure • golden images.

### Windows/IIS awareness (common in .NET shops)

IIS app pools, in-process vs out-of-process hosting for ASP.NET Core, Windows Server patching, Windows containers vs Linux containers, migrating IIS apps to containers.

---

# 26. IaC assessment — Terraform and Bicep

## Assessment A — Azure environment with Terraform (90–150 min)

```text
Resource Group
 └── VNet
      ├── public/app subnets
      ├── private/data subnets
      ├── NSGs, route tables, NAT
      └── App Service/Container Apps/AKS + Azure SQL/PostgreSQL + Key Vault + Storage
```

Add: variables • outputs • modules • environments • remote state (Azure Storage backend with blob lease locking; S3 + DynamoDB/lockfile on AWS) • validation • `fmt`/`validate`/`tflint` • CI plan • controlled apply • managed identities • private endpoints.

### Senior questions

1. Why remote state? Locking?
2. Drift: detect and remediate?
3. State corruption recovery?
4. `import` / `moved` blocks / `state mv`?
5. `plan` vs `apply`; saved plans in CI?
6. Why avoid portal/console changes?
7. Secrets management (Key Vault, no secrets in state where avoidable, sensitive outputs)?
8. Module versioning and registries?
9. dev/staging/prod structure (workspaces vs directories vs Terragrunt)?
10. Reviewing infra changes; protecting from destructive changes (`prevent_destroy`, plan review gates)?
11. Policy as code (OPA/Conftest, Sentinel, Azure Policy, Checkov)?
12. Terraform vs Bicep vs Pulumi — choose and justify.

## Assessment B — Terraform refactor

Refactor a flat config into:

```text
modules/compute/{main,variables,outputs}.tf
envs/{dev,staging,prod}/
```

No hardcoded credentials, variable validation, tagging, encryption, least privilege, CI plan, approval before prod apply. Bonus: policy checks, drift detection, security scanning (tfsec/Checkov), cost estimation (Infracost).

---

# 27. Kubernetes senior assessment (AKS/EKS)

## Scenario

Deploy an ASP.NET Core service:

- 3 replicas, rolling update
- readiness/liveness/startup probes mapped to `/health/ready` and `/health/live`
- resource requests/limits (and .NET memory behaviour in containers: GC heap limit is derived from cgroup limit; `DOTNET_GCHeapHardLimit*` knobs)
- HPA (CPU/memory/custom metrics) or **KEDA** (queue length / Kafka lag)
- ConfigMap, Secret / CSI Key Vault, Service, Ingress (NGINX/AGIC/YARP)
- PodDisruptionBudget, graceful shutdown (`preStop` sleep + `terminationGracePeriodSeconds` > app shutdown timeout)
- Non-root container, read-only filesystem, chiseled/distroless .NET images

### Questions

1. Deployment vs StatefulSet?
2. Service types; ClusterIP vs LoadBalancer vs Ingress?
3. Readiness vs liveness vs startup?
4. What happens when readiness/liveness fails?
5. Requests vs limits; CPU throttling effect on .NET thread pool?
6. OOMKilled — causes in a .NET app?
7. CrashLoopBackOff diagnosis?
8. How does HPA work? Why can HPA on CPU be a poor signal for I/O-bound .NET APIs?
9. Zero-downtime deploy; rollback?
10. Pod-to-pod security; NetworkPolicy?
11. Secrets management; Workload Identity?
12. DNS and service connectivity troubleshooting?
13. High CPU / high memory debugging (ephemeral debug containers + `dotnet-counters`)?
14. Node disappears — what happens?
15. Multi-stage Dockerfile for .NET (`sdk` → `aspnet`/chiseled), layer caching, `dotnet publish` flags, health check in image?

---

# 28. CI/CD senior assessment

```text
Commit -> Build -> Unit Tests -> Static Analysis (Roslyn analyzers, SonarQube)
-> Dependency Scan (NuGet audit, Dependabot) -> Integration Tests (Testcontainers)
-> Build Image -> Container Scan -> Push (ACR/ECR) -> Deploy Dev -> Smoke Tests
-> Deploy Staging -> Approval -> Deploy Production -> Health Checks -> Observe
```

Tools: **Azure DevOps Pipelines**, **GitHub Actions**, GitLab CI, Argo CD / Flux (GitOps), Helm/Kustomize.

Questions:

- Prevent broken builds (branch policies, required checks)?
- Secure pipeline credentials (OIDC federation vs stored secrets)?
- Supply-chain: NuGet package signing/lock files (`packages.lock.json`), SBOM, image signing (cosign), pinned base images?
- Rollback strategy?
- Canary/blue-green; feature flags?
- DB migrations in the pipeline (bundle step with approval)?
- Prevent deploys during incidents (change freeze/environment protection rules)?
- GitOps — pull vs push deployments?
- Monorepo vs multi-repo; build caching (`--no-restore`, NuGet cache)?
- Versioning (GitVersion/MinVer), artifacts, promotion of the *same* artifact across environments?

---

# 29. Production observability

Logs ("what happened") • Metrics ("how much/how often") • Traces ("where did time go") • Profiles ("where is CPU/memory going").

.NET stack: **OpenTelemetry .NET SDK** (traces/metrics/logs, OTLP) • `ILogger` + **Serilog** (structured, enrichers) • **Application Insights** • Seq/ELK/Loki/Grafana/Prometheus • `System.Diagnostics.Activity` / `ActivitySource` • `System.Diagnostics.Metrics` (`Meter`, `Counter`, `Histogram`) • health checks UI • `dotnet-monitor`.

Know: correlation ID • trace ID • span • W3C `traceparent` • structured logging • RED/USE • SLI/SLO/SLA • error budget.

### Senior questions

1. What should every .NET service expose? (health live/ready, metrics, traces, structured logs, version info)
2. Which metrics indicate saturation? (thread pool queue length, GC pause %, DB pool wait, request queue)
3. What is an SLO; how does an error budget influence decisions?
4. Trace a request through 10 services (context propagation incl. through messages)?
5. Avoid logging sensitive data (POPIA/PII) — destructuring policies, redaction?
6. Actionable alerts vs alert fatigue?
7. Log levels and cost of verbose logging; `LoggerMessage` source generator?

---

# 30. Security interview

OWASP API Top 10: broken object/function-level authorization • injection • broken authentication • SSRF • misconfiguration • vulnerable dependencies • excessive data exposure/mass assignment (bind to DTOs, never entities) • unrestricted resource consumption • improper inventory.

.NET-specific: parameterised queries/EF (and `FromSqlRaw` injection risk) • anti-forgery • Data Protection • `[Authorize]` defaults (fallback policy) • HSTS/HTTPS redirection • secure headers • model binding over-posting • deserialisation (`BinaryFormatter` obsolete; `System.Text.Json` polymorphism limits) • NuGet supply chain.

Questions: JWT vs session • OAuth2 vs OIDC • RBAC vs ABAC • service-to-service protection • credential rotation • secret storage • SQL injection prevention • SSRF protection (outbound allow-lists, `HttpClient` handler restrictions) • replay prevention • securing internal APIs • audit logging • POPIA obligations (lawful processing, retention, breach notification).

---

# 31. Distributed systems

CAP/PACELC • consistency models • quorum • leader election • distributed locks • consensus (conceptual) • retries/timeouts • circuit breakers • bulkheads • backpressure • load shedding • idempotency • deduplication • distributed tracing • sagas.

.NET resilience: **Polly v8 / `Microsoft.Extensions.Resilience`** — retry with jitter, circuit breaker, timeout, hedging, rate limiter, bulkhead (concurrency limiter); `AddStandardResilienceHandler()` on `IHttpClientFactory`.

Questions: why distributed systems are hard • why retries are dangerous / retry amplification • thundering herd • cascading failure • circuit breaker • why every network call needs a timeout • choosing timeouts (budget across call chain) • eventual consistency — when unacceptable.

---

# 32. Microservices & modular monoliths

Know service boundaries/bounded contexts • data ownership • API contracts (OpenAPI, gRPC, Pact consumer-driven contracts) • sync vs async • service discovery • gateways (YARP, APIM, Ocelot) • resilience • observability • versioning.

Questions:

1. When should you **not** use microservices? (Often → modular monolith.)
2. How do you define boundaries?
3. Shared database across services?
4. Distributed transactions → saga/outbox.
5. Contract versioning.
6. Preventing cascading failures.
7. Migrating a monolith (strangler fig; YARP in front of legacy .NET Framework app).
8. What makes a distributed monolith?
9. **.NET Aspire** — what problem it solves (orchestration, service defaults, local dev, telemetry) and where it stops (not a production orchestrator replacement).
10. MediatR/CQRS — when it helps vs when it's ceremony.

---

# 33. Performance engineering

Scenario: p95 120ms → 900ms. Check app CPU • GC • thread pool • connection pools • DB • locks • network • downstream • broker • cache • serialisation • payload size.

.NET tooling & techniques: BenchmarkDotNet • `dotnet-trace` / PerfView / Visual Studio profiler / JetBrains dotTrace • allocation profiling (reduce LINQ/boxing/string concat; `StringBuilder`, `ArrayPool`, `Span`) • `System.Text.Json` source generation • response compression • `AsNoTracking` + projections • compiled queries • Server GC vs Workstation GC • `TieredPGO` • avoiding sync-over-async • HTTP/2, connection reuse.

Questions: profile .NET • find slow SQL (EF logging, query store, `pg_stat_statements`) • tune connection pool • identify thread starvation • investigate GC • caching safely (cache-aside, write-through, write-behind) • cache stampede (`HybridCache` stampede protection, per-key locks) • cache invalidation.

---

# 34. Testing

Pyramid: Unit → Integration → E2E.

.NET stack: **xUnit** (or NUnit), **FluentAssertions/Shouldly**, **NSubstitute/Moq**, **AutoFixture/Bogus**, **WebApplicationFactory<T>**, **Testcontainers for .NET**, **Respawn** (DB reset), **WireMock.Net**, **Pact.NET**, **BenchmarkDotNet**, **NBomber/k6** (load), **Stryker.NET** (mutation).

Senior questions:

1. What do you unit test vs integration test?
2. When is mocking harmful? (Don't mock `DbContext`; use real DB via Testcontainers; in-memory provider hides relational behaviour.)
3. Why Testcontainers?
4. Testing messaging (in-memory harnesses: MassTransit test harness; real broker in container)?
5. Testing DB concurrency (parallel tasks hitting the same row, assert invariants)?
6. Testing retries (fake `TimeProvider`, `FakeTimeProvider`)?
7. Testing idempotency (same request N times in parallel)?
8. Testing failure scenarios (fault injection, WireMock delays/500s)?
9. Making code testable: `TimeProvider`, `IClock`, avoiding statics.

---

# 35. Technical leadership interview

## Technical decisions

> Tell me about a difficult technical decision you made.

Structure: Context → Problem → Constraints → Options → Decision → Trade-offs → Implementation → Result → What I'd change.

## Architecture disagreement

> A senior engineer strongly disagrees with your architecture.

Understand the objection • agree objective criteria • prototype/spike if useful • compare trade-offs • involve stakeholders • record the decision (ADR) • disagree-and-commit.

## Underperforming engineer

Expectations • evidence • feedback • support/pairing • measurable improvement • follow-up • escalation if needed.

## Production incident

Incident command • mitigation first • communication • rollback • blameless culture • RCA • corrective actions • prevention.

## Legacy modernisation (very common for .NET leads)

> You've inherited a .NET Framework 4.x monolith with WCF services and a 400-table SQL Server database. What's your plan?

Strong answer: characterise first (dependency map, hot paths, test coverage) • add characterization tests • upgrade assistant/`try-convert` for libraries, multi-target (`net48;net8.0`) • strangler-fig with YARP • extract seams by business capability • anti-corruption layer for WCF/SOAP • migrate data ownership gradually • CI/CD and observability first • measure value, avoid big-bang rewrite.

---

# 36. ADR exercise

```markdown
# ADR-001: Use Azure Service Bus for order events

## Context
Orders must notify multiple downstream consumers; team is on Azure; moderate volume (~500 msg/s).

## Options
1. REST webhooks
2. Azure Service Bus
3. Kafka (Event Hubs / Confluent)

## Decision
Azure Service Bus topics + subscriptions with MassTransit.

## Reasons
- Managed, native Managed Identity auth
- Per-subscriber DLQ, sessions for ordering, duplicate detection
- Lower operational burden than self-hosted Kafka

## Trade-offs
- No log replay like Kafka
- Throughput ceiling / cost at very high volume

## Consequences
Consumers must be idempotent; monitor DLQ depth and active message count.
```

---

# 37. Behavioural questions for technical leads

Prepare real examples: biggest technical failure • biggest production incident • difficult stakeholder • technical disagreement • architecture you changed • legacy system you modernised (e.g. .NET Framework → .NET 8) • developer you mentored • developer you had to challenge • missed deadline • unexpected success • technical-debt decision • security incident • performance optimisation • cost reduction • architecture decision you regret • a time you said "no" • influencing without authority • simplifying a complex system • improving engineering standards • automating infrastructure toil.

---

# 38. Time-boxed challenge strategies

**60 min:** 0–5 clarify • 5–10 design • 10–40 core implementation • 40–50 tests/edge cases • 50–60 trade-offs, failure, scaling, security, improvements.

**90 min:** 0–10 requirements/design • 10–15 data model/API • 15–60 implementation • 60–75 tests/refactor • 75–85 failure/scaling • 85–90 summary.

**120 min:** 0–10 requirements • 10–25 architecture • 25–75 core • 75–95 tests • 95–105 security • 105–115 scalability/failure • 115–120 final explanation.

**180 min:** 0–15 requirements • 15–35 architecture • 35–105 implementation • 105–130 testing • 130–145 security • 145–160 observability • 160–170 scaling • 170–180 trade-offs.

Never finish with "I didn't have time to test." For senior roles testing and reasoning are part of the assessment. In a take-home, include a short `README`/`DECISIONS.md`: assumptions, design, trade-offs, how to run, what you'd do next.

---

# 39. What NOT to do in a senior .NET assessment

- Over-engineering immediately (Clean Architecture + CQRS + MediatR + 6 projects for a 3-endpoint API)
- Blind use of design patterns / generic repository over EF Core
- Creating 10 microservices for a small problem
- Ignoring validation, tests, concurrency, failures
- Hardcoding secrets / connection strings
- `catch (Exception) { }` swallowing; `throw ex;` (destroys stack trace → use `throw;`)
- Using `double`/`float` for money
- `async void`, `.Result`/`.Wait()`, `Task.Run` wrapping I/O in ASP.NET Core
- `new HttpClient()` per request
- Returning EF entities directly from APIs
- `DateTime.Now` instead of `TimeProvider`/UTC
- Using the EF in-memory provider to "test" relational behaviour
- Auto-migrating on startup in multi-replica deployments
- Singleton holding scoped dependencies (captive dependency)
- Claiming "it's scalable" without explaining how
- Claiming "Kubernetes/Azure handles it" without probes/resources/autoscaling/architecture
- Assuming a broker gives business-level exactly-once
- Assuming a DB transaction solves distributed transactions

---

# 40. Senior coding quality checklist

**Code:** clear naming • small methods • right abstractions • no needless complexity • appropriate data structures • nullable annotations on • analyzers clean • exceptions handled properly • `CancellationToken` passed through • `async` all the way.

**API:** validation • correct status codes • `ProblemDetails` errors • idempotency where needed • authN/authZ • versioning • OpenAPI.

**Database:** constraints • indexes • transactions • concurrency tokens • migration safety • no N+1 • projections.

**Tests:** happy path • validation • boundaries • failure cases • concurrency • integration against a real DB.

**Production:** structured logging • metrics • tracing • health checks • options validation • graceful shutdown • resilience policies with timeouts.

**Security:** secrets externalised • least privilege • input validation • authorization on every endpoint (fallback policy) • no sensitive data in logs.

---

# 41. Algorithm practice (secondary)

Don't spend all your time on LeetCode, but practise in C#: two pointers • sliding window • prefix sums • `Dictionary`/`HashSet` • `PriorityQueue<TElement,TPriority>` • `Queue`/`Deque`-style via `LinkedList`/`Channel` • DFS/BFS • shortest path • topological sort • binary search • sort/merge intervals • recursion • DP basics.

Senior-relevant: LRU cache (`Dictionary` + `LinkedList`, thread-safe variant) • rate limiter • retry/backoff with jitter • scheduler • dedup • batching • pagination (keyset) • stream aggregation • bounded-concurrency pipelines with `Channel<T>`.

---

# 42. Weekly rotation of practical challenges

| Challenge | Time | Priority |
|---|---:|---|
| Idempotent payment API | 120m | Critical |
| Rate limiter | 90m | Critical |
| Inventory reservation | 120m | Critical |
| Order service | 180m | Critical |
| Event processor (BackgroundService) | 120m | Critical |
| Outbox | 120m | Critical |
| EF Core / SQL optimisation | 60m | Critical |
| Schema migration | 90m | Critical |
| Notification system | 150m | High |
| File processing | 150m | High |
| URL shortener | 90m | Medium |
| Ledger | 180m | Critical |
| Production debugging | 60m | Critical |
| Terraform (Azure or AWS) | 150m | Critical |
| Kubernetes deployment | 120m | Critical |
| CI/CD pipeline | 90m | High |
| Legacy .NET Framework modernisation plan | 60m | High |

---

# 43. 4-week preparation programme

**Week 1 — Backend depth:** D1 C# async/concurrency/collections • D2 ASP.NET Core pipeline/DI/auth • D3 EF Core + SQL internals • D4 REST/API/security • D5 messaging/event-driven • D6 payment API challenge • D7 mock technical interview.

**Week 2 — Distributed systems:** D1 caching/rate limiting • D2 distributed transactions/sagas • D3 outbox/idempotency • D4 microservices vs modular monolith • D5 system design • D6 order service challenge • D7 90-min mock.

**Week 3 — Cloud/IaaS:** D1 networking (Azure/AWS) • D2 compute/storage/data • D3 security (Entra/Managed Identity/Key Vault) • D4 Terraform/Bicep • D5 Kubernetes • D6 CI/CD • D7 Terraform + K8s practical.

**Week 4 — Technical Lead:** D1 architecture decisions/ADRs • D2 production incidents • D3 performance engineering (.NET diagnostics) • D4 security architecture • D5 leadership scenarios + legacy modernisation • D6 3-hour full assessment • D7 full mock interview.

---

# 44. Full 3-hour mock assessment

**Part A — Coding (75 min):** idempotent order-creation API in ASP.NET Core 8 + PostgreSQL/SQL Server: JWT auth, validation, idempotency, transaction, EF Core persistence, xUnit + Testcontainers tests.

**Part B — System design (45 min):** order-processing platform at 10,000 orders/sec: API, DB, broker, cache, scaling, failure handling, observability.

**Part C — Cloud/IaaS (30 min):** Azure design — Front Door + WAF → App Gateway/APIM → AKS or Container Apps → Azure SQL/PostgreSQL → Redis → Service Bus/Event Hubs → Blob → Azure Monitor; explain networking and security (private endpoints, Managed Identity). Then map to AWS.

**Part D — IaC (20 min):** Terraform modules, remote state, locking, environments, CI/CD, drift.

**Part E — Leadership (10 min):** "Your team wants to split a stable monolith into microservices. How do you decide?"

---

# 45. Interviewer attack-question chain

"Why?" → "What happens if it fails?" → "How does it scale?" → "What does it cost?" → "How do you monitor it?" → "How do you secure it?" → "How do you test it?" → "How do you roll it back?" → "What changes at 10x scale?"

Practise answering all nine for every design.

---

# 46. Senior-level red flags

- Knows framework syntax, not runtime behaviour (e.g. can't explain async state machines, DI lifetimes, change tracking)
- Can't explain own architecture
- Can't explain transactions or isolation
- Can't discuss concurrency or thread-pool starvation
- Can't reason about distributed failures
- Treats Kafka/Service Bus as a magic queue; Kubernetes/Azure as magic scalability
- Can't explain cloud networking or Terraform state
- No production incident stories
- Can't quantify scale or explain trade-offs
- Can't mentor/influence
- Answers architecture questions with technology lists

---

# 47. What excellent answers sound like

Weak:
> "I would use Service Bus because it's scalable."

Strong:
> "I'd use Service Bus topics because this workflow has several independent subscribers, moderate volume, and the team is already on Azure with Managed Identity, so we avoid running Kafka. I'd use sessions keyed by order ID where per-order ordering matters. Consumers are idempotent via an inbox table, because at-least-once delivery means duplicates are expected. I'd alert on DLQ depth and oldest-message age. The trade-off is no long-term replay and a throughput ceiling compared with Kafka, which I'd revisit if volume grows 10x."

---

# 48. Cursor mock-interviewer prompt

```text
You are a Principal Engineer interviewing me for a Senior Backend / Technical Lead position.

Use C#, .NET 8, ASP.NET Core, EF Core, PostgreSQL/SQL Server, Kafka or Azure Service Bus, Azure/AWS, Kubernetes and Terraform where appropriate.

Do NOT make the interview easy.

Give me one realistic production engineering problem at a time.
The assessment must take between 60 and 180 minutes.

First provide ONLY:
1. Problem statement
2. Business context
3. Functional requirements
4. Non-functional requirements
5. Constraints
6. Expected deliverables
7. Time limit

Do not give me the solution.

During the exercise:
- challenge my assumptions
- ask why
- ask about failure scenarios, concurrency, security, scalability, observability, testing, deployment, rollback, cost
- probe .NET specifics: async/await pitfalls, DI lifetimes, EF Core behaviour, HttpClient usage, thread pool, GC

Do not provide code unless I explicitly ask for a hint.

After I submit, score me 0-5 in:
requirements analysis, architecture, code quality, correctness, concurrency, database design, testing, security, observability, scalability, failure handling, communication, technical leadership

Then give:
1. What I did well
2. What I missed
3. Production risks
4. Better alternatives
5. What a Staff/Lead engineer would have considered
6. Model solution (C#)
7. Interviewer follow-up questions
8. Final hiring recommendation: Strong Hire / Hire / Borderline / No Hire

Be demanding. Do not reward buzzwords. Require concrete reasoning and trade-offs.
```

---

# 49. Cursor code-review prompt

```text
Review this C#/.NET implementation as a Principal Engineer conducting a senior backend hiring assessment.

Focus on:
- correctness, concurrency, race conditions
- async/await misuse (sync-over-async, async void, missing CancellationToken, fire-and-forget)
- DI lifetime problems (captive dependencies)
- EF Core issues (N+1, tracking, transaction boundaries, concurrency tokens, migrations)
- HttpClient usage and resilience (timeouts, retries, circuit breakers)
- API design, ProblemDetails, validation
- security (authN/Z, over-posting, secrets, injection)
- performance and allocations
- error handling and logging (no swallowed exceptions, no `throw ex;`)
- observability
- testing quality (real DB vs mocks)
- maintainability and production readiness

Do not rewrite everything immediately.
First identify the problems. For each:
1. Why it is a problem
2. Production impact
3. Severity
4. How an interviewer would evaluate it
5. Recommended fix
6. Trade-offs

Then provide a corrected implementation.
```

---

# 50. Cursor system-design interviewer prompt

```text
Act as a Principal Engineer conducting a 75-minute system design interview.

Give me a real-world problem involving backend APIs (ASP.NET Core), distributed systems, databases, messaging (Kafka/Service Bus), Azure or AWS, Kubernetes, security and observability.

Do not provide the architecture. Make me drive the interview.

Challenge every major decision with:
- What happens if it fails?
- How does it scale?
- Why this technology?
- What is the consistency model?
- What is the bottleneck?
- How do you secure it?
- How do you monitor it?
- What happens during a deployment?
- What happens during a region outage?
- What happens at 10x traffic?
- What does it cost?

Score my final architecture as a Senior/Lead/Staff candidate.
```

---

# 51. Cursor IaC interviewer prompt

```text
Act as a Senior Cloud/Platform Engineer interviewing me for a Technical Lead role.

Give me a 90-150 minute Terraform assessment on Azure (or AWS if I ask) involving VNet/VPC, subnets, routing, security, compute (AKS/Container Apps/App Service), load balancing, database, identity (Managed Identity/IAM), Key Vault, Terraform modules, remote state and CI/CD.

Do not provide the implementation.

Challenge: security, state management, drift, module design, environment separation, secrets, least privilege, rollback, destructive changes, cost, disaster recovery.

After completion, grade me as Junior / Mid / Senior / Lead / Staff and explain why.
```

---

# 52. Cursor production-incident prompt

```text
Act as an Incident Commander and Principal Engineer.

Give me a realistic production incident involving ASP.NET Core, EF Core, SQL Server/PostgreSQL, a message broker, Kubernetes and Azure/AWS.

Provide symptoms but not the root cause. I investigate step by step.
Do not reveal the root cause until I conclude or ask.

Include realistic .NET failure modes (thread-pool starvation, HttpClient socket exhaustion, connection-pool exhaustion, GC pressure, captive dependencies, EF N+1, parameter sniffing, poison messages).

Challenge my methodology and evaluate: prioritisation, observability, hypothesis formation, debugging, mitigation, communication, risk management, RCA, prevention.
```

---

# 53. Cursor legacy-modernisation prompt

```text
Act as a CTO asking me to modernise a legacy .NET Framework 4.8 monolith (WCF, ASMX, Web Forms/MVC 5, SQL Server stored-procedure heavy, deployed on IIS).

Give me constraints (small team, no downtime tolerance, limited tests, POPIA compliance).

Make me produce: assessment approach, target architecture, migration strategy (strangler fig, YARP, anti-corruption layer), data strategy, testing strategy, CI/CD/observability plan, risk register, phased roadmap, and team/stakeholder communication plan.

Challenge every decision. Grade me as a Technical Lead candidate.
```

---

# 54. Final preparation priority

**Tier 1 — must be excellent:** C# & async/concurrency • ASP.NET Core • EF Core + SQL • REST APIs • distributed systems • system design • messaging • Azure/AWS • Kubernetes • Terraform/IaC • production debugging • security • testing • technical communication.

**Tier 2 — strong:** CI/CD • observability (OpenTelemetry) • Redis/caching • Docker • performance engineering • API gateways • resilience (Polly) • schema migration • event-driven architecture • legacy modernisation.

**Tier 3 — supporting:** algorithms • design patterns • NoSQL • gRPC/SignalR • Angular/React awareness (for full-stack roles) • Flutter/MAUI awareness.

---

# 55. Positioning

Don't present as "a developer who can code C#." Present as:

> "A senior .NET engineer who can design, implement, secure, deploy, operate and evolve production systems across application and infrastructure, make sound technical decisions, and help other engineers deliver."

Target roles: Senior .NET Developer • Senior C# Backend Engineer • Senior Software Engineer (.NET/Cloud) • Technical Lead — .NET • Lead Software Engineer • Staff Software Engineer • Solutions/Software Architect • Cloud Backend Engineer • Platform Engineer with strong .NET ownership.

---

# 56. Reference starting points

- Microsoft Learn — ASP.NET Core fundamentals, middleware, DI, minimal APIs, rate limiting, health checks, authentication/authorization
- Microsoft Learn — EF Core (performance, concurrency, migrations bundles), .NET GC, async/await guidance, `HttpClient` guidelines
- Microsoft — Azure Architecture Center & Azure Well-Architected Framework
- AWS Well-Architected Framework
- HashiCorp — Terraform state, modules, recommended practices; Azure/AWS backend docs
- OpenTelemetry .NET docs
- Polly v8 / `Microsoft.Extensions.Resilience` docs
- MassTransit, Confluent.Kafka, Azure Service Bus .NET SDK docs
- Testcontainers for .NET; `WebApplicationFactory` integration-testing docs
- Books: *Designing Data-Intensive Applications* (Kleppmann), *Concurrency in C# Cookbook* (Cleary), *Pro .NET Memory Management* (Kokosa), *Domain-Driven Design Distilled* (Vernon), *Release It!* (Nygard)
