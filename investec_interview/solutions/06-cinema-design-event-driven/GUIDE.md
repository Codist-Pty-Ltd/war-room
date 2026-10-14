# Design Task — Cinema Booking System (Approach B: Event-Driven + Redis Holds)

**Same prompt as Approach A** — use this when they ask about **scale**, **peak load**, or **microservices**.

Still cover all five headings: `tech` · `database` · `apis` · `security` · `other considerations`

---

## When to choose this approach

| Signal from interviewer | Your response |
|-------------------------|---------------|
| "What if 10,000 people book when tickets open?" | Redis atomic holds + queue |
| "How do you decouple services?" | Events between Booking, Inventory, Notification |
| "Can we add email/SMS later?" | Event subscribers without changing booking core |

**Principle:** **Event-driven** for extensibility; **PostgreSQL** still owns final truth.

---

## Step 1 — Bounded contexts (draw three boxes)

```
┌─────────────┐     events      ┌──────────────────┐
│  Catalog    │ ──────────────► │  Booking Service │
│  (movies,   │                 │  (book/cancel)   │
│   showtimes)│                 └────────┬─────────┘
└─────────────┘                          │
                                         │ SeatReserved
                                         ▼
                                ┌──────────────────┐
                                │ Seat Inventory   │
                                │ (availability)   │
                                └──────────────────┘
```

---

## tech

| Component | Choice | Why |
|-----------|--------|-----|
| **Booking API** | ASP.NET Core / NestJS | Commands: Book, Cancel |
| **Message bus** | Azure Service Bus or RabbitMQ | `BookingCreated`, `BookingCancelled`, `SeatsReleased` |
| **Seat holds** | Redis | Atomic `SET NX EX` per seat |
| **System of record** | PostgreSQL | Bookings + final seat state |
| **Read API** | Optional read replica or cached projections | Fast seat map reads |

**Principle:** **CQRS-lite** — writes go through booking command; reads can be cached.

---

## database

### PostgreSQL (source of truth)

Same core schema as Approach A, plus:

```
outbox_events (id, type, payload, created_at, processed_at)
```

**Outbox pattern:** API writes booking + outbox row in **one transaction**; worker publishes to bus — no lost events.

### Redis (ephemeral holds)

Keys: `hold:{showtimeId}:{seatId}` → `{ userId, expiresAt }`  
TTL: **300 seconds** (5 min while user completes selection)

| State | Where |
|-------|-------|
| Available | Neither Redis nor DB booked |
| Held | Redis key exists |
| Booked | DB `booking_seats` row |

---

## apis

Same REST surface as Approach A for clients. Internal difference is **command handling**:

### POST `/bookings` (event-driven variant)

1. Validate user + showtime  
2. For each `seatId`:  
   - `SET hold:{showtime}:{seatId} {userId} NX EX 300`  
   - If any fails → release prior holds → **409**  
3. **DB transaction:** insert booking + seats (check unique constraint)  
4. On success: delete Redis holds, insert outbox `BookingConfirmed`  
5. On DB conflict: release holds → **409**  
6. Return `201`  

### DELETE `/bookings/{id}`

1. Mark `CANCELLED` in DB (transaction)  
2. Outbox event `BookingCancelled`  
3. Worker updates read cache / sends email later  

**Principle:** **Saga-style compensation** — if step 3 fails after Redis holds, release holds (rollback).

---

## security

Same as Approach A, plus:

| Extra | Why |
|-------|-----|
| **Service-to-service auth** | mTLS or signed JWT between workers |
| **Idempotency-Key header** on POST `/bookings` | Retries don't double-book |
| **User can only hold seats for self** | Redis value includes `userId`; confirm match on confirm |

---

## other considerations

### Peak traffic (Avengers opening night)

1. **Ticket queue:** virtual waiting room (optional) — admit N users/minute  
2. **Redis holds** reduce DB write contention during browsing  
3. **Commit** only when user clicks "Confirm booking"  
4. **Read path:** seat map from Redis + DB merge:  
   - `available = all_seats - booked_db - active_holds_redis`

### Event consumers (future, no scope creep in v1)

| Event | Subscriber |
|-------|------------|
| `BookingConfirmed` | Email service, analytics |
| `BookingCancelled` | Waitlist service (future) |

**Principle:** **Open/Closed** — add subscribers without changing booking API.

### Failure modes

| Failure | Handling |
|---------|----------|
| Redis down | Fall back to DB-only locking (Approach A) |
| Duplicate POST | Idempotency key returns same booking id |
| Worker lag | Outbox retry; eventual email delay OK |

### Consistency model

- **Strong consistency** at confirm time (DB transaction)  
- **Eventual** for notifications and read caches  

---

## Whiteboard flow (60 seconds)

```
User picks seats
    → Redis HOLD (5 min)
User confirms
    → PostgreSQL COMMIT (unique seat)
    → Outbox → Service Bus → Email worker
User cancels
    → PostgreSQL CANCEL
    → Outbox → cache invalidate
```

---

## 2-minute summary script

> "For peak load I'd add Redis seat holds with TTL so users can browse without hammering Postgres. Confirm still happens in a DB transaction with a unique (showtime, seat) constraint. I'd use an outbox to publish BookingConfirmed events for email and analytics later. If Redis fails, we degrade to Approach A — pessimistic DB locking only."

---

## A vs B — pick in interview

| Question | Answer |
|----------|--------|
| Default answer? | **A** — simpler, correct |
| When to mention B? | "If you expect flash sales or need async notifications..." |
| Payments out of scope? | Both: booking = CONFIRMED immediately |

Previous: [../05-cinema-design-rest/GUIDE.md](../05-cinema-design-rest/GUIDE.md)
