☀️ Solar Lead Call Manager – Backend
This is the backend of the Solar Lead Call Manager. It handles all logic and storage behind the scenes to power the frontend React app. This server provides API endpoints for adding, updating, and retrieving solar lead data. It uses environment-specific JSON files (e.g., `data/dev/leads.json`) for local storage and is designed to be easily upgraded to a real database in the future.

📁 Directory Structure
graphql
Copy
Edit
backend/
├── controllers/
│   └── leadsController.js      # Logic for handling lead data (GET, POST, PUT)
├── data/
│   └── {env}/leads.json        # JSON file containing all lead records for the given environment
├── routes/
│   └── leadsRoutes.js          # Defines REST API routes
├── server.js                   # Main Express server entry point
├── README.md                   # This file
🚀 Getting Started
1. Install dependencies
bash
Copy
Edit
npm install
2. Run the backend server
bash
Copy
Edit
node server.js
The server will start on:
📡 http://localhost:3000

🛠️ Environment Variables

Create a `.env` file **one level above the `server` directory** (or configure your deployment environment) with the following variables before starting the server. The file must define `ADMIN_USERNAME` and either `ADMIN_PASSWORD_HASH` (SHA-256) or `ADMIN_PASSWORD`:

```
TWILIO_SID=<your Twilio account SID>
TWILIO_AUTH=<your Twilio auth token>
TWILIO_PHONE_DEV=<Twilio phone number for development>
TWILIO_PHONE_PROD=<Twilio phone number for production>
SERVER_BASE_URL=<public base URL of this server>
ADMIN_USERNAME=<admin login name>
ADMIN_PASSWORD_HASH=<sha256 hash of admin password>
# or
ADMIN_PASSWORD=<admin password>
RATE_LIMIT_MAX_REQUESTS=100
OPENAI_API_KEY=<your OpenAI API key>
# optional overrides
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_TEMPERATURE=0.7
# limit calls during development
OPENAI_DEV_MAX_CALLS=50
```

`RATE_LIMIT_MAX_REQUESTS` controls how many requests per minute each IP may make (default `100`).
Authenticated `/bulk-upload` routes are excluded from rate limiting when a valid `Authorization` header is present.

`SERVER_BASE_URL` is used to construct webhook URLs (e.g., Twilio voice and status callbacks).

### Deployment readiness check

Before shipping to staging or production you can verify that all AI and Twilio prerequisites are satisfied:

```bash
npm run check:deploy -- --env production
```

The script loads your `.env` file (pass a custom one with `--env-file path/to/.env`) and confirms that:

- OpenAI credentials and any optional tuning variables are present so the assistant can generate replies.
- Twilio credentials, phone numbers, and a public `SERVER_BASE_URL` are available for outbound calls and webhooks.
- Scheduler and lead datastore files exist or are flagged if they still need to be created for the chosen environment.

Address any reported errors before deploying to ensure automated calls and AI responses work end-to-end.

## Deploying (Render)

This backend is ready to deploy to **Render** even if you haven't configured Twilio/OpenAI yet.

### Render settings

- **Root directory:** `server`
- **Build command:** `npm install`
- **Start command:** `npm start`

### Required environment variables (minimum)

Set these in Render → Service → Environment:

- `NODE_ENV=production`
- `CORS_ORIGINS=https://<your-netlify-site>.netlify.app`
- `ADMIN_USERNAME=...`
- `ADMIN_PASSWORD_HASH=...` (recommended) or `ADMIN_PASSWORD=...`

### Optional (can be added later)

- Twilio: `TWILIO_SID`, `TWILIO_AUTH`, `TWILIO_PHONE_PROD`
- OpenAI: `OPENAI_API_KEY`
- If/when you enable Twilio webhooks: `SERVER_BASE_URL=https://<your-render-service>.onrender.com`

### Health check

After deploy, verify:

- `GET /api/health` returns `{ ok: true }`

### OpenAI setup

1. Create an account at [OpenAI](https://platform.openai.com/).
2. Generate a key under **API Keys** and place it in `OPENAI_API_KEY`.
3. (Optional) Set `OPENAI_MODEL` and `OPENAI_TEMPERATURE` to adjust the model and temperature used for completions.
4. (Optional) Use `OPENAI_DEV_MAX_CALLS` to cap the number of requests in development.

As of 2024, `gpt-3.5-turbo` costs roughly **$0.50 per 1M input tokens** and **$1.50 per 1M output tokens** (see [pricing](https://openai.com/pricing) for updates). You can monitor your usage and remaining quota at [Usage](https://platform.openai.com/account/usage).

Generate `ADMIN_PASSWORD_HASH` with:

```
node -e "console.log(require('crypto').createHash('sha256').update('yourpassword').digest('hex'))"
```

All API routes (except `/api/auth/*` and `/api/leads/webhook`) require an `Authorization: Bearer <token>` header obtained via `POST /api/auth/login`.

🔌 API Endpoints
POST /api/auth/login
Authenticate and receive a bearer token.

Request Body:

```json
{ "username": "admin", "password": "secret" }
```

Response:

```json
{ "token": "..." }
```

POST /api/auth/logout
Invalidate the current token. Requires `Authorization` header.

GET /api/leads
Retrieve all existing leads.

Response:

json
Copy
Edit
[
  {
    "id": 1720398432510,
    "firstName": "Jane",
    "lastName": "Doe",
    "phone": "123-456-7890",
    "status": "Scheduled",
    "note": "Follow-up on Friday",
    "timestamp": "2025-07-08T01:23:45.678Z",
    "answers": [ ... ],
    "callHistory": [ ... ]
  }
]
POST /api/leads
Add a new lead.

Request Body:

json
Copy
Edit
{
  "firstName": "John",
  "lastName": "Smith",
  "phone": "987-654-3210"
}

POST /api/leads/webhook
Receive new lead data from external providers.

Request Body:

```json
{
  "firstName": "John",
  "lastName": "Smith",
  "phone": "+15551234567",
  "address": {
    "street": "123 Main St",
    "city": "Springfield",
    "state": "CA",
    "zip": "90210"
  },
  "note": "Optional note about the lead"
}
```

All fields are required except `note`.

PUT /api/leads/:id
Update an existing lead (notes, status, responses, etc.).

Request Body:

json
Copy
Edit
{
  "id": 1720398432510,
  "status": "Answered",
  "answers": [ ... ],
  "note": "Follow-up next week"
}
🧠 Frontend Integration
This backend connects directly with the frontend React app. All fetch requests in the UI are handled by the routes defined here.

Used In:
App.jsx – Retrieves all leads from /api/leads

LeadForm.jsx – Submits new leads via POST /api/leads

LeadCard.jsx – Updates answers, status, and notes via PUT /api/leads/:id

Reports Modal – Pulls and displays JSON data for summaries

📦 Data Model
Stored inside data/leads.json as an array of objects.

Example Lead Structure:
json
Copy
Edit
{
  "id": 1720398432510,
  "firstName": "Jane",
  "lastName": "Doe",
  "phone": "123-456-7890",
  "status": "Qualified",
  "timestamp": "2025-07-08T01:23:45.678Z",
  "note": "Very interested in stable energy costs.",
  "answers": [
    { "q": "Who pays the electric bill?", "a": "Me." },
    ...
  ],
  "callHistory": [
    { "timestamp": "2025-07-08T01:45:00Z", "questions": [...] }
  ]
}

📞 Twilio Setup
1. **Upgrade your account**
   - Trial accounts can only call verified numbers and play a trial notice.
   - Upgrade in the Twilio Console to remove these restrictions.
2. **Purchase a phone number**
   - In the Twilio Console, go to *Phone Numbers → Buy* and select a voice-capable number.
   - Use a separate number for development and production if needed.
3. **Collect credentials & set environment variables**
   - In the Twilio Console dashboard, copy your **Account SID** and **Auth Token**.
   - Set them as `TWILIO_SID` and `TWILIO_AUTH` in your `.env` file.
   - Assign your phone number to `TWILIO_PHONE_DEV` or `TWILIO_PHONE_PROD` depending on the environment.
   - `SERVER_BASE_URL` should be the public URL of this server for Twilio webhooks.
4. **Configure webhooks**
   - Voice URL: `${SERVER_BASE_URL}/api/phone/voice`
   - Status callback URL: `${SERVER_BASE_URL}/api/phone/status-callback`
   - Set these under your Twilio phone number's **Voice & Fax** settings.

📊 Future Features & Roadmap
✅ Save live notes and updates
🔄 Transition from JSON to PostgreSQL or MongoDB
☎️ Voice call automation with Twilio integration
🤖 AI-assisted lead conversations with OpenAI
📄 PDF & CSV report generation
📬 Automatic follow-up email system

👨‍💻 Author
Nick Santiago
Solar Consultant • Tech Builder • AI Sales Trainer