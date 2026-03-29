# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NEXUS is a swipe-based collaborative networking platform where users discover and apply to projects. It's a monorepo with separate `frontend/` (React + Vite) and `backend/` (Node.js + Express + MongoDB) apps.

## Commands

### Running the full stack
```bash
npm start                    # runs frontend + backend concurrently
npm run frontend             # frontend only (cd frontend && npm run dev)
npm run backend              # backend only (cd backend && npm run start)
```

### Frontend
```bash
cd frontend
npm run dev                  # dev server (Vite, port 5173)
npm run build                # production build
npm run lint                 # ESLint
npm run preview              # preview production build
```

### Backend
```bash
cd backend
npm run dev                  # nodemon (auto-restart on changes)
npm start                    # node server.js (production)
```

### No tests currently configured.

## Environment Setup

Copy `backend/env.example` to `backend/.env`:
```
MONGO_URI=<MongoDB connection string>
JWT_SECRET=<secret>
PORT=5001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

## Architecture

### Backend (`backend/`)

**Entry point:** `server.js` — MongoDB connection, CORS setup, mounts routes, global error handler.

**Pattern:** MVC with factory handlers. `utils/catchAsync.js` wraps async route handlers to avoid try/catch boilerplate. `utils/apperror.js` is the custom error class. `controllers/handlerFactory.js` provides generic CRUD operations reused across controllers.

**Auth:** JWT-based. `authController.js` exports a `protect` middleware that verifies the Bearer token and attaches `req.user`. Passwords hashed with bcrypt.

**Models:**
- `User` — auth fields, profile data (school, bio, skills), `notifications[]`, `skippedProjects[]`
- `Project` — title, description, creator, members, skillsRequired, category (`Software/Design/Research/Business/Competition`), projectType (`Academic/Professional/Hobby/Startup/Hackathon`), `applications[]` sub-documents with status `pending/accepted/rejected`

**Routes:**
- `POST /api/users/signup`, `POST /api/users/login`, `POST /api/users/logout`
- `PATCH /api/users/profilesetup` — update profile (protected)
- `GET /api/users/notifications` — fetch notifications (protected)
- `GET /api/projects/fetch` — project discovery feed (protected, excludes skipped/created/applied)
- `POST /api/projects/:id/apply`, `skip`, `save` — swipe actions
- `GET /api/projects/my-projects`, `my-applications`
- `GET/PATCH /api/projects/:projectId/applications/:applicationId` — manage applicants

### Frontend (`frontend/src/`)

**State management:** React Context only — `context/AuthContext.jsx` holds user, profile, token (persisted to localStorage). No Redux/Zustand.

**API calls:** All endpoints centralized in `config/api.js`. Use the `apiCall` helper which attaches the auth token automatically.

**Routing:** `react-router-dom` v7. Pages in `src/` root (not a `pages/` subdirectory).

**Key pages:**
- `mainPage.jsx` — swipe-based discovery with collapsible filter UI
- `profilesetup.jsx` / `ProfileEdit.jsx` — profile onboarding and editing
- `recruiter.jsx` — manage created projects and review applicants
- `searcher.jsx` — browse/search projects in list view
- `CreateProject.jsx` / `MyProjects.jsx` — project management

**Components:** `SwipeCard.jsx`, `NotificationDropdown.jsx`, `Navbar.jsx`

**Styling:** Mix of Tailwind utility classes and custom CSS files (one CSS file per page/component). Tailwind primary color: `#5c6c90`, secondary: `#8d95b4`.

### Deployment

Both frontend and backend have `vercel.json` configs. Backend `Procfile` supports Heroku. Production API base: `https://nexus-three-phi.vercel.app/`.
