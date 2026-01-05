import express from 'express';
import path from 'path';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import helmet from 'helmet';
import { fileURLToPath } from 'url';
import { Server } from 'socket.io';

import leadsRoutes from './routes/leads.js';
import actionsRoutes from './routes/actions.js';
import phoneRoutes from './routes/phoneRoutes.js';
import simulationRoutes from './routes/simulationRoutes.js';
import webhookRoutes from './routes/webhook.js';
import schedulerRoutes from './routes/schedulerRoutes.js';
import authRoutes from './routes/auth.js';
import { startScheduler } from './services/callScheduler.js';
import { initLeadStore } from './services/leadStore.js';
import { ensureCsrfCookie, requireCsrf } from './middleware/csrf.js';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Load environment variables
// - Local dev: load repo-root .env.development
// - Production:
//   - If repo-root .env.production exists (local prod run), load it
//   - Otherwise rely on platform-provided env vars (Render)
const repoRoot = path.join(__dirname, '..');
const devEnvPath = path.join(repoRoot, '.env.development');
const prodEnvPath = path.join(repoRoot, '.env.production');

if (process.env.NODE_ENV === 'production') {
  const usingProdFile = fs.existsSync(prodEnvPath);
  dotenv.config(usingProdFile ? { path: prodEnvPath } : undefined);
  console.log(`🔧 Env: production (${usingProdFile ? 'loaded .env.production' : 'platform env'})`);
} else {
  const usingDevFile = fs.existsSync(devEnvPath);
  dotenv.config(usingDevFile ? { path: devEnvPath } : undefined);
  console.log(`🔧 Env: development (${usingDevFile ? 'loaded .env.development' : 'process env'})`);
}

const app = express();
const server = http.createServer(app);

const isProduction = process.env.NODE_ENV === 'production';

// If deployed behind Render/Heroku/etc (TLS terminates at proxy), this is required
// for secure cookies and correct protocol detection.
if (isProduction) {
  app.set('trust proxy', 1);
}
const defaultOrigins = isProduction
  ? []
  : ['http://localhost:5173'];

const corsOrigins = (process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean)
  : defaultOrigins);

const corsOptions = {
  origin: corsOrigins.length ? corsOrigins : undefined,
  credentials: true,
};

const io = new Server(server, {
  cors: {
    origin: corsOptions.origin,
    credentials: true,
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3000;

// ✅ Middleware (ensure order)
app.use(
  helmet({
    // We can tighten CSP later once we inventory all external assets.
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);
app.use(cors(corsOptions));
app.use(cookieParser());
// ✅ Compress API responses (helps bandwidth + memory for large payloads like leads)
app.use(
  compression({
    // Respect explicit opt-out
    filter: (req, res) => {
      if (req.headers['x-no-compression']) return false;
      return compression.filter(req, res);
    },
  })
);
app.use(express.json()); // Parses application/json
app.use(express.urlencoded({ extended: true })); // Parses application/x-www-form-urlencoded

// CSRF (double-submit cookie): ensure token cookie exists for browser clients.
app.use(ensureCsrfCookie);

// ✅ Attach Socket.IO to app for access in routes/controllers
app.set('io', io);

// ✅ Routes
app.use('/api/auth', authRoutes);
app.use('/api/leads/webhook', webhookRoutes);
// Require CSRF for state-changing requests on authenticated API routes.
// (Webhooks are excluded because they are called by Twilio.)
app.use('/api/leads', requireCsrf, leadsRoutes);
app.use('/api/actions', requireCsrf, actionsRoutes);
app.use('/api/phone', requireCsrf, phoneRoutes);
app.use('/api/simulation', simulationRoutes);
app.use('/api/scheduler', schedulerRoutes);

// ✅ Health check (Render uses this for deploy verification)
app.get('/api/health', (req, res) => {
  res.status(200).json({ ok: true });
});

// ✅ Start scheduled jobs
startScheduler();

// ✅ Warm the lead store (async). This avoids repeated JSON parse + sync disk I/O per request.
initLeadStore().catch((err) => {
  console.error('❌ Failed to initialize lead store:', err);
});

// ✅ Socket.IO events
io.on('connection', (socket) => {
  console.log('⚡ Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});

// ✅ Start server
server.listen(PORT, () => {
  console.log(`✅ Server with Socket.IO running on http://localhost:${PORT}`);
});
