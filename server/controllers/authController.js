const GuestUser = require("../models/GuestUser");
const {
  isAppAuthEnabled,
  timingSafeStringEq,
  cookieOptions,
  getSuperUser,
  getSuperPassword,
  SUPER_MAX_AGE_SEC,
} = require("../utils/appSession");
const {
  recordFailedLogin,
  clearLoginAttempts,
} = require("../middleware/rateLimiter");

function readExpressSession(req) {
  if (!req.session?.username) return null;
  const role = req.session.role === "guest" ? "guest" : "super";
  return { username: req.session.username, role };
}

function status(req, res) {
  const enabled = isAppAuthEnabled();
  if (!enabled) {
    res.json({ authRequired: false, authenticated: true });
    return;
  }
  const session = readExpressSession(req);
  res.json({
    authRequired: true,
    authenticated: Boolean(session),
    username: session?.username,
    role: session?.role,
  });
}

function login(req, res) {
  if (!isAppAuthEnabled()) {
    res.status(400).json({ error: "App login is not configured" });
    return;
  }
  const superUser = getSuperUser();
  const expectedPass = getSuperPassword();
  if (!expectedPass) {
    res.status(500).json({ error: "Server misconfiguration" });
    return;
  }

  const body = req.body && typeof req.body === "object" ? req.body : {};
  const username = typeof body.username === "string" ? body.username : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (
    timingSafeStringEq(username.trim(), superUser) &&
    timingSafeStringEq(password, expectedPass)
  ) {
    void clearLoginAttempts(req);
    req.session.username = superUser;
    req.session.role = "super";
    req.session.cookie.maxAge = SUPER_MAX_AGE_SEC * 1000;
    req.session.save((err) => {
      if (err) {
        console.error("[auth] session.save failed:", err.message);
        res.status(500).json({
          error:
            "Could not create session — is Redis running? Try: docker compose up redis",
        });
        return;
      }
      res.json({ ok: true, role: "super" });
    });
    return;
  }

  const guest = GuestUser.verifyLogin(username.trim(), password);
  if (!guest) {
    void recordFailedLogin(req, res).then((blocked) => {
      if (blocked) return;
      res.status(401).json({ error: "Invalid username or password" });
    });
    return;
  }

  void clearLoginAttempts(req);

  const remainingMs = new Date(guest.expiresAt).getTime() - Date.now();
  if (remainingMs <= 0) {
    res.status(401).json({ error: "This guest pass has expired" });
    return;
  }
  const maxAgeSec = Math.max(60, Math.ceil(remainingMs / 1000));
  req.session.username = guest.username;
  req.session.role = "guest";
  req.session.cookie.maxAge = maxAgeSec * 1000;
  req.session.save((err) => {
    if (err) {
      console.error("[auth] session.save failed:", err.message);
      res.status(500).json({
        error:
          "Could not create session — is Redis running? Try: docker compose up redis",
      });
      return;
    }
    res.json({ ok: true, role: "guest" });
  });
}

function logout(req, res) {
  if (!req.session) {
    res.json({ ok: true });
    return;
  }
  req.session.destroy((err) => {
    if (err) {
      res.status(500).json({ error: "Could not end session" });
      return;
    }
    res.clearCookie("connect.sid", cookieOptions());
    res.json({ ok: true });
  });
}

module.exports = { status, login, logout };
