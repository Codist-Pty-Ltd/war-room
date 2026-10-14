# Lead Developer / Azure Application Architect — Seraphis IT & Data Solutions

**Interview:** Tuesday, **13 October 2026**, **11:20 AM** (team interview + **Xolani Khoza**, Managing Director)  
**Format:** Relatively **short** but **formal** — background, skills, fit (not a long live-coding session)  
**Company:** Seraphis IT and Data Solutions — application modernisation, cloud, data, enterprise delivery  

**Related prep:** [`top_5_interview_questions.md`](./top_5_interview_questions.md) · [`senior_backend_technical_lead_dotnet_interview_playbook.md`](./senior_backend_technical_lead_dotnet_interview_playbook.md)

---

## 1. Today — last 60 minutes before 11:20

| Time | Do |
|------|-----|
| **T-60** | Quiet room, charger, ethernet if possible, Teams/browser tested, camera at eye level |
| **T-45** | Read **§3** (60-second pitch) out loud **3 times** |
| **T-35** | Skim **§5** requirement match — know your 3 strongest bullets |
| **T-25** | Read **§7** top 8 Q&A — one sentence each in your own words |
| **T-15** | Pick **4 questions** from **§9** to ask Xolani |
| **T-5** | Water, professional dress, join **2 min early**, notepad open |
| **During** | Short answers; lead with **outcome**, then **how**; ask for clarification if needed |

---

## 2. Role in one sentence (what they are hiring)

> A **principal application engineer** who can **lead** modernisation of legacy **.NET + SQL Server + IIS** workloads onto **Azure**, own **architecture and delivery**, and **support production** across app, database, and hosting — not only write code.

Your positioning:

> **Lead Developer / Azure Application Architect** who has spent **12 years** in C#/.NET, **SQL Server at depth**, **enterprise integration**, and **Azure DevOps delivery**, currently on **mission-critical banking gateway** work — ready to own client modernisation end-to-end for Seraphis.

---

## 3. Your 60-second opening pitch (memorise)

> “I’m Ntokozo Banda, a senior .NET engineer based in Centurion with **over eleven years** building enterprise web applications and APIs — mainly **C#, ASP.NET Core, SQL Server**, and integration in **banking, automotive, and digital platforms**.
>
> Currently at **ABSA** through Amidel, I architect the **Core Banking Gateway** — ASP.NET Core services between payment channels and legacy core systems: **REST APIs, resilience, security, and Azure DevOps CI/CD**.
>
> Before that, at **IQbusiness**, I led backend delivery for clients like **Investec** and **Toyota Kinto** — modern .NET, SQL Server, JWT/OAuth, and high-traffic production support.
>
> I’m pursuing **AZ-900** and planning **AZ-204**, and I’m looking for a **lead/architect** role where I can drive **legacy-to-Azure modernisation**, strong **SQL and integration**, and **mentoring** — which matches what Seraphis describes. I’d like to hear how your team structures client engagements and what a typical modernisation project looks like here.”

---

## 4. Job requirements — your honest match

### Mandatory

| Requirement | Your position | What to say |
|-------------|---------------|-------------|
| **BSc / ND IT or equivalent** | BSc Computing **in progress** (UNISA); Web Design + Java certs; **11+ years** delivery | “Formal degree in progress; equivalent through sustained senior delivery and continuous cert path.” |
| **SQL Server cert (MCTS or equivalent)** | Strong **practical** SQL Server + T-SQL; **no MCTS on CV** | “I don’t hold MCTS today; I have **equivalent production competence**: schema design, stored procedures, indexing, backup awareness, performance troubleshooting — happy to certify formally if the role requires it.” |
| **5+ years** web + scripting + **SQL DBA-style** work | **12 years** dev; SQL throughout; reporting/BI at African Sales | Exceeds minimum; emphasise **cross-layer** troubleshooting. |

### Core capabilities — strong fit

| Capability | Evidence |
|------------|----------|
| C# / ASP.NET / **ASP.NET Core** / .NET 8 | ABSA gateway, IQbusiness, 2014+ |
| **.NET Framework** legacy context | Early ASP.NET MVC/EF; integration with older schemas/APIs |
| **SQL Server**, T-SQL, SPs, performance | CV + African Sales reporting; EF Core + raw SQL where needed |
| **REST / Web APIs**, integration | Gateway, Investec, Kinto, bureau-style integrations |
| **HTML/CSS/JS/TS**, Angular | Full-stack delivery; Angular years; React/War Room |
| **Git**, structured SDLC | Azure DevOps, GitHub, Agile, code review, mentoring |
| **Production troubleshooting** | Banking + high-traffic IQ systems; playbook incident method |

### Strongly preferred — lead with honesty + design depth

| Preferred | Your story |
|-----------|------------|
| **Azure** (App Service, Azure SQL, VM, Storage, Key Vault, Monitor, App Insights) | **Azure DevOps CI/CD** daily; architect for **App Service + Azure SQL + Key Vault + App Insights**; AZ-900 in progress |
| **Legacy modernisation / cloud migration** | ABSA **gateway/strangler**; IQ greenfield + legacy SQL/third parties |
| **Azure DB migration** | Frame as: assessment → compatibility → DMA-style planning → cutover/runbook (study if asked) |
| **Windows Server / IIS** | Support migration narrative: know IIS role in Framework apps; Kestrel + reverse proxy in modern stack |
| **CI/CD** | Azure DevOps **primary**; GitHub Actions on side projects |
| **Scalable architectures** | Microservices, Clean Architecture, CQRS, modular monolith |

### Advantageous

| Item | You |
|------|-----|
| AZ-204 / AZ-305 / AZ-104 | **Planned**; AZ-900 in progress — show learning plan |
| Bicep / ARM / Terraform | On CV as exposure; tie to repeatable client deployments |
| Enterprise CMS / workflow / DMS | If no direct CMS: “document/workflow **integration** via APIs”; procurement/recruitment = **integration + audit + SQL** |

---

## 5. Three stories to have ready (2 minutes each)

### Story A — Technical leadership (Lead Developer)

**IQbusiness:** Mentored juniors, code reviews, pair programming; translated business specs into **Clean Architecture** backends; owned delivery for **Investec onboarding** (identity/DHA integrations, security).

**Line:** “I don’t only implement — I **set patterns**, review for production risk, and unblock the team.”

### Story B — Azure application architecture (even if hybrid hosting today)

**ABSA gateway:** ASP.NET Core microservices, **standard REST surface**, secrets not in code, **pipelines**, observability mindset, idempotency for financial flows.

**Azure reference architecture you can whiteboard in 60 seconds:**

```text
Users / integrators
    → App Service (or AKS later) — ASP.NET Core API
    → Azure SQL / existing SQL (managed instance if needed)
    → Key Vault (secrets, certs)
    → Application Insights + Log Analytics
    → Azure DevOps CI/CD
Legacy core / IIS — strangler via YARP or integration layer until retired
```

### Story C — SQL + production firefight

Use **top_5** answer #3 and #5: p95 up → traces → **SQL CPU** → bad query/N+1/index → fix → verify metrics.

---

## 6. Short interview — likely question mix

Expect **breadth**, not a 2-hour deep dive:

| Bucket | % of time (guess) |
|--------|-------------------|
| CV walkthrough & motivation | 30% |
| Legacy + Azure modernisation | 25% |
| SQL Server & integration | 20% |
| Leadership & client delivery | 15% |
| Your questions | 10% |

---

## 7. Top 8 questions + tight answers

### Q1. Why Seraphis and this role?

> “Seraphis sits at **modernisation and data** — exactly where I want to lead: **legacy .NET and SQL** into **Azure-shaped** solutions. The title matches how I already work: **architecture, delivery, and production support**, not ticket-only development.”

### Q2. Describe a legacy-to-modern migration you led or contributed to.

Use **Story B** + strangler, anti-corruption layer, phased cutover. See [`top_5_interview_questions.md`](./top_5_interview_questions.md) §1.

### Q3. How have you used Azure (App Service, SQL, Key Vault, App Insights)?

Use **top_5** §2 — lead with **Azure DevOps**, then each PaaS service as **design and integration** pattern.

### Q4. SQL Server performance — your process?

Use **top_5** §5 — plan, index, SARGable, EF vs T-SQL, blocking.

### Q5. .NET Framework vs .NET 8 — migration considerations?

Use **top_5** §4 — table + no migrate-on-startup with N instances.

### Q6. How do you troubleshoot when users report slowness?

Use **top_5** §3 — app vs DB vs infra decision tree.

### Q7. How do you lead without being the only person who can deploy?

> “**Documented runbooks**, **CI/CD** everyone can trigger, **code review** standards, **pairing** on critical paths, and **architecture decisions** recorded in ADRs or short design notes so the team owns the system.”

### Q8. Salary / rate / availability / hybrid?

> Prepared: **Immediate** availability; **Centurion**; open **hybrid Gauteng** per CV; have a **CTC/range** in mind before the call — don’t invent a number in the doc.

---

## 8. Architecture topics — 30-second answers if they probe

| Topic | Answer skeleton |
|-------|-----------------|
| **App Service vs AKS** | App Service for most LOB APIs; AKS when container orchestration, custom networking, or multi-service density justifies ops cost |
| **Azure SQL vs SQL on VM** | PaaS for new workloads; VM/MI when legacy compatibility or lift-and-shift timing demands it |
| **Secrets** | Key Vault + Managed Identity; never secrets in repo |
| **IIS → Kestrel** | Reverse proxy (App Gateway/nginx/IIS ARR); test auth, session, and file paths |
| **DB migration** | Schema compare, backward-compatible phases, rollback plan, test restore |
| **Monitoring** | App Insights dependencies + alerts on 5xx and p95; SQL DMVs/Query Store |

---

## 9. Questions to ask them (pick 3–4)

**For Xolani (MD — strategy & delivery):**

1. “What does a **typical modernisation engagement** look like from discovery to production — timeline and team shape?”
2. “Where do you see the biggest **client pain** today: legacy .NET, data/SQL, or cloud landing zone?”
3. “How does Seraphis balance **consulting architecture** vs **hands-on delivery** for a Lead Developer / Architect?”

**For the team (technical):**

4. “What’s your standard **Azure target** for .NET apps — App Service, containers, or mixed?”
5. “How do you handle **SQL migration** — Azure SQL, MI, or hybrid?”
6. “What does **success in the first 90 days** look like in this role?”

**Closing:**

7. “What are the **next steps** after today, and is there a technical deep-dive or client scenario later?”

---

## 10. Gaps — handle confidently (don’t hide)

| Gap | Script |
|-----|--------|
| **BSc not complete** | In progress UNISA; 11+ years equivalent experience |
| **No MCTS SQL cert** | Deep practical SQL; willing to sit exam if required |
| **AZ-204 not yet** | AZ-900 in flight; AZ-204 planned; strong .NET + DevOps foundation |
| **Limited public “I built entire Azure landing zone”** | Honest: **application architecture + pipelines**; partner with infra on networking/landing zone |

---

## 11. What to avoid (red flags for this role)

- Claiming you **single-handedly** migrated entire bank core to Azure if you didn’t — say **gateway / integration / phased** work.
- **Buzzwords** without trade-offs (“we use microservices everywhere”).
- Blaming **legacy teams** — show respect for constraints.
- **No questions** for the MD — always ask about engagements and success metrics.
- Long rambling answers — **short interview** = crisp structure: **Situation → Your role → Result**.

---

## 12. After the interview

- Send a **thank-you email** within 24 hours: one line on fit (modernisation + SQL + leadership), one line you enjoyed discussing [specific topic they raised].
- Note any **follow-up** they promised (technical round, reference, rate confirmation).

---

## 13. One-page cheat sheet (print or second monitor)

```
PITCH: 11y .NET | ABSA gateway | IQ Investec/Kinto | SQL + Azure DevOps | lead modernisation

3 PROOFS: Gateway strangler | Azure-ready delivery | SQL perf + prod triage

AZURE DRAW: App Service → API | Azure SQL | Key Vault | App Insights | DevOps

SQL: plan → index → SARGable → EF N+1

LEAD: reviews, patterns, mentoring, runbooks, CI/CD for team

ASK: typical engagement | 90-day success | Azure standard | next steps

GAPS: BSc in progress | MCTS equivalent experience | AZ-900 in progress
```

---

**Good luck at 11:20 — join early, breathe, lead with the 60-second pitch when they say “tell us about yourself.”**
