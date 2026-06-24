***Structure***
- Root contains `backend` (Node/Express API) and `frontend` (React + Vite). Each sub‑project has its own `package.json` and `node_modules`. No workspace manager.

***Environment***
- Backend reads environment variables from `backend/.env`. The repo only provides a template at `/.env.example`; copy it to `backend/.env` (and optionally to `frontend/.env`).
- Frontend reads `VITE_BACKEND_URL` from `frontend/.env`; if missing the API base defaults to `/api` and relies on Vite’s proxy.
- Key dev variables: `MONGODB_URI` (default `mongodb://localhost:27017/swcmas`), `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`. Adjust them for production.

***Setup***
- Run `npm install` **separately** in `backend` and `frontend`.
- Start a local MongoDB instance (default port 27017) before launching the backend or running its tests.

***Running locally***
- Backend: `cd backend && npm run dev` → nodemon, serves on http://localhost:5000.
- Frontend: `cd frontend && npm run dev` → Vite dev server on http://localhost:5173, proxies `/api` to the backend.
- Both processes must be running for full UI functionality.

***Docker***
- Build and start all services: `docker-compose up --build -d`.
  - Ports: 5000 (API), 80 (frontend via Nginx), 27017 (MongoDB).
- Stop services: `docker-compose down`.
- Backend Dockerfile uses `npm ci --omit=dev` (no dev deps) and includes a healthcheck on `/health`.
- Frontend Dockerfile builds the app then serves static files with Nginx; the built assets are in `dist`.

***Testing***
- Backend: `cd backend && npm test` (Jest). Requires a reachable MongoDB (default URI) unless you change `MONGODB_URI` for a test DB. The test harness mocks cron jobs and some services via `backend/tests/setup.js`.
- Frontend: `cd frontend && npm test` (Vitest). No external services needed.

***Lint & format***
- Backend: `npm run lint` (ESLint) and `npm run format` (Prettier). Run both before committing.
- Frontend: `npm run lint` (ESLint). No dedicated format script.

***Scheduled jobs***
- Collection scheduler starts on server start (`collectionScheduler.start()`) and runs daily at 02:00. It respects `MAX_COLLECTIONS_PER_COLLECTOR_DAY` (default 10).
- Anomaly detection runs on server start and then daily at 03:00. Tests mock `node‑cron`; to speed up unit tests you can keep the mock in place.

***API***
- All routes are mounted under the prefix `/api/v1` (configurable via `API_PREFIX`).
- Swagger UI is reachable at `http://localhost:5000/api-docs`.
- CORS allows origins defined in `config.allowedOrigins` (includes `http://localhost:5173`).

***Common pitfalls***
- Missing `backend/.env` → JWT defaults to insecure placeholders; DB connection may fail.
- Forgetting `VITE_BACKEND_URL` in `frontend/.env` → API calls hit `/api` without proxy, causing 404 during dev.
- Running backend tests without a running MongoDB → connection errors. Start MongoDB or point `MONGODB_URI` to a test instance.
- Docker images omit dev dependencies; lint/format tools aren’t available inside containers.

***Helpful commands***
- Lint + format backend: `npm run lint && npm run format`.
- Build frontend for production: `cd frontend && npm run build` (outputs to `dist`).
- Check backend health: `curl http://localhost:5000/health`.

***References***
- See the README sections “Installation”, “Running Locally”, “Docker Compose”, “Testing”, and “Development Workflow” for the source of these details.