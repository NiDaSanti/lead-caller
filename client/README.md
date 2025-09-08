☀️ AI-Powered Solar Lead Manager – Frontend
Welcome to the frontend of the Solar Lead Call Manager — a purpose-built app for qualifying, engaging, and managing solar prospects with future support for Twilio-powered automated calls and OpenAI-enhanced voice scripting.

This interface was designed to be fast, intuitive, and conversion-focused, supporting lead data input, interaction tracking, reporting, and team training — all from one elegant dashboard.

🛠️ Tech Stack
Tool	Purpose
React.js	Component-based UI, state management
Chakra UI	Responsive and modern UI design system
HTML2PDF.js	PDF report export for lead call summaries
LocalStorage	Persist filter and layout preferences
Fetch API	Communicates with backend (Node/Express API)
No Router	Uses modals and buttons to navigate UI views

📁 Project Structure
bash
Copy
Edit
/frontend
  ├── App.jsx                  # Main root component
  ├── components/
  │   ├── LeadForm.jsx         # Form to submit new leads
  │   ├── LeadCard.jsx         # Individual lead cards (with modals)
  │   ├── LeadList.jsx         # Grouped lead view by status
  │   ├── DashboardView.jsx    # Metrics + analytics modal
  │   ├── ReportsView.jsx      # Lead summaries + PDF export
  │   └── SettingsPanel.jsx    # App controls (theme, automation)
  ├── App.css
  └── assets/
      └── leadManager.png
🔑 Features
🔹 Lead Management
Add new leads (name, phone)

Auto-generate timestamps

Assign status (New, Scheduled, Answered, etc.)

Record Q&A call conversations

Add and save internal notes

Auto-save lead updates to server

🔹 Call Simulation
Structured question flow per lead

Simulates real call dialog

Saves answers to lead history

Marks lead as Answered

Timestamp tracking (lastContacted)

🔹 Report Viewer
Opens modal with:

Lead info

Editable notes field

Q&A history

Unique Report ID

One-click PDF export for offline use

🔹 Dashboard View
Total leads

Leads per status

Daily leads generated

Optional chart or progress tracking

🔹 Settings Panel
Toggle UI preferences

Manage automation flags (future AI & call integration)

Dark mode / light mode toggle

Control for script styles (future)

🔹 Filters + Grouping
Smart filter buttons: All, Qualified, Answered, etc.

Leads are grouped by status with visual section headers

Each lead card is interactive and expandable

💾 Persistent Preferences (Saved in localStorage)
Preference	Key	Description
Form toggle	showForm	Controls if form is expanded/collapsed
Lead list toggle	showLeads	Controls if leads are shown
Filter selection	leadFilter	Last used lead status filter
Theme	Chakra colorMode	Light / dark preference

🖼️ UI Preview
Screens include:

🌄 Navbar with theme toggle and modal routes

📝 LeadForm with validation

📁 LeadList grouped by status, animated cards

📊 Dashboard modal with metrics

📋 Reports modal with summary + PDF download

⚙️ Settings modal for future AI controls

✨ Light and dark mode supported natively via Chakra UI

🚀 How to Run the Frontend
1. Install Dependencies
bash
Copy
Edit
npm install
2. Start Development Server
bash
Copy
Edit
npm run dev
This will open localhost:5173 (or next available port) and serve the UI.

3. Backend Required
Ensure the backend API is also running at:

bash
Copy
Edit
http://localhost:3000/api/leads
📎 File I/O (server communication)
GET /api/leads → Load all leads

POST /api/leads → Add a new lead

PUT /api/leads/:id → Update lead with answers, notes, or status

📥 CSV Upload Format
You can bulk upload leads via a CSV file. Ensure the first row contains these headers:

```
firstName,lastName,phone,street,city,state,zip,note
```

Each subsequent row should provide the lead's details. The `note` column is optional.

✅ What’s Ready
Fully functioning UI to manage, qualify, and report on leads

Report export + call history + notes

Local state + persistent preferences

Modal-based navigation

Responsive and animated UI

🔜 What’s Next (Phase 4+)
🤖 Twilio Integration: initiate real outbound phone calls

🧠 OpenAI Integration: real-time AI-generated questions + responses

📅 Scheduling: follow-ups, appointment times

📈 Performance Tracking: lead scoring, conversions, charts

🏢 Multi-user Support: agent dashboards, user roles

👨‍💻 Author
Nick Santiago
Solar Consultant | AI Sales Innovator | Full-stack Dev
Built with speed, purpose, and heart. ☀️⚡🧠