import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'crypto';

let express;
let authRouter;
try {
  express = (await import('express')).default;
  authRouter = (await import('./auth.js')).default;
} catch {
  // express not installed; tests will be skipped
}

const hash = (str) => crypto.createHash('sha256').update(str).digest('hex');

const testFn = express ? test : test.skip;

testFn('login succeeds with hashed and plaintext configurations', async (t) => {
  const makeServer = () => {
    const app = express();
    app.use(express.json());
    app.use('/auth', authRouter);
    return app.listen(0);
  };

  await t.test('with ADMIN_PASSWORD_HASH', async () => {
    process.env.ADMIN_USERNAME = 'admin';
    delete process.env.ADMIN_PASSWORD;
    process.env.ADMIN_PASSWORD_HASH = hash('secret');

    const server = makeServer();
    const { port } = server.address();
    const res = await fetch(`http://localhost:${port}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'secret' }),
    });
    const body = await res.json();
    assert.equal(res.status, 200);
    assert.ok(body.token);
    server.close();
  });

  await t.test('with ADMIN_PASSWORD', async () => {
    process.env.ADMIN_USERNAME = 'admin';
    process.env.ADMIN_PASSWORD = 'secret';
    delete process.env.ADMIN_PASSWORD_HASH;

    const server = makeServer();
    const { port } = server.address();
    const res = await fetch(`http://localhost:${port}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'secret' }),
    });
    const body = await res.json();
    assert.equal(res.status, 200);
    assert.ok(body.token);
    server.close();
  });
});
