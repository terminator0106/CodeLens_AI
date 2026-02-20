# Website walkthrough (end-user view)

This page describes what the website does from a user’s perspective: what to click, what happens, and where to find things.

## Pages & navigation

The frontend uses `HashRouter` and routes like:

- Public:
  - `/` Landing
  - `/products` Products
  - `/solutions` Solutions
  - `/docs` Docs (marketing page inside the app)
  - `/login` Login
  - `/signup` Signup
- Protected (requires auth cookie):
  - `/dashboard`
  - `/repo/:id`
  - `/chat`
  - `/analytics`
  - `/settings`

A modal-based auth flow is used for protected routes: if you’re not logged in and navigate to a protected page, the UI opens a login modal.

## 1) Sign up / log in

Before signing up, make sure the frontend is running and open it in your browser:

- Frontend (default): `http://localhost:3000`
- Backend health check: `http://localhost:8000/health`

### Sign up

- Go to `/signup` (or open the auth modal).
- Provide:
  - username
  - email
  - password
  - remember me (optional)

What happens:

- Backend creates the user record.
- Backend sets an **HTTP-only auth cookie** (`COOKIE_NAME`, default `codelens_auth`).
- Frontend calls `/auth/me` to load your profile.

### Log in

- Go to `/login` (or open the auth modal).
- Provide email/password.

What happens:

- Backend verifies credentials.
- Backend sets the same HTTP-only auth cookie.

## 2) Dashboard

Dashboard is the hub:

- See your repositories
- Add a repository for ingestion
- Quick navigation to Repo View / Chat / Analytics

Behind the scenes:

- The dashboard uses `/dashboard/overview` (and repo listing) to render totals like repos/files/chunks.

## 3) Add repository (ingestion)

From Dashboard, you can ingest a repository by entering a GitHub URL.

Accepted URL format:

- `https://github.com/<org>/<repo>`

Notes:

- The backend currently validates that exact GitHub HTTPS format.
- The ingestion starts **as a background task**.

What happens:

1. Backend creates a repo record immediately so the UI can show a “started” status.
2. A background ingestion task:
   - clones/reads the repo
   - filters files
   - chunks content
   - stores files and chunks in SQLite
   - (optional) builds embeddings + FAISS index if enabled

## 4) Repo View (browse code)

Repo View includes:

- File tree (left)
- Code viewer (main)

Typical flow:

1. Select a file in the file tree.
2. The UI requests its content and renders it.

## 5) Explain tab

The Explain tab generates explanations for:

- an entire file, or
- a selected symbol scope (when supported)

Explain levels:

- Beginner
- Intermediate
- Expert

Explain is powered by the backend explain endpoints. The frontend also caches explanations locally (per user/repo/file/scope/level) to make the UX fast.

## 6) AI Chat (repo Q&A)

AI Chat lets you ask questions against a selected repo.

Key UX behavior:

- Answers include a **Sources dropdown** (file paths) instead of embedding sources into the answer text.
- The UI highlights identifiers and code-ish tokens for readability.
- Chat history can be loaded from the backend so you can resume.

Behind the scenes:

- The backend runs a RAG pipeline:
  1. retrieve relevant chunks
  2. build bounded context (chunks + small file excerpts)
  3. compress/clip context for token budgets
  4. generate a repo-grounded draft + a general draft
  5. blend them into a single final answer

## 7) Analytics

Analytics is a judge-friendly “what happened” page.

It summarizes:

- totals for repos/files/chunks
- avg query latency
- token usage (aggregated)

## 8) Settings

Settings contains account-level functionality (and optional OAuth if configured):

- user profile
- profile image upload (if used)
- logout
