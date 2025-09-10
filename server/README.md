☀️ Solar Lead Call Manager – Backend
This is the backend of the Solar Lead Call Manager. It handles all logic and storage behind the scenes to power the frontend React app. This server provides API endpoints for adding, updating, and retrieving solar lead data. It uses a simple JSON file (leads.json) for local storage and is designed to be easily upgraded to a real database in the future.

📁 Directory Structure
graphql
Copy
Edit
backend/
├── controllers/
│   └── leadsController.js      # Logic for handling lead data (GET, POST, PUT)
├── data/
│   └── leads.json              # JSON file containing all lead records
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
```

`RATE_LIMIT_MAX_REQUESTS` controls how many requests per minute each IP may make (default `100`).
Authenticated `/bulk-upload` routes are excluded from rate limiting when a valid `Authorization` header is present.

`SERVER_BASE_URL` is used to construct webhook URLs (e.g., Twilio voice and status callbacks).

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