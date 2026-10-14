const { createClient } = require("redis");

const host = process.env.REDIS_HOST || "localhost";
const port = parseInt(process.env.REDIS_PORT || "6379", 10);
const password = process.env.REDIS_PASSWORD || undefined;

let client;

async function connectSessionRedis() {
  if (client?.isOpen) return client;

  client = createClient({
    socket: { host, port },
    password: password || undefined,
  });

  client.on("error", (err) =>
    console.warn("Session Redis error:", err.message),
  );

  await client.connect();
  console.log(`Session Redis connected (${host}:${port})`);
  return client;
}

function getSessionRedis() {
  return client;
}

module.exports = { connectSessionRedis, getSessionRedis };
