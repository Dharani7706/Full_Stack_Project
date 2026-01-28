# Career Mentorship Portal

MERN stack (MongoDB, Express, React, Node.js) application. **No Tailwind** — plain CSS only.

## Modules

1. **User Authentication & Profiles** – Login, signup, profile (skills, interests, experience), mentor–mentee linking
2. **Micro-Internship** – Create/manage 1–5 day projects, apply, submit work, feedback, progress, badges
3. **Live Career Lab** – Live sessions (video/chat), mini-hackathon/challenge listings, mentor ratings & feedback
4. **Communication & Feedback** – Real-time chat, session scheduling, reminders, post-session ratings
5. **Dashboard & Analytics** – Micro-internship status, upcoming labs/sessions, mentor and student analytics

## Setup

### Prerequisites

- Node 18+
- MongoDB running locally or a connection URI

### 1. Environment

```bash
# Server
cp server/.env.example server/.env
# Edit server/.env: set MONGODB_URI, JWT_SECRET
```

### 2. Install

```bash
npm run install:all
```

Or manually:

```bash
npm install
cd server && npm install
cd ../client && npm install
```

### 3. Run

**Development (server + client):**

```bash
npm run dev
```

- API: http://localhost:5000  
- Client: http://localhost:5173 (proxies /api to the server)

**Or run separately:**

```bash
# Terminal 1
npm run server

# Terminal 2
cd client && npm run dev
```

### 4. Build (production)

```bash
cd client && npm run build
# Serve client/dist and run server (e.g. PORT=5000 node server/server.js)
```

## API Overview

| Module        | Base Path            | Notes                                                    |
|---------------|----------------------|----------------------------------------------------------|
| Auth          | `/api/auth`          | POST /register, /login; GET /me                          |
| Users         | `/api/users`         | GET /, /:id; PUT /profile; POST /link-mentee, /request-mentor |
| Micro-internships | `/api/micro-internships` | CRUD, /:id/apply, /my/applications, /mentor/applications, /applications/:appId |
| Live sessions | `/api/live-sessions` | /sessions, /sessions/:id/join; /challenges, /challenges/:id/join, /submit, /rate |
| Chat          | `/api/chat`          | /:otherId, /send; /scheduled/list, /scheduled, /scheduled/:id/rate |
| Dashboard     | `/api/dashboard`     | GET /                                                    |

All protected routes use `Authorization: Bearer <token>`.
