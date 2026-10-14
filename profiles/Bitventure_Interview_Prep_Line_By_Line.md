# Bitventure — In-Person Practical + Presentation (Line-by-Line Practice)

**When:** Thursday 11:00–12:30 (Bedfordview — confirm exact address with Luan: Concorde East vs Florence Ave on role letter)  
**Who:** Network IT (Luan / Amy) → client **Bitventure** (identity verification, payments, FICA/KYC, bureau APIs)  
**Format:** ~45–60 min coding + **present code to team** + Q&A  
**Your angle:** 12 years .NET, ABSA gateway, Investec/Maemo-style compliance — prove structure, tests, security narration, **lead-level** review mindset.

---

## Part A — Before you practice (once, not timed)

### A1. Message to Luan (send this text)

```
Hi Luan, thanks for reaching out. Yes, please confirm Thursday 11:00–12:30 at Bitventure Bedfordview for me.

A few quick questions so I can prepare properly:
1. Should I bring my own laptop, or will they provide a machine?
2. Is the assessment in a specific language/framework (e.g. .NET, Angular, Flutter), and is internet/docs allowed?
3. Roughly how long is the coding portion versus the presentation?
4. Could you share the role title, work model (on-site/hybrid), and CTC band if available?

Appreciate the help — looking forward to it.
Ntokozo
```

### A2. What Bitventure cares about (research summary)

| Topic | Why it matters Thursday |
|--------|-------------------------|
| **Identity verification** | SA ID validation is their bread and butter |
| **Bureau / upstream APIs** | Flaky HTTP, timeouts, retries, circuit breakers |
| **FSP 51134, credit bureau, ISO 27001** | Security & audit are product, not a checkbox |
| **Web + mobile + API** | Flutter/Angular/.NET all appear in hiring — confirm stack with Luan |
| **POPIA** | Mask ID in logs; lawful basis; audit who verified whom |

**Likely task shapes (ranked):**

1. SA ID number validator + small API + unit tests  
2. Verification endpoint with mocked bureau + Problem Details errors  
3. Resilience story (retry, idempotency, rate limit) — narrate even if not coded  
4. Short UI consuming API — only if they say full-stack

### A3. Role spec shifts your **presentation** (Senior / lead)

- Reports to **Executive Head of Product** → explain **trade-offs in business language**.  
- **Mentoring, code review, hiring assessments** → present like a **reviewer**: *“In a junior’s PR I’d require test X and reject logging the raw ID.”*  
- **Legacy .NET Framework + upgrades** → one sentence: strangler, Upgrade Assistant, don’t rewrite what works.  
- **Support / production debugging** → *“Correlate by request ID; never log full ID; replay from audit with masked hash.”*

---

## Part B — Dry-run rules (every practice run)

1. **45 min** code → **15 min** prep talk → **5 min** pretend presentation.  
2. **No AI** (Cursor/Copilot off). Docs: learn.microsoft.com only.  
3. `git init` at 0:00; **commit at 45:00**.  
4. Stop when timer stops — note where you were.  
5. Score with rubric at end (Part H).

---

## Part C — The task (read aloud as if interviewer handed it)

> Build a small service that verifies South African ID numbers.  
> `POST /api/v1/verifications/id-number` with `{ "idNumber": "..." }`.  
> Validate: 13 digits, valid DOB, citizenship digit, Luhn check digit.  
> Return DOB, gender, citizenship, and a **bureau status** (mock upstream).  
> Structured errors for clients. Unit tests. Be ready to explain design, next steps, deployment.

---

## Part D — SA ID rules (memorise before timer)

| Pos | Meaning | Rule |
|-----|---------|------|
| 1–6 | YYMMDD | Real date; century: if `YY > today.Year % 100` → 1900s else 2000s |
| 7–10 | SSSS | 0000–4999 female, 5000–9999 male |
| 11 | C | 0 citizen, 1 permanent resident (some specs add 2 refugee) |
| 12 | A | Legacy — **do not reject**; explain if asked |
| 13 | Z | Check digit (RSA Luhn variant — see below) |

**Verified test numbers (both algorithms agree):**

| ID | Valid? | Notes |
|----|--------|--------|
| `9001015009086` | Yes | 1990-01-01, male, citizen |
| `9001015009087` | No | Bad check digit |
| `8001015009087` | Yes | 1980-01-01 |
| `8001015009086` | No | Bad check digit |

---

## Part E — Line-by-line practice run (follow in order)

### Phase 0 — Minute 0–3: Scaffold

**Line 1 — create folder and git**

```bash
mkdir bitventure-verification && cd bitventure-verification
git init
```

**Why:** Shows habit; some interviewers skim history.

**Line 2 — solution + projects**

```bash
dotnet new sln -n Verification
dotnet new webapi -n Verification.Api
dotnet new xunit -n Verification.Tests
dotnet sln add Verification.Api Verification.Tests
dotnet add Verification.Tests reference Verification.Api
```

**Line 3 — quality defaults** (open `Verification.Api/Verification.Api.csproj`, ensure):

```xml
<Nullable>enable</Nullable>
<ImplicitUsings>enable</ImplicitUsings>
<TreatWarningsAsErrors>true</TreatWarningsAsErrors>
```

**Why say in room:** nullable = fewer null bugs; warnings as errors = production discipline.

**Line 4 — delete WeatherForecast** sample from template.

**Line 5 — folders** (under `Verification.Api/`):

```
Domain/
Application/
Api/
```

**Why:** Clean architecture in one project for speed; production = split assemblies so Domain has zero ASP.NET reference.

**Line 6 — first green build**

```bash
dotnet build
```

**Checkpoint:** Build must pass before domain code.

---

### Phase 1 — Minute 3–18: Domain + tests (do tests **with** parser)

#### Step E1 — `Domain/Result.cs` (type line by line)

```csharp
namespace Verification.Api.Domain;

public sealed class Result<T>
{
    public T? Value { get; }
    public string? Error { get; }
    public bool IsSuccess => Error is null;

    private Result(T? value, string? error) { Value = value; Error = error; }

    public static Result<T> Ok(T value) => new(value, null);
    public static Result<T> Fail(string err) => new(default, err);
}
```

**Say:** Invalid ID is **expected** → `Result`, not exception.

#### Step E2 — `Verification.Api/Domain/SouthAfricanIdNumber.cs`

Type in this order: enums → record → `Parse` → `PassesLuhn` → `Masked`.

**Say:** `today` injected → pure function, testable century rule.  
**Say:** Digit 12 not validated → legacy, no business rule today.

```csharp
using System.Globalization;

namespace Verification.Api.Domain;

public enum Gender { Female, Male }

public enum Citizenship { SouthAfricanCitizen, PermanentResident }

public sealed record SouthAfricanIdNumber(
    string Value,
    DateOnly DateOfBirth,
    Gender Gender,
    Citizenship Citizenship)
{
    public const int Length = 13;

    public static Result<SouthAfricanIdNumber> Parse(string? raw, DateOnly today)
    {
        if (string.IsNullOrWhiteSpace(raw))
            return Result<SouthAfricanIdNumber>.Fail("ID number is required.");

        var s = raw.Trim();

        if (s.Length != Length || !s.All(char.IsAsciiDigit))
            return Result<SouthAfricanIdNumber>.Fail("ID number must be exactly 13 digits.");

        if (!PassesLuhn(s))
            return Result<SouthAfricanIdNumber>.Fail("ID number failed checksum validation.");

        var yy = int.Parse(s[..2], CultureInfo.InvariantCulture);
        var century = yy <= today.Year % 100 ? 2000 : 1900;
        var dobText = $"{century + yy:D4}{s[2..6]}";

        if (!DateOnly.TryParseExact(dobText, "yyyyMMdd", CultureInfo.InvariantCulture,
                DateTimeStyles.None, out var dob) || dob > today)
            return Result<SouthAfricanIdNumber>.Fail("ID number contains an invalid date of birth.");

        var sequence = int.Parse(s[6..10], CultureInfo.InvariantCulture);
        var gender = sequence < 5000 ? Gender.Female : Gender.Male;

        Citizenship citizenship;
        switch (s[10])
        {
            case '0': citizenship = Citizenship.SouthAfricanCitizen; break;
            case '1': citizenship = Citizenship.PermanentResident; break;
            default:
                return Result<SouthAfricanIdNumber>.Fail("ID number has an invalid citizenship indicator.");
        }

        return Result<SouthAfricanIdNumber>.Ok(new SouthAfricanIdNumber(s, dob, gender, citizenship));
    }

    public static bool PassesLuhn(ReadOnlySpan<char> digits)
    {
        var sum = 0;
        var doubleIt = false;

        for (var i = digits.Length - 1; i >= 0; i--)
        {
            var d = digits[i] - '0';
            if (doubleIt)
            {
                d *= 2;
                if (d > 9) d -= 9;
            }
            sum += d;
            doubleIt = !doubleIt;
        }

        return sum % 10 == 0;
    }

    public string Masked => $"{Value[..6]}*****{Value[^2..]}";
}
```

#### Step E3 — `Verification.Tests/SouthAfricanIdNumberTests.cs`

Add package if needed: `dotnet add Verification.Tests package Microsoft.NET.Test.Sdk` (usually on template).

```csharp
using Verification.Api.Domain;

namespace Verification.Tests;

public class SouthAfricanIdNumberTests
{
    private static readonly DateOnly Today = new(2026, 9, 22);

    [Fact]
    public void Parses_a_valid_id_number()
    {
        var result = SouthAfricanIdNumber.Parse("9001015009086", Today);

        Assert.True(result.IsSuccess);
        Assert.Equal(new DateOnly(1990, 1, 1), result.Value!.DateOfBirth);
        Assert.Equal(Gender.Male, result.Value.Gender);
        Assert.Equal(Citizenship.SouthAfricanCitizen, result.Value.Citizenship);
    }

    [Theory]
    [InlineData(null, "required")]
    [InlineData("", "required")]
    [InlineData("12345", "13 digits")]
    [InlineData("90010150090AB", "13 digits")]
    [InlineData("9001015009087", "checksum")]
    [InlineData("9002305009083", "date of birth")]
    public void Rejects_invalid_input(string? input, string expectedErrorFragment)
    {
        var result = SouthAfricanIdNumber.Parse(input, Today);

        Assert.False(result.IsSuccess);
        Assert.Contains(expectedErrorFragment, result.Error, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public void Century_rolls_over_relative_to_today()
    {
        var result = SouthAfricanIdNumber.Parse(WithCheckDigit("270101500908"), Today);

        Assert.True(result.IsSuccess);
        Assert.Equal(1927, result.Value!.DateOfBirth.Year);
    }

    [Fact]
    public void Masked_hides_the_middle()
    {
        var result = SouthAfricanIdNumber.Parse("9001015009086", Today);

        Assert.Equal("900101*****86", result.Value!.Masked);
    }

    private static string WithCheckDigit(string twelveDigits)
    {
        for (var c = 0; c <= 9; c++)
        {
            var candidate = twelveDigits + c;
            if (SouthAfricanIdNumber.PassesLuhn(candidate))
                return candidate;
        }

        throw new InvalidOperationException("No valid check digit found.");
    }
}
```

**Note:** If `9002305009083` fails on checksum instead of date, generate with `WithCheckDigit("900230500908")` and use that in the theory row.

**Line — run tests**

```bash
dotnet test
```

**Checkpoint:** All green **before** API work.

---

### Phase 2 — Minute 18–30: Application + HTTP

#### Step E4 — `Verification.Api/Application/IBureauClient.cs`

**Say:** Real impl = typed `HttpClient` + Polly / `AddStandardResilienceHandler`.

```csharp
using Verification.Api.Domain;

namespace Verification.Api.Application;

public enum BureauStatus { Verified, NotFound, Deceased, Unavailable }

public interface IBureauClient
{
    Task<BureauStatus> LookupAsync(SouthAfricanIdNumber id, CancellationToken ct);
}

public sealed class FakeBureauClient : IBureauClient
{
    public Task<BureauStatus> LookupAsync(SouthAfricanIdNumber id, CancellationToken ct)
        => Task.FromResult(id.Value.EndsWith('6') ? BureauStatus.Verified : BureauStatus.NotFound);
}
```

#### Step E5 — `Verification.Api/Application/VerificationService.cs`

```csharp
using Verification.Api.Domain;

namespace Verification.Api.Application;

public sealed record IdVerificationRequest(string? IdNumber);

public sealed record IdVerificationResponse(
    string MaskedIdNumber,
    DateOnly DateOfBirth,
    string Gender,
    string Citizenship,
    string BureauStatus);

public interface IVerificationService
{
    Task<Result<IdVerificationResponse>> VerifyIdNumberAsync(IdVerificationRequest request, CancellationToken ct);
}

public sealed class VerificationService(
    IBureauClient bureau,
    TimeProvider clock,
    ILogger<VerificationService> logger) : IVerificationService
{
    public async Task<Result<IdVerificationResponse>> VerifyIdNumberAsync(
        IdVerificationRequest request,
        CancellationToken ct)
    {
        var today = DateOnly.FromDateTime(clock.GetUtcNow().UtcDateTime);
        var parsed = SouthAfricanIdNumber.Parse(request.IdNumber, today);

        if (!parsed.IsSuccess)
        {
            logger.LogInformation("ID verification rejected: {Reason}", parsed.Error);
            return Result<IdVerificationResponse>.Fail(parsed.Error!);
        }

        var id = parsed.Value!;
        var status = await bureau.LookupAsync(id, ct);

        logger.LogInformation("ID {MaskedId} verified with status {Status}", id.Masked, status);

        return Result<IdVerificationResponse>.Ok(new IdVerificationResponse(
            id.Masked,
            id.DateOfBirth,
            id.Gender.ToString(),
            id.Citizenship.ToString(),
            status.ToString()));
    }
}
```

#### Step E6 — `Verification.Api/Api/VerificationEndpoints.cs`

**Say:** RFC 9457 Problem Details — integrators depend on stable shape.

```csharp
using Microsoft.AspNetCore.Http.HttpResults;
using Verification.Api.Application;

namespace Verification.Api.Api;

public static class VerificationEndpoints
{
    public static IEndpointRouteBuilder MapVerificationEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/verifications").WithTags("Verifications");

        group.MapPost("/id-number", VerifyIdNumber)
             .WithName("VerifyIdNumber")
             .WithSummary("Validates a South African ID number and returns a bureau status.");

        return app;
    }

    private static async Task<Results<Ok<IdVerificationResponse>, ValidationProblem>> VerifyIdNumber(
        IdVerificationRequest request,
        IVerificationService service,
        CancellationToken ct)
    {
        var result = await service.VerifyIdNumberAsync(request, ct);

        return result.IsSuccess
            ? TypedResults.Ok(result.Value!)
            : TypedResults.ValidationProblem(new Dictionary<string, string[]>
            {
                [nameof(IdVerificationRequest.IdNumber)] = [result.Error!]
            });
    }
}
```

#### Step E7 — `Verification.Api/Api/GlobalExceptionHandler.cs`

```csharp
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace Verification.Api.Api;

public sealed class GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext http,
        Exception ex,
        CancellationToken ct)
    {
        logger.LogError(ex, "Unhandled exception for {Method} {Path}", http.Request.Method, http.Request.Path);

        http.Response.StatusCode = StatusCodes.Status500InternalServerError;
        await http.Response.WriteAsJsonAsync(new ProblemDetails
        {
            Status = 500,
            Title = "An unexpected error occurred.",
            Instance = http.Request.Path
        }, ct);

        return true;
    }
}
```

#### Step E8 — `Verification.Api/Program.cs`

Replace the template `Program.cs` entirely. Check `dotnet --version`: .NET 9+ uses `AddOpenApi` / `MapOpenApi`; .NET 8 may need Swagger packages instead (comments below).

```csharp
using Verification.Api.Api;
using Verification.Api.Application;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddProblemDetails();
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();

// .NET 9/10:
builder.Services.AddOpenApi();
// .NET 8 alternative:
// builder.Services.AddEndpointsApiExplorer();
// builder.Services.AddSwaggerGen();

builder.Services.AddSingleton(TimeProvider.System);
builder.Services.AddScoped<IBureauClient, FakeBureauClient>();
builder.Services.AddScoped<IVerificationService, VerificationService>();

var app = builder.Build();

app.UseExceptionHandler();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    // .NET 8 alternative:
    // app.UseSwagger();
    // app.UseSwaggerUI();
}

app.MapVerificationEndpoints();

app.Run();
```

**Checkpoint:**

```bash
dotnet run --project Verification.Api --urls http://localhost:5000
dotnet test
```

---

### Phase 3 — Minute 30–38: Prove + document

#### Step E9 — `Verification.Api/Verification.http`

```http
### Valid
POST http://localhost:5000/api/v1/verifications/id-number
Content-Type: application/json

{ "idNumber": "9001015009086" }

### Bad checksum
POST http://localhost:5000/api/v1/verifications/id-number
Content-Type: application/json

{ "idNumber": "9001015009087" }
```

#### Step E10 — `README.md`

```markdown
# SA ID verification (practice)

POST `/api/v1/verifications/id-number` with `{ "idNumber": "13 digits" }`.

## Run
dotnet run --project Verification.Api --urls http://localhost:5000

## Test
dotnet test

## Mocked
`FakeBureauClient` — IDs ending in 6 return Verified.

## Next
Real HttpClient + resilience, rate limiting, integration tests, Docker/AKS, audit log (hashed ID).
```

**Line — commit**

```bash
git add -A && git commit -m "SA ID verification: domain, tests, API, problem details"
```

---

### Phase 4 — Minute 38–45: If ahead (stretch — mention in talk if not coded)

| Stretch | One-line why |
|---------|----------------|
| `AddStandardResilienceHandler` | Bureau flakiness |
| Idempotency-Key | No double bureau billing |
| `AddRateLimiter` | Abuse / cost control |
| `WebApplicationFactory` test | End-to-end confidence |
| Multi-stage Dockerfile | How you’d ship |

**If behind at 25 min:** drop fake bureau complexity; return parse result only; **say you cut scope**.

---

## Part F — 5-minute presentation script (lead tone)

1. **Outcome (30s):** POST ID → structured 200 or 400; tests cover every rule.  
2. **Layers (60s):** Domain pure → Application orchestrates → Api thin.  
3. **Three decisions (90s):** Result not throw; PII mask in domain; bureau behind interface.  
4. **What I’d flag on a junior PR (60s):** logging raw ID, no Luhn test, exceptions on validation.  
5. **Production (60s):** Key Vault credentials, MI on AKS/App Service, App Insights with masked fields, OpenAPI for integrators, audit table (who/when/hash).  
6. **Questions.**

---

## Part G — Q&A crib sheet (short answers)

| Question | Answer |
|----------|--------|
| Why not throw on bad ID? | Expected path; exceptions for unexpected; cheaper under load |
| Bureau timeout? | Resilience → `Unavailable` + 503 + Retry-After; breaker |
| POPIA / ISO 27001? | Mask logs, encrypt at rest, audit access, least privilege, retention policy |
| Performance? | Parser is cheap; cache bureau result on **hash(id)**, TTL, never key raw ID |
| .NET Framework legacy? | Strangler: new endpoints on Core; migrate hot paths; Upgrade Assistant |
| Generative AI? | Copilot for speed; you own review, tests, and explanation — same bar as today |
| Flutter? | uNjezi / mobile experience; API-first backend same as verification service |

---

## Part H — Rubric (score each run /12)

| Area | 0 | 1 | 2 |
|------|---|---|---|
| Correctness | Won’t run | Partial rules | All rules + Luhn + century |
| Tests | None | Happy path | Theory + edges, green |
| Structure | All in Program.cs | Partial | Domain/App/Api |
| Security/errors | Raw 500, PII logged | Partial | Problem Details + mask + handler |
| Time | No core | No README | README + commit + scope cut |
| Presentation | Read code | What | Why + lead review + prod path |

**Target:** ≥10/12 on second run.

---

## Part I — Two-day schedule

| When | Do |
|------|-----|
| **Tonight** | One full 45-min cold run; debrief Part J |
| **Tomorrow AM** | Re-type `Parse` + Luhn from memory; flashcard APIs you looked up |
| **Tomorrow PM** | Second timed run; 5-min presentation out loud |
| **Wednesday** | Light: read Bitventure services page; rehearse compliance Q&A |
| **Thursday 10:00** | Leave early; laptop charged; `dotnet --version`; no AI in IDE |

---

## Part J — Debrief prompts (after each run)

1. Which minute box slipped — typing, API recall, or over-design?  
2. What did you look up? Write on a card.  
3. Did you **talk while coding**?  
4. Did you run + commit?  
5. Which rubric row scored 0–1? That’s tomorrow’s focus.

---

## Part K — Solution file tree (everything is in Part E above)

```
bitventure-verification/
├── Verification.sln
├── Verification.Api/
│   ├── Program.cs
│   ├── Verification.http
│   ├── Domain/
│   │   ├── Result.cs                 ← Step E1
│   │   └── SouthAfricanIdNumber.cs   ← Step E2
│   ├── Application/
│   │   ├── IBureauClient.cs          ← Step E4
│   │   └── VerificationService.cs    ← Step E5
│   └── Api/
│       ├── VerificationEndpoints.cs    ← Step E6
│       └── GlobalExceptionHandler.cs   ← Step E7
└── Verification.Tests/
    └── SouthAfricanIdNumberTests.cs  ← Step E3
```

**Critical:** Run `dotnet test` before the interview. Use `WithCheckDigit("prefix")` in tests when you need a valid ID for a custom date.

**Next practice:** [Mock 2 — External bureau HTTP client](./Bitventure_Interview_Prep_Mock2_External_Api.md) (typed `HttpClient`, status mapping, stub handler tests).

---

*Good luck Thursday. After run 1, send your rubric scores and where you stopped at 45:00 — tighten run 2 from there.*
