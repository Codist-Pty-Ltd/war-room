const { isAppAuthEnabled } = require("../utils/appSession");

/**
 * When WAR_ROOM_APP_USER is set, requires a valid Redis-backed express session.
 * Otherwise no-op (public API for local/dev without app login).
 */
function requireAppSession(req, res, next) {
  if (!isAppAuthEnabled()) {
    return next();
  }
  if (!req.session?.username) {
    res.status(401).json({ error: "Sign in required" });
    return;
  }
  const role = req.session.role === "guest" ? "guest" : "super";
  req.appSession = { username: req.session.username, role };
  next();
}

module.exports = requireAppSession;
