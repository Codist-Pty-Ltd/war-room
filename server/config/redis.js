const Redis = require("ioredis");

const host = process.env.REDIS_HOST || "localhost";
const port = parseInt(process.env.REDIS_PORT || "6379", 10);

const redis = new Redis({
  host,
  port,
  password: process.env.REDIS_PASSWORD || undefined,
  connectTimeout: 5000,
  retryStrategy: (times) => {
    if (times > 10) return null;
    return Math.min(times * 200, 2000);
  },
  lazyConnect: true,
});

redis.on("connect", () => console.log(`Redis connected (${host}:${port})`));
redis.on("error", (err) => console.warn("Redis error:", err.message));

module.exports = redis;
