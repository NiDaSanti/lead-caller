# Deployment Readiness Review

This document captures outstanding work before deploying the Lead Caller stack. It groups items into configuration, backend, frontend, and operational concerns.

## 1. Environment & Configuration
- **Environment files:** The backend loads `.env.production` or `.env.development` from the repository root. Confirm both files exist in your runtime environment or adjust the loader before deploying to hosted platforms.【F:server/server.js†L21-L25】
- **API credentials:** Twilio, OpenAI, and server URLs are all required at boot time. Missing values prevent the Twilio client from initializing and will surface as runtime errors. Validate `TWILIO_*`, `SERVER_BASE_URL`, and `OPENAI_*` secrets are injected wherever the server runs.【F:server/services/twilioService.js†L7-L52】【F:server/services/openaiClients.js†L3-L105】
- **Scheduler data files:** Auto-call scheduling reads and writes JSON files that are resolved from `NODE_ENV`. Ensure the target host provides writable storage at the configured path (or replace with a database/remote store).【F:server/utils/schedulerUtils.js†L8-L36】

## 2. Backend Hardening
- **CORS & Socket.IO origins:** Production currently allows only `http://localhost:5173`. External deployments need the real frontend origin (and `wss://` when behind HTTPS). Consider an environment-driven allowlist for both Express CORS and Socket.IO.【F:server/server.js†L29-L34】
- **File-backed persistence:** Lead data, scheduler state, and log archives use synchronous file writes. For production, plan for a shared volume, database migration, or at minimum file-locking/backups to avoid corruption under concurrent requests.【F:server/utils/leadUtils.js†L8-L38】【F:server/utils/logger.js†L4-L15】
- **Auth/session durability:** Access tokens are stored in-memory Sets, so restarting the process invalidates every session. Swap to stateless JWTs or a shared store (Redis/DB) to provide continuity across restarts and replicas.【F:server/middleware/auth.js†L3-L15】
- **Rate limiting:** The IP limiter also uses an in-memory Map that resets on deploy and cannot be shared across instances. Decide whether to keep it (understanding the limitation) or move to a distributed limiter.【F:server/middleware/rateLimit.js†L1-L27】
- **Phone/Twilio flow gaps:** Verify inbound call webhooks end-to-end. The controller currently mixes file- and service-level updates, relies on synchronous file mutations, and assumes `SERVER_BASE_URL` routes are reachable from Twilio. Add automated tests (or dry-run scripts) that exercise `/api/phone/*` before going live.【F:server/controllers/phoneController.js†L7-L209】【F:server/services/twilioService.js†L23-L52】
- **Scheduler throughput:** The cron scheduler tracks `availableCalls` in memory, so a process restart resets throttling and simultaneous instances could double-dial. Consider persisting quotas or delegating to an external job system.【F:server/services/callScheduler.js†L10-L55】

## 3. Frontend Preparation
- **API base URLs:** All fetch calls and the Socket.IO client point at `http://localhost:3000`. Extract these into Vite env variables (e.g., `VITE_API_BASE_URL`, `VITE_SOCKET_URL`) so production builds can target the deployed backend (and HTTPS).【F:client/src/App.jsx†L78-L140】【F:client/src/main.jsx†L14-L26】【F:client/src/components/Login.jsx†L23-L36】
- **Auth persistence:** Logout makes a best-effort network request but ignores failures. Consider surfacing errors and handling 401s globally (React Query, SWR, or interceptors) before rollout.【F:client/src/main.jsx†L14-L26】【F:client/src/App.jsx†L92-L142】
- **Build artifacts:** Confirm the Vite build output aligns with your hosting strategy (static CDN vs. served by Express). Document the exact `npm run build` and upload process in your release playbook.【F:client/package.json†L7-L18】

## 4. Operational To‑Dos
- **Testing & CI:** Only the lead utilities have automated coverage today. Add API integration tests (auth, leads CRUD, scheduler endpoints, Twilio mocks) and hook them into CI before shipping.【F:server/utils/leadUtils.test.js†L1-L40】
- **Observability:** File-based logs will not be visible in containerized hosts unless mounted. Consider structured logging to stdout and integrating with your monitoring stack.【F:server/utils/logger.js†L4-L15】
- **Health checks:** Add a lightweight `/healthz` endpoint and, if you containerize, expose it via readiness/liveness probes so orchestrators can monitor the service.【F:server/server.js†L46-L69】
- **Deployment runbook:** Capture the order of operations (migrations or data seeding, scheduler enablement, Twilio webhook registration) to reduce manual error. Document Twilio webhook URLs derived from `SERVER_BASE_URL` for quick setup.【F:server/services/twilioService.js†L35-L45】

Addressing these items will put the project on firmer ground for a stable production launch.
