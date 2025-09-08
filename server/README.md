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

Create a `.env` file (or configure your deployment environment) with the following variables before starting the server:

```
TWILIO_SID=<your Twilio account SID>
TWILIO_AUTH=<your Twilio auth token>
TWILIO_PHONE=<your Twilio phone number>
SERVER_BASE_URL=<public base URL of this server>
```

`SERVER_BASE_URL` is used to construct webhook URLs (e.g., Twilio voice and status callbacks).

🔌 API Endpoints
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