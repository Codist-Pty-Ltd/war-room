import {
  PAYMENTS_FINTECH_TRACK,
  MULTI_TENANT_TRACK,
  DOCKER_OPS_TRACK,
  SA_TECH_CONTEXT_TRACK,
} from "./ntokozoMasteryExtended";
import {
  POSTGRESQL_DEEP_DIVE_TRACK,
  API_DESIGN_TRACK,
  PRODUCTION_INCIDENTS_TRACK,
  SYSTEM_DESIGN_TRACK,
} from "./ntokozoMasteryExtended2";

// NTOKOZO BANDA — Personal mastery drill content.
//
// Tailored to: Senior C# / .NET engineer (11+ yrs), banking domain,
// ABSA Core Banking Gateway, IQbusiness (Toyota Kinto + Investec onboarding).
// Goal: bridge the gap to Lead / Principal-grade questions and code.
//
// Structure: each track has Definitions (quick-fire vocab), Drills (deep
// interview Q&A with reveal), and CodeDrills (actual C# challenges with
// starter + solution).

export type MasteryDefinition = {
  term: string;
  definition: string;
  example?: string;
};

export type MasteryDifficulty =
  | "senior"
  | "lead"
  | "principal"
  | "SENIOR"
  | "LEAD"
  | "PRINCIPAL";

export type MasteryDrill = {
  id: string;
  question: string;
  /** Markdown-ish: paragraphs separated by blank lines, lists by `-`. */
  answer: string;
  followUp?: string;
  /** Shown when follow-up is expanded (Codist extended drills). */
  followUpAnswer?: string;
  difficulty: MasteryDifficulty;
  tags?: string[];
};

export type CodeDrill = {
  id: string;
  title: string;
  brief: string;
  language: "csharp" | "sql" | "yaml" | "bash";
  starter: string;
  solution: string;
  hints?: string[];
  takeaway: string;
};

export type MasteryTrack = {
  id: string;
  title: string;
  description: string;
  color: string;
  definitions: MasteryDefinition[];
  drills: MasteryDrill[];
  codeDrills: CodeDrill[];
};

// ============================================================================
// TRACK 1 — SENIOR vs LEAD vs PRINCIPAL
// ============================================================================

const SENIOR_VS_LEAD: MasteryTrack = {
  id: "senior-vs-lead",
  title: "Senior → Lead → Principal",
  description:
    "What changes as you climb. Definitions, decision frameworks, and the questions that decide whether you stay IC, become a Tech Lead, or push to Principal.",
  color: "#bf7fff",
  definitions: [
    {
      term: "Senior IC (Individual Contributor)",
      definition:
        "Owns features end-to-end with technical excellence. Writes maintainable code, mentors mid-levels, contributes to ADRs in their domain, debugs production issues. Scope = own feature area.",
    },
    {
      term: "Tech Lead",
      definition:
        "Owns the technical direction of a team or service. Scopes work, runs review culture, mediates architectural disagreements, aligns cross-team. Still codes — but ~40-60% rather than 90%.",
    },
    {
      term: "Staff / Principal Engineer",
      definition:
        "Cross-team or cross-org technical decisions. Architectural strategy, technology adoption, hard-to-quantify multipliers (training, tooling, standards). Codes selectively on the highest-leverage problems.",
    },
    {
      term: "ADR — Architecture Decision Record",
      definition:
        "A short markdown doc capturing a decision, its context, alternatives considered, consequences. Lives in the repo. Lets future engineers argue with the past instead of inheriting it blindly.",
      example:
        "ADR-0007: 'Use EF Core projections over .Include for read paths' — context, options, decision, consequences.",
    },
    {
      term: "RFC — Request for Comments",
      definition:
        "A longer-form design proposal circulated before implementation. Used for cross-team or controversial decisions. Outcome may be an ADR.",
    },
    {
      term: "Tech debt vs architectural debt",
      definition:
        "Tech debt = local sloppiness (TODO comments, ugly code). Architectural debt = systemic constraints baked into the model (wrong aggregate boundaries, no outbox, single shared DB). Architectural debt is 10× more expensive to repay.",
    },
    {
      term: "Force multiplier work",
      definition:
        "Work whose value compounds — internal tooling, CI improvements, training, documentation, design templates. Hard to measure short-term, huge long-term ROI. Lead-grade contribution.",
    },
    {
      term: "Bus factor",
      definition:
        "How many people can leave before the project is in trouble. Low bus factor = single point of failure. Leads actively raise it via pairing, docs, and rotation.",
    },
  ],
  drills: [
    {
      id: "sl-1",
      difficulty: "lead",
      question:
        "When do you stop coding day-to-day? What's the right ratio for a Tech Lead?",
      answer:
        "You never stop entirely — if you stop, you lose credibility and you lose context. The ratio depends on team size and codebase maturity.\n\nMy heuristics: for a 4-6 person team in a stable codebase, 40-60% code, 30-40% reviews/design/mentoring, 10-20% cross-team. For a new team or greenfield, code more — 60-70% — because the codebase is the team's source of truth and you set the bar.\n\nThe trap is going to 10% code. Now you can't review meaningfully, you make stale architectural decisions, and your team can't trust your judgement. The other trap is 90% code — you're hoarding, not leading.\n\nWatch the calendar, not your feelings. If meetings ate this week, push back on the next.",
      followUp:
        "What's the first thing you stop doing as you move from Senior to Lead?",
      tags: ["leadership", "time-management"],
    },
    {
      id: "sl-2",
      difficulty: "lead",
      question:
        "How do you handle a teammate who consistently underdelivers?",
      answer:
        "First, separate skill, will, and clarity — they look identical from a distance.\n\n**Skill gap:** they don't know how. Fix with pairing, code reviews framed as teaching, breaking work into smaller chunks. Set explicit growth goals and check in weekly.\n\n**Will / motivation:** they know but won't. Find out why — burnout, wrong project, life stuff, disagreement with direction. This is a 1-on-1 conversation, not a public one. Often fixable with project change or air-time.\n\n**Clarity:** they're delivering what they thought you asked for, but you wanted something else. This is YOUR fault — fix scoping rigor, use Definition of Done, write acceptance criteria.\n\nNever go to HR before you've had three direct, written-down conversations with the person. And document everything in writing — your own notes, dates, what was agreed. If it does become a performance issue, you need the trail.",
      followUp: "What if they're delivering, but their PRs are uniformly poor quality?",
      tags: ["leadership", "people"],
    },
    {
      id: "sl-3",
      difficulty: "lead",
      question: "How do you write an ADR? Walk through the template.",
      answer:
        "Six sections, half a page each.\n\n1. **Title & status** — `ADR-007: Use Outbox Pattern for Domain Events`, status: proposed/accepted/superseded.\n\n2. **Context** — the situation forcing a decision. 'We publish to RabbitMQ inside business transactions and a publish failure has caused data divergence twice in the last quarter.'\n\n3. **Decision** — the choice in plain English. 'We will implement the transactional outbox pattern using MassTransit's DbContext outbox.'\n\n4. **Alternatives considered** — what we rejected and why. Two-phase commit (too expensive, no MQ support), eventual reconciliation (already failing).\n\n5. **Consequences** — positive AND negative. Stronger consistency, +20ms publish latency, new failure mode if outbox publisher dies.\n\n6. **Compliance / metrics** — how do we know it's working? P99 outbox lag < 5s, alert on growing backlog.\n\nADRs are not academic. They die if they're not written quickly and merged with the code that implements them.",
      followUp: "What's the difference between an ADR and an RFC?",
      tags: ["architecture", "documentation"],
    },
    {
      id: "sl-4",
      difficulty: "lead",
      question:
        "How do you push back on PM scope creep without becoming the 'no' person?",
      answer:
        "Trade scope for time openly. Make the tradeoff visible — that's all the leadership leverage you need.\n\n'We can ship feature A by Friday OR features A+B by following Wednesday. Both are fine engineering choices. Which does the business need more?'\n\nThree habits that work:\n\n1. **Always know what's already in the sprint.** When new scope arrives, the question isn't 'can we add this?' but 'what comes out?'\n\n2. **Quantify the cost in days, not vibes.** 'Adding multi-tenancy is 3 weeks not 3 days because we'd need to refactor the data layer.' Specific costs beat vague resistance.\n\n3. **Be the one who proposes the cut.** 'I'd cut the export feature — only 8% of users hit it.' If you offer the trade, you keep the room's trust.\n\nNever say 'no' to PM. Say 'yes, and here's what it costs.' Let them decide. That's their job; you give them clarity.",
      tags: ["leadership", "communication"],
    },
    {
      id: "sl-5",
      difficulty: "lead",
      question: "What's your code review philosophy?",
      answer:
        "Reviews are for three things in order: **correctness, design, style**. I don't comment on style if correctness or design is broken — fix those first, then I add style notes.\n\nHabits:\n\n- **Frame as questions.** 'What happens if `customer` is null?' beats 'add null check'. The author thinks; if the answer is 'oh' they fix; if there's a real reason I learn.\n\n- **Approve with comments, request changes for blockers.** Don't make people wait for trivial suggestions. Differentiate must-fix from nice-to-fix explicitly (`nit:` prefix for taste).\n\n- **One review = one round, ideally.** Big tickets get a design discussion first. Don't 'discover' architecture in PR comments.\n\n- **Praise good code.** Specifically. 'This factored out the validation cleanly — nice.' People remember the praise; it lifts the team's bar.\n\n- **Reviewer load is real.** A 600-line PR is unreviewable. Push back on PR size before content.\n\nThe junior trap: comment counting (50 comments doesn't mean a good review). The senior trap: rubber-stamping. The lead trap: blocking on preference. Reviews are leadership in microcosm.",
      tags: ["leadership", "code-review"],
    },
    {
      id: "sl-6",
      difficulty: "principal",
      question:
        "How do you decide between buy vs build vs adopt-open-source for a critical capability?",
      answer:
        "Four axes I rate every option on:\n\n1. **Core to your differentiation?** If it's commodity (auth, logging, queueing), buy or adopt. If it's *your* business logic, build.\n\n2. **Total cost of ownership over 3 years.** Not just licence — integration, expertise, vendor lock-in, migration cost if you change later.\n\n3. **Team capacity & expertise.** Do you have the people and the air to maintain it? Self-hosting RabbitMQ is fine if you have ops; otherwise managed Service Bus.\n\n4. **Risk profile.** What's the blast radius of vendor failure or licence change? Critical systems demand exit ramps.\n\nMy default: **adopt mature OSS, buy managed where ops cost is real, build only what's differentiating**.\n\nFinancial services trap I've watched: building everything for 'control' and ending up with a half-baked broker maintained by two people. Vs. paying for Azure Service Bus and spending that effort on the actual product.\n\nThe inverse trap: buying a 'low-code platform' that becomes your prison. Always know the exit ramp before you sign.",
      followUp:
        "Concrete example: AI/LLM capability — buy OpenAI, host Llama, or use Azure OpenAI?",
      tags: ["architecture", "strategy"],
    },
    {
      id: "sl-7",
      difficulty: "lead",
      question:
        "Your team disagrees on a technical direction. How do you decide?",
      answer:
        "Five-step ladder, in order:\n\n1. **Is this reversible?** If yes — let someone try it. Bias to action on reversible decisions. Most decisions are more reversible than they feel.\n\n2. **Is the disagreement about facts or values?** If facts (which is faster, which is more secure), measure. Spike for half a day. Bring data.\n\n3. **Is one option strictly better?** Usually yes once you list trade-offs honestly. The disagreement is about which trade-off matters more — say so explicitly.\n\n4. **Is it a values disagreement?** Then state the values openly. 'I value team simplicity; you value performance.' That's progress.\n\n5. **As Lead — decide.** After the conversation, you call it. Write the ADR. Both parties commit. The deal: dissenting opinion in the ADR, then everyone aligns on execution.\n\nWhat kills teams isn't disagreement — it's unresolved disagreement that leaks into the code as inconsistency.",
      tags: ["leadership", "decision-making"],
    },
    {
      id: "sl-8",
      difficulty: "principal",
      question: "How do you grow your team's collective skill over a year?",
      answer:
        "Three structural levers, not just training:\n\n**1. Stretch work assignment.** Every dev gets one project a quarter that's 20% above their current level. Mentor in the room. The job is growing them, not avoiding mistakes.\n\n**2. Knowledge artifacts as a product.** ADRs, runbooks, internal blog posts, walkthroughs. When someone learns something hard, they write it down. Now everyone benefits.\n\n**3. Pairing as default for tricky work.** Not constant — but for any new pattern, security-sensitive code, or production incident response, two people. Skill transfers fastest in real work, not in courses.\n\nMeasurable signals over a year:\n\n- Diversity of who owns which area (bus factor going up)\n- Quality of design docs written by non-Leads (delegation of architectural thinking)\n- PR review depth from mid-levels (catching real issues, not just style)\n- Production incident MTTR (does the team self-fix or wait for Lead?)\n\nThe Lead anti-pattern: keeping yourself indispensable. The team's growth is the work — your individual code output should be going DOWN as their capability goes up.",
      tags: ["leadership", "team-development"],
    },
    {
      id: "sl-9",
      difficulty: "principal",
      question:
        "What's the difference between a Tech Lead and a Manager? Where do they overlap and conflict?",
      answer:
        "Tech Lead owns **what** and **how** — what we build, how we build it well. Manager owns **who** and **why** — staffing, performance, career, business alignment.\n\nOverlap zones:\n\n- **Hiring** — manager runs the process, Tech Lead is the deepest technical screener and has veto on technical bar.\n- **Performance management** — manager makes the call, Tech Lead provides direct technical assessment. Honest signal both ways.\n- **Project planning** — manager owns headcount and dependencies, Tech Lead owns sequencing and architecture.\n\nConflict zones (which need direct conversation, not avoidance):\n\n- **Quality vs deadline.** Manager pressures for ship date; Tech Lead pushes back on quality compromise. Talk in trade-offs, not absolutes.\n- **Tech debt vs new features.** Manager wants visible output; Tech Lead wants foundation work. Frame foundation as risk mitigation in business terms.\n- **Performance issues.** Manager may want quicker action than Tech Lead is comfortable supporting based on technical signal alone.\n\nThe healthiest model: weekly 1:1 between Tech Lead and Manager, honest about constraints both ways. No politics — both serving the team and the work.",
      tags: ["leadership", "roles"],
    },
    {
      id: "sl-10",
      difficulty: "lead",
      question:
        "Walk me through how you'd onboard a new engineer in the first 30 days.",
      answer:
        "Three weeks of structured progress, then four where they own real work.\n\n**Week 1 — context absorption.**\n- Day 1: laptop, accounts, codebase clone, run it locally, ship a `README` typo fix to push their first PR.\n- Day 2-3: pair on a bug fix. They drive, you watch.\n- Day 4-5: read the ADRs. Discuss two of them with you. They write a brief 'what surprised me' note.\n\n**Week 2 — guided contribution.**\n- A small ticket they own. You're the reviewer. Daily check-in.\n- Walk-through of the production incident playbook. Maybe do a simulated incident drill.\n- Coffee with each team member individually — sets relationships.\n\n**Week 3 — first real feature.**\n- Medium-sized ticket they scope themselves. You ask the hard questions in design; they answer.\n- Lead a standup. Lead a design review. Build their voice in the team.\n\n**Week 4 — own a thing.**\n- A small area they're now the primary maintainer of (a service, a job, a workflow).\n- Their first ADR.\n- Retro on the onboarding with you — what was clear, what wasn't. Improve for the next hire.\n\n**The trap:** dumping documentation and walking away. The trap is also throwing them in the deep end. Neither works.\n\n**The metric:** can they ship a non-trivial feature without your input by week 5? If no, the onboarding failed.",
      tags: ["leadership", "onboarding"],
    },
  ],
  codeDrills: [],
};

// ============================================================================
// TRACK 2 — ARCHITECTURE
// ============================================================================

const ARCHITECTURE: MasteryTrack = {
  id: "architecture",
  title: "Architecture (Clean, DDD, CQRS, Modular Monolith)",
  description:
    "The patterns that actually matter day-to-day. Clean Architecture as a layered enforcement, DDD as a modelling discipline, CQRS as a read-write asymmetry tool. Plus the patterns that bind them: outbox, saga, event-driven integration.",
  color: "#bf7fff",
  definitions: [
    {
      term: "Clean Architecture",
      definition:
        "Dependencies point inward. Domain has zero references to EF/ASP.NET/external. Application orchestrates use cases. Infrastructure implements interfaces defined in inner layers. Web/API is the outermost ring.",
    },
    {
      term: "DDD — Domain-Driven Design",
      definition:
        "A modelling approach that elevates the domain model and a ubiquitous language. Concepts: bounded context, aggregate, entity, value object, domain event, anti-corruption layer.",
    },
    {
      term: "Bounded Context",
      definition:
        "A logical boundary inside which a model is internally consistent. 'Customer' in Billing is not the same as 'Customer' in Onboarding. Each bounded context has its own model and its own ubiquitous language.",
    },
    {
      term: "Aggregate",
      definition:
        "A cluster of objects treated as a single unit for the purpose of data changes. Has one root entity. Transactional consistency boundary. References between aggregates are by ID only, never object reference.",
    },
    {
      term: "Value Object",
      definition:
        "Defined by its attributes, not identity. Immutable. Two value objects with the same attribute values are interchangeable. `Money(100, GBP)`, `Address`, `EmailAddress`.",
    },
    {
      term: "CQRS — Command Query Responsibility Segregation",
      definition:
        "Separate the model for writes (commands) and reads (queries). Commands go through the domain; queries can bypass it for performance. Doesn't require event sourcing. Doesn't require separate databases.",
    },
    {
      term: "MediatR pipeline behaviour",
      definition:
        "A cross-cutting concern that wraps every command/query — validation, logging, transaction, caching. Implemented via the `IPipelineBehavior<TRequest, TResponse>` interface.",
    },
    {
      term: "Outbox Pattern",
      definition:
        "Write domain events to an `outbox_messages` table in the same database transaction as your business change. A background process publishes them to the message bus. Solves the dual-write problem (DB commit + MQ publish atomicity).",
    },
    {
      term: "Saga",
      definition:
        "A state machine coordinating a long-running business process across multiple services. State persists between events. Handles compensation when steps fail.",
    },
    {
      term: "Modular Monolith",
      definition:
        "A monolith deliberately structured into modules with explicit boundaries and inter-module APIs. Goal: get most of the maintainability benefits of microservices without the operational complexity.",
    },
    {
      term: "Anti-Corruption Layer",
      definition:
        "A translation layer between your bounded context and an external/legacy system. Protects your model from being polluted by their concepts.",
    },
    {
      term: "Event Sourcing",
      definition:
        "Store the sequence of state-changing events as the source of truth; rebuild current state by replaying events. Not the same as CQRS. Much more invasive than people assume — only when audit/replay is a hard requirement.",
    },
  ],
  drills: [
    {
      id: "arch-1",
      difficulty: "senior",
      question:
        "Explain Clean Architecture using a real codebase you've worked on.",
      answer:
        "On Toyota Kinto: four projects in the solution.\n\n**Domain** — records, value objects, business rules. Zero references to EF, ASP.NET, anything external. `Booking`, `Vehicle`, `Money`, `Tariff` live here as pure C#.\n\n**Application** — MediatR commands and queries. `CreateBookingCommand`, `GetBookingByIdQuery`. Depends only on Domain. Defines `IBookingRepository` as an interface — implementation lives elsewhere.\n\n**Infrastructure** — EF Core `DbContext`, external service clients (pricing engine, Toyota API), message bus consumers, cache, file storage. Implements the interfaces Application defines.\n\n**Web/API** — ASP.NET Core. Controllers are thin — `[HttpPost] async Task<IActionResult> Create(CreateBookingCommand cmd) => Ok(await _mediator.Send(cmd))`. The HTTP concerns live here only.\n\nDependency arrow: `Web → Application → Domain`, with `Infrastructure → Application` for interface implementations. The DI container wires it at startup.\n\n**What it buys you:** swap EF for Dapper, swap RabbitMQ for Service Bus — Domain doesn't know or care. Domain logic is unit-testable in pure C#, no infrastructure setup.\n\n**What it costs you:** more files for simple CRUD, occasional indirection cost. Worth it on anything with real domain complexity; overhead on trivial CRUD.",
      followUp:
        "Where does validation live — Domain, Application, or both?",
      tags: ["clean-architecture"],
    },
    {
      id: "arch-2",
      difficulty: "senior",
      question:
        "What's CQRS actually solving? When do you reach for it and when don't you?",
      answer:
        "**The problem CQRS solves:** the shape your domain wants for writes is rarely the shape your UI wants for reads. Forcing them through the same model means either bad reads (over-fetching aggregates) or bad writes (anemic models contorted for query convenience).\n\n**The solution:** two models. Commands flow through your rich domain — `PlaceOrderCommand` loads the Customer aggregate, applies business rules, persists. Queries skip the domain entirely — `GetCustomerOrdersQuery` is just a SQL projection straight into a `CustomerOrdersDto`.\n\n**Benefits:**\n- Read shapes optimised per screen, no aggregate-fetching overhead\n- Domain stays focused on rules, not query convenience\n- Read scaling becomes independent (read replicas, separate DB, materialized views)\n- Easier to add new reads without touching the domain\n\n**Costs:**\n- Two models to maintain — your `Customer` aggregate and your `CustomerOrdersDto`\n- The pattern is bigger than the problem on small apps\n- People think CQRS implies separate databases / event sourcing — it doesn't, but the confusion is real\n\n**When I reach for it:**\n- Read-heavy apps with diverse query shapes\n- Banking, e-commerce, anywhere reports/dashboards multiply\n- Once the domain has real invariants worth protecting\n\n**When I don't:**\n- Simple CRUD admin tools\n- 5-screen apps where the aggregate is the DTO\n- Junior team unfamiliar with the pattern — the indirection confuses more than helps\n\n**Sneaky middle ground:** start without CQRS, refactor to it when a specific read becomes painful. Don't pre-pay the cost.",
      followUp:
        "Does CQRS require separate read and write databases?",
      tags: ["cqrs", "architecture"],
    },
    {
      id: "arch-3",
      difficulty: "lead",
      question:
        "Modular monolith vs microservices — pick a side and defend it for a new banking gateway.",
      answer:
        "For a new banking gateway, I'd start with a **modular monolith** and only extract services when there's a concrete reason — not a hypothetical one.\n\n**Why modular monolith first:**\n- Single deployable. Single transaction model. Single observability surface. No distributed-system tax until you've earned the privilege.\n- Refactoring across modules is cheap when they're in the same solution. Cross-service refactoring is expensive and risky.\n- Team is one team. Conway's law — your communication structure shapes your architecture. Solo team, solo deployable.\n- Modules with enforced boundaries (NetArchTest rules, separate projects, well-defined interfaces) give you 80% of the maintainability of microservices.\n\n**When I'd extract a service:**\n- One module has fundamentally different scaling needs (a CPU-bound report engine vs a fast API).\n- One module has different deployment cadence (a stable settlements module vs a fast-moving customer-onboarding module).\n- A team grows past ~8 engineers and starts stepping on each other.\n- Regulatory isolation — payment-card data needs its own blast radius.\n\n**What I wouldn't do:**\n- Start with 8 microservices because 'cloud-native'. You've now bought distributed transactions, eventual consistency, service discovery, distributed tracing — all before you have customers. Microservices are an *operations* solution, not an *engineering* one. They only pay back at scale.\n\n**The Bezos quote that gets misquoted:** Amazon's two-pizza teams + microservices was a solution for an organisation of thousands. Most teams adopt the architecture without the organisation. Then they have all the costs and none of the benefits.",
      followUp:
        "Concrete example: at ABSA, how would you structure the Core Banking Gateway?",
      tags: ["microservices", "modular-monolith"],
    },
    {
      id: "arch-4",
      difficulty: "lead",
      question:
        "How do you find a bounded context? You're handed a 30-page banking domain spec — what's your process?",
      answer:
        "Four passes, each ~half a day on a real domain of that size.\n\n**Pass 1 — vocabulary sweep.** Read the spec. Highlight every noun that has business meaning. List them. Many will be synonyms ('client', 'customer', 'account holder') — group those. The list of unique nouns is your *candidate concepts*.\n\n**Pass 2 — the same word means different things.** Where does 'Customer' appear in onboarding? In settlements? In marketing? If the attributes are different — different identity, different lifecycle, different rules — those are separate bounded contexts even though they share a noun. This is the single most important sign of a context boundary.\n\n**Pass 3 — find the workflow seams.** Where does a business process hand off from one stage to another? Onboarding → KYC verification → Account creation → Card issuance. Each transition is usually a context boundary. Each boundary is an integration point — synchronous API or async event.\n\n**Pass 4 — confirm with people.** Have the business analyst describe the workflow back. Where you see seams, ask 'who owns this part?'. Organisational ownership usually aligns with bounded contexts. If it doesn't, that's a red flag worth raising.\n\n**Outputs:** a context map (boxes = contexts, arrows = relationships labeled 'customer-supplier', 'shared kernel', 'ACL'). Each context has a ubiquitous language glossary. ADRs follow.\n\n**Common mistake:** carving by *technical layer* (DB, API, UI) instead of *business capability*. That's what makes 'service-oriented' so painful — every change touches every layer.",
      tags: ["ddd", "bounded-context"],
    },
    {
      id: "arch-5",
      difficulty: "lead",
      question:
        "Walk me through the outbox pattern. Why isn't it optional in production?",
      answer:
        "**The problem:** you want to commit a domain change to your database AND publish an event to a message broker, atomically. Without help, you have a dual-write.\n\nClassic broken code:\n```csharp\nawait _db.SaveChangesAsync();           // commits to DB\nawait _bus.Publish(new OrderPlaced());  // publishes — but what if this fails?\n```\nIf the publish fails, your DB has an order and the rest of your system thinks it doesn't exist. Lost data, ghost data, support tickets that look like sorcery.\n\n**The outbox pattern:**\n1. In the same DB transaction as your business change, write the event to an `outbox_messages` table (id, type, payload, occurred_at, processed_at).\n2. A separate publisher process polls the outbox, publishes new messages to the broker, marks them `processed`.\n3. If the publisher dies, no problem — restart, pick up where it left off.\n\n**What it gives you:**\n- *At-least-once* delivery (the publisher will retry).\n- Atomicity between DB and event publication.\n- Replay capability — pause publisher, fix consumers, resume.\n\n**What it requires:**\n- Consumers must be idempotent. The publisher may publish the same event twice on a crash; consumers handle it.\n- An ordering strategy if you care about per-aggregate ordering — publish by aggregate ID hash.\n- Monitoring on outbox depth — growing means publisher is stuck.\n\n**Why production needs it:** every system that does both DB writes and async publishing has this problem. Without the outbox, you have silent inconsistencies. The bug looks random. It's not — it's the dual-write tax.\n\n**MassTransit gives you `UseDbContextOutbox<TDbContext>()` — three lines of config, problem solved.**",
      followUp: "What's the inbox pattern, and when do you need it?",
      tags: ["outbox", "messaging", "consistency"],
    },
    {
      id: "arch-6",
      difficulty: "lead",
      question:
        "Saga vs orchestrator vs choreography — what's the difference, and when do you use which?",
      answer:
        "All three coordinate work across multiple services. They differ in *where the coordination logic lives*.\n\n**Choreography:** no central coordinator. Each service listens for events and decides what to do. Service A publishes `OrderPlaced`, Service B picks it up, does its work, publishes `PaymentReserved`, Service C picks that up, etc.\n\n- *Pros:* loose coupling, no single point of failure, services don't know each other.\n- *Cons:* business flow is invisible — it's an emergent property of who listens to what. Debugging is hell. Adding a new step requires editing multiple services.\n- *Use when:* simple flows, few participants, services are owned by different teams.\n\n**Orchestration:** a central orchestrator (a service or function) tells each participant what to do, in order. The orchestrator owns the flow.\n\n- *Pros:* business flow is explicit and readable in one place. Easy to add/remove steps. Easier to monitor.\n- *Cons:* the orchestrator becomes a coupling point. Services become 'dumb' — they obey rather than collaborate.\n- *Use when:* complex flows, business rules that span participants, need for explicit compensation logic.\n\n**Saga:** the specific implementation of orchestration as a *state machine*. State persists between events; the saga is itself a domain object that knows its current state and what to do next.\n\nIn MassTransit:\n```csharp\npublic class OrderSaga : MassTransitStateMachine<OrderSagaData> { ... }\n```\nStates: `Submitted`, `PaymentReserved`, `Shipped`, `Completed`, `Failed`. Events trigger transitions. Compensating actions (refund, restock) on failure paths.\n\n**My rule:** start with choreography if the flow is 2-3 services and stable. Move to orchestration / saga when the flow has compensation, retries, or needs to be reasoned about as a whole. Don't start with orchestration — premature complexity.",
      tags: ["saga", "orchestration", "messaging"],
    },
    {
      id: "arch-7",
      difficulty: "lead",
      question:
        "Domain events vs integration events — explain the distinction and why it matters.",
      answer:
        "**Domain events** live INSIDE a bounded context. They represent something meaningful to the business that *just happened in this context*. They're fine-grained and tied to your aggregates.\n\nExample: `OrderTotalRecalculated`, raised by the `Order` aggregate. Other handlers in the same context might subscribe — e.g., a 'loyalty points' service updates its read model.\n\n**Integration events** cross context boundaries. They are part of your public contract with other services. Coarser-grained, designed for stability and consumer needs.\n\nExample: `OrderPlaced` — the kind of event a settlements service or a notification service in a different bounded context will subscribe to.\n\n**Why the distinction matters:**\n\n1. **Versioning rules differ.** Domain events change with the aggregate; integration events are versioned and supported like an API.\n\n2. **Coupling implications.** If a downstream service subscribes to your *domain* events directly, you can't refactor your aggregate without breaking them. Integration events shield you.\n\n3. **Granularity differs.** Domain events fire often (`OrderItemAdded`, `OrderItemRemoved`, `OrderTotalChanged`). Integration events are aggregated (`OrderUpdated` once per business unit of work).\n\n**Translation pattern:** the aggregate raises domain events; a translator in the same context converts them to integration events (1:N or N:1), which go on the message bus. Different DLLs even.\n\n**Anti-pattern:** publishing every domain event directly to the global bus. Your aggregate refactors break unrelated services. Now they own your internal model.",
      tags: ["events", "ddd"],
    },
    {
      id: "arch-8",
      difficulty: "lead",
      question:
        "An aggregate of yours is getting huge — 30 entities deep. What do you do?",
      answer:
        "Almost certainly it's not really one aggregate. It's many aggregates accidentally tangled.\n\nThe test for whether something belongs in the same aggregate: **must this change be transactionally consistent with that change?** If yes — same aggregate. If 'eventually consistent within a second is fine' — different aggregates.\n\nA `Customer` aggregate with 1,000 historical orders is wrong. The customer must be consistent with their NAME and CONTACT details, sure. But the orders? An order can be created without the customer changing. Different aggregate.\n\n**Refactoring playbook:**\n\n1. **Map the invariants.** What rules does the aggregate currently enforce that must be atomic? List them. They're the only justification for size.\n\n2. **Find weakly-coupled subgraphs.** Where can a property change without forcing another to change in the same transaction? That's a seam.\n\n3. **Extract by ID reference, not object reference.** `Customer.Orders` becomes `OrderRepository.GetByCustomerId(id)`. Orders become their own aggregate referenced by customer ID.\n\n4. **Move event handlers.** Things that used to be a method on the giant aggregate become event handlers — `OrderPlaced` raises `CustomerLastOrderUpdated`, a domain event the Customer aggregate subscribes to.\n\n5. **Eventually consistent** between aggregates becomes acceptable. The cost is some staleness; the benefit is performance, modelling clarity, and aggregate-level locking instead of database-level locking.\n\n**Why aggregates go wrong:** developers model the *database* (referential integrity, joins) instead of *business invariants*. Aggregates exist for invariants, not normalisation. Two different jobs.",
      tags: ["ddd", "aggregate"],
    },
    {
      id: "arch-9",
      difficulty: "principal",
      question:
        "Strangler Fig pattern — when and how do you actually use it?",
      answer:
        "The Strangler Fig (Martin Fowler) is a pattern for replacing a legacy system *incrementally* by growing a new system around it until the old one is fully replaced.\n\n**The metaphor:** in nature, a strangler fig grows around a host tree, eventually the fig is the tree and the host has decomposed. Same with code — your new system grows around the legacy, intercepting more and more of the responsibility, until the legacy can be retired.\n\n**The practical playbook:**\n\n1. **Put a façade in front.** Every request to the legacy now goes through a gateway you control — an API gateway, an NGINX, a small ASP.NET service. The legacy doesn't know.\n\n2. **Route by capability.** New functionality goes to the new system. Old endpoints stay on the legacy.\n\n3. **Pick a capability to migrate.** Start with the least-coupled, least-risky one. Reimplement it in the new system. Switch the gateway to route to the new implementation.\n\n4. **Repeat.** One capability at a time. Each migration is small, reversible, and shippable.\n\n5. **When the last capability migrates** — switch off the legacy. Decommission.\n\n**What kills strangler-fig projects:**\n\n- **Data dual-writes.** Both systems need to be authoritative during migration. You build a sync layer or accept eventual consistency.\n- **No clear definition of 'done'.** People migrate the *easy* parts and leave the hard 20% forever. You end up with two systems forever.\n- **Politics.** Old system has owners; they resist losing it. Get exec sponsorship.\n\n**When I'd use it:** any legacy modernisation where 'big bang rewrite' has failed before. Banking core systems, ERP, anything with 10+ years of accreted complexity.\n\n**When I wouldn't:** when the legacy is so broken that even the gateway can't reliably intercept. Or when the team driving it can't sustain 18-24 months of focused work — strangler-figs die from team turnover.",
      tags: ["legacy", "migration", "strategy"],
    },
    {
      id: "arch-10",
      difficulty: "principal",
      question:
        "You're brought in to architect a new payment processing platform — same domain as ABSA's gateway. Where do you start, day one?",
      answer:
        "Day one is **not** architecture diagrams. Day one is *constraints discovery*.\n\n**Hour 1-4 — non-functional requirements.** I write a one-pager and force decisions:\n- **Throughput:** TPS at peak, daily total, growth profile.\n- **Latency:** P50, P95, P99 targets for the critical path.\n- **Availability:** SLA target. Three nines, four nines, five nines — each adds an order of magnitude of cost.\n- **Consistency:** strong vs eventual? Where can we tolerate which?\n- **Compliance:** PCI-DSS, POPIA, internal banking regs.\n- **Geographic:** single-region or multi-region active-active?\n- **Disaster recovery:** RTO and RPO.\n\n**Hour 5-8 — capability map.** What does the system do, abstractly? Probably: accept request → validate → authenticate → authorise → route → execute → reconcile → notify. Each is a *capability*, not yet a service.\n\n**Day 2 — context map.** Bounded contexts: 'Payment Acceptance', 'Routing', 'Settlement', 'Reconciliation', 'Notification', 'Fraud'. How they communicate (sync API, async event, shared DB). Anti-corruption layers where they meet external systems.\n\n**Day 3 — pick the first slice.** Walking skeleton — the simplest possible end-to-end flow that exercises every layer. One payment type, happy path only. Architecture is *only as good as the first slice it survives*.\n\n**Day 4 — ADRs for the foundational choices.** Async vs sync, DB choice, broker choice, deployment target, observability stack. Each ADR has alternatives and trade-offs.\n\n**What I'd resist on day one:**\n- Drawing the perfect microservices diagram before building anything.\n- Choosing tech (Kafka vs RabbitMQ, AKS vs Container Apps) before constraints are clear.\n- Promising delivery dates.\n\n**The trap I've seen in banking:** architects who spent 3 months on Visio diagrams before any code. The first prod-deploy lessons invalidated 50% of the diagrams. Build the walking skeleton early; iterate from real evidence.",
      followUp:
        "What's the riskiest assumption in your design — and how would you de-risk it first?",
      tags: ["architecture", "system-design"],
    },
  ],
  codeDrills: [
    {
      id: "arch-code-1",
      title: "Aggregate with proper encapsulation",
      brief:
        "Refactor an anaemic `Order` class into a proper DDD aggregate. No public setters. Invariants enforced. Domain events raised.",
      language: "csharp",
      starter: `// ANAEMIC — refactor this
public class Order
{
    public Guid Id { get; set; }
    public Guid CustomerId { get; set; }
    public List<OrderLine> Lines { get; set; } = new();
    public decimal Total { get; set; }
    public string Status { get; set; } = "Draft";
}

public class OrderLine
{
    public Guid ProductId { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
}`,
      solution: `// RICH AGGREGATE
public class Order
{
    private readonly List<OrderLine> _lines = new();
    private readonly List<IDomainEvent> _events = new();

    public Guid Id { get; }
    public Guid CustomerId { get; }
    public OrderStatus Status { get; private set; }
    public Money Total => Money.Sum(_lines.Select(l => l.LineTotal));

    public IReadOnlyList<OrderLine> Lines => _lines.AsReadOnly();
    public IReadOnlyList<IDomainEvent> Events => _events.AsReadOnly();

    private Order() { } // EF / serializer

    public Order(Guid customerId)
    {
        if (customerId == Guid.Empty)
            throw new ArgumentException("CustomerId required");

        Id = Guid.NewGuid();
        CustomerId = customerId;
        Status = OrderStatus.Draft;
        _events.Add(new OrderCreated(Id, customerId));
    }

    public void AddLine(Guid productId, int quantity, Money unitPrice)
    {
        if (Status != OrderStatus.Draft)
            throw new InvalidOperationException("Cannot add lines to non-draft order");
        if (quantity <= 0)
            throw new ArgumentException("Quantity must be positive");

        var existing = _lines.SingleOrDefault(l => l.ProductId == productId);
        if (existing is not null)
            existing.IncreaseQuantity(quantity);
        else
            _lines.Add(new OrderLine(productId, quantity, unitPrice));

        _events.Add(new OrderLineAdded(Id, productId, quantity));
    }

    public void Submit()
    {
        if (Status != OrderStatus.Draft)
            throw new InvalidOperationException("Order already submitted");
        if (_lines.Count == 0)
            throw new InvalidOperationException("Cannot submit empty order");

        Status = OrderStatus.Submitted;
        _events.Add(new OrderSubmitted(Id, CustomerId, Total));
    }

    public void ClearEvents() => _events.Clear();
}

public class OrderLine
{
    public Guid ProductId { get; }
    public int Quantity { get; private set; }
    public Money UnitPrice { get; }
    public Money LineTotal => UnitPrice * Quantity;

    internal OrderLine(Guid productId, int quantity, Money unitPrice)
    {
        ProductId = productId;
        Quantity = quantity;
        UnitPrice = unitPrice;
    }

    internal void IncreaseQuantity(int by) => Quantity += by;
}

public enum OrderStatus { Draft, Submitted, Paid, Shipped, Cancelled }

public record Money(decimal Amount, string Currency)
{
    public static Money Sum(IEnumerable<Money> values) =>
        values.Aggregate(new Money(0, "GBP"), (a, b) => a with { Amount = a.Amount + b.Amount });
    public static Money operator *(Money m, int n) => m with { Amount = m.Amount * n };
}

public interface IDomainEvent { }
public record OrderCreated(Guid OrderId, Guid CustomerId) : IDomainEvent;
public record OrderLineAdded(Guid OrderId, Guid ProductId, int Quantity) : IDomainEvent;
public record OrderSubmitted(Guid OrderId, Guid CustomerId, Money Total) : IDomainEvent;`,
      hints: [
        "Private setters everywhere. Constructor enforces invariants.",
        "Collection exposed as `IReadOnlyList<>` — no external mutation.",
        "Status transitions are methods (Submit, Cancel), not setters.",
        "Domain events are immutable records, collected on the aggregate, dispatched after Save.",
        "Money is a value object — immutable, equality by value, basic arithmetic.",
      ],
      takeaway:
        "Aggregates have BEHAVIOUR not just data. The constructor and methods enforce business rules; setters are private; collections are read-only externally. Domain events let the rest of the system react without coupling to internal state.",
    },
    {
      id: "arch-code-2",
      title: "MediatR pipeline behaviour (validation + transaction)",
      brief:
        "Write a `TransactionBehaviour<TRequest, TResponse>` that wraps every command in a database transaction, commits on success, rolls back on exception. Plus a `ValidationBehaviour` that runs FluentValidation before the handler.",
      language: "csharp",
      starter: `// public class TransactionBehaviour<TRequest, TResponse> 
//     : IPipelineBehavior<TRequest, TResponse> 
//     where TRequest : IRequest<TResponse>
// {
//     // TODO
// }`,
      solution: `public class TransactionBehaviour<TRequest, TResponse>
    : IPipelineBehavior<TRequest, TResponse>
    where TRequest : IRequest<TResponse>
{
    private readonly AppDbContext _db;
    private readonly ILogger<TransactionBehaviour<TRequest, TResponse>> _logger;

    public TransactionBehaviour(AppDbContext db, ILogger<TransactionBehaviour<TRequest, TResponse>> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken ct)
    {
        // Queries (IRequest<T> where T is read DTO) don't need a transaction
        // Heuristic: only wrap commands. Mark commands with a marker interface
        // for cleanliness.
        if (request is not ICommand)
            return await next();

        if (_db.Database.CurrentTransaction is not null)
            return await next();  // outer transaction exists; don't nest

        await using var tx = await _db.Database.BeginTransactionAsync(ct);
        try
        {
            var response = await next();
            await _db.SaveChangesAsync(ct);
            await tx.CommitAsync(ct);
            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Transaction rolled back for {Request}", typeof(TRequest).Name);
            await tx.RollbackAsync(ct);
            throw;
        }
    }
}

public class ValidationBehaviour<TRequest, TResponse>
    : IPipelineBehavior<TRequest, TResponse>
    where TRequest : IRequest<TResponse>
{
    private readonly IEnumerable<IValidator<TRequest>> _validators;

    public ValidationBehaviour(IEnumerable<IValidator<TRequest>> validators) =>
        _validators = validators;

    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken ct)
    {
        if (!_validators.Any())
            return await next();

        var ctx = new ValidationContext<TRequest>(request);
        var results = await Task.WhenAll(_validators.Select(v => v.ValidateAsync(ctx, ct)));
        var failures = results.SelectMany(r => r.Errors).Where(f => f != null).ToList();

        if (failures.Count > 0)
            throw new ValidationException(failures);

        return await next();
    }
}

public interface ICommand : IRequest { }
public interface ICommand<TResponse> : IRequest<TResponse> { }

// Registration in Program.cs:
// services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(Program).Assembly));
// services.AddScoped(typeof(IPipelineBehavior<,>), typeof(ValidationBehaviour<,>));
// services.AddScoped(typeof(IPipelineBehavior<,>), typeof(TransactionBehaviour<,>));
// services.AddValidatorsFromAssemblyContaining<Program>();
// Order matters — Validation first, Transaction wrapping it.`,
      hints: [
        "Order of registration matters — first registered runs first / outermost",
        "Don't open a transaction inside an existing one (nested transactions are tricky in EF)",
        "Use a marker interface (`ICommand`) so queries don't get wrapped",
        "Log the request type on rollback — invaluable for forensics",
      ],
      takeaway:
        "Pipeline behaviours give you cross-cutting concerns (validation, transactions, logging, caching, retries) without polluting every handler. Compose them like middleware. Order is significant.",
    },
    {
      id: "arch-code-3",
      title: "Outbox publisher (simplified)",
      brief:
        "Write a `BackgroundService` that polls an outbox table, publishes pending messages to a bus, marks them processed. Handle retries and poison messages.",
      language: "csharp",
      starter: `// public class OutboxPublisher : BackgroundService
// {
//     protected override async Task ExecuteAsync(CancellationToken stoppingToken)
//     {
//         // TODO
//     }
// }`,
      solution: `public class OutboxPublisher : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly IPublishEndpoint _bus;   // MassTransit / similar
    private readonly ILogger<OutboxPublisher> _logger;
    private static readonly TimeSpan PollInterval = TimeSpan.FromSeconds(5);
    private const int BatchSize = 50;
    private const int MaxAttempts = 5;

    public OutboxPublisher(
        IServiceScopeFactory scopeFactory,
        IPublishEndpoint bus,
        ILogger<OutboxPublisher> logger)
    {
        _scopeFactory = scopeFactory;
        _bus = bus;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken ct)
    {
        while (!ct.IsCancellationRequested)
        {
            try
            {
                var processed = await ProcessBatchAsync(ct);
                // If we drained a full batch, no delay — there might be more.
                // If batch was empty, back off to PollInterval.
                if (processed < BatchSize)
                    await Task.Delay(PollInterval, ct);
            }
            catch (OperationCanceledException)
            {
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "OutboxPublisher iteration failed");
                await Task.Delay(PollInterval, ct);
            }
        }
    }

    private async Task<int> ProcessBatchAsync(CancellationToken ct)
    {
        using var scope = _scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        // Pick up unprocessed rows, lock them so a second publisher instance
        // can't grab the same ones. SELECT FOR UPDATE SKIP LOCKED is the
        // canonical pattern.
        var pending = await db.OutboxMessages
            .FromSqlRaw(@"
                SELECT * FROM outbox_messages
                WHERE processed_at IS NULL AND attempts < {0}
                ORDER BY occurred_at
                LIMIT {1}
                FOR UPDATE SKIP LOCKED", MaxAttempts, BatchSize)
            .ToListAsync(ct);

        if (pending.Count == 0) return 0;

        foreach (var msg in pending)
        {
            try
            {
                var eventType = Type.GetType(msg.Type)
                    ?? throw new InvalidOperationException($"Unknown type {msg.Type}");
                var payload = JsonSerializer.Deserialize(msg.Payload, eventType)!;

                await _bus.Publish(payload, eventType, ct);

                msg.ProcessedAt = DateTimeOffset.UtcNow;
                msg.Attempts += 1;
            }
            catch (Exception ex)
            {
                msg.Attempts += 1;
                msg.LastError = ex.Message;
                if (msg.Attempts >= MaxAttempts)
                {
                    _logger.LogError(ex, "Outbox message {Id} moved to dead-letter after {Attempts}", msg.Id, msg.Attempts);
                    msg.DeadLetteredAt = DateTimeOffset.UtcNow;
                }
                else
                {
                    _logger.LogWarning(ex, "Outbox publish failed for {Id}, attempt {Attempts}", msg.Id, msg.Attempts);
                }
            }
        }

        await db.SaveChangesAsync(ct);
        return pending.Count;
    }
}

public class OutboxMessage
{
    public Guid Id { get; set; }
    public DateTimeOffset OccurredAt { get; set; }
    public string Type { get; set; } = "";        // assembly-qualified type name
    public string Payload { get; set; } = "";     // JSON
    public DateTimeOffset? ProcessedAt { get; set; }
    public int Attempts { get; set; }
    public string? LastError { get; set; }
    public DateTimeOffset? DeadLetteredAt { get; set; }
}

// Required index:
//   CREATE INDEX ix_outbox_unprocessed ON outbox_messages (occurred_at)
//   WHERE processed_at IS NULL AND attempts < 5;`,
      hints: [
        "`SELECT FOR UPDATE SKIP LOCKED` lets multiple publishers run safely",
        "Stamp `ProcessedAt` AND increment `Attempts` so you have audit trail",
        "Cap attempts — poisoned messages go to a dead-letter state, not infinite retry",
        "Add a partial index on `(occurred_at) WHERE processed_at IS NULL` — keeps queries fast as the table grows",
        "Consumers must be idempotent — outbox guarantees at-least-once, not exactly-once",
      ],
      takeaway:
        "The outbox isn't magic — it's a polling loop with locking and retry. The discipline is in the failure modes: poisoned messages, multiple publisher instances, monitoring outbox depth.",
    },
  ],
};

// ============================================================================
// TRACK 3 — RESILIENCE (Retries, Circuit Breaker, Rate Limiting, Idempotency)
// ============================================================================

const RESILIENCE: MasteryTrack = {
  id: "resilience",
  title: "Resilience — Retries, Circuit Breaker, Rate Limits, Idempotency",
  description:
    "How systems survive when their dependencies misbehave. Retry, timeout, circuit breaker, bulkhead, rate limiting, idempotency, dead-letter handling. The patterns that turn 'it crashes sometimes' into 'it degrades gracefully'.",
  color: "#bf7fff",
  definitions: [
    {
      term: "Retry with exponential backoff",
      definition:
        "Retry a failing call after delays that grow exponentially (1s, 2s, 4s, 8s). Add 'jitter' (random variance) to prevent thundering-herd retry storms.",
    },
    {
      term: "Circuit Breaker",
      definition:
        "Wrap a call; if it fails too often, 'open' the circuit and fast-fail subsequent calls without trying. After a cooldown, 'half-open' — let one call through to test. Three states: Closed (healthy), Open (failing fast), Half-Open (probing).",
    },
    {
      term: "Bulkhead",
      definition:
        "Isolate failures by limiting concurrent calls to a dependency. Like watertight compartments in a ship — if dependency A floods, it doesn't sink dependencies B and C.",
    },
    {
      term: "Rate limiting — Token Bucket",
      definition:
        "A bucket holds tokens; each request consumes one. Bucket refills at a fixed rate. Allows bursts up to bucket capacity, smooths sustained traffic to the refill rate.",
    },
    {
      term: "Rate limiting — Sliding Window",
      definition:
        "Count requests in the last N seconds via a rolling window. More accurate than fixed windows but more expensive to compute.",
    },
    {
      term: "Idempotency key",
      definition:
        "A client-supplied unique identifier for a request. Server caches the response by key for a window (e.g. 24h). Same key + repeated request = same response, no duplicate work.",
    },
    {
      term: "Timeout",
      definition:
        "Hard upper bound on how long you'll wait for a call. ALWAYS set explicitly — defaults are usually too long. Pair with cancellation tokens in C#.",
    },
    {
      term: "Dead Letter Queue (DLQ)",
      definition:
        "Where messages go when they can't be processed after N retries. A debugging surface, not a black hole — needs monitoring and replay capability.",
    },
    {
      term: "Backpressure",
      definition:
        "When the consumer can't keep up, signal upstream to slow down. Without it, queues grow unbounded and the system collapses under its own weight.",
    },
    {
      term: "Saga compensation",
      definition:
        "When a step in a multi-step process fails, execute compensating actions to undo previous successful steps. Different from rollback (which is transactional). E.g. 'refund payment' compensates 'charge payment'.",
    },
  ],
  drills: [
    {
      id: "res-1",
      difficulty: "senior",
      question:
        "When do you retry, when don't you? What's safe to retry?",
      answer:
        "Only retry **transient, idempotent** failures.\n\n**Retry these:**\n- Network timeouts (the request might not have reached the server)\n- HTTP 503 Service Unavailable (the service is temporarily down)\n- HTTP 429 Too Many Requests (respect the `Retry-After` header if given)\n- Connection refused / DNS failures\n- Database deadlocks (specifically, retry the entire transaction)\n\n**Do NOT retry these:**\n- HTTP 400 Bad Request — your payload is wrong; retrying won't fix it\n- HTTP 401/403 — auth issue, retrying makes it worse\n- HTTP 404 — the thing isn't there; retrying won't conjure it\n- HTTP 422 / business validation failures — deterministic, won't change\n- Non-idempotent POSTs without an idempotency key — risk double-charging the customer\n\n**The crucial nuance:** if the original call has side effects and you didn't get a response, you don't know if it succeeded. Retrying without an idempotency mechanism is a duplicate-write hazard. Always pair retries on POST/PUT with idempotency keys or upstream-supplied uniqueness.\n\n**Strategy:** 3 attempts max for inline retries, exponential backoff (100ms, 400ms, 1600ms), add jitter. If still failing, return error to caller. Logging is mandatory — silent retry hides production problems.",
      followUp:
        "How do you decide if an API call is idempotent or not?",
      tags: ["retry", "http"],
    },
    {
      id: "res-2",
      difficulty: "senior",
      question:
        "Explain the three states of a circuit breaker. What are the right defaults?",
      answer:
        "**Closed** (the normal state): calls pass through. Failures are counted in a rolling window.\n\n**Open** (the protective state): once failure rate hits a threshold (say 50% of last 20 requests), the breaker opens. All calls fail-fast with an exception — no attempts to the downstream. Saves CPU, saves dependency from being hammered while it's already struggling.\n\n**Half-Open** (the probing state): after a cooldown (say 30 seconds), the breaker lets ONE call through. If it succeeds → close the breaker (back to normal). If it fails → re-open for another cooldown period.\n\n**Defaults that usually work:**\n- Failure threshold: 50% over a window of 20 requests OR 5 consecutive failures\n- Cooldown: 30s (shorter for high-frequency calls, longer for cold dependencies)\n- Success threshold to close: 1 successful call in half-open\n- Timeout per call: must be FINITE — 5-10 seconds typically. A breaker can't trip if the call hangs forever.\n\n**What it gives you:**\n- Containment — when dependency A is dying, your service degrades gracefully instead of cascading.\n- Recovery time — dependency gets breathing room to recover.\n- Observability — open breakers are loud, easy to alert on.\n\n**What it costs you:**\n- Complexity (worth it for critical dependencies, not for everything).\n- False positives during deploy windows or transient spikes.\n\n**Implementation:** in .NET use Polly. `Policy.Handle<HttpRequestException>().CircuitBreakerAsync(handledEventsAllowedBeforeBreaking: 5, durationOfBreak: TimeSpan.FromSeconds(30))`.",
      followUp:
        "What if your downstream is genuinely down for 30 minutes — what should your service do?",
      tags: ["circuit-breaker", "polly"],
    },
    {
      id: "res-3",
      difficulty: "senior",
      question:
        "How would you implement idempotent POST endpoints in ASP.NET Core?",
      answer:
        "**Client supplies an `Idempotency-Key` header** with a unique value (a UUID, typically) per logical operation. The server caches the response keyed by `(client-id, idempotency-key)` for a window — typically 24h.\n\n**The flow:**\n\n1. Request arrives with `Idempotency-Key: abc-123`.\n2. Server checks the cache. If a response is already stored for this key — return that response immediately. No business logic runs.\n3. If not in cache — execute the request normally.\n4. Before responding, store the response under the key.\n\n**Pitfalls and how to handle them:**\n\n- **Race condition on first request:** two requests with the same key arrive simultaneously. Use a 'lock-on-insert' pattern — insert a `(key, status=in-flight)` row with a unique constraint. Second request sees `in-flight` and waits or returns 409.\n\n- **Different payload, same key:** customer makes a mistake reusing a key. Hash the payload, store the hash with the key. If payloads differ, return 422 'idempotency key conflict'.\n\n- **Response storage size:** don't cache megabyte responses. Cap response size, fall back to 'idempotent operation completed; result not available' for large ones.\n\n- **Expiry:** 24h is typical for payment workflows. Shorter for high-frequency APIs.\n\n**Storage:** Redis or a dedicated DB table. Redis is faster but transient — DB is durable. Banking APIs typically use DB.\n\n**In ASP.NET Core:** implement as middleware. Read the header, hash the payload + key, check store, either return cached response or invoke the next handler and store the response.\n\n**Stripe's API is the canonical example** — every payment intent accepts `Idempotency-Key`, cached for 24h.",
      tags: ["idempotency", "api"],
    },
    {
      id: "res-4",
      difficulty: "lead",
      question:
        "Token bucket vs sliding window rate limiting — which when, and what are the trade-offs?",
      answer:
        "**Token bucket:**\n- A bucket holds N tokens, refills at R tokens per second.\n- Each request takes 1 token. No tokens → request rejected (or queued).\n- Allows BURSTS up to bucket size, then smooths to refill rate.\n- *Pros:* simple, memory-efficient, allows traffic shape variation.\n- *Cons:* a perfectly aligned burst of N requests succeeds, then the next request fails — not always intuitive to users.\n- *Use when:* you want to allow short bursts but limit sustained rate. APIs, login attempts.\n\n**Sliding window:**\n- Counts requests in the last X seconds via a rolling window.\n- Two variants: log-based (exact, expensive) and counter-based (approximate, cheap using two adjacent buckets weighted by elapsed time).\n- *Pros:* most accurate; doesn't allow burst at window boundary.\n- *Cons:* more memory (log) or more computation (counter approximation).\n- *Use when:* you need precise enforcement — security-sensitive endpoints, anti-abuse.\n\n**Fixed window (NOT the same as sliding window):**\n- Resets count every X seconds.\n- *Cons:* allows 2× burst at boundary (last second of window + first second of next).\n- *Use when:* good enough for unsophisticated rate limits where 2× boundary burst is acceptable.\n\n**Production reality:**\n- ASP.NET Core 7+ has built-in rate limiting middleware: `AddRateLimiter()` with `TokenBucket`, `SlidingWindow`, `FixedWindow` policies.\n- For distributed services, you need a shared store — usually Redis.\n- Always include `Retry-After` header in 429 responses so clients back off correctly.\n\n**Banking gateway context:**\n- Per-client rate limits on the API surface — token bucket usually.\n- Internal rate limits on calls to the core banking engine — protects the core, often sliding window.",
      followUp:
        "How would you implement a distributed rate limiter across multiple API instances?",
      tags: ["rate-limiting"],
    },
    {
      id: "res-5",
      difficulty: "lead",
      question:
        "Cascading failures — how do they happen, how do you prevent them?",
      answer:
        "**Anatomy of a cascade:**\n\nDependency A slows down → calls to A pile up in your service → threads/connections/memory get held up waiting for A → your service can't serve OTHER requests → upstream consumers experience your service as down → they retry, hammering you → eventually you OOM or run out of threads.\n\nThe slow dependency didn't crash anything; *waiting on it* did.\n\n**The five lines of defence:**\n\n1. **Timeouts on every call.** Never trust a default. If A normally responds in 50ms, set 500ms timeout — generous but bounded. Without this, a hanging call holds a thread forever.\n\n2. **Circuit breaker on every dependency.** When A fails enough, stop calling it. Your service returns degraded responses instead of hanging waiting for A.\n\n3. **Bulkheads (resource isolation).** Limit concurrent calls to each dependency. `Polly.Bulkhead` or `SemaphoreSlim` — at most 20 in-flight calls to A. The 21st gets rejected. Limits the blast radius.\n\n4. **Backpressure / queue limits.** Bounded queues, not unbounded. If a queue is full, the producer is told to slow down or fail — instead of memory growing without limit.\n\n5. **Retry with jitter.** Without jitter, all clients retry at the same instant after a downstream hiccup → thundering herd → second outage. Random spread is mandatory.\n\n**Observability is the early warning:**\n- p99 latency on each dependency call\n- Thread pool starvation metrics\n- Queue depth on every internal queue\n- 5xx rate by upstream dependency\n\n**At ABSA in banking gateway:** every downstream call wraps in a Polly policy with timeout + circuit breaker + bulkhead. If the core is slow, we shed load gracefully — return 503 with `Retry-After` — instead of taking the whole gateway down with us.",
      tags: ["cascading-failures", "resilience"],
    },
    {
      id: "res-6",
      difficulty: "lead",
      question:
        "Walk through what 'graceful degradation' looks like in practice.",
      answer:
        "**Graceful degradation:** when a non-critical capability fails, the system continues to serve its critical functions, possibly with reduced features. The opposite of binary up/down.\n\n**Examples I've shipped:**\n\n1. **Pricing engine slow.** On Toyota Kinto, the pricing service was a critical-but-slow dependency. When it timed out, we returned `last-known-good` prices from a 60-second cache with a UI badge: 'Prices may be slightly outdated — recalculating'. Booking still worked.\n\n2. **Recommendation engine down.** E-commerce site. When the recommendation API failed, instead of showing an error or empty section, the homepage rendered without that section. Most users didn't notice. Core checkout was unaffected.\n\n3. **Notification service unhealthy.** Order confirmation flow. Instead of failing the order because email couldn't send, we accepted the order, stored a 'pending notification' record, and a background process retried the notification. Customer sees their order is placed; email arrives later.\n\n4. **Search index lagging.** A user posts something, but the search index hasn't picked it up yet. We can either (a) fall back to a direct DB query for their own content, or (b) accept that 'newly posted, give it a minute' is fine. Either way, no hard error.\n\n**Implementation patterns:**\n- **Fallbacks**: cached value, default value, simpler computation, empty/skeleton response.\n- **Feature flags** to disable problematic features at runtime without redeploy.\n- **Async escape**: if it must succeed but isn't urgent — queue it for retry, accept the user-facing request.\n- **Visible status** to user — never silently degrade.\n\n**Anti-pattern:** silently swallowing exceptions and pretending all is well. That's not degradation — it's data loss.\n\n**The mindset shift:** every dependency call is an opportunity to choose what to do when it fails. Most code defaults to 'throw exception, fail the request'. Senior code asks: 'is this fail-fast appropriate, or can we do better?'",
      tags: ["graceful-degradation"],
    },
    {
      id: "res-7",
      difficulty: "principal",
      question:
        "Design idempotency keys for an asynchronous payment workflow that spans multiple services.",
      answer:
        "Cross-service async idempotency is harder than HTTP-level idempotency. You need a strategy that survives message replay across multiple stages.\n\n**The pattern: idempotency keys propagate, not regenerate.**\n\n1. **Client sends** `POST /payments` with `Idempotency-Key: payment-abc-123`.\n\n2. **Payment Acceptance service** stores `(client_id, payment-abc-123)` in an idempotency table. Either:\n   - First time → process, return 202 Accepted with a `payment-id` URL.\n   - Replay → look up stored response, return identical 202 Accepted.\n\n3. **Accepted payment** is enqueued for processing. Critical: the message includes BOTH `payment-id` (server-generated) AND `idempotency-key` (client-supplied).\n\n4. **Processing service** consumes the message. Idempotency at THIS layer is by `payment-id` — that's the server's unique ID. The processor checks its own DB: 'have I already processed `payment-id`?' If yes, skip; if no, process and mark as processed.\n\n5. **Settlement service** consumes the 'PaymentProcessed' event. Idempotency check by event ID / payment ID — `INSERT ... ON CONFLICT DO NOTHING` against a `processed_events` table.\n\n6. **Notification** is the same pattern — keyed by `payment-id`.\n\n**Why two keys:**\n- `idempotency-key` (client) protects against duplicate API calls (retries from the client).\n- `payment-id` (server) protects against duplicate internal processing (message bus replays, consumer crashes).\n\n**Storage:**\n- Idempotency table: small, hot, high TTL pressure. Postgres table with `expires_at` and a daily cleanup, or Redis with TTL.\n- 'Already processed' tables per service: durable, partitioned by month for retention.\n\n**Pitfalls:**\n- Forgetting to propagate the idempotency-key through to downstream services breaks end-to-end idempotency.\n- Allowing different payloads under the same key — store the payload hash.\n- TTLs too short — customer retries from yesterday cause duplicate charges. Banking sees this. 24h minimum, sometimes 7 days.\n\n**Stripe gets this right; Square gets this right. Most homegrown payment systems do not.**",
      tags: ["idempotency", "messaging", "payments"],
    },
    {
      id: "res-8",
      difficulty: "principal",
      question:
        "Your message consumer is processing successfully but it's slow — depth growing 1000 msgs/min. What's the playbook?",
      answer:
        "**Confirm symptom first.** Look at three metrics:\n1. Consumer throughput (messages/sec consumed)\n2. Consumer processing latency per message (p50, p99)\n3. Queue depth growth rate\n\nIf throughput is steady but depth is growing → producer is publishing faster than you can consume. If throughput dropped → consumer is bottlenecked.\n\n**Diagnose the bottleneck (5-min spike investigation):**\n\n- **CPU pegged?** Consumer is doing too much per message. Profile the hot path — usually JSON deserialization, an unnecessary database call, or N+1 queries inside the consumer.\n- **DB-bound?** Each consume hits the DB N times. Look for batching opportunities — load 100 related entities in one query.\n- **External API call inside consume?** Bad — your consumer is now coupled to that API's latency. Move the side effect to a downstream consumer if possible.\n- **GC churn?** Allocating heavily per message. Reuse buffers with `ArrayPool`, use `Span<T>`.\n\n**Mitigations (in order of risk):**\n\n1. **Scale out consumers** (easy if your consumer is stateless and the queue supports it). Add more instances; throughput multiplies. Check broker concurrency limits.\n\n2. **Increase prefetch / batch size.** For RabbitMQ, `PrefetchCount`. For SQS, `MaxNumberOfMessages`. Lets the consumer pull more work per round trip.\n\n3. **Parallel processing within the consumer.** `Parallel.ForEachAsync` with bounded `MaxDegreeOfParallelism`. Careful — if processing isn't thread-safe, this breaks things.\n\n4. **Optimize the slow path.** Code-level — fewer DB calls, batched updates, async I/O properly.\n\n5. **Shed load.** If overload is sustained, *can* you drop low-priority messages? Different queues for high/low priority — high gets all consumer capacity in incidents.\n\n**Watch out:**\n- Scaling out blindly with a non-thread-safe sink behind it (e.g. a single DB connection per host) just moves the bottleneck.\n- Increasing concurrency without checking downstream — you'll DDoS the database.\n- Backpressure on the producer might be the right answer, not consumer scale.",
      tags: ["messaging", "performance", "queues"],
    },
  ],
  codeDrills: [
    {
      id: "res-code-1",
      title: "Retry policy with exponential backoff + jitter",
      brief:
        "Write a generic async retry helper. Handles transient exceptions. Exponential backoff with jitter. Caps attempts. Respects cancellation.",
      language: "csharp",
      starter: `public static class Retry
{
    // public static async Task<T> ExecuteAsync<T>(
    //     Func<CancellationToken, Task<T>> action,
    //     int maxAttempts = 3,
    //     CancellationToken ct = default)
    // {
    //     // TODO
    // }
}`,
      solution: `public static class Retry
{
    private static readonly Random _random = new();

    public static async Task<T> ExecuteAsync<T>(
        Func<CancellationToken, Task<T>> action,
        int maxAttempts = 3,
        TimeSpan? baseDelay = null,
        Func<Exception, bool>? shouldRetry = null,
        ILogger? logger = null,
        CancellationToken ct = default)
    {
        baseDelay ??= TimeSpan.FromMilliseconds(100);
        shouldRetry ??= IsTransient;

        Exception? lastException = null;

        for (int attempt = 1; attempt <= maxAttempts; attempt++)
        {
            ct.ThrowIfCancellationRequested();
            try
            {
                return await action(ct);
            }
            catch (Exception ex) when (shouldRetry(ex) && attempt < maxAttempts)
            {
                lastException = ex;
                var delay = ComputeDelayWithJitter(baseDelay.Value, attempt);
                logger?.LogWarning(ex,
                    "Attempt {Attempt}/{Max} failed, retrying in {Delay}ms",
                    attempt, maxAttempts, delay.TotalMilliseconds);
                await Task.Delay(delay, ct);
            }
        }

        throw new RetryExhaustedException(maxAttempts, lastException!);
    }

    private static TimeSpan ComputeDelayWithJitter(TimeSpan baseDelay, int attempt)
    {
        // Exponential: base * 2^(attempt-1) → 100, 200, 400, 800ms
        var exponential = baseDelay.TotalMilliseconds * Math.Pow(2, attempt - 1);

        // Full jitter (AWS Architecture Blog): random between 0 and exponential
        // Avoids synchronized retry storms across clients.
        double jittered;
        lock (_random) jittered = _random.NextDouble() * exponential;

        return TimeSpan.FromMilliseconds(jittered);
    }

    private static bool IsTransient(Exception ex) => ex switch
    {
        TaskCanceledException tce when tce.InnerException is TimeoutException => true,
        HttpRequestException => true,
        TimeoutException => true,
        SocketException => true,
        // Specific HTTP codes worth retrying
        HttpRequestException { Data: var d } when d.Contains("StatusCode") &&
            (int)d["StatusCode"]! is 503 or 504 or 429 => true,
        _ => false
    };
}

public class RetryExhaustedException : Exception
{
    public int Attempts { get; }
    public RetryExhaustedException(int attempts, Exception inner)
        : base($"Operation failed after {attempts} attempts", inner) => Attempts = attempts;
}

// USAGE:
// var result = await Retry.ExecuteAsync(
//     ct => httpClient.GetFromJsonAsync<Quote>("/api/quote", ct),
//     maxAttempts: 4,
//     baseDelay: TimeSpan.FromMilliseconds(200),
//     logger: _logger,
//     ct: cancellationToken);
//
// // Or just use Polly — but knowing how to write this is the senior signal.`,
      hints: [
        "Always honour the CancellationToken — both inside `action` and in `Task.Delay`",
        "Jitter is mandatory — full jitter (random 0..exp) is empirically best",
        "Cap attempts; never retry forever",
        "Discriminate retriable from permanent — 503/504/429 yes, 400/401/422 no",
        "Log every retry attempt with context — silent retries hide real problems",
      ],
      takeaway:
        "Retries are simple in concept and dangerous in practice. The danger is in: forgetting cancellation, no jitter (thundering herd), retrying non-idempotent calls, and silent retries that hide systemic problems. Use Polly in production — but writing this yourself proves you understand it.",
    },
    {
      id: "res-code-2",
      title: "Token-bucket rate limiter (thread-safe)",
      brief:
        "Build an in-memory token bucket rate limiter. N tokens, refills at R per second. Thread-safe. Call `TryAcquire` returns true if a token was taken, false if bucket empty.",
      language: "csharp",
      starter: `public class TokenBucketLimiter
{
    // public TokenBucketLimiter(int capacity, double refillRatePerSecond) { }
    // public bool TryAcquire() => throw new NotImplementedException();
}`,
      solution: `public class TokenBucketLimiter
{
    private readonly int _capacity;
    private readonly double _refillRatePerSecond;
    private readonly object _lock = new();

    private double _tokens;
    private long _lastRefillTicks;  // ticks from Stopwatch — monotonic clock

    public TokenBucketLimiter(int capacity, double refillRatePerSecond)
    {
        if (capacity < 1) throw new ArgumentException("Capacity must be >= 1");
        if (refillRatePerSecond <= 0) throw new ArgumentException("Refill rate must be > 0");

        _capacity = capacity;
        _refillRatePerSecond = refillRatePerSecond;
        _tokens = capacity;  // start full
        _lastRefillTicks = Stopwatch.GetTimestamp();
    }

    public bool TryAcquire(int count = 1)
    {
        if (count < 1) throw new ArgumentException("Count must be >= 1");

        lock (_lock)
        {
            RefillLocked();

            if (_tokens >= count)
            {
                _tokens -= count;
                return true;
            }
            return false;
        }
    }

    /// <summary>Returns the time to wait for 'count' tokens (0 if available).</summary>
    public TimeSpan TimeUntilAvailable(int count = 1)
    {
        lock (_lock)
        {
            RefillLocked();
            if (_tokens >= count) return TimeSpan.Zero;
            var deficit = count - _tokens;
            return TimeSpan.FromSeconds(deficit / _refillRatePerSecond);
        }
    }

    private void RefillLocked()
    {
        var now = Stopwatch.GetTimestamp();
        var elapsedSeconds = (double)(now - _lastRefillTicks) / Stopwatch.Frequency;
        if (elapsedSeconds <= 0) return;

        _tokens = Math.Min(_capacity, _tokens + (elapsedSeconds * _refillRatePerSecond));
        _lastRefillTicks = now;
    }
}

// USAGE in a middleware:
//
// public class RateLimitingMiddleware
// {
//     private readonly ConcurrentDictionary<string, TokenBucketLimiter> _buckets = new();
//     public async Task InvokeAsync(HttpContext ctx, RequestDelegate next)
//     {
//         var clientId = ctx.User.FindFirst("sub")?.Value ?? ctx.Connection.RemoteIpAddress!.ToString();
//         var bucket = _buckets.GetOrAdd(clientId, _ => new TokenBucketLimiter(100, 10));  // 100 burst, 10/sec
//         if (!bucket.TryAcquire())
//         {
//             ctx.Response.StatusCode = StatusCodes.Status429TooManyRequests;
//             ctx.Response.Headers.RetryAfter = bucket.TimeUntilAvailable().TotalSeconds.ToString("0");
//             return;
//         }
//         await next(ctx);
//     }
// }`,
      hints: [
        "Use `Stopwatch.GetTimestamp()` — it's monotonic. `DateTime.UtcNow` can go backwards on NTP adjustment.",
        "Refill lazily on each `TryAcquire` — no background timer needed.",
        "`lock` over the critical section. Don't try Interlocked.* for double precision — verbose and bug-prone.",
        "Always return `Retry-After` header on 429 responses — clients respect it.",
        "For distributed limiting, swap the in-memory bucket for Redis with INCR + EXPIRE — different code but same algorithm.",
      ],
      takeaway:
        "Token bucket is the right default for API rate limiting. The implementation is ~30 lines, monotonic-clock-aware, thread-safe. Don't reach for Redis until you need to share state across instances.",
    },
    {
      id: "res-code-3",
      title: "Idempotency middleware",
      brief:
        "Write ASP.NET Core middleware that intercepts POST/PUT requests with an `Idempotency-Key` header, caches the response, returns cached response on replay.",
      language: "csharp",
      starter: `public class IdempotencyMiddleware
{
    private readonly RequestDelegate _next;
    public IdempotencyMiddleware(RequestDelegate next) => _next = next;
    public async Task InvokeAsync(HttpContext ctx) { /* TODO */ }
}`,
      solution: `public class IdempotencyMiddleware
{
    private const string HeaderName = "Idempotency-Key";
    private static readonly HashSet<string> RelevantMethods = new(StringComparer.OrdinalIgnoreCase)
    { "POST", "PUT", "PATCH", "DELETE" };

    private readonly RequestDelegate _next;
    private readonly IIdempotencyStore _store;
    private readonly ILogger<IdempotencyMiddleware> _logger;

    public IdempotencyMiddleware(
        RequestDelegate next,
        IIdempotencyStore store,
        ILogger<IdempotencyMiddleware> logger)
    {
        _next = next;
        _store = store;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext ctx)
    {
        // Only mutating methods need idempotency
        if (!RelevantMethods.Contains(ctx.Request.Method))
        {
            await _next(ctx);
            return;
        }

        if (!ctx.Request.Headers.TryGetValue(HeaderName, out var keyValues) ||
            string.IsNullOrWhiteSpace(keyValues.ToString()))
        {
            await _next(ctx);
            return;  // header optional; client opted out of idempotency
        }

        var key = keyValues.ToString().Trim();
        var clientId = ctx.User.FindFirst("sub")?.Value
                       ?? ctx.Connection.RemoteIpAddress?.ToString()
                       ?? "anonymous";
        var fullKey = $"{clientId}:{key}";

        // Body hash — protects against same key, different payload
        ctx.Request.EnableBuffering();
        var bodyHash = await HashRequestBodyAsync(ctx.Request);
        ctx.Request.Body.Position = 0;

        // Try fetch existing response
        var existing = await _store.TryGetAsync(fullKey);
        if (existing is not null)
        {
            if (existing.BodyHash != bodyHash)
            {
                _logger.LogWarning("Idempotency key reused with different payload: {Key}", fullKey);
                ctx.Response.StatusCode = StatusCodes.Status422UnprocessableEntity;
                await ctx.Response.WriteAsync("Idempotency-Key reused with different payload");
                return;
            }

            ctx.Response.StatusCode = existing.StatusCode;
            foreach (var (k, v) in existing.Headers) ctx.Response.Headers[k] = v;
            await ctx.Response.WriteAsync(existing.Body);
            return;
        }

        // Race: claim the key first; if claim fails, another request beat us — return 409 or wait
        var claimed = await _store.TryClaimAsync(fullKey, bodyHash, TimeSpan.FromSeconds(30));
        if (!claimed)
        {
            ctx.Response.StatusCode = StatusCodes.Status409Conflict;
            await ctx.Response.WriteAsync("Request with this Idempotency-Key already in flight");
            return;
        }

        // Capture the response so we can store it
        var originalBody = ctx.Response.Body;
        using var buffer = new MemoryStream();
        ctx.Response.Body = buffer;

        try
        {
            await _next(ctx);

            buffer.Position = 0;
            var responseBody = await new StreamReader(buffer).ReadToEndAsync();

            // Only cache success (2xx) — failures can be retried
            if (ctx.Response.StatusCode is >= 200 and < 300)
            {
                await _store.SaveAsync(new IdempotencyRecord(
                    fullKey, bodyHash, ctx.Response.StatusCode,
                    ctx.Response.Headers.ToDictionary(h => h.Key, h => h.Value.ToString()),
                    responseBody, TimeSpan.FromHours(24)));
            }

            buffer.Position = 0;
            await buffer.CopyToAsync(originalBody);
        }
        finally
        {
            ctx.Response.Body = originalBody;
        }
    }

    private static async Task<string> HashRequestBodyAsync(HttpRequest req)
    {
        using var sha = SHA256.Create();
        using var ms = new MemoryStream();
        await req.Body.CopyToAsync(ms);
        return Convert.ToHexString(sha.ComputeHash(ms.ToArray()));
    }
}

public record IdempotencyRecord(
    string Key, string BodyHash, int StatusCode,
    Dictionary<string, string> Headers, string Body, TimeSpan Ttl);

public interface IIdempotencyStore
{
    Task<IdempotencyRecord?> TryGetAsync(string key);
    Task<bool> TryClaimAsync(string key, string bodyHash, TimeSpan claimTtl);
    Task SaveAsync(IdempotencyRecord record);
}

// Registration:
// app.UseMiddleware<IdempotencyMiddleware>();`,
      hints: [
        "Enable request body buffering — `ctx.Request.EnableBuffering()` — or you can't hash AND let the handler read it",
        "Hash the body and store with the response — protects against same-key/different-payload",
        "Race condition: two parallel requests with the same key. Use `TryClaim` with a short TTL — second request sees the claim, returns 409",
        "Only cache successful responses (2xx). 5xx failures aren't 'completed', allow retry",
        "Store TTL: 24 hours is standard for payment-style flows. Storage cost is real — purge expired",
        "Implementation of `IIdempotencyStore` is yours — Redis (fast, transient) or a DB table (durable, slightly slower)",
      ],
      takeaway:
        "Idempotency at the HTTP layer is the cheapest insurance against duplicate-writes from client retries. Pair with idempotency in your async pipeline for end-to-end safety.",
    },
    {
      id: "res-code-4",
      title: "Simple circuit breaker",
      brief:
        "Implement a minimal three-state circuit breaker. Closed → Open after N consecutive failures. Half-open after cooldown. Closes again on success.",
      language: "csharp",
      starter: `public enum CircuitState { Closed, Open, HalfOpen }

public class CircuitBreaker
{
    // public CircuitBreaker(int failureThreshold, TimeSpan cooldown) { }
    // public async Task<T> ExecuteAsync<T>(Func<CancellationToken, Task<T>> action, CancellationToken ct = default) { }
}`,
      solution: `public enum CircuitState { Closed, Open, HalfOpen }

public class CircuitBreaker
{
    private readonly int _failureThreshold;
    private readonly TimeSpan _cooldown;
    private readonly object _lock = new();

    private CircuitState _state = CircuitState.Closed;
    private int _consecutiveFailures;
    private long _openedAtTicks;

    public CircuitBreaker(int failureThreshold, TimeSpan cooldown)
    {
        if (failureThreshold < 1) throw new ArgumentException();
        if (cooldown <= TimeSpan.Zero) throw new ArgumentException();
        _failureThreshold = failureThreshold;
        _cooldown = cooldown;
    }

    public CircuitState State { get { lock (_lock) return _state; } }

    public async Task<T> ExecuteAsync<T>(
        Func<CancellationToken, Task<T>> action, CancellationToken ct = default)
    {
        CheckOpen();

        try
        {
            var result = await action(ct);
            OnSuccess();
            return result;
        }
        catch (Exception)
        {
            OnFailure();
            throw;
        }
    }

    private void CheckOpen()
    {
        lock (_lock)
        {
            if (_state == CircuitState.Open)
            {
                var elapsed = TimeSpan.FromTicks(Stopwatch.GetTimestamp() - _openedAtTicks)
                              * (TimeSpan.TicksPerSecond / (double)Stopwatch.Frequency);
                if (elapsed >= _cooldown)
                {
                    _state = CircuitState.HalfOpen;
                }
                else
                {
                    throw new CircuitOpenException();
                }
            }
        }
    }

    private void OnSuccess()
    {
        lock (_lock)
        {
            _consecutiveFailures = 0;
            _state = CircuitState.Closed;
        }
    }

    private void OnFailure()
    {
        lock (_lock)
        {
            _consecutiveFailures++;

            if (_state == CircuitState.HalfOpen)
            {
                _state = CircuitState.Open;
                _openedAtTicks = Stopwatch.GetTimestamp();
            }
            else if (_consecutiveFailures >= _failureThreshold)
            {
                _state = CircuitState.Open;
                _openedAtTicks = Stopwatch.GetTimestamp();
            }
        }
    }
}

public class CircuitOpenException : Exception
{
    public CircuitOpenException() : base("Circuit breaker is open") { }
}

// USAGE:
// var breaker = new CircuitBreaker(failureThreshold: 5, cooldown: TimeSpan.FromSeconds(30));
// var result = await breaker.ExecuteAsync(ct => httpClient.GetAsync(url, ct));`,
      hints: [
        "Three states — keep them in an enum, transitions in the methods only",
        "Stopwatch for elapsed time (monotonic clock)",
        "Half-open: ONE call permitted; if it succeeds → closed, if it fails → open with fresh cooldown",
        "Production version (Polly) adds rolling failure windows, not just consecutive failures",
        "Always pair circuit breaker WITH timeout — a hanging call can't trip a breaker",
      ],
      takeaway:
        "A circuit breaker is ~40 lines and protects you from cascade failures. The three states (Closed/Open/HalfOpen) are the whole pattern. Production: use Polly's `CircuitBreakerAsync` with rolling window, but understand the mechanics yourself.",
    },
  ],
};

// ============================================================================
// TRACK 4 — SECURITY
// ============================================================================

const SECURITY: MasteryTrack = {
  id: "security",
  title: "Security — OAuth2, JWT, OWASP, Secrets",
  description:
    "What every banking-grade engineer must know. OAuth2 flows in detail, JWT pitfalls, OWASP API Top 10, secrets management, mTLS, threat modelling.",
  color: "#bf7fff",
  definitions: [
    {
      term: "OAuth2 Authorization Code with PKCE",
      definition:
        "The current standard flow for browser and mobile apps. User redirects to auth server, gets a code back, exchanges code+PKCE-verifier for tokens. PKCE prevents code interception attacks.",
    },
    {
      term: "OAuth2 Client Credentials",
      definition:
        "Service-to-service flow. No user. The service has a client_id and client_secret (or signed JWT assertion), exchanges them for an access token.",
    },
    {
      term: "OpenID Connect (OIDC)",
      definition:
        "An identity layer on top of OAuth2. Adds an `id_token` (a JWT containing user identity claims) alongside the access token. Standard for SSO.",
    },
    {
      term: "JWT (JSON Web Token)",
      definition:
        "A signed (and optionally encrypted) JSON payload. Three parts: header, payload, signature, base64url-encoded and joined by dots. Stateless — server doesn't store session.",
    },
    {
      term: "Refresh token",
      definition:
        "A long-lived token used to obtain new access tokens without re-authentication. Must be stored securely (HttpOnly cookie, secure storage on mobile). Rotated on use in production setups.",
    },
    {
      term: "mTLS (Mutual TLS)",
      definition:
        "Both client and server present certificates and authenticate each other. Higher security than regular TLS, used in service-to-service or sensitive client-to-server scenarios.",
    },
    {
      term: "HSM (Hardware Security Module)",
      definition:
        "Tamper-resistant hardware that stores cryptographic keys and performs operations without exposing keys. Used in banking, certificate authorities, payment processing.",
    },
    {
      term: "Secrets rotation",
      definition:
        "Periodically replacing credentials (DB passwords, API keys, certificates) on a schedule. Limits the blast radius of a leaked secret.",
    },
    {
      term: "OWASP API Top 10 — BOLA (Broken Object Level Authorization)",
      definition:
        "API returns a resource without checking the caller is authorized for THAT specific resource. e.g., `/orders/123` returns order 123 regardless of who's asking.",
    },
    {
      term: "OWASP API Top 10 — Mass Assignment",
      definition:
        "API binds request body fields directly to your domain model, allowing attackers to set fields they shouldn't (`isAdmin: true`, `accountBalance: 1000000`).",
    },
    {
      term: "Threat modelling — STRIDE",
      definition:
        "Spoofing, Tampering, Repudiation, Information disclosure, Denial of service, Elevation of privilege. A framework for systematically finding threats in a system design.",
    },
  ],
  drills: [
    {
      id: "sec-1",
      difficulty: "senior",
      question:
        "Walk through OAuth2 grant types — when do you use which?",
      answer:
        "Five grant types, four still recommended.\n\n**Authorization Code with PKCE** — the modern default for ANY browser/mobile/desktop client. User redirects to identity provider, comes back with a one-time code; client exchanges code + PKCE verifier for tokens. PKCE prevents code interception on insecure channels.\n\n**Client Credentials** — service-to-service only. No user. The calling service authenticates with `client_id` + `client_secret` (or a signed JWT assertion) and gets back an access token. Use for backend → backend calls.\n\n**Device Code** — for input-constrained devices (TVs, IoT). User goes to a URL on their phone and enters a short code, granting access to the device. Smart TV Netflix login uses this.\n\n**Refresh Token** — pairs with the others, not a flow on its own. Long-lived token exchanged for new access tokens. Rotate on use in high-security contexts.\n\n**DEPRECATED — Resource Owner Password Credentials (ROPC)** — user types their password directly into the client. Was for legacy migration; should not be used in new systems. The client now has the user's password.\n\n**DEPRECATED — Implicit Flow** — was for SPAs; tokens came back in the URL fragment. Replaced by Authorization Code with PKCE because Implicit had security weaknesses.\n\n**Banking context:** customer-facing apps use Authorization Code + PKCE; internal services use Client Credentials with mTLS on top; integration with third-party processors often uses Client Credentials with JWT bearer assertion (signed by HSM).",
      tags: ["oauth2"],
    },
    {
      id: "sec-2",
      difficulty: "senior",
      question:
        "Where should you store JWTs in a browser? What are the trade-offs?",
      answer:
        "**The three options and their trade-offs:**\n\n**1. localStorage** — convenient, vulnerable to XSS. If an attacker can inject ANY JavaScript into your page, they can read localStorage and exfiltrate the token. Best practice in 2024+: **don't**.\n\n**2. sessionStorage** — same XSS vulnerability as localStorage; token is only lost on tab close, not page close. Slightly less convenient, equally vulnerable. Same answer: don't.\n\n**3. HttpOnly + Secure + SameSite=Strict cookie** — the JavaScript layer literally cannot read it (HttpOnly). Browser sends it automatically with same-origin requests. Cookie is sent over HTTPS only (Secure). Cannot be sent cross-site by default (SameSite). **This is the right answer for browser apps.**\n\n**The CSRF concern:** with cookies, you need CSRF protection (because the browser auto-sends cookies). Use `SameSite=Strict` cookies, OR pair with anti-forgery tokens on state-changing requests, OR use a custom header check + CORS to make CSRF infeasible.\n\n**For SPAs talking to APIs:** the BFF (Backend-For-Frontend) pattern. Your SPA never touches a token — it talks to your BFF server using HttpOnly session cookies. The BFF holds the OAuth2 tokens and proxies API calls. Tokens never reach JavaScript. This is the OWASP recommendation now.\n\n**For mobile / desktop apps:** secure platform storage — Keychain (iOS), Keystore (Android), Credential Manager (Windows). Never plain text on disk.\n\n**JWT-specific:** keep access tokens short-lived (5-15 min). Refresh tokens longer-lived (hours-days) but rotated on use. Even if a token is leaked, blast radius is bounded.",
      tags: ["jwt", "xss", "owasp"],
    },
    {
      id: "sec-3",
      difficulty: "senior",
      question:
        "Run through the OWASP API Top 10 issues you've seen in real codebases.",
      answer:
        "**1. BOLA — Broken Object Level Authorization.** Most common. `GET /api/orders/{id}` returns the order without checking the requesting user owns it. Fix: every read by ID must include a 'WHERE owner_id = current_user' filter.\n\n**2. Broken Authentication.** Weak password policies, JWT mishandling (no signature verification, `alg=none` accepted), missing rate limits on login. Fix: standard auth library (Identity, IdentityServer); never roll your own.\n\n**3. Broken Object Property Level Authorization.** Like BOLA but for properties — user can update their order, but the endpoint also lets them set `discountPercent`. Fix: explicit DTOs per endpoint; never bind directly to domain entities.\n\n**4. Unrestricted Resource Consumption.** No rate limits, no payload size limits, no query depth limits. Attacker uploads a 10GB file or runs a query that returns a million rows. Fix: rate limits, body size limits, pagination on every list endpoint.\n\n**5. Broken Function Level Authorization.** Admin endpoints accessible by regular users — sometimes by URL guessing (`/api/admin/users`). Fix: explicit `[Authorize(Roles=\"Admin\")]` on admin controllers; default-deny in middleware if no `[Authorize]` is present.\n\n**6. Unrestricted Access to Sensitive Business Flows.** Bulk operations exposed without rate limit — e.g. password reset abuse, refund storming. Fix: business-level rate limits AND CAPTCHAs / risk scoring.\n\n**7. Server-Side Request Forgery (SSRF).** API accepts a URL and fetches it server-side, attacker provides `http://169.254.169.254/...` to hit AWS metadata. Fix: never accept arbitrary URLs; if you must, whitelist destinations.\n\n**8. Security Misconfiguration.** Verbose error messages, debug endpoints in prod, default credentials, CORS too open, X-Frame-Options missing. Fix: hardened config templates; security scanner in CI.\n\n**9. Improper Inventory Management.** Old API versions still deployed and forgotten. v1 endpoints have known vulnerabilities, attackers find them. Fix: API versioning policy, sunset old versions, inventory dashboard.\n\n**10. Unsafe Consumption of APIs.** Your app trusts an upstream API too much — doesn't validate responses, exposes data based on untrusted input. Fix: validate everything inbound, treat upstreams as untrusted.\n\n**Banking codebase additions:**\n- Sensitive data logging — log scrubbers for PAN, secrets.\n- Replay attacks — nonces and idempotency keys on sensitive endpoints.\n- mTLS for service-to-service.",
      tags: ["owasp"],
    },
    {
      id: "sec-4",
      difficulty: "lead",
      question:
        "Design a secrets management strategy for an ASP.NET Core service in Azure.",
      answer:
        "**Goal:** secrets never appear in source code, never appear in logs, never live on disk in plaintext, rotate without redeploys.\n\n**Storage:** Azure Key Vault. Period. Don't put secrets in App Service config strings unless they're encrypted secret references.\n\n**Access:** **Managed Identity** — not service principals with passwords, not connection strings with embedded credentials. Managed Identity means Azure assigns the App Service / Container App a system identity; your code authenticates to Key Vault without any secret at all. The identity is the authority.\n\n**Retrieval in code:**\n```csharp\nbuilder.Configuration.AddAzureKeyVault(\n    new Uri(\"https://my-vault.vault.azure.net/\"),\n    new DefaultAzureCredential());  // uses Managed Identity in prod\n```\nNow `IConfiguration[\"DbConnectionString\"]` reads from Key Vault transparently.\n\n**Rotation:**\n- Quarterly minimum for DB passwords, API keys.\n- Annually for certificates.\n- Immediate on suspected leak.\n- Automated via Azure Key Vault rotation policies for supported secret types.\n- Apps re-fetch on rotation — use Key Vault's refresh callback or scheduled config reload.\n\n**Local development:**\n- Developers DO NOT have prod Key Vault access.\n- Local dev uses User Secrets (`dotnet user-secrets`) or a dev Key Vault with non-prod values.\n- `appsettings.Development.json` referenced ONLY for non-sensitive defaults.\n\n**Logs and telemetry:**\n- Add log filters that scrub known patterns (JWT, connection strings, API keys with known prefixes).\n- Never log entire HTTP requests at INFO. DEBUG yes, never INFO.\n- Application Insights filters to drop properties matching `\"password\"`, `\"secret\"`, `\"key\"`.\n\n**Audit:**\n- Key Vault has its own access log. Pipe to Log Analytics.\n- Alert on unusual access patterns — same identity reading 100 secrets in a minute.\n\n**Anti-patterns I've seen:**\n- Secrets in `appsettings.json` committed to source control. Use `git-secrets` to block on commit.\n- Service principals with passwords stored in another secret store. Just use Managed Identity.\n- Long-lived secrets without rotation 'because it's hard to rotate'. If it's hard to rotate, fix the deployment so it's easy.\n- Sharing one secret across all environments. Always per-environment.",
      tags: ["secrets", "azure", "key-vault"],
    },
    {
      id: "sec-5",
      difficulty: "lead",
      question:
        "How do you threat-model a new API endpoint? Walk through STRIDE on a real example.",
      answer:
        "**STRIDE on a new `/api/transfers` endpoint** (money movement, banking API).\n\n**S — Spoofing.** Could an attacker pretend to be someone else?\n- Threats: stolen JWT, replay attack, session hijack.\n- Mitigations: short token TTL, refresh rotation, IP/device fingerprint anomaly detection, anti-replay nonces on transfer requests.\n\n**T — Tampering.** Could an attacker modify the request in flight?\n- Threats: man-in-the-middle on insecure network, request body tampering.\n- Mitigations: TLS everywhere (no exceptions), HSTS, signed requests for high-value operations (sign the body with a shared HMAC key or the user's session key).\n\n**R — Repudiation.** Could a user deny they made a transfer?\n- Threats: 'I didn't authorise that', no proof.\n- Mitigations: comprehensive audit log of every transfer with IP, user agent, timestamp, request body hash. Cannot be deleted by users. Stored separately from the transactional DB (write-only audit store).\n\n**I — Information Disclosure.** Could an attacker get data they shouldn't?\n- Threats: BOLA (seeing other people's transfers), error messages leaking schema, response headers leaking server version.\n- Mitigations: explicit `WHERE owner_id = current_user` filters on every read. Generic error messages externally; detailed internally. Strip `Server` headers. Mask PAN and account numbers in logs.\n\n**D — Denial of Service.** Could an attacker exhaust the system?\n- Threats: spam transfer requests, request body of 100MB, expensive query injection.\n- Mitigations: per-user rate limits (token bucket), per-IP rate limits, body size limit, fail-fast on invalid input before expensive processing.\n\n**E — Elevation of Privilege.** Could a user gain unintended access?\n- Threats: mass assignment (`isAdmin=true` in body), function-level auth missing, role escalation through nested operations.\n- Mitigations: explicit DTOs (never bind to domain entities), `[Authorize(Roles=...)]` on every admin endpoint, default-deny middleware.\n\n**Output of threat-modelling:** a 1-pager with the threats found and mitigations chosen, stored as an ADR. Updates whenever the endpoint changes meaningfully.\n\n**The discipline:** STRIDE every new high-risk endpoint. Don't STRIDE every CRUD — too expensive. Focus on payment, auth, anything that touches PII or money.",
      tags: ["threat-modelling", "stride"],
    },
    {
      id: "sec-6",
      difficulty: "lead",
      question:
        "JWT — what are the most common security mistakes you've seen?",
      answer:
        "**1. Algorithm confusion (`alg=none` or RS256→HS256 attack).**\nJWT specs allow `alg=none` for unsigned tokens. If your validation library accepts `none`, anyone can forge a token. Also: if your code uses the public key to verify (RS256) but allows the algorithm to be downgraded to HS256, an attacker can sign with the public key (now used as a symmetric key) and bypass auth.\n*Fix:* pin the expected algorithm in your validator. Never accept `none`.\n\n**2. No expiry or huge expiry.**\nTokens valid for 30 days are leak amplifiers. Once stolen, attacker has 30 days.\n*Fix:* 5-15 minute access tokens, longer-lived refresh tokens rotated on use.\n\n**3. No signature verification.**\nSurprisingly common — code parses the JWT and reads claims without verifying the signature.\n*Fix:* always validate signature + issuer + audience + expiry. Use a library; never roll your own JWT parser.\n\n**4. Sensitive data in JWT payload.**\nJWTs are signed but NOT encrypted by default. The payload is base64-encoded — readable by anyone with the token. Putting passwords, PII, or sensitive flags in the payload leaks them.\n*Fix:* put identifiers and roles only. Look up sensitive data server-side when needed.\n\n**5. Storing in localStorage.**\nSee earlier answer — XSS exfiltration. Use HttpOnly cookies for browsers.\n\n**6. No revocation strategy.**\nJWTs are stateless — you can't revoke a token once issued; you can only wait for it to expire. If a user logs out or their token leaks, they're still valid until expiry.\n*Fix:* very short access tokens (so revocation window is small), OR add a revocation check via a Redis blacklist for high-security contexts.\n\n**7. JWT 'kid' header used insecurely.**\nThe `kid` (key ID) header tells the verifier which key to use. If the verifier looks up the key by `kid` from an untrusted source, an attacker can substitute their own key. SQL injection via `kid` has been a real vulnerability.\n*Fix:* `kid` must map to a pre-registered set of keys; don't dynamically resolve from a database without sanitization.\n\n**8. Using JWTs as session tokens (when sessions would be better).**\nIf you need revocation, sliding session, server-side state — JWTs are the wrong tool. Use a session ID + Redis store.",
      tags: ["jwt"],
    },
    {
      id: "sec-7",
      difficulty: "principal",
      question:
        "Design end-to-end security for an open banking API your team is building.",
      answer:
        "**Layered approach. Every layer is independent — defence in depth.**\n\n**Layer 1 — Network.**\n- All traffic over TLS 1.2+; prefer TLS 1.3.\n- mTLS between consumer banks and your gateway. Each consumer presents a client certificate issued by a trusted CA.\n- Azure Front Door or equivalent at edge for DDoS mitigation, WAF rules (OWASP Core Rule Set).\n- Private endpoints for internal traffic; no service exposed to public internet that doesn't need to be.\n\n**Layer 2 — Authentication.**\n- OAuth2 + OIDC for end-user consent (Open Banking standard — PSD2 in EU, similar elsewhere).\n- FAPI (Financial-grade API) profile of OAuth2 — adds requested-acr, request object signing, etc.\n- Consumer authentication: mTLS + signed client assertions (JWT-bearer).\n- HSM-backed signing keys at the issuer.\n\n**Layer 3 — Authorization.**\n- Scopes per consent (read accounts, initiate payments).\n- Per-resource authorization on every endpoint (the user consented to account X — your API must check that THIS call relates to account X).\n- Short-lived access tokens (5 min); refresh tokens rotated on use.\n\n**Layer 4 — Request integrity.**\n- Detached JWS signature on every request (FAPI requirement). Body cannot be tampered without invalidating signature.\n- Idempotency keys on every payment endpoint.\n- Nonces for replay protection.\n\n**Layer 5 — Data protection.**\n- TLS in transit. At rest: TDE on databases, encryption on blob storage.\n- Field-level encryption for PII (account number, name) using HSM-managed keys.\n- Tokenisation of card data — never store the full PAN.\n\n**Layer 6 — Audit & monitoring.**\n- Every authenticated action logged with: user, consumer, IP, timestamp, request hash, response code.\n- Logs immutable, retention 7 years (banking regulation).\n- Anomaly detection: unusual transaction patterns, off-hours admin access.\n- Real-time alerting on critical events (admin role changes, large transfers, repeated 401s).\n\n**Layer 7 — Operational security.**\n- Secrets in HSM-backed Key Vault. No plaintext secrets anywhere.\n- Privileged access reviewed quarterly. Just-In-Time elevation for prod access.\n- Secure SDLC: SAST in CI, dependency scanning, container scanning, penetration testing.\n- Incident response playbook. Tabletop exercises twice a year.\n\n**Compliance:** PCI-DSS (cards), POPIA (SA personal data), GDPR (if EU customers), SOC 2 Type II, ISO 27001. None of this is optional in banking.\n\n**Threat model updated quarterly.** Not a one-time activity.",
      tags: ["security", "banking", "architecture"],
    },
  ],
  codeDrills: [
    {
      id: "sec-code-1",
      title: "Secure JWT validation",
      brief:
        "Configure ASP.NET Core JWT bearer authentication with all the security knobs set correctly. Defence against algorithm confusion, missing expiry, unsigned tokens.",
      language: "csharp",
      starter: `// builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
//     .AddJwtBearer(...);`,
      solution: `// Program.cs — properly hardened JWT bearer setup
builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = builder.Configuration["Auth:Authority"];   // e.g. https://login.microsoftonline.com/{tenantId}
        options.Audience  = builder.Configuration["Auth:Audience"];
        options.RequireHttpsMetadata = true;                            // never disable in prod
        options.SaveToken = false;                                      // don't persist token in AuthenticationProperties

        options.TokenValidationParameters = new TokenValidationParameters
        {
            // === Signature ===
            ValidateIssuerSigningKey = true,
            // Pin to expected algorithm(s) — defends against alg=none and HS/RS confusion
            ValidAlgorithms = new[] { SecurityAlgorithms.RsaSha256 },

            // === Issuer ===
            ValidateIssuer = true,
            ValidIssuer = builder.Configuration["Auth:Issuer"],

            // === Audience ===
            ValidateAudience = true,
            ValidAudience = builder.Configuration["Auth:Audience"],

            // === Lifetime ===
            ValidateLifetime = true,
            RequireExpirationTime = true,
            ClockSkew = TimeSpan.FromSeconds(30),    // tighten default 5min skew

            // === Tokens MUST be signed ===
            RequireSignedTokens = true,

            // Map claim names exactly; don't let library invent mappings
            NameClaimType = "sub",
            RoleClaimType = "roles",
        };

        options.Events = new JwtBearerEvents
        {
            OnAuthenticationFailed = context =>
            {
                var logger = context.HttpContext.RequestServices
                    .GetRequiredService<ILogger<Program>>();
                logger.LogWarning("JWT auth failed: {Message}", context.Exception.Message);
                return Task.CompletedTask;
            },
            OnChallenge = context =>
            {
                // Don't leak why auth failed externally
                context.Response.Headers.Remove("WWW-Authenticate");
                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization(options =>
{
    // Default-deny: every endpoint requires auth unless explicitly anonymous
    options.FallbackPolicy = new AuthorizationPolicyBuilder()
        .RequireAuthenticatedUser()
        .Build();
});

// ... later in pipeline ...
app.UseAuthentication();
app.UseAuthorization();`,
      hints: [
        "`ValidAlgorithms` is the single most important line — without it, `alg=none` attacks are possible.",
        "`RequireSignedTokens = true` — explicit, even though it's the default. Belt and braces.",
        "Tight `ClockSkew` (30s, not 5min default) — limits replay window.",
        "`FallbackPolicy` makes anonymous access opt-in via `[AllowAnonymous]`. Default-deny is the safer pattern.",
        "`OnChallenge` strips `WWW-Authenticate` — prevents leaking auth scheme details to attackers.",
      ],
      takeaway:
        "Default JwtBearer config is permissive enough for dev and dangerous for prod. The explicit pinning of algorithms, issuer, audience, and lifetime is what makes it production-grade. Default-deny authorization is the discipline that catches accidentally-anonymous endpoints.",
    },
    {
      id: "sec-code-2",
      title: "Resource-level authorization (defeating BOLA)",
      brief:
        "Write a `Get` endpoint that returns an Order by ID. Implement BOLA protection — the current user must own the order, OR have an admin role.",
      language: "csharp",
      starter: `[HttpGet("{id:guid}")]
public async Task<IActionResult> Get(Guid id)
{
    var order = await _db.Orders.FindAsync(id);
    if (order is null) return NotFound();
    return Ok(order);   // BOLA — anyone can read anyone's order
}`,
      solution: `// Option A — at the query level (preferred — simplest, hardest to forget)
[HttpGet("{id:guid}")]
[Authorize]
public async Task<IActionResult> Get(Guid id, CancellationToken ct)
{
    var userId = User.GetUserId();
    var isAdmin = User.IsInRole("Admin");

    var query = _db.Orders.Where(o => o.Id == id);
    if (!isAdmin) query = query.Where(o => o.CustomerId == userId);

    var order = await query.Select(o => new OrderDto(
        o.Id, o.CustomerId, o.Status, o.Total, o.CreatedAt))
        .FirstOrDefaultAsync(ct);

    return order is null ? NotFound() : Ok(order);
}

// Option B — at the handler level via policy (when authorization is complex)
[HttpGet("{id:guid}")]
[Authorize(Policy = "CanReadOrder")]
public async Task<IActionResult> Get(Guid id, CancellationToken ct)
{
    var order = await _db.Orders.FindAsync(new object?[] { id }, ct);
    if (order is null) return NotFound();
    return Ok(MapToDto(order));
}

// Policy registration
services.AddAuthorization(o =>
{
    o.AddPolicy("CanReadOrder", policy =>
        policy.Requirements.Add(new OwnerOrAdminRequirement()));
});
services.AddScoped<IAuthorizationHandler, OwnerOrAdminHandler>();

// Requirement + Handler
public record OwnerOrAdminRequirement : IAuthorizationRequirement;

public class OwnerOrAdminHandler : AuthorizationHandler<OwnerOrAdminRequirement>
{
    private readonly IHttpContextAccessor _http;
    private readonly AppDbContext _db;

    public OwnerOrAdminHandler(IHttpContextAccessor http, AppDbContext db)
    {
        _http = http;
        _db = db;
    }

    protected override async Task HandleRequirementAsync(
        AuthorizationHandlerContext context, OwnerOrAdminRequirement requirement)
    {
        if (context.User.IsInRole("Admin"))
        {
            context.Succeed(requirement);
            return;
        }

        if (!Guid.TryParse(_http.HttpContext?.Request.RouteValues["id"]?.ToString(), out var id))
            return;  // route param missing — fail

        var userId = context.User.GetUserId();
        var isOwner = await _db.Orders.AnyAsync(
            o => o.Id == id && o.CustomerId == userId);

        if (isOwner) context.Succeed(requirement);
        // else: fail by not calling Succeed → 403 returned to caller
    }
}

public static class ClaimsPrincipalExtensions
{
    public static Guid GetUserId(this ClaimsPrincipal principal) =>
        Guid.Parse(principal.FindFirst("sub")?.Value ?? throw new InvalidOperationException());
}

// Notice — Option A returns 404 for unauthorized (doesn't leak existence).
// Option B returns 403 (more transparent but reveals the resource exists).
// Choose based on threat model. For sensitive resources, 404 is safer.`,
      hints: [
        "Put authorization in the QUERY when possible — `WHERE CustomerId = currentUserId`. Hardest to bypass.",
        "Authorization policies are right when logic is complex or shared across endpoints.",
        "Return `NotFound` (404) for unauthorized access on sensitive resources — prevents existence disclosure.",
        "Admins bypass — but admin role should itself require strong auth (MFA, IP restrictions).",
        "Architecture test: every controller method has either `[Authorize]` or `[AllowAnonymous]`. Default-deny in middleware is the safety net.",
      ],
      takeaway:
        "BOLA is the #1 API vulnerability. The fix is mechanical: every resource access carries the current user's identity, and the query filters by it. Don't trust the URL ID alone — the URL is attacker-controlled.",
    },
  ],
};

// ============================================================================
// TRACK 5 — AZURE & DEPLOYMENT
// ============================================================================

const AZURE: MasteryTrack = {
  id: "azure-deploy",
  title: "Azure & Deployment",
  description:
    "Choosing the right compute (App Service, Container Apps, AKS, Functions). IaC with Bicep. Zero-downtime deploys. Observability stack. Managed Identity + Key Vault. The decisions you'll defend in an architecture review.",
  color: "#bf7fff",
  definitions: [
    {
      term: "Azure App Service",
      definition:
        "PaaS for web apps and APIs. You bring code (or a Docker image), Azure manages the host. Easy autoscale, deployment slots, custom domains, managed identity. Sweet spot for standard ASP.NET apps.",
    },
    {
      term: "Azure Container Apps",
      definition:
        "Managed Kubernetes-lite — containers without the K8s operational burden. Built on K8s + Dapr + KEDA. Good for microservices, event-driven workloads, scale-to-zero.",
    },
    {
      term: "Azure Kubernetes Service (AKS)",
      definition:
        "Managed Kubernetes. You get the full K8s API and operational complexity. Choose when you need K8s-specific features (custom operators, service mesh, multi-tenant clusters).",
    },
    {
      term: "Azure Functions",
      definition:
        "Serverless compute. Event-triggered (HTTP, queue, timer, blob). Consumption plan = pay-per-execution; Premium = warm instances and VNet integration.",
    },
    {
      term: "Managed Identity",
      definition:
        "Azure assigns an identity to your compute resource. Your code authenticates to Key Vault, Storage, etc. WITHOUT credentials. Two flavours: system-assigned (tied to resource lifecycle) and user-assigned (shared across resources).",
    },
    {
      term: "Azure Key Vault",
      definition:
        "Managed secrets, keys, certificates. Backed by HSMs (Premium tier). Access via Managed Identity, no shared secrets.",
    },
    {
      term: "Application Insights",
      definition:
        "Azure's APM. Auto-instrumentation for .NET. Distributed tracing, metrics, logs, exceptions. Built on Log Analytics under the hood.",
    },
    {
      term: "Bicep",
      definition:
        "Microsoft's IaC DSL for Azure. Transpiles to ARM JSON. Simpler syntax, modules, type checking. Drop-in alternative to Terraform if you're Azure-only.",
    },
    {
      term: "Deployment slots",
      definition:
        "App Service feature: a 'staging' slot is a parallel deployment. You deploy to staging, run smoke tests, then swap. Swap is instant (DNS-level), enables zero-downtime deploys.",
    },
    {
      term: "Blue-green deployment",
      definition:
        "Two production environments. New version goes to 'green'; traffic switches over at the load balancer once green is verified. Easy rollback by switching back to 'blue'.",
    },
    {
      term: "Canary deployment",
      definition:
        "Roll out a new version to a small % of traffic first (5%, 25%, 100%). Monitor metrics; if anything regresses, rollback. Reduces blast radius of bad deploys.",
    },
  ],
  drills: [
    {
      id: "az-1",
      difficulty: "senior",
      question:
        "App Service vs Container Apps vs AKS — when do you reach for each?",
      answer:
        "**App Service** — my default for standard ASP.NET Core APIs and web apps. Reasons:\n- Deployment slots out of the box (zero-downtime, easy rollback).\n- Managed Identity, Key Vault integration trivial.\n- Autoscale, custom domains, TLS all managed.\n- Linux or Windows hosts, can also run Docker.\n- *Limits:* less control over networking, no easy multi-tenant isolation, fewer knobs than K8s.\n\n**Container Apps** — when:\n- You have multiple microservices that need scale-to-zero and event-driven scaling.\n- You want K8s-style features (pod-style isolation, service mesh) but don't want to run K8s.\n- You're using Dapr — it's first-class.\n- You need KEDA-style autoscale based on queue depth, Kafka lag, etc.\n- *Limits:* younger product, fewer enterprise features than App Service, no deployment slots concept yet.\n\n**AKS** — when:\n- You need raw Kubernetes — custom operators, service mesh (Istio/Linkerd), specific scheduling.\n- You're running stateful workloads with custom storage classes.\n- You have ops capacity to maintain a cluster (node pools, upgrades, networking).\n- You have many services or massive scale where Container Apps doesn't fit.\n- *Limits:* operational burden is real. If you don't have a platform team, this is a strain.\n\n**Functions** — for event-triggered work, background jobs, glue:\n- Process a queue message, trigger a timer job, handle a webhook.\n- Stateless, short-lived.\n- *Limits:* don't try to host a full API in Functions unless it's truly serverless-shaped.\n\n**My banking-grade default stack:**\n- Customer-facing API → App Service (Premium tier, slots, autoscale).\n- Background processing → Functions or Container Apps depending on workload shape.\n- Heavy stateful or specialised workloads → AKS, but only if you can staff it.\n\n**The mistake I see often:** teams jump to AKS for 'flexibility' and end up with 8 nights of debugging YAML for something App Service would have handled in 30 minutes.",
      tags: ["azure", "compute"],
    },
    {
      id: "az-2",
      difficulty: "senior",
      question:
        "How do you do zero-downtime deploys on App Service?",
      answer:
        "**Deployment slots** are the App Service primitive for this.\n\n**Setup:**\n1. Create a 'staging' slot on the App Service (Standard tier or above).\n2. Configure slot-specific settings — anything that differs (connection strings to staging DB, feature flags). Mark them 'Slot Setting' so they don't follow the swap.\n3. Deploy to staging slot from CI/CD.\n\n**Deploy workflow:**\n1. Build artifact in CI.\n2. Deploy to staging slot.\n3. Warm up — hit a few key endpoints to load the app, JIT, prime caches. App Service has 'auto-warm-up' configuration.\n4. Run smoke tests against staging URL.\n5. **Swap** staging → production. The swap is at the routing layer — instant, no dropped requests.\n6. Verify production. If something's wrong → **swap back** instantly (the old version is now in staging).\n\n**Why this works for zero downtime:**\n- Both slots are running simultaneously during the swap.\n- Live requests in flight are completed on whichever slot they started on.\n- New requests go to the newly-swapped slot.\n- Database migrations need to be backward-compatible (old AND new versions running together briefly).\n\n**Limitations:**\n- Settings marked 'Slot Setting' don't swap. Everything else does. Get this wrong and you might swap a production secret to staging.\n- Some resources don't auto-warm; you may need to script warmup requests.\n- For SignalR or stateful WebSocket connections, swaps drop the connection (clients should reconnect).\n\n**Container Apps equivalent:** revisions. Each deploy is a new revision; traffic split between revisions; can roll back by shifting traffic.\n\n**AKS:** rolling deployment is the default; old pods drained as new ones come up.\n\n**Banking discipline:** never deploy on Friday afternoon. Have a rollback runbook tested. Synthetic transactions on a schedule so you SEE problems within seconds, not when a customer calls support.",
      tags: ["deployment", "app-service"],
    },
    {
      id: "az-3",
      difficulty: "lead",
      question:
        "Walk me through the observability stack for a .NET API on Azure.",
      answer:
        "Three pillars: **logs, metrics, traces.** Plus alerts on top.\n\n**Logging — Serilog + Application Insights.**\n```csharp\nbuilder.Host.UseSerilog((ctx, services, cfg) => cfg\n    .ReadFrom.Configuration(ctx.Configuration)\n    .Enrich.FromLogContext()\n    .Enrich.WithProperty(\"Application\", \"PaymentGateway\")\n    .Enrich.WithProperty(\"Environment\", ctx.HostingEnvironment.EnvironmentName)\n    .WriteTo.Console()\n    .WriteTo.ApplicationInsights(services.GetRequiredService<TelemetryConfiguration>(),\n        TelemetryConverter.Traces));\n```\nStructured logs. JSON. Correlation IDs propagated via `IHttpContextAccessor` or OpenTelemetry context.\n\n**Metrics — OpenTelemetry + App Insights.**\n- Built-in: request rate, latency, error rate (the RED method).\n- Custom: payment success rate, queue depth, business KPIs.\n- `MeterProvider` and `Meter` from `System.Diagnostics.Metrics`.\n\n**Traces — OpenTelemetry distributed tracing.**\n- Every HTTP request gets a `TraceId` and `SpanId`.\n- Propagated through outgoing calls (HttpClient, message bus, DB).\n- Visible in Application Insights' end-to-end transaction view.\n- Lets you see: request enters API → calls Service B → which calls DB → with timings.\n\n**OpenTelemetry config (the modern way, vendor-neutral):**\n```csharp\nbuilder.Services.AddOpenTelemetry()\n    .ConfigureResource(r => r.AddService(\"PaymentGateway\"))\n    .WithTracing(t => t\n        .AddAspNetCoreInstrumentation()\n        .AddHttpClientInstrumentation()\n        .AddEntityFrameworkCoreInstrumentation()\n        .AddAzureMonitorTraceExporter())\n    .WithMetrics(m => m\n        .AddAspNetCoreInstrumentation()\n        .AddHttpClientInstrumentation()\n        .AddAzureMonitorMetricExporter());\n```\n\n**Alerting strategy:**\n- **Symptom-based, not cause-based.** Alert on 'p99 latency > 500ms for 5 min' and 'error rate > 1% for 2 min', not on 'CPU > 80%'. Symptoms are what users feel.\n- **Tiered severity.** Page-the-on-call for customer-impacting; ticket-the-team for non-critical degradation.\n- **Alert fatigue is real.** If you're getting more than ~3 pages a week, alert thresholds are wrong.\n\n**Dashboards:**\n- One overview per service: RED metrics + business KPIs.\n- Incident dashboards per known issue type — pre-built so on-call doesn't have to construct them at 2am.\n- SLO dashboards — error budget remaining, burn rate.\n\n**What I never skip:**\n- Correlation ID in every log line.\n- Structured logs (JSON), never plaintext.\n- TraceId in the response header so support can grep logs by it.\n- Application Map view in App Insights — visualises service dependencies.",
      tags: ["observability", "opentelemetry"],
    },
    {
      id: "az-4",
      difficulty: "lead",
      question:
        "Bicep — what's your project structure, and what are your best practices?",
      answer:
        "**Structure I use:**\n```\ninfra/\n  main.bicep                # entry — composes modules\n  parameters/\n    dev.bicepparam\n    staging.bicepparam\n    prod.bicepparam\n  modules/\n    appservice.bicep        # reusable building blocks\n    keyvault.bicep\n    sqldatabase.bicep\n    storage.bicep\n    monitor.bicep\n```\n\n**`main.bicep`** is thin — it composes modules and passes parameters. Each module is independently reasonable, takes ~5 parameters, outputs the relevant IDs.\n\n**Best practices:**\n\n1. **Naming conventions baked into Bicep.** Resource names are hard to change. Use a function: `${prefix}-${env}-${resourceType}-${suffix}`. Consistency = future-you thanks you.\n\n2. **Parameters separated from definitions.** `.bicepparam` files per environment. Same Bicep, different parameter file per env.\n\n3. **Modules with explicit outputs.** Don't reach into a module to extract a value — declare it as an output. Force the contract.\n\n4. **Tags everywhere.** `env`, `cost-center`, `owner`, `app`. Used for cost allocation, automated cleanup, compliance.\n\n5. **No magic values.** Hard-coded SKUs, regions, secrets — all parameters. Hard-coded values bite when you spin up a new env.\n\n6. **Use Managed Identity, not service principals.** `identity: { type: 'SystemAssigned' }` on the App Service; grant RBAC role on Key Vault by principal ID output.\n\n7. **Output what you need.** Resource IDs, primary keys (NOT secrets — secrets should be `@secure()` and referenced, not output), connection strings.\n\n8. **Test in a sacrificial subscription.** Don't `az deployment sub create` against prod until you've run the same thing against a sandbox first.\n\n9. **CI/CD validates with `az deployment ... what-if` before deploying.** Shows the diff. Cheap insurance.\n\n10. **Pin module versions in CI.** Don't pull latest Bicep — pin to a known version so deploys are reproducible.\n\n**Anti-patterns I've seen:**\n- 2000-line main.bicep with no modules.\n- Secrets hard-coded in Bicep.\n- No parameter validation (`@minValue`, `@allowed`, `@minLength`).\n- Deploys directly from a developer laptop using `az login`. Use service principals or OIDC federation from GitHub Actions.\n\n**Bicep vs Terraform:** Terraform is more portable (multi-cloud, larger ecosystem). Bicep is more native to Azure (newer features land in Bicep first, Microsoft's tools support it natively). If you're Azure-only, Bicep is fine. If you're multi-cloud, Terraform.",
      tags: ["bicep", "iac"],
    },
    {
      id: "az-5",
      difficulty: "lead",
      question:
        "Design a CI/CD pipeline for an ASP.NET Core API to Azure App Service with quality gates.",
      answer:
        "**Pipeline stages — in order:**\n\n**Stage 1: Build** (~3 min)\n- Restore, build (Release), pack.\n- Run linter (Roslyn analyzers, StyleCop, custom rules).\n- Cache nuget restore.\n- Output: build artifact.\n\n**Stage 2: Unit Tests** (~2 min)\n- Run unit tests with coverage.\n- Fail if coverage < threshold (75% for new code; existing can be looser).\n- Fail on flaky test (zero-tolerance for flakes — they erode trust).\n- Output: test results + coverage report.\n\n**Stage 3: Integration Tests** (~5 min)\n- Spin up Postgres + Redis in Testcontainers.\n- Run integration tests against real dependencies.\n- These catch DB schema issues, SQL bugs, EF mapping errors.\n- Output: integration test results.\n\n**Stage 4: Static Analysis** (~3 min)\n- SonarCloud (or SonarQube self-hosted) for code quality, duplications, smells.\n- Dependency scan (Snyk / GitHub Dependabot / OWASP Dependency-Check).\n- Container scan if Docker (Trivy, Grype).\n- Secret scan (GitGuardian, gitleaks) — fail on any secret found.\n\n**Stage 5: Architecture Tests** (~1 min)\n- NetArchTest rules: domain doesn't reference EF, controllers don't reference repositories, etc.\n- Catches drift from architectural rules.\n\n**Stage 6: Build container image** (~2 min)\n- Multi-stage Dockerfile (build image separate from runtime).\n- Sign image (cosign or Notation).\n- Push to Azure Container Registry.\n\n**Stage 7: Deploy to Staging slot** (~3 min)\n- Bicep `what-if` to show diff.\n- Apply Bicep (incrementally — only resources that changed).\n- Deploy container image to staging slot of App Service.\n- App Service warmup phase.\n\n**Stage 8: Smoke tests against Staging** (~2 min)\n- Hit health endpoint.\n- Hit 3-5 critical endpoints with known inputs/outputs.\n- Run a synthetic transaction (e.g. create a test payment, then refund it).\n- Fail pipeline if any fail.\n\n**Stage 9: Manual approval** (production only)\n- Required reviewer (engineering manager or rotating on-call).\n- Auto-approve in lower environments.\n- For prod: must include link to change ticket, expected impact, rollback plan.\n\n**Stage 10: Swap slots → Production** (~30 sec)\n- App Service slot swap.\n- Smoke tests against production.\n- Tag the release in Git.\n\n**Stage 11: Post-deploy monitoring** (~10 min)\n- Watch error rate, latency, alert dashboard.\n- Automatic rollback if error rate exceeds threshold (swap slots back).\n- Notify Slack/Teams when complete.\n\n**Quality gates that block:**\n- Test failures.\n- Coverage drop below threshold.\n- New SAST high/critical findings.\n- High/critical CVEs in dependencies.\n- Architecture test failures.\n- Secret found in code.\n- Failed smoke test.\n\n**Branch strategy:**\n- `main` is always deployable; protected.\n- Feature branches → PR → CI runs (build + tests + scans).\n- Merge to main triggers full deploy pipeline.\n- Hotfix branches from main; same gates, expedited approval.\n\n**Total time main → prod:** ~25 min including approval. Tighten to ~12 min for pre-prod environments.\n\n**Banking reality:** prod deploys often have a change advisory board (CAB) approval window. Pipeline halts at 'pending approval' until approved.",
      tags: ["cicd", "github-actions"],
    },
  ],
  codeDrills: [
    {
      id: "az-code-1",
      title: "Bicep module — App Service with Managed Identity + Key Vault",
      brief:
        "Bicep that provisions an App Service plan + App Service with system-assigned managed identity, and grants it read access to a Key Vault.",
      language: "yaml",
      starter: `// param appServiceName string
// param location string = resourceGroup().location
// param keyVaultName string
// // TODO`,
      solution: `// modules/appservice.bicep
@minLength(3)
@maxLength(60)
param appServiceName string
param location string = resourceGroup().location
param skuName string = 'P1v3'
param keyVaultName string
param appSettings object = {}

@allowed(['Development', 'Staging', 'Production'])
param environment string

var plan_name = '\${appServiceName}-plan'

resource plan 'Microsoft.Web/serverfarms@2023-12-01' = {
  name: plan_name
  location: location
  sku: {
    name: skuName
    tier: 'PremiumV3'
  }
  properties: {
    reserved: true   // Linux
  }
  kind: 'linux'
  tags: {
    env: environment
    app: appServiceName
  }
}

resource app 'Microsoft.Web/sites@2023-12-01' = {
  name: appServiceName
  location: location
  identity: {
    type: 'SystemAssigned'   // <-- Managed Identity
  }
  properties: {
    serverFarmId: plan.id
    httpsOnly: true
    siteConfig: {
      linuxFxVersion: 'DOTNETCORE|8.0'
      alwaysOn: true
      ftpsState: 'Disabled'
      minTlsVersion: '1.2'
      http20Enabled: true
      healthCheckPath: '/health'
      appSettings: [for (item, i) in items(appSettings): {
        name: item.key
        value: item.value
      }]
    }
  }
  tags: {
    env: environment
    app: appServiceName
  }
}

// Reference the existing Key Vault and grant the app's identity read access
resource kv 'Microsoft.KeyVault/vaults@2023-07-01' existing = {
  name: keyVaultName
}

// RBAC role 'Key Vault Secrets User' lets the identity read secrets only
var keyVaultSecretsUserRoleId = '4633458b-17de-408a-b874-0445c86b69e6'

resource kvRoleAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  scope: kv
  name: guid(kv.id, app.id, keyVaultSecretsUserRoleId)
  properties: {
    principalId: app.identity.principalId
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', keyVaultSecretsUserRoleId)
    principalType: 'ServicePrincipal'
  }
}

output appServiceName string = app.name
output appServiceUrl string = 'https://\${app.properties.defaultHostName}'
output appIdentityPrincipalId string = app.identity.principalId

// USAGE in main.bicep:
//
// module appservice './modules/appservice.bicep' = {
//   name: 'app-deploy'
//   params: {
//     appServiceName: 'payment-api-\${env}'
//     keyVaultName: kv.outputs.kvName
//     environment: env
//     appSettings: {
//       'ASPNETCORE_ENVIRONMENT': env
//       'KeyVaultUri': kv.outputs.kvUri
//     }
//   }
// }`,
      hints: [
        "Use `identity: { type: 'SystemAssigned' }` — Azure manages the credential lifecycle.",
        "Grant the LEAST role needed — 'Secrets User' for read, 'Secrets Officer' for write.",
        "The role assignment scope is the Key Vault (not the subscription) — limits blast radius.",
        "`existing` keyword references a resource that's already deployed — no recreate.",
        "Use `guid()` for role assignment names — deterministic, idempotent across redeploys.",
        "Don't put secrets in `appSettings` — put a Key Vault reference instead: `@Microsoft.KeyVault(SecretUri=...)`.",
      ],
      takeaway:
        "Managed Identity is the right way to do service-to-Azure auth — no rotating credentials, no secrets in config. Bicep makes the wiring declarative: one identity declaration, one role assignment, fully reproducible across environments.",
    },
    {
      id: "az-code-2",
      title: "GitHub Actions — deploy to App Service via OIDC",
      brief:
        "GitHub Actions workflow that builds an ASP.NET Core app and deploys to App Service. Uses OIDC federation — NO long-lived secrets in GitHub.",
      language: "yaml",
      starter: `# name: Deploy
# on:
#   push:
#     branches: [main]
# # TODO`,
      solution: `name: Deploy

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  id-token: write     # required for OIDC token issuance
  contents: read

env:
  DOTNET_VERSION: '8.0.x'
  APP_NAME: 'payment-api-prod'
  STAGING_SLOT: 'staging'
  RESOURCE_GROUP: 'rg-payment-prod'

jobs:
  build:
    runs-on: ubuntu-latest
    outputs:
      artifact: \${{ steps.upload.outputs.artifact-id }}

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-dotnet@v4
        with:
          dotnet-version: \${{ env.DOTNET_VERSION }}

      - name: Restore
        run: dotnet restore

      - name: Build
        run: dotnet build --configuration Release --no-restore

      - name: Test (unit + integration)
        run: dotnet test --configuration Release --no-build --collect:"XPlat Code Coverage"

      - name: Publish
        run: dotnet publish src/Api/Api.csproj -c Release -o ./publish --no-build

      - id: upload
        uses: actions/upload-artifact@v4
        with:
          name: api
          path: ./publish

  deploy-staging:
    needs: build
    runs-on: ubuntu-latest
    environment: production    # GitHub Environments — gives manual approval option
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: api
          path: ./publish

      - name: Azure login (OIDC, no secrets!)
        uses: azure/login@v2
        with:
          client-id: \${{ secrets.AZURE_CLIENT_ID }}
          tenant-id: \${{ secrets.AZURE_TENANT_ID }}
          subscription-id: \${{ secrets.AZURE_SUBSCRIPTION_ID }}

      - name: Deploy to staging slot
        uses: azure/webapps-deploy@v3
        with:
          app-name: \${{ env.APP_NAME }}
          slot-name: \${{ env.STAGING_SLOT }}
          package: ./publish

      - name: Warm up staging
        run: |
          STAGING_URL="https://\${{ env.APP_NAME }}-\${{ env.STAGING_SLOT }}.azurewebsites.net"
          for i in {1..5}; do
            curl -fsS "$STAGING_URL/health" && break
            sleep 10
          done

      - name: Smoke tests
        run: |
          STAGING_URL="https://\${{ env.APP_NAME }}-\${{ env.STAGING_SLOT }}.azurewebsites.net"
          curl -fsS "$STAGING_URL/health"
          curl -fsS "$STAGING_URL/api/v1/version"

  swap:
    needs: deploy-staging
    runs-on: ubuntu-latest
    environment:
      name: production-swap   # second approval gate
    steps:
      - name: Azure login
        uses: azure/login@v2
        with:
          client-id: \${{ secrets.AZURE_CLIENT_ID }}
          tenant-id: \${{ secrets.AZURE_TENANT_ID }}
          subscription-id: \${{ secrets.AZURE_SUBSCRIPTION_ID }}

      - name: Swap staging → production
        run: |
          az webapp deployment slot swap \\
            --resource-group \${{ env.RESOURCE_GROUP }} \\
            --name \${{ env.APP_NAME }} \\
            --slot \${{ env.STAGING_SLOT }} \\
            --target-slot production

      - name: Verify production
        run: |
          PROD_URL="https://\${{ env.APP_NAME }}.azurewebsites.net"
          curl -fsS "$PROD_URL/health"

      - name: Notify
        if: success()
        run: echo "✅ Deployed \${{ github.sha }} to production"`,
      hints: [
        "OIDC federation = no long-lived secrets in GitHub. Configure a federated credential on the Azure AD app pointing at your GitHub repo + branch.",
        "`environment: production` enables required reviewers, secrets scoping, deployment history.",
        "Always deploy to staging slot FIRST — never directly to production.",
        "Warm-up hits before smoke tests — slot needs to JIT-compile and load caches.",
        "Smoke tests should hit at least one read endpoint AND one write endpoint (or read-only safe equivalent).",
        "The swap is atomic — both slots run during the swap, no requests dropped.",
        "For rollback: just swap again (the old version is now in the staging slot).",
      ],
      takeaway:
        "Modern Azure CI/CD uses OIDC — no service principal secrets stored in GitHub. The pipeline is: build → test → deploy to staging slot → warm up → smoke test → manual approval → swap → verify. Each step can fail independently and abort the deploy.",
    },
  ],
};

// ============================================================================
// TRACK 6 — CODE CHALLENGES (Pure C# brain teasers + senior-grade puzzles)
// ============================================================================

const CODE_CHALLENGES: MasteryTrack = {
  id: "code-challenges",
  title: "C# Code Challenges (Senior-grade)",
  description:
    "Pure code drills tuned to senior interviews. Concurrency, allocation discipline, performance, EF Core gotchas, LINQ depth. Each has a starter, solution, and explicit takeaway.",
  color: "#bf7fff",
  definitions: [
    {
      term: "Span<T>",
      definition:
        "A ref-struct that represents a contiguous region of memory without allocation. Lives on the stack. Use for high-perf string parsing, buffer manipulation. Cannot be captured in async methods (use Memory<T> instead).",
    },
    {
      term: "Memory<T>",
      definition:
        "Heap-allocated wrapper for memory regions. Slower than Span but works in async methods (can be stored on the heap across await points).",
    },
    {
      term: "ArrayPool<T>",
      definition:
        "Renting/returning arrays from a shared pool to avoid allocations. `ArrayPool<byte>.Shared.Rent(size)` / `Return(arr)`. Use in hot paths where buffers are otherwise allocated per call.",
    },
    {
      term: "ConfigureAwait(false)",
      definition:
        "On library code, prevents continuation from being scheduled back to the original synchronization context. Avoids deadlocks in legacy sync contexts and improves throughput. Default behaviour in ASP.NET Core (no sync context) so less critical there.",
    },
    {
      term: "ValueTask<T>",
      definition:
        "A struct alternative to Task<T> that avoids the heap allocation if the operation completes synchronously. Use for hot paths where async operations frequently return cached/synchronous results.",
    },
  ],
  drills: [
    {
      id: "cc-1",
      difficulty: "senior",
      question:
        "What's the difference between `Task`, `Task<T>`, and `ValueTask<T>`?",
      answer:
        "**`Task`** — represents an asynchronous operation that returns no value. Always allocated on the heap. Common.\n\n**`Task<T>`** — same as Task but returns a value of type T. Also heap-allocated.\n\n**`ValueTask<T>`** — a *struct* version of Task<T>. Doesn't allocate on the heap if the operation completes synchronously (cached values, immediate returns). Use when:\n- The method *often* returns synchronously (e.g. cache hit returns immediately; cache miss is async).\n- The hot path matters (called millions of times per second).\n\n**Restrictions on ValueTask:**\n- Don't await it multiple times (it's a struct, may be reused).\n- Don't store it without first calling `.AsTask()` or awaiting.\n- Don't pass it to `Task.WhenAll` directly — convert via `.AsTask()`.\n\n**Real-world example:**\n```csharp\npublic async ValueTask<User> GetUserAsync(int id)\n{\n    if (_cache.TryGetValue(id, out var cached))\n        return cached;     // synchronous return, no Task allocation\n    return await _db.Users.FindAsync(id);   // falls back to async\n}\n```\n\n**Default advice:** start with `Task<T>`. Switch to `ValueTask<T>` only if profiling shows allocation pressure. Premature use leads to bugs from the restrictions above.",
      tags: ["async", "performance"],
    },
    {
      id: "cc-2",
      difficulty: "senior",
      question:
        "When does `ConfigureAwait(false)` matter, and when does it not?",
      answer:
        "**It matters in:**\n- Library code that may be called from any context (UI apps, WinForms, WPF, old ASP.NET Framework).\n- Long-running async operations where you don't need to return to the original context.\n\n**It DOESN'T matter (much) in:**\n- ASP.NET Core. There's no synchronization context — every await already runs on a thread pool thread.\n- Console apps (no sync context).\n- Top-level application code where you DO need the original context.\n\n**Why it was crucial in the past:**\nIn classic ASP.NET (.NET Framework) and WinForms/WPF, awaiting a Task scheduled the continuation back to the original thread (UI thread, request thread). Doing `Task.Wait()` or `.Result` on the UI thread would deadlock — the continuation needed the UI thread which was blocked.\n\n**Senior nuance:**\n- For libraries you publish for broad use: yes, `ConfigureAwait(false)` everywhere. Bullet-proof against weird callers.\n- For your ASP.NET Core app code: optional. The compiler isn't optimizing it; the runtime cost is negligible; the readability cost of `.ConfigureAwait(false)` on every await is real.\n- Roslyn analyzer `CA2007` flags missing `ConfigureAwait` — turn it off in app projects, leave it on in library projects.\n\n**Don't do this:**\n```csharp\nvar result = SomeAsyncMethod().Result;   // DEADLOCK RISK in any sync context\nvar result = SomeAsyncMethod().GetAwaiter().GetResult();   // same risk\n```\nIf you must call async from sync (legacy interop), use `Task.Run(() => SomeAsyncMethod()).GetAwaiter().GetResult()` — offloads to thread pool, breaks deadlock chain. Best fix: make the calling method async too.",
      tags: ["async"],
    },
    {
      id: "cc-3",
      difficulty: "lead",
      question:
        "EF Core — explain change tracking. When is it your friend and when does it hurt?",
      answer:
        "**What it is:** EF Core's `DbContext` keeps a record of every entity it loaded, watching for property changes. When you call `SaveChanges`, it generates the UPDATE/INSERT/DELETE statements based on what changed.\n\n**Friend:**\n- You load `var customer = await _db.Customers.FindAsync(id);`, change a property, call `SaveChanges()`. EF figures out the UPDATE for you. Convenient.\n- Cascade saves: change related entities, EF persists them all in dependency order.\n- Concurrency tokens: EF adds them to UPDATE WHERE clauses automatically.\n\n**Enemy:**\n\n1. **Read-only queries with tracking on.** Every loaded entity adds to the change tracker, costs memory, costs CPU on `SaveChanges`. Fix: `.AsNoTracking()` on read-only queries. Default it for queries — opt in to tracking.\n\n2. **Long-lived DbContexts.** Web apps create a DbContext per request — small lifespan, small change tracker. Batch jobs that load 10,000 entities into one context hit memory walls. Fix: use multiple smaller contexts, or `.AsNoTracking()`, or `DetectChangesAfterSaveBatch`.\n\n3. **Detected changes overhead.** Before each `SaveChanges`, EF scans every tracked entity for changes — O(N) where N is tracked count. Massive contexts have non-trivial `SaveChanges` overhead even when little has changed.\n\n4. **'I changed nothing but SaveChanges did an UPDATE'.** A query that includes navigation properties with tracking can mark them all as modified if your code mutates them inadvertently. Watch the SQL log; if there are surprise UPDATEs, your tracker is the culprit.\n\n5. **Bulk updates / deletes.** Loading 1M rows to delete them is wasteful. EF Core 7+ has `ExecuteDeleteAsync` and `ExecuteUpdateAsync` — set-based SQL, no tracking.\n\n**My defaults:**\n```csharp\nbuilder.Services.AddDbContext<AppDbContext>(opts =>\n    opts.UseNpgsql(conn)\n        .UseQueryTrackingBehavior(QueryTrackingBehavior.NoTrackingWithIdentityResolution));\n```\nNo tracking by default. Add `.AsTracking()` explicitly when you need it. Most read paths don't.",
      tags: ["ef-core", "performance"],
    },
    {
      id: "cc-4",
      difficulty: "lead",
      question:
        "What's the difference between `IEnumerable<T>`, `IQueryable<T>`, and `IAsyncEnumerable<T>`?",
      answer:
        "**`IEnumerable<T>`** — represents a sequence that can be iterated synchronously. May be in-memory or backed by anything. LINQ operations are *deferred* — they don't execute until you iterate.\n\n**`IQueryable<T>`** — represents a *query* that hasn't executed yet. Backed by a *provider* (EF Core, LINQ-to-SQL). LINQ operations build an *expression tree* that the provider translates (e.g., to SQL). Only when you iterate does the SQL run.\n\n**Critical difference:**\n```csharp\nIEnumerable<Order> orders = db.Orders;                 // IQueryable wrapped\nvar bigOrders = orders.Where(o => o.Total > 1000);     // runs IN MEMORY — pulls ALL orders, filters in process\n\nIQueryable<Order> ordersQ = db.Orders;\nvar bigOrders = ordersQ.Where(o => o.Total > 1000);    // builds expression tree; SQL has WHERE clause\n```\nThe first version is a performance disaster — pulls every order in the table to memory. The second version sends `WHERE Total > 1000` to SQL.\n\n**Rule of thumb:** keep queries `IQueryable<T>` for as long as possible. Cast to `IEnumerable<T>` only when you've finished translating to SQL and you need to do additional in-memory work (or you've called `.ToListAsync()`).\n\n**`IAsyncEnumerable<T>`** — represents an asynchronous stream of items. You `await foreach` over it.\n\n```csharp\nasync IAsyncEnumerable<Order> StreamOrders()\n{\n    await foreach (var o in db.Orders.AsAsyncEnumerable())\n        yield return o;\n}\n```\n\n**When to use which:**\n- Building queries against a DB? `IQueryable<T>`.\n- Working with in-memory data? `IEnumerable<T>`.\n- Streaming large result sets to a consumer? `IAsyncEnumerable<T>` — lower memory than materializing a `List<T>`.\n- API endpoint returning many records? Consider `IAsyncEnumerable<T>` over `Task<IEnumerable<T>>` — streams JSON to client without buffering.\n\n**The trap I've seen:** returning `IEnumerable<T>` from a repository method that wraps `IQueryable<T>`. Callers do `.Where()` thinking it's pushed to SQL — but the cast already triggered enumeration. Type contracts matter for query semantics.",
      tags: ["linq", "ef-core"],
    },
  ],
  codeDrills: [
    {
      id: "cc-code-1",
      title: "Thread-safe LRU cache with TTL",
      brief:
        "Build a fixed-capacity LRU cache that also expires entries after a TTL. Thread-safe for concurrent reads and writes.",
      language: "csharp",
      starter: `public class LruCache<TKey, TValue> where TKey : notnull
{
    // public LruCache(int capacity, TimeSpan ttl) { }
    // public bool TryGet(TKey key, out TValue value) { ... }
    // public void Set(TKey key, TValue value) { ... }
}`,
      solution: `public class LruCache<TKey, TValue> where TKey : notnull
{
    private readonly int _capacity;
    private readonly TimeSpan _ttl;
    private readonly Dictionary<TKey, LinkedListNode<CacheEntry>> _map;
    private readonly LinkedList<CacheEntry> _list;
    private readonly object _lock = new();

    private record CacheEntry(TKey Key, TValue Value, long ExpiresAtTicks);

    public LruCache(int capacity, TimeSpan ttl)
    {
        if (capacity < 1) throw new ArgumentException("Capacity must be >= 1");
        _capacity = capacity;
        _ttl = ttl;
        _map = new Dictionary<TKey, LinkedListNode<CacheEntry>>(capacity);
        _list = new LinkedList<CacheEntry>();
    }

    public int Count
    {
        get { lock (_lock) return _map.Count; }
    }

    public bool TryGet(TKey key, out TValue value)
    {
        lock (_lock)
        {
            if (!_map.TryGetValue(key, out var node))
            {
                value = default!;
                return false;
            }

            if (Stopwatch.GetTimestamp() > node.Value.ExpiresAtTicks)
            {
                // expired
                _list.Remove(node);
                _map.Remove(key);
                value = default!;
                return false;
            }

            // promote to front (most-recently-used)
            _list.Remove(node);
            _list.AddFirst(node);
            value = node.Value.Value;
            return true;
        }
    }

    public void Set(TKey key, TValue value)
    {
        lock (_lock)
        {
            var expiresAt = Stopwatch.GetTimestamp() + (long)(_ttl.TotalSeconds * Stopwatch.Frequency);

            if (_map.TryGetValue(key, out var existing))
            {
                _list.Remove(existing);
                _map.Remove(key);
            }

            var entry = new CacheEntry(key, value, expiresAt);
            var node = _list.AddFirst(entry);
            _map[key] = node;

            if (_map.Count > _capacity)
            {
                var last = _list.Last!;
                _list.RemoveLast();
                _map.Remove(last.Value.Key);
            }
        }
    }

    public bool Remove(TKey key)
    {
        lock (_lock)
        {
            if (!_map.TryGetValue(key, out var node)) return false;
            _list.Remove(node);
            _map.Remove(key);
            return true;
        }
    }
}

// USAGE:
// var cache = new LruCache<string, Quote>(capacity: 1000, ttl: TimeSpan.FromMinutes(5));
// if (!cache.TryGet(symbol, out var quote))
// {
//     quote = await FetchQuote(symbol);
//     cache.Set(symbol, quote);
// }`,
      hints: [
        "Doubly-linked list + dictionary is the canonical LRU implementation. O(1) get/set.",
        "Stopwatch for expiry — monotonic clock; DateTime.UtcNow can go backwards.",
        "Lock on every access — small critical section. For very high concurrency, consider `ConcurrentDictionary` with a separate eviction loop, but it's more code.",
        "On expired access, evict and report miss — don't return stale values.",
        "Production library options: `Microsoft.Extensions.Caching.Memory.MemoryCache` (more features), `LazyCache` wrapper.",
      ],
      takeaway:
        "LRU with TTL is a five-method class. The two data structures (LinkedList for ordering, Dictionary for O(1) lookup) together give you O(1) operations. Locks make it thread-safe at the cost of contention — fine for caches that aren't hammered.",
    },
    {
      id: "cc-code-2",
      title: "Producer-consumer with bounded backpressure",
      brief:
        "Use `System.Threading.Channels` to build a producer-consumer pipeline with bounded capacity. Producer waits when channel is full (backpressure). Multiple consumers process items concurrently.",
      language: "csharp",
      starter: `// public class PaymentPipeline
// {
//     public PaymentPipeline(int capacity, int consumerCount) { }
//     public Task PublishAsync(Payment payment, CancellationToken ct) { }
//     public Task RunAsync(CancellationToken ct) { }
// }`,
      solution: `public class PaymentPipeline
{
    private readonly Channel<Payment> _channel;
    private readonly int _consumerCount;
    private readonly Func<Payment, CancellationToken, Task> _consumeAsync;
    private readonly ILogger _logger;

    public PaymentPipeline(
        int capacity,
        int consumerCount,
        Func<Payment, CancellationToken, Task> consumeAsync,
        ILogger logger)
    {
        if (capacity < 1) throw new ArgumentException();
        if (consumerCount < 1) throw new ArgumentException();

        _channel = Channel.CreateBounded<Payment>(new BoundedChannelOptions(capacity)
        {
            FullMode = BoundedChannelFullMode.Wait,     // producer waits — backpressure
            SingleReader = false,
            SingleWriter = false
        });
        _consumerCount = consumerCount;
        _consumeAsync = consumeAsync;
        _logger = logger;
    }

    /// <summary>Producer side. Blocks (asynchronously) if channel is full.</summary>
    public async Task PublishAsync(Payment payment, CancellationToken ct = default)
    {
        await _channel.Writer.WriteAsync(payment, ct);
    }

    /// <summary>Completes the channel — no more items will be accepted.</summary>
    public void Complete() => _channel.Writer.Complete();

    /// <summary>Starts N consumers. Returns when all consumers exit (channel completed or cancelled).</summary>
    public async Task RunAsync(CancellationToken ct = default)
    {
        var consumers = Enumerable.Range(0, _consumerCount)
            .Select(i => Task.Run(() => ConsumerLoop(i, ct), ct))
            .ToArray();

        await Task.WhenAll(consumers);
    }

    private async Task ConsumerLoop(int id, CancellationToken ct)
    {
        _logger.LogInformation("Consumer {Id} started", id);
        try
        {
            await foreach (var payment in _channel.Reader.ReadAllAsync(ct))
            {
                try
                {
                    await _consumeAsync(payment, ct);
                }
                catch (OperationCanceledException) when (ct.IsCancellationRequested)
                {
                    throw;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Consumer {Id} failed on payment {PaymentId}",
                        id, payment.Id);
                    // Decide policy: rethrow (kill consumer), swallow (DLQ separately), retry
                }
            }
        }
        finally
        {
            _logger.LogInformation("Consumer {Id} exited", id);
        }
    }
}

public record Payment(Guid Id, decimal Amount, string Currency);

// USAGE:
// var pipeline = new PaymentPipeline(
//     capacity: 1000,
//     consumerCount: 4,
//     consumeAsync: async (p, ct) => await _processor.ProcessAsync(p, ct),
//     logger: _logger);
//
// var consumerTask = pipeline.RunAsync(cts.Token);
//
// // Producer side
// foreach (var p in incomingPayments)
//     await pipeline.PublishAsync(p);
//
// pipeline.Complete();
// await consumerTask;`,
      hints: [
        "`Channel.CreateBounded` with `FullMode.Wait` is the standard backpressure pattern.",
        "Multiple consumers via `Task.Run` — they each iterate the same channel and pick items.",
        "`await foreach (var x in channel.Reader.ReadAllAsync(ct))` is the modern, cancellation-aware consumer pattern.",
        "Catch exceptions inside the consumer — don't let one bad message kill the consumer loop.",
        "`Complete()` tells the channel no more producers; existing items finish processing, then `ReadAllAsync` exits.",
        "For multi-process backpressure, this becomes a real message broker (RabbitMQ, Service Bus). Same concepts.",
      ],
      takeaway:
        "`System.Threading.Channels` is the modern in-process producer/consumer primitive. Bounded with `FullMode.Wait` gives you free backpressure. Multi-consumer is just multiple `await foreach` loops on the same reader.",
    },
  ],
};

// ============================================================================
// EXPORT
// ============================================================================

export const NTOKOZO_TRACKS: MasteryTrack[] = [
  SENIOR_VS_LEAD,
  ARCHITECTURE,
  RESILIENCE,
  SECURITY,
  AZURE,
  CODE_CHALLENGES,
  PAYMENTS_FINTECH_TRACK,
  MULTI_TENANT_TRACK,
  DOCKER_OPS_TRACK,
  SA_TECH_CONTEXT_TRACK,
  POSTGRESQL_DEEP_DIVE_TRACK,
  API_DESIGN_TRACK,
  PRODUCTION_INCIDENTS_TRACK,
  SYSTEM_DESIGN_TRACK,
];
