# Elara

Elara is a full-stack wellness app that generates adaptive workout and nutrition plans from user profile data and daily check-ins, then tracks how recommendations evolve over time.

## Architecture

- `frontend`: React + Vite single-page app for onboarding, dashboard, profile, analytics, and plan history.
- `server`: Express + MongoDB API with JWT auth, check-ins, plan generation, plan versioning, and analytics endpoints.
- `server/src/services`: domain logic for plan diffing, plan version creation, and explanation of plan changes.

## Core Features

- Auth with JWT (`httpOnly` cookie) and protected API routes.
- Profile onboarding (including optional cycle-tracking context).
- Daily check-in submission with one-check-in-per-day protection.
- AI-generated daily plans.
- Versioned plan history with:
  - source tags (`initial`, `checkin`, `profile_update`)
  - structured diffs between versions
  - "why changed" summaries
- Analytics summaries (streaks, averages, top symptoms).

## Local Setup

### 1) Install dependencies

```bash
cd frontend && npm install
cd ../server && npm install
```

### 2) Configure environment

Create `server/.env`:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=models/gemini-2.5-flash
PORT=5174
NODE_ENV=development
```

### 3) Run the app

Terminal 1:

```bash
cd server
npm run dev
```

Terminal 2:

```bash
cd frontend
npm run dev
```

Frontend runs on `http://localhost:5173` and proxies API requests to `http://localhost:5174`.

## Scripts

### Frontend (`frontend/package.json`)

- `npm run dev`: start Vite dev server
- `npm run lint`: run lightweight source hygiene checks
- `npm run test`: run Node-based unit tests
- `npm run build`: build production bundle
- `npm run preview`: preview production build

### Server (`server/package.json`)

- `npm run dev`: run API server
- `npm run lint`: run lightweight source hygiene checks
- `npm run test`: run Node unit tests
- `npm run build`: run backend syntax/build checks

## API Surface (Summary)

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/profile`
- `PATCH /api/profile`
- `POST /api/plan`
- `GET /api/plans/history`
- `GET /api/plans/:id`
- `POST /api/checkin`
- `GET /api/analytics/summary`
- `GET /api/health`
