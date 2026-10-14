require("dotenv").config();

const express = require("express");
const session = require("express-session");
const { RedisStore } = require("connect-redis");
const cors = require("cors");
const { initDb } = require("./config/db");
const redis = require("./config/redis");
const { connectSessionRedis } = require("./config/redisSession");
const { assertSecretIfAuthEnabled, isAppAuthEnabled } = require("./utils/appSession");
const authRoutes = require("./routes/authRoutes");
const requireAppSession = require("./middleware/requireAppSession");
const problemRoutes = require("./routes/problemRoutes");
const screeningRoutes = require("./routes/screeningRoutes");
const sessionRoutes = require("./routes/sessions.routes");
const guestUsersRoutes = require("./routes/guestUsersRoutes");
const requireSuperUser = require("./middleware/requireSuperUser");
const errorHandler = require("./middleware/errorHandler");
const patternController = require("./controllers/patternController");
const { initRateLimiters } = require("./middleware/rateLimiter");

assertSecretIfAuthEnabled();

const app = express();
const PORT = process.env.PORT || 5050;

const trustProxy = process.env.TRUST_PROXY;
if (trustProxy === "1" || trustProxy === "true") {
  app.set("trust proxy", 1);
} else if (trustProxy && /^\d+$/.test(trustProxy)) {
  app.set("trust proxy", parseInt(trustProxy, 10));
}

const corsOrigins = process.env.CORS_ORIGIN;
const corsOptions = corsOrigins
  ? {
      origin: corsOrigins.split(",").map((s) => s.trim()).filter(Boolean),
      credentials: true,
    }
  : { origin: true, credentials: true };

app.use(cors(corsOptions));
app.use(express.json());

async function start() {
  let redisOk = false;
  let sessionStore;

  try {
    const sessionClient = await connectSessionRedis();
    await redis.connect();
    redisOk = true;
    sessionStore = new RedisStore({ client: sessionClient });
    console.log("[redis] Connected (sessions: node-redis, rate limits: ioredis)");
  } catch (err) {
    sessionStore = new session.MemoryStore();
    console.warn(
      "[redis] Unavailable — using in-memory sessions for this process:",
      err.message,
    );
    console.warn(
      "[redis] For production or multi-instance: run Redis (docker compose up redis) and set REDIS_HOST in .env",
    );
  }

  initRateLimiters(redisOk);

  app.use(
    session({
      store: sessionStore,
      secret: process.env.WAR_ROOM_SESSION_SECRET || "dev-only-insecure-secret",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      },
    }),
  );

  initDb();

  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      redis: redisOk,
      timestamp: new Date().toISOString(),
    });
  });

  app.use("/api", authRoutes);

  const APP_AUTH_PUBLIC = new Set([
    "/api/health",
    "/api/auth/status",
    "/api/auth/login",
    "/api/auth/logout",
  ]);

  app.use((req, res, next) => {
    if (!req.path.startsWith("/api")) {
      next();
      return;
    }
    if (APP_AUTH_PUBLIC.has(req.path)) {
      next();
      return;
    }
    requireAppSession(req, res, next);
  });

  if (isAppAuthEnabled()) {
    app.use("/api/auth/guests", requireSuperUser, guestUsersRoutes);
  }

  app.use("/api", problemRoutes);
  app.use("/api", screeningRoutes);
  app.use("/api/sessions", sessionRoutes);

  app.get("/api/patterns", patternController.listPatterns);
  app.get("/api/patterns/stats/summary", patternController.getSummary);
  app.get("/api/patterns/:id", patternController.getPattern);
  app.post("/api/patterns/:id/session", patternController.logSession);

  app.use(errorHandler);

  app.listen(PORT, () => {
    console.log(`War Room server running on http://localhost:${PORT}`);
    if (isAppAuthEnabled()) {
      console.log("[auth] Sign-in screen enabled (super user + guest passes).");
    } else {
      console.log(
        "[auth] Sign-in screen disabled — no WAR_ROOM_APP_USER / WAR_ROOM_SUPER_USER. Set those plus WAR_ROOM_APP_PASSWORD (or WAR_ROOM_SUPER_PASSWORD) and WAR_ROOM_SESSION_SECRET to require login.",
      );
    }
  });
}

start();
