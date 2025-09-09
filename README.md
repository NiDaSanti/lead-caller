# Solar Lead Call Manager

The Solar Lead Call Manager is a full-stack application for qualifying, engaging, and managing solar prospects.
It combines a React frontend with a Node.js/Express backend and is designed for future integration with Twilio and OpenAI.

## Project Structure

- **client/** – React Vite frontend for interacting with and reporting on leads.
- **server/** – Node.js backend that stores lead data and exposes REST APIs.

Each subdirectory contains its own README with detailed documentation and setup steps.

## Quick Start

1. **Install dependencies** for both client and server:
   ```bash
   cd client && npm install
   cd ../server && npm install
   ```
2. **Run the development servers** in separate terminals:
   ```bash
   cd client && npm run dev
   cd server && node server.js
   ```
3. The frontend runs on `http://localhost:5173` and expects the backend at `http://localhost:3000`.

## Features

- Lead management with status tracking, notes, and call history
- Simulation tools for guided call dialogues
- Report generation with PDF export
- Planned Twilio calling and OpenAI-assisted conversations

## License

This project is provided as-is without an explicit license. Contact the repository owner for usage questions.

