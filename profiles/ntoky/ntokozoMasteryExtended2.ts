// client/src/constants/ntokozoMasteryExtended2.ts
// NTOKOZO BANDA — Extended Mastery Tracks Part 2
// Tracks: PostgreSQL Deep Dive, API Design, Distributed Systems,
//         Production Incidents, Angular + Flutter, System Design Interviews
// ─────────────────────────────────────────────────────────────────────

// ═══════════════════════════════════════════════════
// TRACK: POSTGRESQL & EF CORE DEEP DIVE
// Where production bugs actually live
// ═══════════════════════════════════════════════════

export const POSTGRESQL_DEEP_DIVE_TRACK = {
  id: "POSTGRESQL_DEEP_DIVE",
  title: "PostgreSQL & EF Core Deep Dive",
  description: "Execution plans, isolation levels, locking, N+1 queries, migrations in production, pgvector, connection pooling. This is where Billable's data layer lives and where senior engineers earn their keep.",
  color: "#3B82F6",
  drills: [
    {
      id: "pg_001",
      difficulty: "SENIOR",
      question: "EF Core generated a query that is crawling in production. What are the first three things you check and how do you see the actual SQL being executed?",
      answer: "**See the SQL first:**\n```csharp\n// Option 1 — Log to console during development\noptionsBuilder.LogTo(Console.WriteLine, LogLevel.Information);\n\n// Option 2 — Get the SQL before executing\nvar query = _db.Invoices.Where(i => i.Status == 'Pending');\nvar sql = query.ToQueryString(); // shows parameterised SQL\nConsole.WriteLine(sql);\n\n// Option 3 — Production: check pg_stat_statements\nSELECT query, mean_exec_time, calls\nFROM pg_stat_statements\nORDER BY mean_exec_time DESC\nLIMIT 10;\n```\n\n**First three checks:**\n\n1. **N+1 query.** Are you loading a list then calling a navigation property in a loop? Check with `.Include()` or use a projection.\n\n2. **Missing index.** Run `EXPLAIN ANALYZE` on the query. Look for `Seq Scan` on a large table — that is a full table scan with no index.\n\n3. **IQueryable escaped to IEnumerable.** Somewhere you called `.AsEnumerable()`, `.ToList()`, or `.AsNoTracking()` before applying a `.Where()`. The filter ran in .NET memory, not in SQL.",
      followUp: "Show me the difference between IQueryable and IEnumerable in EF Core with a concrete example of how the wrong choice causes a full table scan.",
      followUpAnswer: "```csharp\n// WRONG — IEnumerable: loads ALL invoices into memory, THEN filters\nIEnumerable<Invoice> invoices = _db.Invoices;\nvar pending = invoices.Where(i => i.Status == \"Pending\").ToList();\n// SQL: SELECT * FROM Invoices  ← NO WHERE clause\n// 50,000 rows loaded into memory, filtered in C#\n\n// RIGHT — IQueryable: filter happens in PostgreSQL\nIQueryable<Invoice> invoices = _db.Invoices;\nvar pending = invoices.Where(i => i.Status == \"Pending\").ToList();\n// SQL: SELECT * FROM Invoices WHERE Status = 'Pending'\n// Only matching rows cross the network\n```\n\nThe bug happens when you accept `IEnumerable<T>` as a parameter instead of `IQueryable<T>` in a repository method — the caller passes an `IQueryable`, but once inside the method it is treated as `IEnumerable` and all deferred execution is lost.",
      tags: ["postgresql", "ef-core", "performance", "billable"]
    },
    {
      id: "pg_002",
      difficulty: "SENIOR",
      question: "What is an N+1 query problem? Give a concrete Billable example and show both the bad EF Core code and the fix.",
      answer: "**N+1:** You execute 1 query to load a list of N items, then N more queries to load related data for each item. For N=100 invoices you get 101 queries.\n\n**Bad code (N+1):**\n```csharp\nvar invoices = await _db.Invoices\n    .Where(i => i.OrgId == orgId)\n    .ToListAsync(); // Query 1: loads 100 invoices\n\nforeach (var invoice in invoices)\n{\n    // Query 2, 3, 4... 101: one per invoice!\n    var clientName = invoice.Client.Name;\n    Console.WriteLine($\"{invoice.Number}: {clientName}\");\n}\n```\n\n**Fix — Option A: Eager loading with Include**\n```csharp\nvar invoices = await _db.Invoices\n    .Where(i => i.OrgId == orgId)\n    .Include(i => i.Client) // JOIN in one query\n    .ToListAsync();\n// SQL: SELECT i.*, c.* FROM Invoices i\n//      JOIN Clients c ON i.ClientId = c.Id\n//      WHERE i.OrgId = @orgId\n```\n\n**Fix — Option B: Projection (more efficient if you only need some fields)**\n```csharp\nvar invoices = await _db.Invoices\n    .Where(i => i.OrgId == orgId)\n    .Select(i => new InvoiceListDto\n    {\n        Id = i.Id,\n        Number = i.InvoiceNumber,\n        ClientName = i.Client.Name, // EF Core translates to JOIN\n        Total = i.Total\n    })\n    .ToListAsync();\n```",
      tags: ["postgresql", "ef-core", "n+1", "performance", "billable"]
    },
    {
      id: "pg_003",
      difficulty: "LEAD",
      question: "Explain PostgreSQL isolation levels. Which one does PostgreSQL use by default and what anomalies does it prevent vs allow?",
      answer: "**Four isolation levels (SQL standard):**\n\n| Level | Dirty Read | Non-Repeatable Read | Phantom Read |\n|-------|-----------|---------------------|---------------|\n| Read Uncommitted | Possible | Possible | Possible |\n| Read Committed (PG default) | Prevented | Possible | Possible |\n| Repeatable Read | Prevented | Prevented | Possible |\n| Serializable | Prevented | Prevented | Prevented |\n\n**PostgreSQL default: Read Committed**\n- You only see data committed before your statement began\n- If another transaction commits between two SELECT statements in your transaction, your second SELECT may see different data (non-repeatable read)\n- Phantom reads: a re-run of a range query may return additional rows\n\n**When to use higher isolation in Codist:**\n```sql\n-- Payout job: must not double-pay\n-- Use REPEATABLE READ so balance read stays consistent\nBEGIN ISOLATION LEVEL REPEATABLE READ;\nSELECT available_cents FROM creator_balances\nWHERE creator_id = $1 FOR UPDATE; -- lock the row\nUPDATE creator_balances\nSET available_cents = 0 WHERE creator_id = $1;\nCOMMIT;\n```\n\nIn EF Core: `await _db.Database.BeginTransactionAsync(IsolationLevel.RepeatableRead);`",
      tags: ["postgresql", "transactions", "isolation", "concurrency"]
    },
    {
      id: "pg_004",
      difficulty: "LEAD",
      question: "The Billable API has a migration that adds a column to the Invoices table which has 500,000 rows. Your CTO says you cannot have downtime. How do you execute this migration safely?",
      answer: "**The danger:** `ALTER TABLE ADD COLUMN` in PostgreSQL acquires an `AccessExclusiveLock` that blocks ALL reads and writes for the duration. On a 500K row table with a default value, this can take minutes.\n\n**Safe approach — expand and contract:**\n\n**Step 1: Add nullable column (zero downtime)**\n```sql\n-- Instant in PostgreSQL — no lock needed for nullable with no default\nALTER TABLE \"Invoices\" ADD COLUMN \"DiscountPercent\" numeric(5,2) NULL;\n```\n\n**Step 2: Backfill in batches (while app runs)**\n```sql\n-- Do NOT UPDATE all 500K rows in one transaction\n-- Batch it: 1000 rows at a time\nUPDATE \"Invoices\"\nSET \"DiscountPercent\" = 0\nWHERE id IN (\n    SELECT id FROM \"Invoices\"\n    WHERE \"DiscountPercent\" IS NULL\n    LIMIT 1000\n);\n-- Run this 500 times with a short sleep between\n```\n\n**Step 3: Add NOT NULL constraint after backfill**\n```sql\n-- Only after ALL rows are populated\nALTER TABLE \"Invoices\"\nALTER COLUMN \"DiscountPercent\" SET NOT NULL;\n```\n\n**Step 4: Add default for new rows**\n```sql\nALTER TABLE \"Invoices\"\nALTER COLUMN \"DiscountPercent\" SET DEFAULT 0;\n```\n\nThis is the standard zero-downtime migration pattern. Rails calls it 'expand and contract'. Takes longer but no downtime.",
      tags: ["postgresql", "migrations", "production", "zero-downtime", "billable"]
    },
    {
      id: "pg_005",
      difficulty: "PRINCIPAL",
      question: "Explain what pgvector is, how it works, and give a concrete use case for it in the Codist product suite.",
      answer: "**pgvector** is a PostgreSQL extension that adds a `vector` data type and approximate nearest-neighbour search. It stores embeddings (lists of floating-point numbers that represent semantic meaning) and can find the most similar vectors using cosine similarity, L2 distance, or inner product.\n\n**How it works:**\n```sql\n-- Store a 1536-dimensional embedding (OpenAI ada-002 size)\nCREATE TABLE code_embeddings (\n    id UUID PRIMARY KEY,\n    content TEXT,\n    embedding vector(1536)\n);\n\n-- Create an index for fast approximate search\nCREATE INDEX ON code_embeddings\n    USING ivfflat (embedding vector_cosine_ops)\n    WITH (lists = 100);\n\n-- Find the 5 most semantically similar pieces of code\nSELECT content,\n    1 - (embedding <=> $1::vector) AS similarity\nFROM code_embeddings\nORDER BY embedding <=> $1::vector\nLIMIT 5;\n-- <=> is cosine distance operator (lower = more similar)\n```\n\n**Codist use cases:**\n\n1. **EngineIQ:** Index the codebase. When reviewing a PR, find similar code patterns in the history. 'This implementation looks like what caused the outbox bug 3 months ago.'\n\n2. **The Record:** Index commission testimony and findings. 'Find all testimony mentioning Eskom and irregular contracts' — semantic search, not keyword search.\n\n3. **Billable:** Find invoices similar to the current one for auto-suggesting line items. 'Previous invoices for this client usually include travel expenses.'\n\n4. **Send a Coldrink:** Find creators similar to ones a supporter has tipped — recommendation engine.",
      tags: ["postgresql", "pgvector", "ai", "embeddings", "architecture"]
    }
  ],
  codeDrills: [
    {
      id: "pg_code_001",
      title: "Optimistic Concurrency with EF Core",
      brief: "Billable's invoice status can be updated by multiple concurrent requests (accept/reject/mark-paid). Implement optimistic concurrency using a RowVersion column. Show: entity configuration, handler that detects conflicts, retry logic, and the specific DbUpdateConcurrencyException handling.",
      language: "csharp",
      starter: `// The problem: two admin users click "Mark as Paid" on the same invoice
// simultaneously. Without concurrency control, both succeed and the
// audit log shows two payments.

// TODO: Add RowVersion to Invoice entity
// TODO: Configure concurrency token in EF Core
// TODO: Handle DbUpdateConcurrencyException in UpdateInvoiceStatusHandler
// TODO: Implement retry with reload

public class Invoice
{
    public Guid Id { get; set; }
    public string Status { get; set; } = default!;
    // TODO: Add RowVersion property
}`,
      hints: [
        "RowVersion is a byte[] property decorated with [Timestamp] attribute",
        "EF Core generates: WHERE Id = @id AND RowVersion = @rowVersion",
        "DbUpdateConcurrencyException has a .Entries property — reload from DB then retry or throw",
        "The optimistic approach: try the update, catch conflict, ask user to refresh and retry",
        "PostgreSQL uses xmin (system column) for row versioning — map with HasRowVersion()"
      ],
      solution: `// 1. Entity with concurrency token
public class Invoice
{
    public Guid Id { get; set; }
    public Guid OrgId { get; set; }
    public string Status { get; set; } = default!;
    public decimal Total { get; set; }

    // PostgreSQL xmin — auto-incremented on every UPDATE
    public uint RowVersion { get; set; }
}

// 2. EF Core configuration
protected override void OnModelCreating(ModelBuilder mb)
{
    mb.Entity<Invoice>(e =>
    {
        // Map to PostgreSQL's xmin system column
        e.Property(i => i.RowVersion)
            .HasColumnName("xmin")
            .HasColumnType("xid")
            .ValueGeneratedOnAddOrUpdate()
            .IsConcurrencyToken(); // EF adds it to WHERE clause
    });
}

// 3. Handler with concurrency conflict handling
public class UpdateInvoiceStatusHandler
{
    public async Task<Result> Handle(
        UpdateInvoiceStatusCommand cmd,
        CancellationToken ct)
    {
        const int MaxRetries = 3;
        var attempts = 0;

        while (attempts < MaxRetries)
        {
            try
            {
                var invoice = await _db.Invoices
                    .FirstOrDefaultAsync(
                        i => i.Id == cmd.InvoiceId &&
                             i.OrgId == _tenant.OrgId, ct);

                if (invoice is null)
                    return Result.NotFound();

                if (!invoice.CanTransitionTo(cmd.NewStatus))
                    return Result.Invalid(
                        $"Cannot transition from {invoice.Status} to {cmd.NewStatus}");

                invoice.Status = cmd.NewStatus;
                await _db.SaveChangesAsync(ct); // throws if xmin changed
                return Result.Ok();
            }
            catch (DbUpdateConcurrencyException ex)
            {
                attempts++;
                if (attempts >= MaxRetries)
                    return Result.Conflict(
                        "Invoice was modified by another user. " +
                        "Please refresh and try again.");

                // Reload the entity from DB with fresh xmin
                foreach (var entry in ex.Entries)
                    await entry.ReloadAsync(ct);

                // Small delay before retry
                await Task.Delay(50 * attempts, ct);
            }
        }

        return Result.Conflict("Could not update invoice after retries");
    }
}`,
      takeaway: "Optimistic concurrency: assume conflicts are rare, detect them on save. EF Core adds the concurrency token to the WHERE clause — if 0 rows updated, a conflict occurred. PostgreSQL's xmin is free (no extra column needed) and auto-incremented on every UPDATE. Use for any entity updated by multiple concurrent users."
    },
    {
      id: "pg_code_002",
      title: "Pagination with Cursor (not offset)",
      brief: "Billable's invoice list must paginate efficiently over 500,000 rows. Implement cursor-based pagination. Show why offset pagination breaks at scale, and implement cursor pagination that is stable (no duplicate/missing items when new invoices are inserted during pagination).",
      language: "csharp",
      starter: `// BROKEN — offset pagination
// SELECT * FROM Invoices ORDER BY CreatedAt DESC LIMIT 20 OFFSET 40000
// Problem: PostgreSQL must scan and skip 40,000 rows. Gets slower per page.
// Also: if a new invoice arrives while user is paginating, rows shift.

// TODO: Implement cursor-based pagination
// Cursor = opaque token encoding the last seen item's sort key
// Next page query: WHERE CreatedAt < @lastSeenCreatedAt (keyset pagination)

public record InvoicePage(
    List<InvoiceDto> Items,
    string? NextCursor,  // null = last page
    bool HasNextPage
);

public class GetInvoicesQuery
{
    public int PageSize { get; init; } = 20;
    public string? Cursor { get; init; } // opaque base64 token
}`,
      hints: [
        "Cursor encodes: last item's CreatedAt + Id as JSON, then Base64",
        "Decode cursor → WHERE (CreatedAt, Id) < (@lastDate, @lastId) using tuple comparison",
        "Fetch PageSize + 1 items — if you get PageSize+1, there is a next page",
        "Return the cursor from the LAST item in the returned page (not the +1)",
        "Use (CreatedAt DESC, Id DESC) ordering for stability — Id breaks ties"
      ],
      solution: `public class GetInvoicesQueryHandler
{
    public async Task<InvoicePage> Handle(
        GetInvoicesQuery query, CancellationToken ct)
    {
        // Decode cursor if provided
        (DateTimeOffset? afterDate, Guid? afterId) = DecodeCursor(query.Cursor);

        // Keyset pagination — no OFFSET, always fast
        var dbQuery = _db.Invoices
            .Where(i => i.OrgId == _tenant.OrgId)
            .AsQueryable();

        if (afterDate.HasValue && afterId.HasValue)
        {
            // Tuple comparison: skip everything before cursor position
            // (CreatedAt, Id) < (@afterDate, @afterId) in DESC order
            dbQuery = dbQuery.Where(i =>
                i.CreatedAt < afterDate.Value ||
                (i.CreatedAt == afterDate.Value && i.Id < afterId.Value));
        }

        // Fetch one extra to determine if there's a next page
        var items = await dbQuery
            .OrderByDescending(i => i.CreatedAt)
            .ThenByDescending(i => i.Id)
            .Take(query.PageSize + 1)
            .Select(i => new InvoiceDto
            {
                Id = i.Id,
                Number = i.InvoiceNumber,
                Total = i.Total,
                Status = i.Status,
                CreatedAt = i.CreatedAt
            })
            .ToListAsync(ct);

        var hasNextPage = items.Count > query.PageSize;
        if (hasNextPage)
            items.RemoveAt(items.Count - 1); // remove the sentinel item

        // Encode cursor from last item
        var nextCursor = hasNextPage && items.Any()
            ? EncodeCursor(items.Last().CreatedAt, items.Last().Id)
            : null;

        return new InvoicePage(items, nextCursor, hasNextPage);
    }

    private static string? EncodeCursor(DateTimeOffset date, Guid id)
    {
        var json = JsonSerializer.Serialize(new { date, id });
        return Convert.ToBase64String(Encoding.UTF8.GetBytes(json));
    }

    private static (DateTimeOffset?, Guid?) DecodeCursor(string? cursor)
    {
        if (string.IsNullOrEmpty(cursor)) return (null, null);
        try
        {
            var json = Encoding.UTF8.GetString(Convert.FromBase64String(cursor));
            var obj = JsonSerializer.Deserialize<JsonElement>(json);
            return (
                obj.GetProperty("date").GetDateTimeOffset(),
                obj.GetProperty("id").GetGuid()
            );
        }
        catch { return (null, null); } // malformed cursor = start from beginning
    }
}`,
      takeaway: "Offset pagination degrades linearly — page 2000 scans 40,000 rows. Keyset (cursor) pagination always scans from the index position of the last seen item — O(log N) regardless of page number. The cursor is opaque to the client (base64 encoded) so you can change the internal format without breaking clients. The +1 trick determines if there's a next page without a separate COUNT query."
    }
  ],
  definitions: [
    { term: "EXPLAIN ANALYZE", definition: "PostgreSQL command that shows the actual execution plan of a query including actual row counts and timing. EXPLAIN shows the plan, ANALYZE executes it. Use: EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT) SELECT ... — the BUFFERS option shows cache hits vs disk reads. Look for Seq Scan on large tables and large rows-estimated vs rows-actual discrepancies." },
    { term: "IVFFlat index (pgvector)", definition: "Inverted File Index — approximate nearest-neighbour index for pgvector. Divides vectors into lists (clusters). On search, only searches the nearest lists. lists=100 means 100 clusters. Trade-off: faster search vs exact results. For exact (slow): use no index. For production: IVFFlat or HNSW." },
    { term: "Connection pooling (Npgsql)", definition: "Npgsql (EF Core PostgreSQL driver) maintains a pool of database connections. Default pool size: 100. Each ASP.NET request gets a connection from the pool and returns it after. Pool exhaustion (all 100 busy) causes requests to queue or timeout. Monitor with pg_stat_activity. For high-concurrency APIs, consider PgBouncer as external pooler." },
    { term: "FOR UPDATE SKIP LOCKED", definition: "PostgreSQL lock hint that skips rows already locked by other transactions instead of waiting. Used in the outbox pattern: multiple worker processes compete for unprocessed messages. FOR UPDATE SKIP LOCKED lets each worker take a different batch without blocking. Essential for safe concurrent job processing." },
    { term: "Keyset pagination", definition: "Pagination based on filtering by the last-seen item's sort key rather than OFFSET. Also called cursor pagination. WHERE CreatedAt < @lastSeen ORDER BY CreatedAt DESC LIMIT 20. Always O(log N) via index. Does not skip items when new data is inserted. Trade-off: cannot jump to arbitrary page numbers." },
    { term: "Optimistic concurrency", definition: "Concurrency control that assumes conflicts are rare. Read data, attempt update, detect conflict on save using a version token (EF Core concurrency token). If another transaction modified the row, DbUpdateConcurrencyException is thrown. Alternative: pessimistic concurrency (FOR UPDATE lock), which blocks concurrent readers." }
  ]
};

// ═══════════════════════════════════════════════════
// TRACK: API DESIGN — REST, VERSIONING, CONTRACTS
// ═══════════════════════════════════════════════════

export const API_DESIGN_TRACK = {
  id: "API_DESIGN",
  title: "API Design & Contracts",
  description: "REST maturity, versioning strategies, breaking changes, OpenAPI, problem details, correlation IDs, backward compatibility. Codist ships APIs used by Angular, Flutter, and third-party integrations.",
  color: "#8B5CF6",
  drills: [
    {
      id: "api_001",
      difficulty: "SENIOR",
      question: "A junior developer on your team adds a new required field to the CreateInvoiceRequest DTO and ships it. Two weeks later you discover the Billable mobile app is crashing for all users. What happened and how do you design APIs to prevent this?",
      answer: "**What happened:** The mobile app (Flutter) was compiled against the old API contract. The new required field was added without a version bump. All existing mobile builds that do not send the new field receive a 400 Bad Request or validation error. The app crashes because it does not handle this case.\n\n**The principle: Additive changes only on existing versions**\n- ✅ Add new OPTIONAL fields to request — old clients ignore them\n- ✅ Add new fields to response — old clients ignore extra fields (Postel's Law)\n- ❌ Add new REQUIRED fields to request — breaking change\n- ❌ Remove fields from response — breaking change\n- ❌ Change field names or types — breaking change\n- ❌ Change validation rules to be more strict — breaking change\n\n**How to ship the new required field correctly:**\n1. Make it optional (nullable) in v1\n2. Set a sensible default in the handler if not provided\n3. OR: create v2 endpoint with the field required, keep v1 working\n4. Deprecate v1 with a `Deprecation: true` header and a sunset date\n5. Notify mobile team 3 months in advance to update the app",
      tags: ["api-design", "versioning", "mobile", "billable", "contracts"]
    },
    {
      id: "api_002",
      difficulty: "SENIOR",
      question: "What is the RFC 7807 Problem Details standard and why should every Codist API use it for error responses?",
      answer: "**RFC 7807 Problem Details** defines a standard JSON format for HTTP error responses. Instead of each API inventing its own error shape, every error looks the same.\n\n```json\n{\n  \"type\": \"https://api.mybillable.co.za/errors/validation\",\n  \"title\": \"Validation Failed\",\n  \"status\": 400,\n  \"detail\": \"The invoice total does not match the sum of line items\",\n  \"instance\": \"/api/invoices/abc-123\",\n  \"correlationId\": \"550e8400-e29b-41d4-a716-446655440000\",\n  \"errors\": {\n    \"total\": [\"Must match sum of line items\"]\n  }\n}\n```\n\n**In .NET 8:**\n```csharp\n// Built-in ProblemDetails support\nbuilder.Services.AddProblemDetails();\n\n// In a handler:\nreturn TypedResults.Problem(\n    title: \"Validation Failed\",\n    detail: \"Invoice total mismatch\",\n    statusCode: 400,\n    type: \"https://api.mybillable.co.za/errors/validation\");\n```\n\n**Why every Codist API must use it:**\n1. Angular interceptors and Flutter error handlers can parse one format\n2. Logs correlate via correlationId field\n3. Clients can programmatically act on `type` (machine-readable)\n4. No guessing what field contains the error message",
      tags: ["api-design", "error-handling", "rfc-7807", "dotnet"]
    },
    {
      id: "api_003",
      difficulty: "LEAD",
      question: "Billable exposes a public API for SkillBay to create clients and jobs. Six months after launch you need to change how client phone numbers are validated. How do you version this API and what is your sunset strategy?",
      answer: "**Versioning options and Codist's choice:**\n\n1. **URI versioning** (Codist's choice): `/api/v1/clients`, `/api/v2/clients`\n   - Most visible, easiest to route in nginx\n   - Easy to test in browser\n   - Cacheable\n\n2. **Header versioning**: `API-Version: 2`\n   - Cleaner URIs but hidden complexity\n\n3. **Query string**: `/api/clients?version=2`\n   - Breaks caching, looks messy\n\n**Implementation in .NET 8:**\n```csharp\nbuilder.Services.AddApiVersioning(options =>\n{\n    options.DefaultApiVersion = new ApiVersion(1, 0);\n    options.AssumeDefaultVersionWhenUnspecified = true;\n    options.ReportApiVersions = true; // adds api-supported-versions header\n});\n\n[ApiVersion(\"1.0\")]\n[Route(\"api/v{version:apiVersion}/clients\")]\npublic class ClientsV1Controller : ControllerBase { ... }\n\n[ApiVersion(\"2.0\")]\n[Route(\"api/v{version:apiVersion}/clients\")]\npublic class ClientsV2Controller : ControllerBase { ... }\n```\n\n**Sunset strategy:**\n1. Ship v2 alongside v1\n2. Add to v1 responses: `Deprecation: true` and `Sunset: Sat, 01 Jan 2027 00:00:00 GMT`\n3. Notify SkillBay team directly with migration guide\n4. Monitor v1 traffic — alert when below 5%\n5. Keep v1 running until traffic drops to near zero\n6. Remove v1 after sunset date",
      tags: ["api-design", "versioning", "billable", "skillbay", "contracts"]
    }
  ],
  codeDrills: [
    {
      id: "api_code_001",
      title: "Correlation ID Middleware + Structured Logging",
      brief: "Every Billable API request must have a correlation ID that flows through: HTTP response header, all Serilog log entries for that request, and all downstream service calls. Build the complete middleware that generates or accepts the ID, wires it into the log context, and propagates it to outgoing HttpClient calls.",
      language: "csharp",
      starter: `// Requirements:
// 1. Read X-Correlation-ID from incoming request OR generate a new UUID
// 2. Validate format if provided (must be valid UUID)
// 3. Add to Serilog log context so ALL logs in this request include it
// 4. Add to response headers
// 5. Wire into HttpClient so outgoing calls carry the same ID
// 6. Make accessible via ICorrelationIdAccessor for use in error responses

public class CorrelationIdMiddleware
{
    // TODO: implement
}`,
      hints: [
        "Use Serilog.Context.LogContext.PushProperty to add to all log entries in scope",
        "IDisposable from PushProperty must be disposed — use using statement",
        "Register a DelegatingHandler on HttpClient to forward the header",
        "Store correlation ID in HttpContext.Items for access in handlers",
        "Validate UUID format with Guid.TryParse before accepting the client-provided ID"
      ],
      solution: `// 1. Accessor interface
public interface ICorrelationIdAccessor
{
    string CorrelationId { get; }
}

// 2. Scoped accessor — one per request
public class CorrelationIdAccessor : ICorrelationIdAccessor
{
    public string CorrelationId { get; set; } = Guid.NewGuid().ToString();
}

// 3. Middleware
public class CorrelationIdMiddleware(RequestDelegate next)
{
    private const string HeaderName = "X-Correlation-ID";

    public async Task InvokeAsync(HttpContext context)
    {
        var accessor = context.RequestServices
            .GetRequiredService<ICorrelationIdAccessor>();

        // Accept client-provided ID if valid UUID, generate if not
        var provided = context.Request.Headers[HeaderName].FirstOrDefault();
        var correlationId = !string.IsNullOrEmpty(provided) &&
                            Guid.TryParse(provided, out _)
            ? provided
            : Guid.NewGuid().ToString();

        ((CorrelationIdAccessor)accessor).CorrelationId = correlationId;

        // Add to response BEFORE awaiting next (response headers must be set early)
        context.Response.OnStarting(() =>
        {
            context.Response.Headers[HeaderName] = correlationId;
            return Task.CompletedTask;
        });

        // Push to Serilog context — all log entries in this request get it
        using (LogContext.PushProperty("CorrelationId", correlationId))
        {
            await next(context);
        }
    }
}

// 4. HttpClient propagation handler
public class CorrelationIdPropagationHandler(
    ICorrelationIdAccessor accessor) : DelegatingHandler
{
    protected override Task<HttpResponseMessage> SendAsync(
        HttpRequestMessage request, CancellationToken ct)
    {
        request.Headers.TryAddWithoutValidation(
            "X-Correlation-ID", accessor.CorrelationId);
        return base.SendAsync(request, ct);
    }
}

// 5. Registration in Program.cs
builder.Services.AddScoped<ICorrelationIdAccessor, CorrelationIdAccessor>();
builder.Services.AddTransient<CorrelationIdPropagationHandler>();
builder.Services.AddHttpClient<IPaystackClient, PaystackClient>()
    .AddHttpMessageHandler<CorrelationIdPropagationHandler>();

app.UseMiddleware<CorrelationIdMiddleware>(); // early in pipeline

// 6. Serilog output template includes CorrelationId:
// "[{Timestamp:HH:mm:ss} {Level}] {CorrelationId} {Message}"`,
      takeaway: "Correlation IDs must flow through all layers: incoming header → log context → response header → outgoing HTTP calls. Using ICorrelationIdAccessor as a scoped service makes it injectable anywhere without passing it as a parameter. LogContext.PushProperty ensures every Serilog log entry in the request scope automatically includes it — no manual passing required."
    }
  ],
  definitions: [
    { term: "Postel's Law", definition: "Be conservative in what you send, liberal in what you accept. API design principle: your API should accept loosely-structured input (optional fields, flexible formats) but always produce strictly consistent output. Enables forward compatibility — clients built today keep working when you add optional fields tomorrow." },
    { term: "RFC 7807 Problem Details", definition: "Standard JSON format for HTTP error responses: type (URI identifying the problem), title, status (HTTP status code), detail (human-readable explanation), instance (URI of the failing request). Supported natively in .NET 8 via ProblemDetails and IProblemDetailsService." },
    { term: "API versioning strategies", definition: "URI versioning (/v1/, /v2/): most visible, cacheable, recommended for public APIs. Header versioning (API-Version: 2): cleaner URIs, harder to test. Query string (?version=2): breaks caching. Media type versioning (Accept: application/vnd.api.v2+json): REST purist approach. Codist uses URI versioning." },
    { term: "Sunset header", definition: "HTTP response header indicating when an API version will be decommissioned. Format: Sunset: Sat, 01 Jan 2027 00:00:00 GMT. Combined with Deprecation: true header. Clients can programmatically detect upcoming deprecation and warn their operators." },
    { term: "Breaking vs non-breaking API change", definition: "Breaking: adding required request fields, removing response fields, renaming fields, changing types, making validation stricter, changing status codes. Non-breaking (safe): adding optional request fields, adding response fields, making validation looser, adding new endpoints. When in doubt: new endpoint + deprecate old." }
  ]
};

// ═══════════════════════════════════════════════════
// TRACK: PRODUCTION INCIDENTS — PAGED AT 2AM
// Battle-testing composure and systematic debugging
// ═══════════════════════════════════════════════════

export const PRODUCTION_INCIDENTS_TRACK = {
  id: "PRODUCTION_INCIDENTS",
  title: "Production Incidents",
  description: "Real scenarios from Codist's production systems. You are paged. What do you do? Systematic debugging under pressure, post-mortems, prevention. These are based on actual incidents on the Hetzner servers.",
  color: "#EF4444",
  drills: [
    {
      id: "inc_001",
      difficulty: "SENIOR",
      question: "INCIDENT: It is 3am. Unsullied (your Billable client) WhatsApps you: 'None of my team can log in. The app just spins.' Walk me through your complete incident response from your phone.",
      answer: "**Step 1: Acknowledge** (immediate)\nReply to Unsullied: 'I am on it. Will update you in 10 minutes.'\nThis prevents panic escalation while you investigate.\n\n**Step 2: Triage from phone** (2 minutes)\n```bash\n# Open Termius or SSH from phone\nssh billable\ndocker ps | grep billable-api\n# Is the container running?\n```\n\n**Step 3: Check logs for the error**\n```bash\ndocker logs billable-api --tail 30 2>&1 | grep -iE 'error|fail|exception'\n```\n\n**Step 4: Test the endpoint**\n```bash\ncurl -s http://localhost:8080/health\n# No response = API is down\n# Response = API is up, check CORS or auth\n\ncurl -sI -X OPTIONS https://api.mybillable.co.za/api/auth/login \\\n  -H 'Origin: https://app.mybillable.co.za'\n# Check for Access-Control-Allow-Origin header\n```\n\n**Step 5: Most likely causes in order**\n1. Container crashed (disk full, OOM, StringComparison EF bug)\n2. Data protection keys regenerated (sessions invalidated)\n3. CORS misconfigured after a deploy\n4. Database connection lost\n5. TLS certificate expired\n\n**Step 6: Fix and verify**\nFor container crash: `docker rm -f billable-api && docker run ...`\nFor cert: `certbot renew --nginx && systemctl reload nginx`\n\n**Step 7: Update client** (< 15 minutes from page)\n'Login is restored. Root cause was [X]. I am monitoring for the next 30 minutes.'\n\n**Step 8: Post-mortem next day**\nWrite a brief post-mortem. What failed, why, what prevents recurrence.",
      tags: ["incident-response", "billable", "production", "debugging"]
    },
    {
      id: "inc_002",
      difficulty: "SENIOR",
      question: "INCIDENT: EngineIQ PR reviews stopped being posted as GitHub comments 6 hours ago. No errors visible to users. GitHub shows webhooks are being delivered successfully (200 responses). Where do you look?",
      answer: "**Key insight:** Webhooks returning 200 means the API received and queued the message. The failure is downstream — in the Worker or the GitHub comment posting.\n\n**Step 1: Check Worker logs**\n```bash\nssh root@162.55.188.252\ndocker logs engineiq-engineiq-worker-1 --tail 50 2>&1\n```\nLook for: RabbitMQ connection errors, Claude API errors, GitHub API errors.\n\n**Step 2: Check RabbitMQ queue depth**\n```bash\n# Via SSH tunnel on your PC:\nssh -L 15672:127.0.0.1:15672 root@162.55.188.252 -N\n# Open http://localhost:15672\n# Check pr.review.requested queue depth\n# If depth > 0: messages are queuing but not being consumed\n# = Worker is not running or not connected\n```\n\n**Step 3: Check if Worker is actually running**\n```bash\ndocker ps | grep worker\n# Look at the STATUS column — not just that it exists\n# 'Up 6 hours' is fine; 'Restarting' or 'Exited' is the problem\n```\n\n**Step 4: Check dead letter queue**\n```bash\n# In RabbitMQ management UI\n# Check: pr.review.dead queue\n# Messages here = they failed processing and were dead-lettered\n```\n\n**Step 5: Most likely causes**\n1. Claude API rate limit or quota exceeded — check Anthropic dashboard\n2. GitHub App token expired — check GitHub App installation\n3. Worker crashed and RabbitMQ is batching unacked messages\n4. Network issue between codist2 and GitHub API\n\n**Step 6: Check Anthropic API**\n```bash\ndocker exec engineiq-engineiq-worker-1 \\\n  curl -s https://api.anthropic.com/v1/health\n```",
      tags: ["incident-response", "engineiq", "rabbitmq", "debugging", "production"]
    },
    {
      id: "inc_003",
      difficulty: "LEAD",
      question: "INCIDENT: The Record is showing 502 for all users. You SSH in and find therecord-web is running and healthy. The nginx config has not changed. What is your next diagnostic step and what are you looking for?",
      answer: "**Container is running but nginx returns 502 — possible causes:**\n1. Container is running but the process inside crashed (container alive, app dead)\n2. Container is on a different network than nginx expects\n3. The port mapping changed\n4. The app inside is listening on a different port than nginx proxies to\n\n**Step 1: Test directly**\n```bash\ncurl -s http://localhost:3090\n# If nothing: the app inside is not listening on 3090\n# If HTML: nginx config is the issue\n```\n\n**Step 2: Check what is actually listening**\n```bash\nss -tlnp | grep 3090\n# If empty: nothing is listening on 3090\n```\n\n**Step 3: Check the container's network**\n```bash\ndocker inspect therecord-web \\\n  --format '{{range $k,$v := .NetworkSettings.Networks}}{{$k}}{{end}}'\n# Expected: therecord-network\n# If: bridge (wrong) — container is on default network, nginx cannot reach it\n```\n\n**Step 4: Check app logs inside container**\n```bash\ndocker logs therecord-web --tail 20\n# Look for: 'Listening on port X' — what port is it actually on?\n# Next.js default is 3000, but we map 3090:3000\n# nginx must proxy to 3090 (host port), not 3000\n```\n\n**Step 5: Check nginx config is correct**\n```bash\ncat /etc/nginx/sites-available/therecord\n# proxy_pass http://127.0.0.1:3090; ← should be this\nnginx -t\n```\n\n**Most likely root cause:** After a docker compose down/up without the correct network specified, the container starts on the default bridge network instead of therecord-network. Nginx cannot reach a container not on its network.",
      tags: ["incident-response", "nginx", "docker", "therecord", "debugging"]
    },
    {
      id: "inc_004",
      difficulty: "LEAD",
      question: "You deploy a new Billable image. Five minutes later you see a spike in 500 errors. Your monitoring shows the EF Core migration ran but failed halfway. What do you do and what is the correct order of operations for a rollback?",
      answer: "**Immediate: Stop the bleeding**\n```bash\n# 1. Roll back to the previous image\ndocker rm -f billable-api\ndocker run -d \\\n  --name billable-api \\\n  --restart unless-stopped \\\n  --network billable-network \\\n  -p 127.0.0.1:8080:8080 \\\n  -v /home/billable/billable/dataprotection-keys:/root/.aspnet/DataProtection-Keys \\\n  --env-file /home/billable/billable/deploy/.env \\\n  ghcr.io/ntokyb/billable-api:latest  # ← previous working image\n\n# 2. Verify it started\nsleeep 15 && curl -s http://localhost:8080/health\n```\n\n**But: the database schema is partially migrated.**\nThe old image may not be compatible with the partial migration.\n\n**Assess the partial migration:**\n```bash\ndocker exec postgres psql -U billable -d billable \\\n  -c \"SELECT \\\"MigrationId\\\" FROM \\\"__EFMigrationsHistory\\\" ORDER BY \\\"MigrationId\\\" DESC LIMIT 3;\"\n```\n\n**Option A: Complete the migration manually**\nIf the migration added columns and stopped halfway, add the remaining columns manually via ALTER TABLE. Then restart the new image.\n\n**Option B: Reverse the partial migration**\nMore dangerous. Write a manual DOWN migration SQL to undo what was applied. Remove the entry from __EFMigrationsHistory. Restart old image.\n\n**Prevention:**\n1. Auto-migrate on startup catches this before the app serves traffic\n2. Blue-green deployments: new version starts, migrations run, health check passes, THEN traffic switches\n3. Test migrations against a production database snapshot before shipping",
      tags: ["incident-response", "migrations", "rollback", "billable", "production"]
    },
    {
      id: "inc_005",
      difficulty: "PRINCIPAL",
      question: "Write a blameless post-mortem for the Billable CORS + Data Protection incident. Include: timeline, root cause, contributing factors, impact, and 5 specific action items.",
      answer: "**INCIDENT POST-MORTEM**\n**Date:** May 2026\n**Severity:** P1 — all users locked out of Billable\n**Duration:** ~4 hours\n\n**Timeline:**\n- 09:00: CI deploys new billable-api:staging image\n- 09:15: First user reports cannot log in (CORS error in browser)\n- 10:00: Investigation begins. CORS headers confirmed missing on preflight.\n- 11:00: .env file found corrupted — multiple duplicate and malformed CORS entries from previous sed commands.\n- 11:30: .env cleaned. Container restarted. CORS resolved.\n- 12:00: Users report being logged out after login (sessions not persisting).\n- 12:30: Data Protection keys identified as ephemeral — not mounted on volume.\n- 13:00: Volume mount added. Container restarted with persistent keys.\n- 13:00: Full resolution.\n\n**Root cause:**\nTwo separate issues compounded:\n1. `.env` file had `App__CorsOrigin` commented out (line starting with `#`) and subsequent manual edits created malformed entries.\n2. DataProtection keys were not persisted to a volume — new container = new keys = all sessions invalidated.\n\n**Contributing factors:**\n- No staging environment to catch issues pre-production\n- CI deploy used `docker compose` which was not reading the `.env` file correctly due to variable name mismatches\n- No automated health check verifying CORS headers post-deploy\n- No monitoring alert on 401 spike that would have caught the session issue sooner\n\n**Impact:** All Billable users unable to log in for 4 hours. One paying client (Unsullied) affected.\n\n**Action items:**\n1. **[Done]** Mount DataProtection keys volume in all docker run commands: `-v /home/billable/billable/dataprotection-keys:/root/.aspnet/DataProtection-Keys`\n2. **[Immediate]** Add post-deploy smoke test to CI that hits the CORS preflight endpoint and fails deployment if `Access-Control-Allow-Origin` header is absent\n3. **[This week]** Replace all `docker compose` deploy steps in CI with direct `docker run` commands to eliminate variable name mismatch\n4. **[This week]** Add a staging environment (`staging.mybillable.co.za`) that mirrors production and receives all deploys before production\n5. **[This month]** Set up Uptime Kuma monitoring with alerts for: 401 spike > 10/min, 5xx spike > 5/min, CORS preflight failure",
      tags: ["post-mortem", "incident-response", "billable", "process", "production"]
    }
  ],
  codeDrills: [],
  definitions: [
    { term: "Blameless post-mortem", definition: "A post-incident review that focuses on systems and processes rather than individual failure. The goal is learning and prevention, not punishment. Key elements: objective timeline, root cause analysis (5 Whys), contributing factors, specific action items with owners and due dates. Pioneered by Google's SRE culture." },
    { term: "MTTD / MTTR", definition: "Mean Time To Detect (how long before you know there is an incident) and Mean Time To Resolve (how long from detection to resolution). Key SRE metrics. Monitoring and alerting reduces MTTD. Runbooks and practiced incident response reduce MTTR. Aim: MTTD < 5 minutes, MTTR < 30 minutes for P1." },
    { term: "P1 / P2 / P3 severity", definition: "Incident severity classification. P1: complete service outage, all users affected, immediate response required. P2: degraded service, some users affected, response within 1 hour. P3: minor issue, few users affected, next business day. Codist: P1 = Billable down for paying clients. P2 = specific feature broken. P3 = cosmetic issue." },
    { term: "Rollback vs roll-forward", definition: "Rollback: revert to previous known-good state (previous Docker image). Roll-forward: quickly ship a fix as a new deployment. Rollback is faster but may leave the database in an incompatible state if migrations ran. Roll-forward is safer when migrations have changed schema. Choose based on what the migration did." },
    { term: "Blue-green deployment", definition: "Two identical production environments (blue=current, green=new). Deploy to green, run health checks, switch traffic. If green fails, switch back to blue instantly. No in-place upgrade risk. Requires double the infrastructure. Alternative: canary deployment (route 5% of traffic to new version first)." }
  ]
};

// ═══════════════════════════════════════════════════
// TRACK: SYSTEM DESIGN INTERVIEWS
// The questions where you walk through large-scale design
// ═══════════════════════════════════════════════════

export const SYSTEM_DESIGN_TRACK = {
  id: "SYSTEM_DESIGN",
  title: "System Design",
  description: "Walk through designing systems at scale. Billable at 10,000 orgs. EngineIQ at 1M reviews/day. Send a Coldrink at 100,000 creators. These are the 45-minute whiteboard questions that separate senior from lead.",
  color: "#0EA5E9",
  drills: [
    {
      id: "sd_001",
      difficulty: "LEAD",
      question: "Design the Send a Coldrink tip processing system. Start from a supporter clicking 'Send R50' to the creator seeing the balance update. Handle 10,000 tips per minute at peak (viral creator moment).",
      answer: "**Clarify requirements first (say this out loud):**\n- Must be exactly-once: R50 charged once, credited once\n- Latency: supporter gets confirmation < 2 seconds\n- Creator sees balance update: eventual consistency acceptable (< 30 seconds)\n- 10,000 tips/min = ~167/second sustained\n\n**Architecture:**\n\n```\nSupporter browser\n  → POST /api/tips/initiate (rate limited: 5/IP/10min)\n  → sac-api validates creator, calculates fees\n  → Calls Paystack /transaction/initialize\n  → Returns { authorizationUrl } to browser\n  → Browser redirects to Paystack hosted page\n  → Supporter pays on Paystack\n  → Paystack calls POST /api/webhooks/paystack\n  → Webhook: HMAC validate → idempotency check → publish to queue\n  → Return 200 to Paystack immediately\n  → RabbitMQ: pr.tip.completed queue\n  → Worker: credit creator balance, publish notifications event\n  → Notification worker: send WhatsApp to creator\n```\n\n**Scaling for 10,000/min:**\n- Webhook handler: stateless, horizontal scale, 3 replicas handle this easily\n- RabbitMQ: single node handles 50,000 msg/sec, no bottleneck\n- Worker: scale to 5 replicas, each processing different tips\n- PostgreSQL: connection pool (PgBouncer), read replica for balance reads\n- Redis: creator balance cache (invalidate on credit), reduces DB load\n\n**The idempotency table is the critical safety mechanism:**\nEven if Paystack retries the webhook 3 times, the unique constraint on paystack_event_id means the tip is credited exactly once.",
      tags: ["system-design", "send-a-coldrink", "scale", "payments"]
    },
    {
      id: "sd_002",
      difficulty: "LEAD",
      question: "EngineIQ needs to review PRs at 1 million reviews per day (sustained). Your current architecture processes reviews synchronously via a single worker. What needs to change?",
      answer: "**Current: 1 worker, sequential processing**\n1M reviews/day = 11.6 reviews/second\nEach review takes 5-15 seconds (diff fetch + Claude API)\nCurrent capacity: 1/15 = 0.067 reviews/second → 5,760/day MAX\nWe need 170x more capacity.\n\n**Changes needed:**\n\n**1. Horizontal worker scaling**\nDeploy 20 worker replicas. RabbitMQ distributes messages across all workers.\n20 workers × 0.067 reviews/sec = 1.34/sec → 115,000/day. Still not enough.\n\n**2. Faster reviews — LLM routing**\nSmall PRs (< 200 lines, no security keywords): use local Codist LLM (< 2 seconds)\nLarge/security PRs: use Claude (5-15 seconds)\n80% of PRs are small → 80% at 2 seconds = effective throughput multiplied\n\n**3. Tenant rate limiting**\nToken bucket per tenant. Large tenants (many repos) cannot flood the queue.\nSmall tenants always get capacity.\n\n**4. Priority queues**\nEnterprise tenants: high-priority queue\nGrowth tenants: normal queue\nFree tenants: low-priority queue (best effort)\n\n**5. Batching for same-PR updates**\nIf 5 commits are pushed in rapid succession, review only the final state.\nDebounce: wait 30 seconds after last push before queuing review.\n\n**6. Database optimisation**\nShard the PR review jobs table by tenant_id.\nArchive completed reviews to cold storage after 90 days.\n\n**Result: 50 workers × routing → ~1.2M reviews/day capacity**",
      tags: ["system-design", "engineiq", "scale", "architecture"]
    },
    {
      id: "sd_003",
      difficulty: "PRINCIPAL",
      question: "Design The Record's search feature. A user types 'Eskom corruption' and should get relevant commission findings, recommendations, and people — not just keyword matches but semantic results. How do you build this?",
      answer: "**Two search modes to support:**\n1. Keyword: exact term matches (fast, precise)\n2. Semantic: meaning-based matches via embeddings (finds related content)\n\n**Architecture:**\n\n```\nUser types: 'Eskom corruption'\n    ↓\n[ Search API ]\n    ↓ parallel ↓\n[Keyword search]    [Semantic search]\nPostgreSQL FTS       pgvector cosine\nts_vector index      similarity search\n    ↓                    ↓\n[Result merger + re-ranker]\n    ↓\n[Response with highlighted snippets]\n```\n\n**Keyword search (PostgreSQL FTS):**\n```sql\nSELECT id, title, ts_rank(search_vector, query) AS rank\nFROM commission_findings,\n     to_tsquery('english', 'Eskom & corruption') query\nWHERE search_vector @@ query\nORDER BY rank DESC\nLIMIT 20;\n```\n\n**Semantic search (pgvector):**\n```sql\n-- Embed the query: 'Eskom corruption' → [0.12, -0.34, ...]\n-- Then:\nSELECT id, content,\n    1 - (embedding <=> $1::vector) AS similarity\nFROM commission_findings\nWHERE 1 - (embedding <=> $1::vector) > 0.7  -- threshold\nORDER BY embedding <=> $1::vector\nLIMIT 20;\n```\n\n**Embedding pipeline:**\n- When a finding is saved: generate embedding via Anthropic or local model\n- Store in pgvector column\n- Incremental: only embed new/changed records\n\n**Re-ranking:**\nMerge keyword and semantic results, de-duplicate by id, re-rank by combining both scores with weights (keyword_score × 0.4) + (semantic_score × 0.6).\n\n**Response includes:** highlighted keyword matches, entity extraction (person names, dates, monetary amounts), related commissions.",
      tags: ["system-design", "therecord", "search", "pgvector", "ai"]
    }
  ],
  codeDrills: [],
  definitions: [
    { term: "CAP theorem", definition: "Consistency, Availability, Partition tolerance — a distributed system can only guarantee two of the three simultaneously. During a network partition you choose: serve possibly stale data (AP: available but not consistent) or refuse requests (CP: consistent but not available). PostgreSQL is CP. DynamoDB is AP by default. For Codist's payment system: CP is mandatory." },
    { term: "Eventual consistency", definition: "A guarantee that, given no new updates, all replicas will eventually converge to the same value. Not immediately consistent. Acceptable for: Send a Coldrink creator balance display (30 second delay is fine). Not acceptable for: payout eligibility check (must see latest balance to prevent overdraft)." },
    { term: "CQRS (Command Query Responsibility Segregation)", definition: "Separate the write model (commands) from the read model (queries). Commands: validate and mutate state. Queries: optimised for reading, can use different data stores or denormalised views. Codist uses MediatR to implement CQRS: ICommand/IQuery types routed to separate handlers." },
    { term: "Event sourcing", definition: "Store every state change as an immutable event rather than the current state. The current state is derived by replaying events. Provides complete audit history, time-travel queries, and event replay for rebuilding read models. Overkill for most Codist products — use a status history table instead for audit trails." },
    { term: "Saga pattern", definition: "Manages distributed transactions across multiple services without two-phase commit. Each step is a local transaction. On failure, compensating transactions undo completed steps. Choreography-based (events) or orchestration-based (central coordinator). EngineIQ's PR review flow is a simple saga: receive webhook → fetch diff → call LLM → post comment." }
  ]
};

// ═══════════════════════════════════════════════════
// WIRING INSTRUCTIONS FOR WAR ROOM
// Add all new tracks to ntokozoMastery.ts
// ═══════════════════════════════════════════════════

/*
STEP 1 — In client/src/constants/ntokozoMastery.ts
Add imports at the top:

import {
  PAYMENTS_FINTECH_TRACK,
  MULTI_TENANT_TRACK,
  DOCKER_OPS_TRACK,
  SA_TECH_CONTEXT_TRACK,
} from './ntokozoMasteryExtended';

import {
  POSTGRESQL_DEEP_DIVE_TRACK,
  API_DESIGN_TRACK,
  PRODUCTION_INCIDENTS_TRACK,
  SYSTEM_DESIGN_TRACK,
} from './ntokozoMasteryExtended2';

STEP 2 — Add to the main TRACKS array:

export const NTOKOZO_MASTERY_TRACKS = [
  // ORIGINAL 6 TRACKS
  SENIOR_VS_LEAD_TRACK,
  ARCHITECTURE_TRACK,
  RESILIENCE_TRACK,
  SECURITY_TRACK,
  AZURE_DEPLOY_TRACK,
  CSHARP_CHALLENGES_TRACK,
  // EXTENDED — FILE 1
  PAYMENTS_FINTECH_TRACK,
  MULTI_TENANT_TRACK,
  DOCKER_OPS_TRACK,
  SA_TECH_CONTEXT_TRACK,
  // EXTENDED — FILE 2
  POSTGRESQL_DEEP_DIVE_TRACK,
  API_DESIGN_TRACK,
  PRODUCTION_INCIDENTS_TRACK,
  SYSTEM_DESIGN_TRACK,
];

COMPLETE DRILL TOTALS AFTER ALL ADDITIONS:
════════════════════════════════════════
Original:                44 drills  | 13 code | 57 defs
Extended File 1:         17 drills  |  4 code | 35 defs
Extended File 2:         18 drills  |  3 code | 23 defs
────────────────────────────────────────────────────────
GRAND TOTAL:             79 drills  | 20 code | 115 defs
════════════════════════════════════════

DAILY DRILL SCHEDULE (updated):
Mon:  Senior → Lead + Docker Ops          (40 min)
Tue:  Architecture + Multi-Tenant         (45 min)
Wed:  Resilience + System Design          (45 min)
Thu:  Security + API Design               (40 min)
Fri:  Azure + PostgreSQL                  (40 min)
Sat:  Payments & Fintech + SA Context     (40 min)
Sun:  Code challenges — type from scratch (60 min)
      Production Incidents — all 5        (30 min)

THE PRODUCTION INCIDENTS TRACK IS THE MOST IMPORTANT.
Do it every Sunday. These scenarios test whether you can
think clearly under pressure — that is the entire point
of senior engineering.
*/
