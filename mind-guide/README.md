# MIND-GUIDE: Predict, Decide, Thrive

A personal digital counselor for lifestyle and mental wellness.

## Tech Stack

- Frontend: React + Vite, Tailwind CSS, Framer Motion, Chart.js
- Backend: FastAPI (Python), JWT (python-jose), bcrypt
- Storage: JSON files (no DB)

## Project Structure

```
mind-guide/
  frontend/
  backend/
    storage/
      users.json
      checkins.json
      chats.json
```

## Run Instructions

### 1) Backend

Open a terminal in `mind-guide/backend`:

```bash
python -m venv .venv
# Windows PowerShell
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Optional environment variable:

- `JWT_SECRET` (recommended for non-dev)
- `FRONTEND_ORIGINS` (comma-separated frontend URLs allowed by CORS, for example `https://your-frontend.onrender.com`)

### 2) Frontend

Open a second terminal in `mind-guide/frontend`:

```bash
npm install
npm run dev
```

Frontend runs on:

- `http://localhost:5173`

Backend runs on:

- `http://127.0.0.1:8000`

For local frontend API configuration, create `frontend/.env` if needed:

```bash
VITE_API_BASE_URL=http://127.0.0.1:8000
```

## Deploy Frontend on Render

The frontend is configured to call your deployed backend:

- `https://mind-guide-1.onrender.com`

You can deploy the frontend as a Render Static Site with these settings:

- Root Directory: `frontend`
- Build Command: `npm ci && npm run build`
- Publish Directory: `dist`
- Environment Variable: `VITE_API_BASE_URL=https://mind-guide-1.onrender.com`
- Rewrite Rule: `/*` -> `/index.html`

This repository also includes `render.yaml` with the same Static Site settings. Render's docs recommend a rewrite to `/index.html` for React Router SPAs so direct visits to routes like `/dashboard` work after deployment.

## Core Features

- Authentication: Signup/Login using JWT stored in `localStorage`
- Profile: Name, age, intro (editable)
- Dashboard: Snapshot + trend charts + daily check-in
- Counseling AI: Mood detection + empathetic responses + actionable advice + calming quotes
- Crisis Detection: Detects self-harm/extreme distress and displays helplines (IN/US/UK)
- Future Mirror: Habit-based simulation with before/after metrics + narrative
- Insights: Avg stress, best mood recorded, sleep trends, last counseling mood

## API Endpoints

All protected endpoints require:

`Authorization: Bearer <token>`

- `POST /signup`
- `POST /login`
- `GET /profile`
- `PUT /profile` (also supports `POST /profile`)
- `POST /checkin`
- `GET /chat`
- `POST /chat`
- `POST /simulate`
- `GET /insights`

## Notes

- JSON storage files live in `backend/storage/`
- CORS is enabled for local Vite, configured `FRONTEND_ORIGINS`, and Render-hosted frontend URLs
