const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");

function loadWithEnv(env) {
  const keys = [
    "WAR_ROOM_APP_USER",
    "WAR_ROOM_APP_PASSWORD",
    "WAR_ROOM_SESSION_SECRET",
  ];
  const prev = {};
  for (const k of keys) {
    prev[k] = process.env[k];
    if (env[k] === undefined) delete process.env[k];
    else process.env[k] = env[k];
  }
  const sessionPath = path.join(__dirname, "..", "utils", "appSession.js");
  const modPath = path.join(__dirname, "..", "middleware", "requireAppSession.js");
  delete require.cache[require.resolve(sessionPath)];
  delete require.cache[require.resolve(modPath)];
  const requireAppSession = require(modPath);
  const restore = () => {
    for (const k of keys) {
      if (prev[k] === undefined) delete process.env[k];
      else process.env[k] = prev[k];
    }
    delete require.cache[require.resolve(sessionPath)];
    delete require.cache[require.resolve(modPath)];
  };
  return { requireAppSession, restore };
}

test("requireAppSession: no-op when app auth unset", async (t) => {
  const { requireAppSession, restore } = loadWithEnv({});
  t.after(restore);
  let next = 0;
  await new Promise((resolve) => {
    requireAppSession(
      { headers: {} },
      { status() {}, json() {} },
      () => {
        next += 1;
        resolve();
      },
    );
  });
  assert.equal(next, 1);
});

test("requireAppSession: 401 when auth enabled and no cookie", async (t) => {
  const { requireAppSession, restore } = loadWithEnv({
    WAR_ROOM_APP_USER: "alice",
    WAR_ROOM_APP_PASSWORD: "x",
    WAR_ROOM_SESSION_SECRET: "1234567890123456",
  });
  t.after(restore);
  let code;
  await new Promise((resolve) => {
    requireAppSession(
      { headers: {} },
      {
        status(c) {
          code = c;
          return this;
        },
        json() {
          resolve();
        },
      },
      () => assert.fail("next should not run"),
    );
  });
  assert.equal(code, 401);
});

test("requireAppSession: next when valid super session cookie", async (t) => {
  const { requireAppSession, restore } = loadWithEnv({
    WAR_ROOM_APP_USER: "alice",
    WAR_ROOM_APP_PASSWORD: "x",
    WAR_ROOM_SESSION_SECRET: "1234567890123456",
  });
  t.after(restore);
  let sess;
  const req = {
    session: { username: "alice", role: "super" },
  };
  await new Promise((resolve) => {
    requireAppSession(req, { status() {}, json() {} }, () => {
      sess = req.appSession;
      resolve();
    });
  });
  assert.equal(sess.username, "alice");
  assert.equal(sess.role, "super");
});
