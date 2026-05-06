# War Room.

Local interview prep app: **practice problems** (platform-style), **technical screening** Q&A, and **mock** flows. The UI is a **React + TypeScript** (Vite) client; generation and caching run on a small Express API backed by SQLite. New items are produced with the **Anthropic Claude** API and stored under `server/data/warroom.db`.

## Requirements

- **Node.js 18+** (global `fetch` is used on the server)
- An **Anthropic API key**

## Setup

1. ****Server****

   ```bash
   cd server
   ```

   Copy `server/.env.example` to `server/.env` and edit:

   ```env
   ANTHROPIC_API_KEY=sk-ant-...
   PORT=5050
   ```

   Optional:

   - `CORS_ORIGIN` — comma-separated allowed browser origins (e.g. `http://localhost:5173`). If unset, CORS allows any origin (fine for local dev).
   - `GENERATE_RATE_LIMIT_MAX` — max POST `/api/problem` and `/api/screening` requests per 15 minutes per IP (default `40`).
   - `TRUST_PROXY` — set to `1` or `true` when the API sits behind a reverse proxy so **rate limiting** uses the real client IP from `X-Forwarded-For`. You can also set a numeric hop count (e.g. `2`).
   - `WAR_ROOM_API_KEY` — if set, **POST** `/api/problem` and `/api/screening` require the same value as `Authorization: Bearer <key>` or header `X-War-Room-Key: <key>`. Omit for local-only use.

   ```bash
   npm install
   npm run dev
   ```

2. **Client** (separate terminal)

   ```bash
   cd client
   npm install
   npm run dev
   ```

   If the server uses **`WAR_ROOM_API_KEY`**, copy `client/.env.example` to `client/.env` and set **`VITE_WAR_ROOM_API_KEY`** to the same value so generation requests send `Authorization: Bearer …`. (Vite inlines this into the bundle—it deters casual abuse, not a determined attacker with your JS.)

   Vite proxies `/api` to `http://localhost:5050` (see `client/vite.config.ts`). Start the server before generating problems or screening questions.

3. **Optional seed**

   ```bash
   cd server
   node scripts/seed.js
   ```

## Scripts

| Location | Command | Purpose |
|----------|---------|---------|
| `server` | `npm run dev` | API with nodemon |
| `server` | `npm start` | API (production-style) |
| `server` | `npm test` | Node test runner (`parseClaudeJson`, `requireApiKey`) |
| `client` | `npm run dev` | Vite dev server |
| `client` | `npm run typecheck` | `tsc --noEmit` |
| `client` | `npm run build` | Typecheck + Vite production build |

## Behavior notes

- **Cache**: Same platform/language/category/difficulty (or screening tuple) may return a cached item unless you enable **“New problem / New question (skip cache)”** in the config screens.
- **Stats** in the header (solved / hinted / skipped / streak) are **persisted in `localStorage`** (`war-room-stats`).
- **Rate limits** apply only to generation POSTs; listing history endpoints are not limited by the same middleware. Behind a reverse proxy, set **`TRUST_PROXY`** so per-IP limits are meaningful.
- **No in-app editor**: practice and mock flows include a **local IDE stopwatch** and suggested minutes so you budget time to implement and run tests in your own environment. The header timer is the overall **session** clock only.
- **Screening** includes **whiteboard / DevOps / tech-lead** categories and question types (`whiteboard_system`, `whiteboard_devops`, `whiteboard_lead`) with an on-screen **whiteboard prep** panel (3-minute sketch timer, narration tips). Generation prompts target senior IC, tech lead, and platform/SRE roles while answers stay “teach me like a junior.”

## Health check

`GET http://localhost:5050/api/health` — returns `{ status: "ok", ... }`.
# deployed Mon, Apr 13, 2026  6:14:44 PM
