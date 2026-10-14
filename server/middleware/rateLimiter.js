const {
  RateLimiterRedis,
  RateLimiterMemory,
} = require("rate-limiter-flexible");
const redis = require("../config/redis");

let generationRateLimiter;
let loginRateLimiter;
let usingRedis = false;

function initRateLimiters(redisAvailable) {
  usingRedis = redisAvailable;
  const loginOpts = {
    keyPrefix: "rl:login",
    points: parseInt(process.env.LOGIN_RATE_LIMIT_MAX || "10", 10),
    duration: 60 * 15,
    blockDuration: 60 * 15,
  };
  const genOpts = {
    keyPrefix: "rl:generation",
    points: parseInt(process.env.GENERATE_RATE_LIMIT_MAX || "40", 10),
    duration: 15 * 60,
    blockDuration: 60,
  };

  if (redisAvailable) {
    loginRateLimiter = new RateLimiterRedis({ ...loginOpts, storeClient: redis });
    generationRateLimiter = new RateLimiterRedis({ ...genOpts, storeClient: redis });
    console.log("[rate-limit] Using Redis-backed limiters");
  } else {
    loginRateLimiter = new RateLimiterMemory(loginOpts);
    generationRateLimiter = new RateLimiterMemory(genOpts);
    console.warn("[rate-limit] Redis unavailable — using in-memory limiters (local dev)");
  }
}

function isRateLimitRejection(err) {
  return err && typeof err.msBeforeNext === "number";
}

async function generationLimiter(req, res, next) {
  if (!generationRateLimiter) {
    next();
    return;
  }
  try {
    await generationRateLimiter.consume(req.ip);
    next();
  } catch (rejRes) {
    if (!isRateLimitRejection(rejRes)) {
      console.warn("[rate-limit] Generation limiter error:", rejRes.message);
      next();
      return;
    }
    const retryAfter = Math.round(rejRes.msBeforeNext / 1000);
    res.set("Retry-After", String(retryAfter));
    res.status(429).json({
      error: "Too many requests",
      retryAfter,
    });
  }
}

/** Call after a failed login — returns true if the client should receive 429. */
async function recordFailedLogin(req, res) {
  if (!loginRateLimiter) return false;
  try {
    await loginRateLimiter.consume(req.ip);
    return false;
  } catch (rejRes) {
    if (!isRateLimitRejection(rejRes)) {
      console.warn("[rate-limit] Login limiter error:", rejRes.message);
      return false;
    }
    const retryAfter = Math.round(rejRes.msBeforeNext / 1000);
    res.set("Retry-After", String(retryAfter));
    res.status(429).json({
      error: "Too many login attempts",
      retryAfter,
    });
    return true;
  }
}

async function clearLoginAttempts(req) {
  if (!loginRateLimiter || !usingRedis) return;
  try {
    await loginRateLimiter.delete(req.ip);
  } catch {
    /* non-fatal */
  }
}

module.exports = {
  initRateLimiters,
  generationLimiter,
  recordFailedLogin,
  clearLoginAttempts,
};
