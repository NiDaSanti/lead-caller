import express from 'express';
import path from 'path';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Load environment variables based on NODE_ENV
const envFile = process.env.NODE_ENV === 'production'
  ? '.env.production'
  : '.env.development';
dotenv.config({ path: path.join(__dirname, '..', envFile) });

const app = express();
const server = http.createServer(app);

const isProduction = process.env.NODE_ENV === 'production';
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
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json()); // Parses application/json
app.use(express.urlencoded({ extended: true })); // Parses application/x-www-form-urlencoded

// ✅ Attach Socket.IO to app for access in routes/controllers
app.set('io', io);

// ✅ Routes
app.use('/api/auth', authRoutes);
app.use('/api/leads/webhook', webhookRoutes);
app.use('/api/leads', leadsRoutes);
app.use('/api/actions', actionsRoutes);
app.use('/api/phone', phoneRoutes);
app.use('/api/simulation', simulationRoutes);
app.use('/api/scheduler', schedulerRoutes);

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
