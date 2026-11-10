require("dotenv").config();
require("./tracing");

const express = require("express");
const cors = require("cors");
const { initDb } = require("./config/db");
const { assertSecretIfAuthEnabled, isAppAuthEnabled } = require("./utils/appSession");
const authRoutes = require("./routes/authRoutes");
const requireAppSession = require("./middleware/requireAppSession");
const problemRoutes = require("./routes/problemRoutes");
const screeningRoutes = require("./routes/screeningRoutes");
const sessionRoutes = require("./routes/sessions.routes");
const guestUsersRoutes = require("./routes/guestUsersRoutes");
const requireSuperUser = require("./middleware/requireSuperUser");
const errorHandler = require("./middleware/errorHandler");

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

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Initialize database
initDb();

// Routes
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
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

// Error handler (must be last)
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
