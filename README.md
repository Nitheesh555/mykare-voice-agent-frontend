# Mykare Voice Agent — Frontend

React + TypeScript + Vite frontend for the Mykare AI voice appointment agent. Connects to LiveKit for real-time voice, streams tool events from the backend, and displays call summaries.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript |
| Build | Vite |
| Styling | Tailwind CSS v4 |
| Voice | LiveKit Components + livekit-client |
| HTTP | Axios |
| Icons | Lucide React |

## Features

- Welcome screen with participant name entry
- Live voice call UI with mute/unmute controls
- Real-time tool event feed (e.g. "Fetching slots...", "Booking confirmed")
- Post-call summary screen — conversation summary, appointments, cost breakdown
- Connects to any backend via `VITE_BACKEND_URL` env variable

## Local Development

**Requirements:** Node.js 18+

```bash
# 1. Install dependencies
npm install

# 2. Copy and fill in environment variables
cp .env.example .env

# 3. Start the dev server
npm run dev
```

App runs at `http://localhost:5173`.  
Make sure the backend is running at the URL set in `VITE_BACKEND_URL`.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_BACKEND_URL` | Backend API base URL. Defaults to `http://localhost:8000` if not set. |

## Build

```bash
npm run build
```

Production assets are output to `dist/`.

## Deployment — Vercel

The project includes a `vercel.json` pre-configured for Vercel deployment.

1. Push this repo to GitHub
2. [Vercel](https://vercel.com) → **Add New Project** → import this repo
3. Vercel auto-detects Vite — no framework config needed
4. Under **Environment Variables**, add:
   ```
   VITE_BACKEND_URL=https://your-backend.up.railway.app
   ```
5. Click **Deploy**

Vercel provides a live URL immediately after deploy.

## Project Structure

```
src/
├── components/
│   ├── WelcomeScreen.tsx   # Name entry and call start
│   ├── ActiveCall.tsx      # Live voice UI + tool event feed
│   └── SummaryScreen.tsx   # Post-call summary and appointments
├── lib/
│   └── api.ts              # Typed API client (axios)
└── App.tsx                 # Root — manages screen state
```
