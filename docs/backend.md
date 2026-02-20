# Backend documentation

This doc explains the backend app wiring, configuration, and major modules.

## Tech stack

- FastAPI
- SQLAlchemy
- SQLite
- Optional FAISS vector index

## App wiring

Entry point:

- `backend/main.py` builds the app via `build_app()`.
- `backend/config.py` wires middleware, exception handlers, routers, and startup hooks.

Routers:

- `/auth` auth routes
- `/repos` repository ingestion and file browsing/explain routes
- `/query` and `/repos/{repo_id}/chat/history` RAG/chat routes
- `/dashboard/overview` and `/analytics/usage` analytics

Startup:

- initializes database
- creates the vectorstore data directory
- loads FAISS indexes from disk (if present)

## Configuration

Settings are loaded from `backend/.env` via `backend/settings.py`.

Highlights:

- `DATABASE_URL` (defaults to sqlite in `backend/`)
- `COOKIE_NAME` (default `codelens_auth`)
- `ALLOWED_ORIGINS` (CORS)
- `FRONTEND_BASE_URL` (OAuth redirects; should match your Vite dev server, typically `http://localhost:3000`)
- `GROQ_API_KEY` / `GROQ_MODEL`
- `LLM_PROVIDER` (affects explain endpoints)
- `DISABLE_EMBEDDINGS` and embedding settings
- `RAG_TOP_K` and token budgets
- Optional ScaleDown compression: `COMPRESSION_PROVIDER=scaledown` + `SCALEDOWN_API_KEY` + `SCALEDOWN_API_URL`

## Auth

Auth endpoints set and clear an HTTP-only cookie.

- Signup/login create an access token, then `set_cookie(httponly=True, samesite='lax')`.
- Session length depends on `remember_me`.

Protected endpoints use a dependency that:

- reads the cookie
- validates the token
- loads the user

## Repository ingestion

Ingestion is async:

- `/repos/ingest` creates a repo record and schedules a background task.
- The background task clones/reads the repo, filters files, chunks them, and inserts them into SQLite.

URL validation:

- Only GitHub HTTPS URLs matching `https://github.com/<org>/<repo>` are accepted.

Optional embeddings:

- If embeddings are enabled and OpenRouter key is present, embeddings are generated and inserted into the FAISS index.

Re-ingestion:

- `/repos/{repo_id}/reingest` clears existing indexed data and re-runs ingestion.

## Explain endpoints

Explain endpoints are file-scoped and use indexed context.

Endpoints include:

- explain file
- explain selected symbol
- “why written” reasoning

If LLM keys are missing, the explain endpoint returns a clear message rather than a stack trace.

## Analytics

Analytics endpoints use database totals + in-memory counters for query aggregates.

- `/dashboard/overview` returns repo/file/chunk totals
- `/analytics/usage` returns token usage and average query latency
