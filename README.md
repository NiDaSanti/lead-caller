# Lead Caller (Call Leads)

A full-stack app to manage leads and run AI-assisted phone calls.

- **Client:** React + Vite + Chakra UI (`/client`)
- **Server:** Node + Express (`/server`)
- **Storage:** JSON files on disk (per-environment) under `server/data/*`

> This README focuses on what you need to deploy successfully and how to run the system locally.

## What you need to deploy successfully

### 1) Accounts / third-party services

- **Twilio account** (Voice enabled)
  - Account SID + Auth Token
  - A voice-capable phone number
  - Trial accounts can only call verified numbers and may play a trial message.

- **OpenAI account**
  - API key with access to the model you choose
  - Budget/limits set appropriately for your call volume

### 2) Hosting / infrastructure

You need a place to run the **server** and host the **client**.

- **Server hosting** (one of):
  - Render / Railway / Fly.io / Heroku-style platform
  - VPS (Docker or Node process manager)

- **Client hosting** (one of):
  - Vercel / Netlify / Cloudflare Pages
  - Serve the built `client/dist` behind Nginx

### 3) Public HTTPS URL for the server (required for Twilio)

Twilio will call back into your server (webhooks). For production you should have:

- `SERVER_BASE_URL` publicly reachable
- **HTTPS** strongly recommended/expected

### 4) Environment variables (server)

The server reads its configuration from environment variables. A production example is provided in:

- `.env.production.example`

Required variables:

- `NODE_ENV=production`
- `PORT` (your host sets this sometimes)
- `LEADS_FILE` (path to JSON datastore)
- `SCHEDULER_FILE` (path to scheduler config)
- `OPENAI_API_KEY`
- `TWILIO_SID`
- `TWILIO_AUTH`
- `TWILIO_PHONE_PROD` (E.164 format: `+15551234567`)
- `SERVER_BASE_URL` (example: `https://your-domain.com`)
- `ADMIN_USERNAME`
- Either `ADMIN_PASSWORD` **or** `ADMIN_PASSWORD_HASH`

Optional variables:

- `OPENAI_MODEL` (defaults to `gpt-3.5-turbo`)
- `OPENAI_TEMPERATURE` (defaults to `0.7`)
- `OPENAI_DEV_MAX_CALLS` (development only)
- `RATE_LIMIT_MAX_REQUESTS` (default `100`)

#### Admin password hash

You can generate a SHA-256 hash like this:

```bash
node -e "console.log(require('crypto').createHash('sha256').update('yourpassword').digest('hex'))"
```

### 5) Data files / persistent storage

This app uses JSON files on disk. For production you must ensure your host has **persistent storage**.

- `LEADS_FILE` example: `server/data/prod/leads.json`
- `SCHEDULER_FILE` example: `server/data/prod/scheduler.json`

Notes:

- If you deploy to an environment with **ephemeral disk**, your leads will reset on redeploy.
- Consider switching to a database later (Postgres/Mongo) if you need durability.

### 6) Twilio Webhooks

Your Twilio phone number needs to point to your public server URLs.

Typical endpoints (see server routes for your exact paths):

- Voice URL: `${SERVER_BASE_URL}/api/phone/voice`
- Status callback: `${SERVER_BASE_URL}/api/phone/status-callback`

### 7) Client configuration (API URL)

The client calls the server using a configurable API base:

- `VITE_API_BASE_URL` (recommended for production)
- otherwise it defaults to same-origin and uses relative paths like `/api/*`.

For local development, the Vite dev server proxies `/api/*` to `http://127.0.0.1:3000`.

## Deployment readiness check

The server includes a script that validates environment variables and file paths:

```bash
cd server
npm run check:deploy -- --env production
```

You can also pass a custom env file:

```bash
cd server
npm run check:deploy -- --env production --env-file ../.env
```

## Local development

### Server

```bash
cd server
npm install
npm run dev
```

Server runs at:

- `http://localhost:3000`

### Client

```bash
cd client
npm install
npm run dev
```

Client runs at:

- `http://localhost:5173`

## Production build

### Client

```bash
cd client
npm run build
```

### Server

Run your server using your host’s recommended process manager (or `node server.js`).

## Troubleshooting

- **Dashboard modal blank / errors**
  - Ensure the client bundle is up to date and the server is reachable.

- **Login fails**
  - Verify `ADMIN_USERNAME` and `ADMIN_PASSWORD`/`ADMIN_PASSWORD_HASH` on the server.
  - Check server logs for auth errors.

- **Twilio calls fail**
  - Confirm `SERVER_BASE_URL` is public and HTTPS.
  - Confirm Twilio webhooks are configured to point to your server.
  - Confirm `TWILIO_PHONE_PROD` is in E.164 format.

- **Leads not saving in production**
  - Your host may have ephemeral disk. Use persistent storage or a database.

## Repo layout

- `client/` – React UI
- `server/` – Express API + Twilio/OpenAI integrations

## Deploying (Render for server + Netlify for client)

Yes — this is a common setup and works well:

- **Render** runs your Express API (and provides a stable HTTPS URL for Twilio webhooks)
- **Netlify** serves your Vite-built static UI

### Deploy the server on Render

1) Create a new **Web Service** on Render

- Connect your GitHub repo
- Root directory: `server`

2) Build + start commands

- **Build Command:** `npm install`
- **Start Command:** `node server.js`

3) Environment variables (Render → Environment)

Minimum recommended set:

- `NODE_ENV=production`
- `PORT` (Render sets this automatically; you usually don’t need to set it)
- `SERVER_BASE_URL=https://<your-render-service>.onrender.com`
- `CORS_ORIGINS=https://<your-netlify-site>.netlify.app`

Data paths (use the prod datastore location):

- `LEADS_FILE=server/data/prod/leads.json`
- `SCHEDULER_FILE=server/data/prod/scheduler.json`

Auth:

- `ADMIN_USERNAME=...`
- `ADMIN_PASSWORD=...` (or `ADMIN_PASSWORD_HASH=...`)

Twilio (required for real calling in production):

- `TWILIO_SID=...`
- `TWILIO_AUTH=...`
- `TWILIO_PHONE_PROD=+15551234567`

OpenAI:

- `OPENAI_API_KEY=...`

4) Twilio webhooks (point Twilio to Render)

Set these to your Render URL (examples):

- Voice URL: `https://<your-render-service>.onrender.com/api/phone/voice`
- Status callback: `https://<your-render-service>.onrender.com/api/phone/status-callback`

5) Persistent data note

This app stores leads in JSON files on disk. Render services typically have **ephemeral disk** unless you add a persistent disk. If you don’t add persistent storage, leads can reset on redeploy.

If you want durability:

- Add a Render **Disk** and point `LEADS_FILE`/`SCHEDULER_FILE` to a path on that disk, or
- Move storage to a database (future improvement)

### Deploy the client on Netlify

1) Create a new site on Netlify from Git

- Base directory: `client`

2) Build settings

- **Build command:** `npm run build`
- **Publish directory:** `dist`

3) Configure the API base URL (Netlify → Site configuration → Environment)

Set the server URL so the client can call your Render API:

- `VITE_API_BASE_URL=https://<your-render-service>.onrender.com`

Then redeploy.

4) Netlify (SPA) routing

This is a single-page app. If you get 404s on refresh, add a Netlify redirect file:

- `client/public/_redirects` containing: `/*    /index.html   200`

### Quick post-deploy checklist

- Visit the Netlify site and log in (admin creds)
- Confirm the browser can call:
  - `GET <render>/api/auth/session`
  - `GET <render>/api/leads` (after login)
- Confirm Twilio webhooks show successful requests when placing a call

