import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import crypto from 'crypto';
import authRouter from './auth.js';
import { requireAuth } from '../middleware/auth.js';

const hash = (str) => crypto.createHash('sha256').update(str).digest('hex');

const makeServer = () => {
  const app = express();
  app.use(express.json());
  app.use('/auth', authRouter);
  app.get('/protected', requireAuth, (req, res) => res.json({ ok: true }));
  return app.listen(0);
};

test('login succeeds with hashed and plaintext configurations', async (t) => {
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

test('token expires after idle timeout', async (t) => {
  process.env.ADMIN_USERNAME = 'admin';
  process.env.ADMIN_PASSWORD = 'secret';
  process.env.TOKEN_IDLE_TIMEOUT_MS = '100';

  const server = makeServer();
  const { port } = server.address();
  const loginRes = await fetch(`http://localhost:${port}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'secret' }),
  });
  const { token } = await loginRes.json();
  assert.equal(loginRes.status, 200);

  // wait for token to expire
  await new Promise((r) => setTimeout(r, 150));

  const res = await fetch(`http://localhost:${port}/protected`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  assert.equal(res.status, 401);
  server.close();
});
