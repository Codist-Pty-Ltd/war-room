# Top 5 Likely Interview Questions — Model Answers (Ntokozo Banda)

Use these as **spoken answers** (2–4 minutes each). Adjust names/details to match what you can defend in the room.

---

## 1. Legacy .NET modernisation or migration — approach and challenges

### Short headline

> I’ve modernised **how the business integrates with legacy** — not always by rewriting the core on day one, but by introducing **ASP.NET Core services**, standard REST contracts, and CI/CD in front of older engines.

### Structured answer (STAR)

**Situation:** At **ABSA (Core Banking Gateway)**, payment processors speak modern protocols, while core banking systems use **legacy contracts and operational constraints**. The goal was not a big-bang rewrite but **safe, incremental modernisation** of the integration surface.

**Task:** Design and maintain a **gateway layer** — ASP.NET Core microservices that **normalise** inbound traffic, enforce security, and translate to core-banking calls with **retries, idempotency, and observability**.

**Approach:**

1. **Strangler / façade** — new capabilities and channels go through the gateway; legacy core stays until bounded contexts are proven.
2. **Anti-corruption layer** — map external DTOs to internal models; never leak legacy shapes to public APIs.
3. **Parallel run** — compare responses in lower environments before cutover.
4. **Automated delivery** — Azure DevOps pipelines (build, test, deploy) so modern services release independently of monolith cadence.
5. **Security first** — OWASP-aligned validation, no secrets in code, audit-friendly logging (no unnecessary PII).

**At IQbusiness (2020–2024):** Delivered **greenfield ASP.NET Core** systems (Investec onboarding, Toyota Kinto) while integrating **older enterprise patterns** (stored procedures, existing SQL schemas, third-party SOAP/REST). That is migration in practice: **new .NET Core apps coexisting with legacy data and services**.

**Challenges:**

| Challenge | How we handled it |
|-----------|-------------------|
| Unknown legacy behaviour | Characterisation tests, shadow traffic, tight logging with correlation IDs |
| Downtime tolerance | Rolling deploys, backward-compatible API versions |
| Data consistency | Clear transaction boundaries; idempotency keys on financial flows |
| Team skill mix | Code reviews, pairing, shared patterns (Clean Architecture, CQRS where it helped) |
| Scope creep | Explicit “in scope / out of scope” per phase |

**Close:**  
> “Modernisation for me is **risk-managed evolution**: gateway first, measurable slices, strong tests, and never betting the bank on a single cutover.”

---

## 2. Azure — App Service, Azure SQL, Key Vault, Application Insights

### Short headline

> My deepest hands-on Azure work is **Azure DevOps CI/CD** and **cloud-ready .NET services**; I design for **App Service / Azure SQL / Key Vault / Application Insights** as the standard production stack even when specific apps run on hybrid or client-managed infrastructure.

### Honest framing

On CV, **Azure DevOps** is explicit daily use. Position **App Service, Azure SQL, Key Vault, and Application Insights** as services you’ve **integrated with or designed for** — align with ABSA/IQ enterprise Azure adoption. Do not claim sole ownership of a full landing zone unless you did.

### How you’ve used (or would describe) each service

| Service | Your story |
|---------|------------|
| **Azure App Service** | Host ASP.NET Core APIs and workers; deployment slots for blue/green; always-on and health checks for banking-style uptime; App Service ↔ Azure SQL via private networking in a full Azure design. |
| **Azure SQL** | Same T-SQL and EF Core patterns as on-prem SQL Server; connection pooling, retry policies, migration bundles (not migrate-on-startup with multiple instances). |
| **Key Vault** | Store API keys, connection strings, certificates; apps use **Managed Identity** to read secrets — no secrets in `appsettings` in prod. Rotation without redeploying code. |
| **Application Insights** | End-to-end **correlation IDs** from API through dependencies; track failures, dependency duration, custom metrics; KQL for “which endpoint regressed after deploy?” |

### Concrete behaviours (transferable from current work)

- **Pipelines (Azure DevOps):** build, test, security scan, deploy to environment; gates before production.
- **Observability mindset:** structured logging (Serilog-style), request tracing, alerting on error rate and latency — whether the backend is App Insights or another APM.
- **Security:** JWT/OAuth2, least privilege, POPIA-aware logging — same whether hosted on App Service or VPS/Kubernetes.

**Close:**  
> “I’m strongest on **shipping .NET safely in Azure-shaped environments**; I’m actively deepening cert-level breadth (AZ-900 in progress) on the full PaaS surface.”

---

## 3. Production performance issue — app vs database vs infrastructure

### Short headline

> I **narrow the blast radius with metrics**, then follow the **slowest layer** — usually DB or downstream dependency when app CPU is low but latency is high.

### Method (what you say you do)

1. **Confirm the symptom** — p95/p99, error rate, which endpoints, since when (deploy? traffic spike?).
2. **Split the stack:**
   - **App CPU high** → profiling, GC, thread pool, hot code path, sync-over-async.
   - **App CPU low, latency high** → often **I/O**: DB, HTTP downstream, broker lag.
   - **DB CPU / waits high** → SQL first (plans, blocking, missing index).
   - **Infra** — saturation, throttling, DNS, network, connection limits.
3. **Use traces** — slowest span in distributed trace (gateway → DB → external bureau).
4. **.NET tooling** — `dotnet-counters` (thread pool queue, GC), connection pool counters, EF Core tagged logging (no sensitive data).
5. **Mitigate** — fix root cause before scaling out (more pods can **worsen** DB connection storms).
6. **RCA** — prevent recurrence (index, cache, circuit breaker, query rewrite).

### Example story (IQbusiness / ABSA-style — safe generic)

**Situation:** Production API **p95 latency jumped**; users reported timeouts on reporting or payment-related endpoints.

**Investigation:** Error logs showed **SQL timeout** on specific queries; App/server CPU was **moderate**; **SQL Server** showed high CPU and long-running reads.

**Root cause:** **N+1** or unbounded query after a release; or **parameter sniffing** / plan regression on a high-volume stored procedure or EF query.

**Fix:** Projection/`Include` fix or optimised SQL; index aligned to `WHERE`/`JOIN`; optional plan guide or stats refresh on SQL Server.

**Result:** Latency back to SLO; added **integration test** or query review gate in PR.

**Close:**  
> “I don’t guess — I **correlate deploy time, traces, and database waits**, then prove the fix in metrics before I call the incident closed.”

---

## 4. .NET Framework vs .NET Core / .NET 8 — differences and migration considerations

### Key differences (interview checklist)

| Area | .NET Framework | .NET 8 (Core lineage) |
|------|----------------|------------------------|
| Platform | Windows-first, IIS | Cross-platform, Kestrel, Linux containers |
| Deployment | IIS, GAC, heavy config | Self-contained, containers, App Service, AKS |
| Web stack | ASP.NET MVC 5, Web API 2, WCF, ASMX | ASP.NET Core (Minimal APIs, middleware pipeline) |
| DI | Third-party or manual | Built-in DI container |
| Config | `web.config` | `appsettings.json`, environment, Key Vault |
| Performance | Baseline | Higher throughput, modern GC, span APIs |
| Long-term support | Maintenance mode | **LTS** (.NET 8) — strategic target |
| APIs | Some Windows-only | Unified BCL; some APIs removed (porting required) |

### Migration considerations (what you’d say as a lead)

1. **Assessment** — inventory projects, NuGet dependencies, WCF/WinForms/WebForms blockers, System.Web usage.
2. **Strategy** — **strangler fig**: new services on .NET 8; YARP reverse proxy to route traffic; anti-corruption layer to legacy.
3. **Not a line-for-line port** — rewrite hot paths; keep stable legacy behind APIs.
4. **Data** — EF6 → EF Core differences; test migrations; expand/contract schema for zero-downtime.
5. **Config & secrets** — move secrets to Key Vault; no passwords in config transforms.
6. **Testing** — automated regression, contract tests for APIs consumed by mobile/web.
7. **Deployment** — CI/CD pipelines; **no** `Database.Migrate()` on startup with multiple instances — use scripts/bundles.
8. **Operational** — health checks, structured logging, Application Insights/OpenTelemetry from day one on new services.

**Personal tie-in:**  
> “At ABSA, the **gateway is .NET Core** precisely to decouple modern channels from **legacy core** — that’s the migration pattern I’ve lived, not just read about.”

---

## 5. SQL Server experience — optimisation and slow queries

### Short headline

> **11+ years** with SQL Server — EF Core in modern apps, **T-SQL and stored procedures** for reporting and BI; I fix slow queries with **plans, indexes, and SARGable predicates**, not guesswork.

### How you optimise

1. **Measure** — actual execution plan, `STATISTICS IO`, duration; on busy systems, Query Store / DMVs (`sys.dm_exec_query_stats`).
2. **Find the pattern** — table scan, key lookup storm, sort/hash spill, blocking, implicit conversion.
3. **Fix in order of leverage:**
   - Rewrite query (remove SELECT *, fix N+1 in app layer).
   - **SARGable** predicates (no `WHERE YEAR(date) = ...` on indexed column).
   - Correct **composite index** column order (equality columns first, then range).
   - **Covering index** (INCLUDE) to avoid lookups.
   - Update statistics; resolve **parameter sniffing** (recompile hint, OPTIMIZE FOR UNKNOWN, or refactor parameters) — explain trade-offs.
4. **Concurrency** — isolation level, deadlock graphs, retry with backoff in app code.
5. **EF Core specifically** — projections, `AsNoTracking` on reads, split queries on cartesian risk, batch size, avoid lazy load in APIs.

### Example story (African Sales / IQ reporting)

Built **SQL-backed reporting** with stored procedures and complex joins for operational dashboards. When reports slowed:

- Identified **missing index** or **scalar UDF** in SELECT (classic anti-pattern).
- Added filtered/covering index or moved logic to set-based T-SQL.
- Validated with before/after plans and row counts.

### Senior one-liner

> “Slow query work is **science**: reproduce, capture plan, change one thing, measure again — and fix the app if the ORM is generating the wrong shape.”

---

## Quick prep — map questions to your proof points

| Question | Proof from your CV |
|----------|-------------------|
| Legacy / modernisation | ABSA Core Banking **Gateway**; IQ **ASP.NET Core** + legacy SQL/integrations |
| Azure | **Azure DevOps** CI/CD; Azure in skills; cert path AZ-900 |
| Performance | Gateway **optimisation**; IQ **high-traffic** production support |
| .NET 8 vs Framework | **.NET 8**, ASP.NET Core daily; early career **ASP.NET MVC / EF** |
| SQL Server | **T-SQL**, stored procedures, **query optimisation**, EF Core |

---

*Practice: read each answer once, then answer **without** the doc in 3 minutes, then tighten to your real project names and dates.*
