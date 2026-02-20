# Architecture overview

This doc explains the system at a high level: frontend, backend, database, ingestion, retrieval, LLM calls, and analytics.

## Components

- Frontend: React + TypeScript + Vite + Tailwind
- Backend: FastAPI + SQLAlchemy
- Storage: SQLite
- Retrieval:
  - lexical fallback over stored chunks
  - optional FAISS index for semantic retrieval (embeddings)
- LLM:
  - Groq for chat and blending (Groq-only by design)
  - OpenRouter optionally used for embeddings, and may be used for certain explain flows if configured

## Request/response and trust boundaries

- The frontend talks to the backend over HTTP.
- Authentication uses an HTTP-only cookie set by the backend.
- All repo and chat access is checked by `user_id` server-side.

## ASCII diagram

```text
┌─────────────────────┐         ┌──────────────────────────┐
│      Frontend        │  HTTP   │          Backend          │
│  React/Vite/Tailwind  ├────────►  FastAPI + routers        │
│  Zustand stores       │        │  auth / repos / rag / ... │
└──────────┬───────────┘         └────────────┬─────────────┘
           │                                    │
           │                                    │ SQLAlchemy
           │                                    ▼
           │                           ┌─────────────────────┐
           │                           │       SQLite         │
           │                           │ users, repos, files, │
           │                           │ chunks, chat, ...    │
           │                           └─────────┬───────────┘
           │                                     │
           │                                     │ optional
           │                                     ▼
           │                           ┌─────────────────────┐
           │                           │      FAISS index     │
           │                           │ (semantic retrieval) │
           │                           └─────────┬───────────┘
           │                                     │
           │                         retrieved chunks/excerpts
           │                                     ▼
           │                           ┌─────────────────────┐
           │                           │      RAG pipeline    │
           │                           │ retrieve + compress  │
           │                           │ + LLM drafts + blend │
           │                           └─────────┬───────────┘
           │                                     │
           │                                     ▼
           │                           ┌─────────────────────┐
           │                           │       Groq LLM       │
           │                           │ chat + blending      │
           │                           └─────────────────────┘
```

## Key flows

### Auth

- Signup/login sets an HTTP-only cookie (`COOKIE_NAME`, default `codelens_auth`).
- Frontend calls `/auth/me` to populate the user in state.

### Ingestion

- API endpoint accepts a repo URL + branch.
- Returns immediately, while ingestion runs in a background task.
- Stores indexed files + code chunks in SQLite.
- Optionally builds embeddings + FAISS index.

### Explain

- Operates file-scoped: explain endpoints are designed to use indexed chunks for a given file.
- Supports explain levels.

### Chat (RAG)

- Uses retrieval to fetch relevant context.
- Uses compression + clipping so LLM calls don’t exceed provider limits.
- Returns a text answer + `referenced_files` for sources UI.

### Analytics

- Aggregates totals and lightweight query metrics (latency and token usage).

## Design constraints

- The product intentionally keeps analytics deterministic by keeping LLM calls in a single module (`backend/rag/llm.py`).
- Prompt size is bounded to reduce Groq failures (request too large / TPM exceeded).
