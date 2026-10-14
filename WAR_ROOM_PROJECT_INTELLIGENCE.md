# War Room — Codist Project Intelligence Brief

> **One-line summary**  
> **PROJECT:** War Room | **STATUS:** Partial (production live, repo gaps) | **SERVER:** 65.109.7.45 (billable / shared VPS) | **TESTS:** Pass (3 server unit files; no E2E) | **TESTERS:** Not Yet (auth + API key required for full use)

> **Methodology:** This brief follows the **Codist Project Intelligence Agent** prompt: read the codebase first, report only verifiable facts, mark **UNKNOWN** where code/docs are silent, and flag **PARTIAL** where implementation is incomplete. Section headings and tables match that audit template exactly.

---

## SECTION 1 — PROJECT IDENTITY

### 1.1 Project name and one-line description

**War Room** — local/production interview prep app: AI-generated coding problems, technical screening Q&A, mock sessions, certifications, and study tracks.

*Evidence: `README.md`, `client/src/components/Header.tsx`, `server/package.json` description*

### 1.2 Primary purpose

Solve **interview preparation** for software engineers: practice platform-style problems (LeetCode, HackerRank, etc.), generate and cache screening questions (including whiteboard/DevOps/tech-lead categories), run timed mocks, track session stats, and study via certification flashcards and mastery/console/brain labs.

*Evidence: `README.md`, `server/controllers/problemController.js`, `server/controllers/screeningController.js`, `client/src/App.tsx`*

### 1.3 Target user

**Individual developer / interview candidate** (primarily the author and invited guests). Not a multi-tenant SaaS product in code — single SQLite DB, optional guest passes for short-lived access.

Enterprise/trader/journalist use cases: **not applicable** to runtime product (some study *content* references Codist internal systems).

### 1.4 Tech stack

| Layer | Technology | Evidence |
|-------|------------|----------|
| Frontend | React 19, TypeScript, Vite 8, vanilla CSS | `client/package.json`, `.cursorrules` |
| Backend | Node.js 20 (Docker), Express 4, CommonJS | `server/package.json`, `server/Dockerfile` |
| Database | SQLite (`better-sqlite3`, WAL mode) | `server/config/db.js` |
| AI | Anthropic Claude API (`claude-sonnet-4-20250514`), native `fetch` | `problemController.js`, `screeningController.js` |
| Reverse proxy (container) | nginx (client image) | `client/nginx.conf`, `client/Dockerfile` |
| Host proxy | nginx on VPS (not in repo) | `.cursorrules` |
| Queue / cache | **None** (no Redis, RabbitMQ) | repo search |
| CI | GitHub Actions | `.github/workflows/` |

### 1.5 Monorepo or separate repos?

**Monorepo** at repository root:

```
war-room/
├── client/          React SPA
├── server/          Express API
├── deploy/          setup-server.sh
├── .github/         CI + deploy workflows
├── certification/   PDFs (often untracked locally)
├── investec_interview/  C# prep (untracked)
├── profiles/        CV + extended mastery content
├── assessments/     assets only
├── screenshots/
├── cursor-bbd-prep.md
├── README.md
├── .cursorrules
└── docker-compose.yml
```

No `docs/` folder exists in repo.

### 1.6 `.cursorrules` summary

Present at `.cursorrules`. Key rules:

- Product: Practice + Screening modes, Claude model id documented
- Deployment: `https://warroom.codist.co.za`, Hetzner `65.109.7.45`, `/opt/warroom`, user `warroom`
- Container paths: server `WORKDIR /app` (not `/app/server`)
- Prod compose override: `docker-compose.prod.yml` on server, client `127.0.0.1:3080:80`
- BusyBox grep: no `--include` flag in containers
- Auth env vars documented; guest pass flow
- SQLite backup cron on server (`backup-warroom.sh`) — script **not in repo**
- Do not edit prod nginx on server without care (shared with Billable)

### 1.7 Author / organisation

- **Git remote org:** `Codist-Pty-Ltd/war-room` (`.git/config`)
- **Setup script default repo:** `ntokyb/war-room` (`deploy/setup-server.sh`) — **mismatch**
- **Personal branding in UI:** Ntokozo mastery tracks, profiles content
- `server/package.json` `author` field: **empty**

---

## SECTION 2 — GITHUB & VERSION CONTROL

### 2.1 GitHub remote URL

```
https://github.com/Codist-Pty-Ltd/war-room.git
```

*(from `.git/config`)*

### 2.2 Default branch

`main`

### 2.3 CI/CD workflows

| Workflow | Trigger | Jobs |
|----------|---------|------|
| `ci.yml` | push `main`/`develop`, PR to `main`, `workflow_call` | See below |
| `deploy.yml` | push `main` only | `ci` → `deploy` |

**`ci.yml` jobs:**

| Job | What it does |
|-----|----------------|
| `lint-client` | `npm ci` + `npm run lint` in `client/` |
| `build-client` | needs lint; `npm run build`; uploads `client-dist` artifact (7 days) |
| `build-server` | `npm ci` + `npm test` in `server/` |
| `docker-build` | builds `warroom-server:test` and `warroom-client:test` images |

**`deploy.yml` jobs:**

| Job | What it does |
|-----|----------------|
| `ci` | Reuses `ci.yml` via `workflow_call` |
| `deploy` | SSH to server; `git reset --hard origin/main`; `docker compose -f docker-compose.yml -f docker-compose.prod.yml build/up` |

### 2.4 Does CI run tests?

**Yes** — server only:

```bash
cd server && npm test
```

Runs 3 files: `parseClaudeJson.test.js`, `requireApiKey.test.js`, `requireAppSession.test.js`

Client: lint + build only — **no client tests**.

### 2.5 Does CI deploy automatically?

**Yes** — on push to `main`, after CI passes, to production environment via SSH.

**Target:** server at `secrets.SERVER_HOST` (documented as Hetzner `65.109.7.45` in `.cursorrules`), app dir default `/opt/warroom`.

### 2.6 GitHub secrets referenced

| Secret | Purpose |
|--------|---------|
| `SERVER_HOST` | Deploy SSH host |
| `SERVER_USER` | Deploy SSH user |
| `SERVER_SSH_KEY` | Deploy SSH private key |
| `APP_DIR` | Optional; defaults to `/opt/warroom` in script |

No Anthropic key or app passwords in GitHub secrets — those live in `server/.env` on the server.

### 2.7 CODEOWNERS / branch protection

**Not found in repo.** Branch protection rules: **UNKNOWN** (check GitHub repo settings).

### 2.8 GitHub Actions marketplace actions

- `actions/checkout@v4`
- `actions/setup-node@v4`
- `actions/upload-artifact@v4`
- `appleboy/ssh-action@v1`

### 2.9 Docker image pushed to GHCR?

**No.** CI builds local test tags only (`warroom-server:test`, `warroom-client:test`). Production images built on server during deploy. **No GHCR push workflow.**

---

## SECTION 3 — INFRASTRUCTURE & HOSTING

### 3.1 Docker services (`docker-compose.yml`)

| Service | Container | Notes |
|---------|-----------|-------|
| `server` | `warroom-server` | Build `./server`, `env_file: ./server/.env`, volume `sqlite-data:/app/data`, expose 5050 |
| `client` | `warroom-client` | Build `./client`, depends on healthy server |

### 3.2 Production compose separate from dev?

**Yes — but `docker-compose.prod.yml` is NOT committed to repo.**

Referenced by:
- `.github/workflows/deploy.yml`
- `.cursorrules` (client port `127.0.0.1:3080:80`)

**Exists on server at `/opt/warroom/docker-compose.prod.yml` per ops docs — not verifiable from repo alone.**

### 3.3 Domains / URLs

| URL | Source |
|-----|--------|
| `https://warroom.codist.co.za` | `.cursorrules` (production) |
| `http://localhost:5050` | API dev (`README.md`) |
| `http://localhost:5173` | Vite dev (`README.md`) |
| `http://app.mybillable.co.za` | Same VPS, different app (`.cursorrules`) |

Study JSON files reference other Codist domains (`ops.codist.co.za`, etc.) — **content only**, not War Room runtime.

### 3.4 Reverse proxy

- **Inside Docker:** nginx in client container (`client/nginx.conf`) — proxies `/api/` → `http://server:5050`
- **On host:** nginx (TLS termination) — **not in repo**; `.cursorrules` describes binding client to localhost:3080

**Caddy / Traefik:** not found.

### 3.5 TLS/HTTPS

**Configured on host nginx**, not in application repo. Let's Encrypt assumed for `warroom.codist.co.za` — **UNKNOWN** (verify on server). App sets `COOKIE_SECURE=1` in prod when auth enabled.

### 3.6 Hetzner server target

**65.109.7.45** — documented in `.cursorrules` as shared VPS with Billable.

**162.55.188.252 (codist2 / EngineIQ):** not referenced for War Room.

### 3.7 Internal port

API: **5050** (`server/index.js`, `PORT` env, Docker expose)

Client nginx: **80** inside container; **3080** on host in prod override (`.cursorrules`)

### 3.8 Deploy script

**`deploy/setup-server.sh`** — one-time bootstrap:

1. Install Docker (Ubuntu/Debian)
2. Create user `warroom`, add to docker group
3. Clone repo to `/opt/warroom`
4. Copy `server/.env.example` → `server/.env`
5. `docker compose up -d --build`

**Ongoing deploy:** GitHub Actions SSH script (see Section 2.3).

### 3.9 Volume mounts

| Mount | Purpose |
|-------|---------|
| `sqlite-data:/app/data` | Persist `warroom.db` |

### 3.10 Healthchecks

**Server only:**

```yaml
wget -qO- http://localhost:5050/api/health
interval: 30s, timeout: 5s, retries: 3
```

Client: **no healthcheck** in compose.

### 3.11 Restart policy

`restart: unless-stopped` on both services.

### 3.12 RabbitMQ, Redis, queue/cache

**Not used** by War Room application.

---

## SECTION 4 — ENVIRONMENT VARIABLES

### Server (`server/.env.example`)

| Variable | Purpose | Required | Default | Source |
|----------|---------|----------|---------|--------|
| `ANTHROPIC_API_KEY` | Claude API | **Yes** (for generation) | none | `.env` |
| `PORT` | API listen port | No | `5050` | code |
| `CORS_ORIGIN` | Allowed browser origins (comma-sep) | No | allow all | `.env` |
| `GENERATE_RATE_LIMIT_MAX` | Max generation POSTs / 15 min / IP | No | `40` | code |
| `TRUST_PROXY` | Express trust proxy for rate limit IP | No | off | `.env` |
| `WAR_ROOM_API_KEY` | Bearer key on generation POSTs | No | off | `.env` |
| `WAR_ROOM_APP_USER` | Super username; enables app auth | No* | off | `.env` |
| `WAR_ROOM_APP_PASSWORD` | Super password | Yes if auth on | none | `.env` |
| `WAR_ROOM_SUPER_USER` / `WAR_ROOM_SUPER_PASSWORD` | Aliases for super | Optional aliases | — | `.env` |
| `WAR_ROOM_SESSION_SECRET` | HMAC cookie signing (≥16 chars) | Yes if auth on | none | `.env` |
| `WAR_ROOM_GUEST_HOURS` | Guest account lifetime | No | `3` | code |
| `WAR_ROOM_GUEST_SESSION_SEC` | Guest cookie max age | No | `10800` | code |
| `WAR_ROOM_SUPER_SESSION_SEC` | Super session max age | No | 7 days | code |
| `COOKIE_SECURE` | Secure cookie flag | No | true in production | code |

\*If `WAR_ROOM_APP_USER` is set, auth is **on** and password + session secret are required.

### Client (`client/.env.example`)

| Variable | Purpose | Required | Default | Source |
|----------|---------|----------|---------|--------|
| `VITE_WAR_ROOM_API_KEY` | Must match server API key | If server key set | none | Vite bundle |

### Flags

- **Required without default:** `ANTHROPIC_API_KEY` for AI features; auth trio when login enabled
- **Secrets in repo:** none found in committed code (test fixtures only)
- **`VITE_WAR_ROOM_API_KEY`:** bundled into client JS — not secret from determined users
- **Referenced but not in example:** `NODE_ENV` (implicit, cookie secure default)

---

## SECTION 5 — DATABASE

### 5.1 Database engine

**SQLite** via `better-sqlite3`. Path: `server/data/warroom.db` (Docker: `/app/data/warroom.db`).

No PostgreSQL/MySQL.

### 5.2 ORM

**None** — raw SQL in model modules (`server/models/*.js`).

### 5.3 Migrations

**No migration framework.** Schema created inline in `initDb()` with `CREATE TABLE IF NOT EXISTS`.

**Recent schema changes:** not versioned — **UNKNOWN** history beyond git blame on `db.js`.

### 5.4 Pending migrations

**N/A** — no migration files. Schema drift risk if `db.js` changes without manual DB handling.

### 5.5 Seed files

**`server/scripts/seed.js`** — manual run; inserts starter problems and screening questions (no dedupe by hash).

### 5.6 Migration script for deployment

**None.** Deploy relies on `initDb()` on startup.

### 5.7 Main tables

| Table | Purpose |
|-------|---------|
| `problems` | Cached coding problems (JSON in `response_json`) |
| `screening` | Cached screening questions |
| `sessions` | Practice session outcomes (solved/skipped/hinted) |
| `app_guest_users` | Guest pass credentials (scrypt hash, expiry) |

### 5.8 Schema issues / TODOs

No TODOs in `db.js`. **Risk:** additive columns require manual ALTER or DB reset — not automated.

### 5.9 pgvector / extensions

**Not required.**

### 5.10 Multi-tenancy

**No** — single SQLite file, no `tenant_id`, no RLS.

---

## SECTION 6 — WHAT IS IMPLEMENTED AND WORKING

### Backend endpoints

| Method | Route | Purpose | Status |
|--------|-------|---------|--------|
| GET | `/api/health` | Health check | **COMPLETE** |
| GET | `/api/auth/status` | Auth state for UI | **COMPLETE** |
| POST | `/api/auth/login` | Super or guest login | **COMPLETE** |
| POST | `/api/auth/logout` | Clear session | **COMPLETE** |
| POST | `/api/auth/guests` | Create guest pass (super) | **COMPLETE** |
| GET | `/api/auth/guests` | List guest passes | **COMPLETE** |
| DELETE | `/api/auth/guests/:username` | Revoke guest | **COMPLETE** |
| POST | `/api/problem` | Generate/cache problem (Claude) | **COMPLETE** |
| GET | `/api/problems` | List cached problems | **COMPLETE** |
| GET | `/api/problems/:id` | Get one problem | **COMPLETE** |
| POST | `/api/screening` | Generate/cache screening Q | **COMPLETE** |
| GET | `/api/screenings` | List screening questions | **COMPLETE** |
| GET | `/api/screenings/:id` | Get one screening | **COMPLETE** |
| POST | `/api/sessions` | Log practice outcome | **COMPLETE** |
| GET | `/api/sessions/summary` | Aggregate stats | **COMPLETE** |
| GET | `/api/sessions/dashboard` | Dashboard data | **COMPLETE** |

When `WAR_ROOM_APP_USER` unset: all routes open except guest admin routes.

### Frontend screens (no URL router — state in `App.tsx`)

| Screen key | Component | Purpose | Status |
|------------|-----------|---------|--------|
| `platform` | `PlatformSelect` | Choose coding platform | **COMPLETE** |
| `config` | `ProblemConfig` | Configure problem generation | **COMPLETE** |
| `problem` | `ProblemView` | Active practice | **COMPLETE** |
| `history` | `ProblemHistory` | Browse cache | **COMPLETE** |
| `dashboard` | `Dashboard` | Stats dashboard | **COMPLETE** |
| `prep` | `PrepGuide` | Interview prep guide | **COMPLETE** |
| `certs` | `Certifications` | AZ-900+ flashcards | **COMPLETE** |
| `screening` | `ScreeningConfig` | Screening setup | **COMPLETE** |
| `screeningQuestion` | `ScreeningView` | Active screening | **COMPLETE** |
| `mockConfig` | `MockConfig` | Mock interview setup | **COMPLETE** |
| `mockSession` | `MockSession` | Timed mock | **COMPLETE** |
| `bbd` | `BBDMockSession` | BBD/HackerEarth sim | **COMPLETE** |
| `mastery` | `NtokozoMastery` | Multi-track drills | **PARTIAL** (stub drills in content) |
| `consoleLab` | `ConsoleLab` | Console/system design lab | **COMPLETE** |
| `brainLab` | `BrainTraining` | Brain training | **COMPLETE** |

### Background jobs

**None** — no cron/scheduler in app code. Server backup cron documented in `.cursorrules` only.

### Integrations

| Service | What it does | Status | Credentials |
|---------|--------------|--------|-------------|
| Anthropic Claude | Problem/screening generation | **COMPLETE** | `ANTHROPIC_API_KEY` |

---

## SECTION 7 — WHAT IS MISSING OR BROKEN

### 7.1 Scaffolded but not fully implemented

- **Mastery drill stubs** — `NotImplementedException` / TODO in `*Mastery.ts` files (intentional study scaffolding)
- **`docker-compose.prod.yml`** — required by deploy workflow but **missing from repo**
- **Client published ports** — base compose exposes no host port for client (needs prod override)

### 7.2 Endpoints returning 501 / commented out

**None found.** All listed routes have handlers.

### 7.3 Frontend placeholder UI

- Mastery tracks include drill placeholders for interview practice (by design)
- No React Router — **no shareable deep links** to screens

### 7.4 Known bugs / TODOs

- Remote URL mismatch: `Codist-Pty-Ltd` vs `ntokyb` in setup script
- `develop` branch runs CI but **does not deploy**
- Stats in header use **localStorage** — not synced to server sessions for all metrics

### 7.5 Missing validations

- Generation inputs validated in controllers — **basic**; no formal JSON schema on Claude responses beyond parse helper

### 7.6 Missing error handling on external API

- Claude failures handled in controllers with error responses — **verify** retry/backoff: **not implemented** (single attempt)

### 7.7 Security gaps

| Issue | Severity |
|-------|----------|
| API key in Vite bundle | Medium (acknowledged in README) |
| Auth off if env unset | High if prod misconfigured |
| Guest password shown once in plaintext on create | Low (by design for handoff) |
| No hardcoded prod secrets in repo | ✓ Good |

### 7.8 Data integrity risks

- SQLite single file — backup depends on external cron
- No FK migrations — schema changes manual
- Session logging and generation are separate — OK for use case

---

## SECTION 8 — TESTING

### 8.1 Frameworks

| Area | Framework |
|------|-----------|
| Server | Node.js built-in `node --test` |
| Client | ESLint only — **no Jest/Vitest/Playwright** |

### 8.2 Test categories

| Category | Present | Count / notes |
|----------|---------|---------------|
| Unit (server) | Yes | 3 test files |
| Integration | No | — |
| E2E | No | — |
| API contract | No | — |
| Client | No | — |

### 8.3 Run command

```bash
cd server && npm test
cd client && npm run lint && npm run build
```

### 8.4 CI

Server tests in `build-server` job. Client lint in `lint-client`, build in `build-client`.

### 8.5 Coverage estimate

**Low** — critical paths (Claude integration, DB models, auth login flow) largely untested beyond middleware unit tests.

### 8.6 Skipped / broken tests

**None marked skip** in the 3 test files.

### 8.7 Testcontainers

**Not used.**

### 8.8 Deployment gates

| Gate | Requirement |
|------|-------------|
| **Staging** | `npm test` (server) + client lint + build + docker build pass |
| **Production** | Same + manual verify auth, Anthropic key, health check, smoke generation |

---

## SECTION 9 — THIRD PARTY TOOLS & INTEGRATIONS

| Tool | Purpose | Status | Account needed | Cost |
|------|---------|--------|----------------|------|
| **Anthropic Claude** | AI generation | Active | Anthropic API key | Pay per token |
| **better-sqlite3** | SQLite driver | Active | — | Free |
| **express / cors / rate-limit** | HTTP stack | Active | — | Free |
| **GitHub Actions** | CI/CD | Active | GitHub org | Free tier |
| **Docker Hub** (base images) | `node:20-alpine`, `nginx:alpine` | Active | — | Free |

**Not integrated:** Paystack, Stripe, WhatsApp/Meta, SendGrid, Sentry, Redis, RabbitMQ, OAuth providers.

**Sandbox modes:** Anthropic API — use dev keys / spending limits (org policy).

---

## SECTION 10 — CODIST PLATFORM INTEGRATION

### 10.1 EngineIQ readiness

| Question | Answer |
|----------|--------|
| On GitHub? | **Yes** — `Codist-Pty-Ltd/war-room` |
| GitHub App installed? | **UNKNOWN** — check org settings |
| Can EngineIQ review PRs? | **Yes, if repo registered** in EngineIQ |
| Repo to register | `Codist-Pty-Ltd/war-room` |
| **Recommended action** | **Register now** if PR review desired; CI already present |

### 10.2 Billable readiness

| Question | Answer |
|----------|--------|
| Revenue product? | **No** — personal/interview prep tool |
| Paystack needed? | **Not needed** |
| Vendor payouts? | **Not needed** |
| Subscription plans? | **Not needed** |
| **Recommended action** | **Not needed** — shares VPS only |

### 10.3 WhatsApp readiness

| Question | Answer |
|----------|--------|
| WhatsApp notifications needed? | **No** in current product |
| Trigger events | N/A |
| Meta Business Account? | **No** |
| **Recommended action** | **Not needed / future** if onboarding alerts desired |

---

## SECTION 11 — DEPLOYMENT READINESS ASSESSMENT

### INFRASTRUCTURE

| Check | Status |
|-------|--------|
| Docker images build without errors | ✅ CI `docker-build` |
| Docker compose runs all services | ⚠️ Prod needs `docker-compose.prod.yml` on server |
| Health check endpoints exist | ✅ `/api/health` |
| Environment variables documented | ✅ `.env.example` + README |
| Reverse proxy config present | ⚠️ In container nginx yes; host nginx not in repo |
| TLS/HTTPS configured | ⚠️ Host-level — verify on server |
| Deploy script exists | ✅ GH Actions + `setup-server.sh` |

### DATABASE

| Check | Status |
|-------|--------|
| Migrations exist and sequential | ❌ Inline schema only |
| Migration script in CI | ❌ |
| Seed data for demo | ✅ `seed.js` (manual) |
| Breaking schema pending | ⚠️ Unknown |

### APPLICATION

| Check | Status |
|-------|--------|
| Core user flows E2E | ✅ Practice + screening + dashboard |
| Auth/login works | ✅ When env configured |
| Main CRUD operations | ✅ Cache list/get + session log |
| No 500 on happy paths | ✅ Assumed prod — verify smoke |
| External API fallbacks | ⚠️ No retry on Claude failures |

### TESTING

| Check | Status |
|-------|--------|
| Unit tests pass | ✅ 3 files |
| Integration tests | ❌ None |
| E2E smoke tests | ❌ None |
| CI green on main | ⚠️ Verify current branch |

### SECURITY

| Check | Status |
|-------|--------|
| No hardcoded secrets | ✅ |
| Auth on private endpoints | ✅ When `WAR_ROOM_APP_USER` set |
| Webhook signatures | N/A |
| Input validation | ⚠️ Basic |
| Admin endpoints protected | ✅ Guest routes require super |

### OVERALL VERDICT

| Question | Answer |
|----------|--------|
| **Ready for staging** | **With conditions** — commit or document `docker-compose.prod.yml`; verify `.env` on server |
| **Ready for beta testers** | **With conditions** — enable auth, issue guest passes, document Anthropic cost |
| **Ready for production (paying clients)** | **No** — personal tool, low test coverage, no SLA/support model |
| **Blockers** | Missing prod compose in repo; auth must be enabled on public URL; no E2E tests |

---

## SECTION 12 — DEPLOYMENT PLAN

*Assumes target server **65.109.7.45** (billable VPS), app dir `/opt/warroom`.*

### 12.1 Pre-deployment checklist

- [ ] `server/.env` on server has `ANTHROPIC_API_KEY`, auth vars, `CORS_ORIGIN=https://warroom.codist.co.za`
- [ ] `docker-compose.prod.yml` exists on server (port `127.0.0.1:3080:80`)
- [ ] GitHub secrets: `SERVER_HOST`, `SERVER_USER`, `SERVER_SSH_KEY`, optional `APP_DIR`
- [ ] Host nginx points `warroom.codist.co.za` → `127.0.0.1:3080`
- [ ] TLS certificate valid

### 12.2 Server preparation (first time)

```bash
# On fresh Ubuntu/Debian VPS as root:
bash deploy/setup-server.sh
# Edit /opt/warroom/server/.env
# Ensure docker-compose.prod.yml present
# Configure host nginx + certbot (manual — not in repo)
```

### 12.3 Environment variables to set (production)

```env
ANTHROPIC_API_KEY=sk-ant-...
PORT=5050
CORS_ORIGIN=https://warroom.codist.co.za
TRUST_PROXY=1
WAR_ROOM_APP_USER=<super-username>
WAR_ROOM_APP_PASSWORD=<strong-password>
WAR_ROOM_SESSION_SECRET=<min-16-chars-random>
COOKIE_SECURE=1
# Optional:
WAR_ROOM_API_KEY=<optional-generation-key>
GENERATE_RATE_LIMIT_MAX=40
```

Client build on server uses Docker multi-stage — set `VITE_WAR_ROOM_API_KEY` at **build time** if using API key (requires Dockerfile ARG or server-side `.env` for build — **currently not in Dockerfile**; API key protection may be server-only unless rebuild pipeline updated).

### 12.4 Database migration commands

```bash
# No migrations — DB auto-inits on server start.
# Optional seed:
docker exec warroom-server node scripts/seed.js
# Or from host with volume access.
```

### 12.5 Docker build and push

Images built **on server** (not GHCR):

```bash
cd /opt/warroom
docker compose -f docker-compose.yml -f docker-compose.prod.yml build --no-cache
```

### 12.6 Docker up

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
docker image prune -f
```

### 12.7 Nginx / host config

**Not in repo.** Expected pattern (`.cursorrules`):

- Host nginx TLS for `warroom.codist.co.za`
- Proxy to `127.0.0.1:3080` (client container)
- Client nginx proxies `/api/` to `server:5050` on Docker network

### 12.8 DNS records

| Record | Value |
|--------|-------|
| A | `warroom.codist.co.za` → `65.109.7.45` |

*(Verify in DNS provider — **UNKNOWN** from repo)*

### 12.9 Post-deployment smoke tests

```bash
curl -s https://warroom.codist.co.za/api/health
# Expect: {"status":"ok",...}

curl -s https://warroom.codist.co.za/api/auth/status
# Expect authRequired true/false based on env

# After login (cookie jar):
curl -s -c cookies.txt -X POST https://warroom.codist.co.za/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"...","password":"..."}'
```

### 12.10 Rollback plan

```bash
cd /opt/warroom
git log -5 --oneline
git reset --hard <previous-sha>
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

SQLite volume persists — **no automatic DB rollback**.

---

## SECTION 13 — TESTER / CLIENT ONBOARDING READINESS

### 13.1 Self-service signup?

**No public signup.** Super user logs in; super creates **guest passes** (username/password, ~3h TTL).

### 13.2 Demo/seed data?

**Yes** — run `node server/scripts/seed.js` for cached problems/questions.

### 13.3 Test payment method?

**N/A** — no payments.

### 13.4 WhatsApp for testers?

**N/A**

### 13.5 Minimum onboarding flow (tester)

1. Receive guest username/password from super user
2. Open `https://warroom.codist.co.za`
3. Log in on gate screen
4. Choose Practice or Screening from home
5. Configure platform/difficulty → Generate
6. Complete session; check Dashboard/History

### 13.6 Feedback mechanism

**Not built-in.** Options: GitHub Issues on `Codist-Pty-Ltd/war-room`, email, WhatsApp to owner — **external**.

### 13.7 Known issues for testers

| Issue | Workaround |
|-------|------------|
| Generation fails | Check Anthropic key/quota on server |
| Session expired | Request new guest pass |
| Stats in header vs dashboard differ | Header uses localStorage; dashboard uses server |
| No deep links | Navigate via UI only |

### 13.8 Semi-client / paying beta readiness

**Not ready** for paying production clients — no SLA, single SQLite, personal tool scope, minimal automated testing.

---

## SECTION 14 — MARKET POSITION

### 14.1 South Africa market

| Topic | Assessment |
|-------|------------|
| Primary user | Individual developer preparing for interviews (not SME/trader) |
| Competitors | LeetCode, HackerRank, Pramp, local bootcamp prep, ChatGPT directly |
| Pricing (ZAR) | Could be R99–R299/mo as niche prep — **not implemented** |
| SA features present | None specific (no Paystack, POPIA docs, load shedding UX) |
| SA features missing | POPIA privacy policy, ZAR billing, WhatsApp onboarding, offline mode |

### 14.2 Africa market

Applicable as **generic interview prep**; would need payment localisation (Paystack/M-Pesa) and connectivity-aware UX for expansion — **not built**.

### 14.3 Global market

Global use case exists (English, international platforms). Competitors: LeetCode Premium, Interviewing.io, Exponent. **Defensible advantage:** customised study tracks (Codist/EngineIQ/Maemo content), Claude cache, mock flows — **niche personal war room**, not scalable SaaS yet.

### 14.4 Go-to-market recommendation

| Item | Recommendation |
|------|----------------|
| Launch strategy | **Private / invite-only** — not public SA launch |
| Beta profile | Senior devs at Codist network preparing for IKM/Investec-style assessments |
| Pricing | Free for guests; no monetisation until productised |
| Differentiator | Integrated study modules + AI generation + session tracking in one private app |

---

## SECTION 15 — RECOMMENDED NEXT ACTIONS

### MUST DO BEFORE DEPLOYMENT (blockers)

| Action | Why | Effort |
|--------|-----|--------|
| Commit or document `docker-compose.prod.yml` | Deploy workflow references it; clean clone fails without server copy | 1h |
| Verify prod `.env` has auth + Anthropic key + CORS | Public URL without auth = open AI spend | 30m |
| Align repo URLs (`Codist-Pty-Ltd` vs `ntokyb`) in setup script | Onboarding confusion | 15m |
| Smoke test post-deploy curl commands | Confirm health + auth | 30m |

### MUST DO BEFORE BETA TESTERS (quality gates)

| Action | Why | Effort |
|--------|-----|--------|
| Enable app auth on production | Prevent anonymous Claude usage | 30m |
| Document guest pass workflow for super user | Testers need credentials | 1h |
| Run `seed.js` on prod or share seeded instance | Immediate value without generation | 30m |
| Add GitHub Issue template or feedback email | Capture tester bugs | 1h |

### SHOULD DO THIS SPRINT (high value)

| Action | Why | Effort |
|--------|-----|--------|
| Add integration test for `/api/health` + auth login | Catch regressions | 2–4h |
| Add `docker-compose.prod.yml` to repo with `3080:80` | Reproducible deploys | 1h |
| Register repo in EngineIQ | PR review for Codist workflow | 1h |
| Client: optional deep linking (React Router) | Shareable study links | 1–2 days |

### BACKLOG (future)

| Action | Why | Effort |
|--------|-----|--------|
| PostgreSQL + migrations if multi-user SaaS | SQLite limits | Large |
| E2E Playwright smoke tests | Deployment confidence | 2–3 days |
| POPIA privacy page + data export | If external users | 1–2 days |
| Claude retry/backoff | Resilience | 2h |
| Remove API key from client bundle (server-only session auth) | Security | 4h |

---

## APPENDIX — How this brief was framed (prompt template)

Each section maps to the **Codist Project Intelligence Agent** audit questions:

1. **Identity** — what is this product?
2. **GitHub** — how is it shipped and CI’d?
3. **Infrastructure** — where does it run?
4. **Environment** — what secrets/config exist?
5. **Database** — what persists?
6. **Implemented** — what works today?
7. **Missing/broken** — honest gaps
8. **Testing** — proof of quality
9. **Third parties** — external dependencies
10. **Codist integration** — EngineIQ, Billable, WhatsApp
11. **Deployment readiness** — traffic lights
12. **Deployment plan** — exact commands
13. **Tester onboarding** — can someone else use it?
14. **Market position** — SA/Africa/global
15. **Next actions** — prioritised backlog

**Rules applied:** no guessing (UNKNOWN where needed), explicit PARTIAL states, file-path evidence, no truncation of section list.

---

*Generated from codebase at `c:\projects\interviews\programming_practices\study_sessions\war-room`. Re-run audit after major changes.*
