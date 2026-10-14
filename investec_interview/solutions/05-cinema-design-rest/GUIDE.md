# Design Task — Cinema Booking System (Approach A: REST + PostgreSQL)

**Prompt (from Investec):** Design a cinema booking system. Users can:

- Register an account  
- Choose a cinema location  
- Choose a show (movie + time)  
- Select specific seats  
- Make a booking  
- Cancel a booking  

**Out of scope:** payments, ticket types, price classes.

**Required headings:** `tech` · `database` · `apis` · `security` · `other considerations`

**Format:** 15–20 min whiteboard / verbal. Use this doc as a **script to rehearse aloud**.

---

## Step 1 — Clarify (30 seconds — say first)

Ask or state assumptions:

1. One user can book multiple seats in one transaction  
2. A seat can only be sold once per showtime  
3. No payment → booking confirmed immediately (or `CONFIRMED` status)  
4. ~50 cinemas, ~10 screens each, peak concurrent booking on popular shows  

---

## tech

| Layer | Choice | Why |
|-------|--------|-----|
| **API** | ASP.NET Core 8 or NestJS | REST, OpenAPI, mature auth |
| **Database** | PostgreSQL | ACID for seat uniqueness; JSON for seat maps optional |
| **Cache** | Redis (optional) | Seat hold TTL, session cache |
| **Frontend** | React / Next.js | Seat map UI |
| **Deploy** | Azure App Service + Azure Database for PostgreSQL | Standard enterprise pattern |
| **CI/CD** | GitHub Actions / Azure DevOps | Automated deploy |

**Principle:** **Boring technology** for correctness-critical booking; optimize after correctness.

---

## database

### Core tables

```
users (id, email, password_hash, created_at)
cinemas (id, name, city, address)
screens (id, cinema_id, name, row_count, col_count)
movies (id, title, duration_minutes)
showtimes (id, screen_id, movie_id, starts_at, ends_at)
seats (id, screen_id, row_label, seat_number)        -- physical seats
bookings (id, user_id, showtime_id, status, created_at)
booking_seats (booking_id, seat_id)                   -- UNIQUE(seat_id, showtime_id) via composite
```

### Critical constraint — no double booking

```sql
-- booking_seats links to showtime through booking
CREATE UNIQUE INDEX ux_one_seat_per_showtime
ON booking_seats (showtime_id, seat_id);
```

Or model `showtime_seats (showtime_id, seat_id, status, booking_id)` with **UNIQUE(showtime_id, seat_id)**.

**Principle:** **Invariant in the database**, not only in application code.

### Booking status

| Status | Meaning |
|--------|---------|
| `PENDING` | Optional 5-min hold while user picks seats |
| `CONFIRMED` | Booked |
| `CANCELLED` | User cancelled; seats released |

---

## apis

REST, versioned `/api/v1`:

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/auth/register` | Create account |
| POST | `/auth/login` | JWT access + refresh |
| GET | `/cinemas` | List locations |
| GET | `/cinemas/{id}/showtimes?date=` | Shows for a day |
| GET | `/showtimes/{id}/seats` | Seat map + availability |
| POST | `/bookings` | Body: `{ showtimeId, seatIds[] }` — create booking |
| GET | `/bookings/{id}` | Booking detail |
| DELETE | `/bookings/{id}` | Cancel (if show not started) |

### POST `/bookings` flow (explain step-by-step)

1. Validate JWT → `userId`  
2. Validate showtime exists and is in future  
3. **Begin transaction**  
4. `SELECT ... FROM showtime_seats WHERE showtime_id = @id AND seat_id IN (...) FOR UPDATE`  
5. If any seat not `AVAILABLE` → **409 Conflict**  
6. Insert `booking` + mark seats `BOOKED`  
7. **Commit**  
8. Return `201` with booking id  

**Principle:** **Pessimistic locking** (`FOR UPDATE`) or unique constraint + retry on conflict.

---

## security

| Area | Approach |
|------|----------|
| **Auth** | Email + bcrypt/Argon2 password hash; JWT short-lived (15 min) + refresh token |
| **AuthZ** | Users can only view/cancel **their** bookings |
| **Transport** | HTTPS only |
| **Input** | Validate seat IDs belong to showtime's screen |
| **Rate limit** | Login + booking endpoints (prevent seat scraping) |
| **PII** | Email encrypted at rest optional; audit log for booking changes |
| **OWASP** | Parameterized SQL, no mass assignment on admin fields |

---

## other considerations

### Concurrency (most important)

- **Problem:** Two users click same seat at same time  
- **Solution A:** DB transaction + row lock on seat rows  
- **Solution B:** Optimistic concurrency — version column; second writer gets 409  
- **Optional hold:** Redis `SET seat:showtime:5:12 EX 300 NX` for 5-min soft hold during checkout (no payment still useful for UX)

### Scalability

- Read-heavy: cache `GET /showtimes` and seat maps (invalidate on booking)  
- Write path stays on primary DB  
- CDN for static movie posters  

### Cancellation rules

- Allow cancel until `starts_at - 30 minutes`  
- Release seats in same transaction as status → `CANCELLED`  

### Observability

- Correlation ID on every request  
- Metrics: booking success rate, 409 conflict rate, p95 latency  
- Structured logs for audit (who booked which seat when)  

### What you'd draw on whiteboard

```
[Web App] → [API] → [PostgreSQL]
                ↘ [Redis] optional seat holds
```

---

## 2-minute summary script

> "I'd use a REST API over PostgreSQL with a unique constraint on (showtime, seat) so double booking is impossible. Booking is a transaction: lock seats, verify available, insert booking. Auth is JWT. Cancellation releases seats in the same transaction. Redis optional for short holds. Out of scope: payments and ticket tiers."

---

## Compare to Approach B

| | A (this) | B (event-driven) |
|--|----------|------------------|
| Complexity | Lower | Higher |
| Best for | Interview default | If they ask "high traffic premiere" |
| Seat truth | PostgreSQL | PostgreSQL + events |

Next: [../06-cinema-design-event-driven/GUIDE.md](../06-cinema-design-event-driven/GUIDE.md)
