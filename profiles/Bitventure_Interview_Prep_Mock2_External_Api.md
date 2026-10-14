# Bitventure Mock 2 — Call an External Bureau API (Line-by-Line Practice)

**Prerequisite:** Complete [Mock 1 — SA ID verification](./Bitventure_Interview_Prep_Line_By_Line.md) first (domain parser + endpoint + `IBureauClient` seam).

**Why this mock:** Bitventure’s product is **API integrations** with credit bureaus and Home Affairs–style upstreams. After local ID validation, the next likely ask is: **call HTTP, map status codes, test without the real network, handle failure safely.**

**Timer:** Same rules — 45 min code, no AI, `git commit` at end.

---

## Part 1 — Task (read as interviewer brief)

> Replace the in-memory `FakeBureauClient` with an **HTTP client** that calls a bureau API.
>
> - `POST {BaseUrl}/api/v1/identity/verify` with JSON `{ "idNumber": "..." }`  
> - Header: `Authorization: Bearer {ApiKey}` from configuration (never hard-code secrets)  
> - Map responses:  
>   - **200** + body status → `BureauStatus`  
>   - **404** → `NotFound`  
>   - **503** or timeout → `Unavailable`  
>   - Other errors → log and `Unavailable` (do not leak upstream body to client)  
> - Unit tests must use a **fake HTTP handler** — no real network calls.  
> - Keep logging: **masked ID only**.

Upstream JSON (contract):

```json
{ "status": "verified" }
```

Allowed status strings: `verified`, `not_found`, `deceased` (case-insensitive).

---

## Part 2 — Minute plan

| Time | Do |
|------|-----|
| 0–5 | Options class + DTOs + update `appsettings.json` |
| 5–25 | `HttpBureauClient` + register `AddHttpClient` in `Program.cs` |
| 25–40 | `BureauClientTests` with stub `HttpMessageHandler` |
| 40–45 | Run tests, optional `.http` against WireMock/local stub, commit |

**If behind at 30 min:** skip resilience package; mention `AddStandardResilienceHandler` in presentation only.

---

## Part 3 — Configuration

### Step M1 — `Verification.Api/appsettings.json` (add section)

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*",
  "Bureau": {
    "BaseUrl": "https://bureau.example.local",
    "ApiKey": "dev-key-change-in-key-vault",
    "TimeoutSeconds": 10
  }
}
```

**Say in room:** Production → Key Vault + Managed Identity; never commit real keys.

### Step M2 — `Application/BureauApiOptions.cs`

```csharp
namespace Verification.Api.Application;

public sealed class BureauApiOptions
{
    public const string SectionName = "Bureau";

    public string BaseUrl { get; init; } = "";
    public string ApiKey { get; init; } = "";
    public int TimeoutSeconds { get; init; } = 10;
}
```

### Step M3 — `Application/BureauApiDtos.cs`

```csharp
using System.Text.Json.Serialization;

namespace Verification.Api.Application;

public sealed record BureauVerifyRequest(string IdNumber);

public sealed record BureauVerifyResponse(
    [property: JsonPropertyName("status")] string Status);
```

---

## Part 4 — HTTP client implementation

### Step M4 — Update `Application/IBureauClient.cs`

Remove `FakeBureauClient` from this file (or move to `FakeBureauClient.cs` for local dev only). Keep interface + enum as in Mock 1:

```csharp
using Verification.Api.Domain;

namespace Verification.Api.Application;

public enum BureauStatus { Verified, NotFound, Deceased, Unavailable }

public interface IBureauClient
{
    Task<BureauStatus> LookupAsync(SouthAfricanIdNumber id, CancellationToken ct);
}
```

### Step M5 — `Application/HttpBureauClient.cs`

```csharp
using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.Extensions.Options;
using Verification.Api.Domain;

namespace Verification.Api.Application;

public sealed class HttpBureauClient : IBureauClient
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    private readonly HttpClient _http;
    private readonly ILogger<HttpBureauClient> _logger;

    public HttpBureauClient(
        HttpClient http,
        IOptions<BureauApiOptions> options,
        ILogger<HttpBureauClient> logger)
    {
        _http = http;
        _logger = logger;

        var cfg = options.Value;
        _http.BaseAddress = new Uri(cfg.BaseUrl.TrimEnd('/') + "/");
        _http.Timeout = TimeSpan.FromSeconds(cfg.TimeoutSeconds);
        _http.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", cfg.ApiKey);
    }

    public async Task<BureauStatus> LookupAsync(SouthAfricanIdNumber id, CancellationToken ct)
    {
        try
        {
            using var response = await _http.PostAsJsonAsync(
                "api/v1/identity/verify",
                new BureauVerifyRequest(id.Value),
                ct);

            if (response.StatusCode == HttpStatusCode.NotFound)
                return BureauStatus.NotFound;

            if (response.StatusCode == HttpStatusCode.ServiceUnavailable)
                return BureauStatus.Unavailable;

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning(
                    "Bureau returned {StatusCode} for {MaskedId}",
                    (int)response.StatusCode,
                    id.Masked);
                return BureauStatus.Unavailable;
            }

            var body = await response.Content.ReadFromJsonAsync<BureauVerifyResponse>(JsonOptions, ct);
            if (body?.Status is null)
                return BureauStatus.Unavailable;

            return body.Status.Trim().ToLowerInvariant() switch
            {
                "verified" => BureauStatus.Verified,
                "not_found" => BureauStatus.NotFound,
                "deceased" => BureauStatus.Deceased,
                _ => BureauStatus.Unavailable
            };
        }
        catch (TaskCanceledException ex) when (ex.InnerException is TimeoutException || !ct.IsCancellationRequested)
        {
            _logger.LogWarning("Bureau timeout for {MaskedId}", id.Masked);
            return BureauStatus.Unavailable;
        }
        catch (HttpRequestException ex)
        {
            _logger.LogWarning(ex, "Bureau HTTP error for {MaskedId}", id.Masked);
            return BureauStatus.Unavailable;
        }
    }
}
```

**Why line by line (presentation):**

| Piece | Why |
|-------|-----|
| `IOptions<BureauApiOptions>` | Config binding; testable; Key Vault in prod |
| `PostAsJsonAsync` | Typed request; ID in body not URL (fewer log leaks) |
| Map 404/503 explicitly | Integrators pay per call — distinguish “not found” vs “bureau down” |
| Unknown status → `Unavailable` | Safe default |
| Catch timeout / `HttpRequestException` | Upstream flaky — **return enum**, don’t throw to controller |
| Log `id.Masked` only | POPIA |

---

## Part 5 — Register in DI

### Step M6 — Replace bureau registration in `Program.cs`

Remove:

```csharp
builder.Services.AddScoped<IBureauClient, FakeBureauClient>();
```

Add:

```csharp
builder.Services.Configure<BureauApiOptions>(
    builder.Configuration.GetSection(BureauApiOptions.SectionName));

builder.Services.AddHttpClient<IBureauClient, HttpBureauClient>();
```

Optional resilience (.NET 8+ package `Microsoft.Extensions.Http.Resilience`):

```csharp
// builder.Services.AddHttpClient<IBureauClient, HttpBureauClient>()
//     .AddStandardResilienceHandler();
```

**Say:** Retry only on idempotent GET; for POST verify use **careful** retry or idempotency key — narrate Bitventure billing.

---

## Part 6 — Unit tests (no network)

### Step M7 — `Verification.Tests/BureauClientTests.cs`

```csharp
using System.Net;
using System.Net.Http.Json;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using Verification.Api.Application;
using Verification.Api.Domain;

namespace Verification.Tests;

public class BureauClientTests
{
    private static SouthAfricanIdNumber ValidId =>
        SouthAfricanIdNumber.Parse("9001015009086", new DateOnly(2026, 9, 22)).Value!;

    [Fact]
    public async Task Maps_200_verified()
    {
        var handler = new StubHttpMessageHandler(_ =>
            JsonResponse(HttpStatusCode.OK, new { status = "verified" }));

        var client = CreateClient(handler);
        var status = await client.LookupAsync(ValidId, CancellationToken.None);

        Assert.Equal(BureauStatus.Verified, status);
    }

    [Fact]
    public async Task Maps_404_not_found()
    {
        var handler = new StubHttpMessageHandler(_ =>
            new HttpResponseMessage(HttpStatusCode.NotFound));

        var client = CreateClient(handler);
        var status = await client.LookupAsync(ValidId, CancellationToken.None);

        Assert.Equal(BureauStatus.NotFound, status);
    }

    [Fact]
    public async Task Maps_503_unavailable()
    {
        var handler = new StubHttpMessageHandler(_ =>
            new HttpResponseMessage(HttpStatusCode.ServiceUnavailable));

        var client = CreateClient(handler);
        var status = await client.LookupAsync(ValidId, CancellationToken.None);

        Assert.Equal(BureauStatus.Unavailable, status);
    }

    [Fact]
    public async Task Maps_deceased_status_in_body()
    {
        var handler = new StubHttpMessageHandler(_ =>
            JsonResponse(HttpStatusCode.OK, new { status = "deceased" }));

        var client = CreateClient(handler);
        var status = await client.LookupAsync(ValidId, CancellationToken.None);

        Assert.Equal(BureauStatus.Deceased, status);
    }

    [Fact]
    public async Task Sends_bearer_token_and_json_body()
    {
        HttpRequestMessage? captured = null;
        var handler = new StubHttpMessageHandler(req =>
        {
            captured = req;
            return JsonResponse(HttpStatusCode.OK, new { status = "verified" });
        });

        var client = CreateClient(handler, apiKey: "test-secret-key");
        await client.LookupAsync(ValidId, CancellationToken.None);

        Assert.NotNull(captured);
        Assert.Equal(HttpMethod.Post, captured!.Method);
        Assert.Equal("api/v1/identity/verify", captured.RequestUri!.PathAndQuery.TrimStart('/'));

        Assert.Equal("Bearer", captured.Headers.Authorization!.Scheme);
        Assert.Equal("test-secret-key", captured.Headers.Authorization.Parameter);

        var body = await captured.Content!.ReadFromJsonAsync<BureauVerifyRequest>();
        Assert.Equal("9001015009086", body!.IdNumber);
    }

    private static HttpBureauClient CreateClient(
        HttpMessageHandler handler,
        string apiKey = "dev-key")
    {
        var http = new HttpClient(handler) { BaseAddress = new Uri("https://test.local/") };
        var options = Options.Create(new BureauApiOptions
        {
            BaseUrl = "https://test.local",
            ApiKey = apiKey,
            TimeoutSeconds = 5
        });

        return new HttpBureauClient(http, options, NullLogger<HttpBureauClient>.Instance);
    }

    private static HttpResponseMessage JsonResponse(HttpStatusCode code, object body)
        => new(code) { Content = JsonContent.Create(body) };

    private sealed class StubHttpMessageHandler : HttpMessageHandler
    {
        private readonly Func<HttpRequestMessage, HttpResponseMessage> _responder;

        public StubHttpMessageHandler(Func<HttpRequestMessage, HttpResponseMessage> responder)
            => _responder = responder;

        protected override Task<HttpResponseMessage> SendAsync(
            HttpRequestMessage request,
            CancellationToken cancellationToken)
            => Task.FromResult(_responder(request));
    }
}
```

**Line — run**

```bash
dotnet test
```

**Checkpoint:** All Mock 1 + Mock 2 tests green.

---

## Part 7 — Manual smoke test (optional)

Run Mock 1 API; bureau calls will fail against `bureau.example.local` unless you point BaseUrl to a stub.

**Quick local stub (second terminal)** — only if you have time; otherwise skip and rely on unit tests.

Or use `Verification.http` with your running API and temporarily register `FakeBureauClient` in Development:

```csharp
if (builder.Environment.IsDevelopment())
    builder.Services.AddScoped<IBureauClient, FakeBureauClient>();
else
    builder.Services.AddHttpClient<IBureauClient, HttpBureauClient>();
```

**Say:** Dev fake, prod HTTP — common pattern.

---

## Part 8 — 5-minute presentation (Mock 2 focus)

1. **Outcome:** Same POST as Mock 1; bureau is now real HTTP behind `IBureauClient`.  
2. **Seam:** Service unchanged; swapped implementation — **Open/Closed**.  
3. **HTTP details:** Typed client, options binding, status mapping, timeout → `Unavailable`.  
4. **Tests:** `StubHttpMessageHandler` proves URL, auth header, body, and mappings — **no network flakiness in CI**.  
5. **Production:** Key Vault, resilience handler, correlation ID header, circuit breaker when bureau returns 503 storm.  
6. **Lead line:** “I’d block a PR that logs full ID or puts ID in query string.”

---

## Part 9 — Q&A add-ons (API-specific)

| Question | Answer |
|----------|--------|
| Why `IHttpClientFactory`? | DNS refresh, pooled connections, avoids socket exhaustion from `new HttpClient()` |
| Why not `.Result` on HTTP? | Blocks thread; deadlock risk in ASP.NET |
| Retry POST? | Only with idempotency key or if bureau documents safe retry |
| Where store API key? | Key Vault; rotate; never appsettings in prod repo |
| How debug prod failure? | Request ID, masked ID, bureau latency, status code — not response body (may contain PII) |
| Polly vs StandardResilienceHandler? | Built-in .NET 8+ handler for retry/timeout/breaker — prefer Microsoft package |

---

## Part 10 — Rubric (Mock 2 only /12)

| Area | 0 | 1 | 2 |
|------|---|---|---|
| HttpClient registration | Missing / wrong lifetime | Works, manual HttpClient | `AddHttpClient` + options |
| Status mapping | Throws on 404 | Partial | 404/503/body/timeout |
| Security | API key in code | Config only | Config + masked logs + no ID in URL |
| Tests | None | One happy path | Stub handler + auth/body assert |
| Service unchanged | Broken | Works | Mock 1 service intact |
| Time | Not done | Tests partial | Green + commit |

---

## Part 11 — File tree after Mock 2

```
Verification.Api/
├── appsettings.json              ← Step M1
├── Application/
│   ├── BureauApiOptions.cs       ← Step M2
│   ├── BureauApiDtos.cs          ← Step M3
│   ├── IBureauClient.cs          ← Step M4
│   ├── HttpBureauClient.cs       ← Step M5
│   └── VerificationService.cs    ← unchanged from Mock 1
└── Program.cs                    ← Step M6

Verification.Tests/
├── SouthAfricanIdNumberTests.cs  ← Mock 1
└── BureauClientTests.cs          ← Step M7
```

---

## Part 12 — Practice order before Thursday

| Session | Focus |
|---------|--------|
| **Run A** | Mock 1 only, 45 min |
| **Run B** | Mock 1 from memory, 30 min |
| **Run C** | Mock 2 HTTP client + tests, 45 min |
| **Run D** | Mock 1 + 2 combined cold, 60 min (simulate longer assessment) |

---

## Part 13 — Alternate task (if they give a different API spec)

Same steps; only change:

- Path string in `PostAsJsonAsync` / `GetAsync`  
- DTO property names  
- Status mapping table on a sticky note before you code  

**Do not** rewrite the domain parser — plug new client into existing `IBureauClient`.

---

*After Run C, note whether you forgot `AddHttpClient`, auth header, or timeout catch — that’s what to drill before the interview.*
