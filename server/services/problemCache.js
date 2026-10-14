const redis = require("../config/redis");
const CACHE_TTL = 60 * 60 * 24;

async function getCachedProblem(key) {
  const cached = await redis.get(`problem:${key}`);
  return cached ? JSON.parse(cached) : null;
}

async function cacheProblem(key, problem) {
  await redis.setex(`problem:${key}`, CACHE_TTL, JSON.stringify(problem));
}

async function invalidateProblem(key) {
  await redis.del(`problem:${key}`);
}

module.exports = { getCachedProblem, cacheProblem, invalidateProblem };
