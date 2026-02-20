# CodeLens AI — Understand large codebases with repo-grounded explanations (RAG)

Local-first web app that ingests a GitHub repository and lets you **browse**, **explain**, and **chat** about the codebase using **Retrieval-Augmented Generation (RAG)**.


Repo layout:
- `frontend/` — React + TypeScript + Vite
- `backend/` — FastAPI + SQLAlchemy + SQLite + RAG pipeline

---

## Prerequisites (setup first)

- Node.js 18+ (20+ recommended)
- Python 3.11+
- A Groq API key

Optional:
- OpenRouter API key (only needed if you enable embeddings for semantic retrieval, or if you set `LLM_PROVIDER=openrouter` for LLM-backed Explain endpoints)
- ScaleDown API key/url (only if you enable external compression)

---

## Setup & Installation (copy/paste)

### Quick start (Windows)

Backend (FastAPI):

```powershell
py -m venv .venv
./.venv/Scripts/Activate.ps1
python -m pip install -r backend/requirements.txt

# Configure keys and settings in `backend/.env`

python -m uvicorn backend.main:app --reload --port 8000
```

Backend health check:
- http://localhost:8000/health

Frontend (Vite):

```powershell
cd frontend
npm install
npm run dev
```

Frontend:
- http://localhost:5173

### Quick start (macOS / Linux)

Backend:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt

python -m uvicorn backend.main:app --reload --port 8000
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

---

## Backend configuration (environment variables)

The backend loads environment variables from `backend/.env` (see `backend/settings.py`).

Minimal `backend/.env` (Groq-only chat):

```env
LLM_PROVIDER=groq
GROQ_API_KEY=YOUR_KEY_HERE
GROQ_MODEL=llama-3.1-8b-instant

# Recommended for demo stability (no embeddings calls)
DISABLE_EMBEDDINGS=true
```

Common knobs:
- `RAG_TOP_K=4` — number of chunks to retrieve
- `MAX_CONTEXT_TOKENS=1800` — token budget for chunk compression (`backend/rag/compressor.py`)
- `CHUNK_SIZE_TOKENS=1000` / `CHUNK_OVERLAP_TOKENS=100` — ingestion chunking
- `ALLOWED_ORIGINS=http://localhost:5173,...` — CORS

Embeddings / semantic retrieval (optional):
- If `DISABLE_EMBEDDINGS=false`, embeddings require `OPENROUTER_API_KEY` and a FAISS index will be built/used.

LLM provider note:
- Chat is Groq-only. `LLM_PROVIDER` primarily affects the file Explain endpoints (Groq by default, or OpenRouter if configured).

ScaleDown (optional external context compression):
- `COMPRESSION_PROVIDER=scaledown`
- `SCALEDOWN_API_KEY=...`
- `SCALEDOWN_API_URL=...`

---

## Problem statement

When you join a new project (or revisit a large one), the hard part isn’t writing code — it’s **understanding**:

- Where key behavior lives (auth, ingestion, caching, permissions)
- Which files matter for a specific feature
- Why something was written a certain way

Why existing tools often fall short:

- `grep` / search finds *strings*, not *meaning* and not the best supporting context
- Docs are frequently missing or outdated
- ChatGPT-style answers can be helpful but may guess repo-specific details if you don’t provide the right context

---

## Solution overview

CodeLens AI ingests a repo into a local database, retrieves the most relevant code snippets for your question, compresses that context to fit token budgets, and then asks the LLM to answer using that context.

RAG explained simply:

- Instead of sending the entire repo to the model, we **retrieve** a small, relevant subset (chunks + a few file excerpts).
- The model answers using that subset and returns the **source files** used.

---

## Key features

### Works today

- **Repository ingestion** (background task): store files + chunks in SQLite
- **Repo browser**: file tree + code viewer
- **Explain tab** with level toggle: Beginner / Intermediate / Expert
- **AI Chat**: Groq-only, blended answer style (~60% general guidance + ~40% repo-grounded RAG)
- **Sources dropdown**: sources are returned as structured data (not appended to the text)
- **Analytics**: deterministic tracking of latency and token usage totals

### Partially implemented / optional

- **Semantic retrieval** (FAISS): enabled only if embeddings are configured (OpenRouter key)
- **External compression (ScaleDown)**: optional provider; local trimming always works

### Planned

- Private repo support (GitHub auth / tokens)
- Smarter file selection for “send related files” (structure-aware)
- Better evaluation (golden questions + regression tests for RAG quality)

---

## Usage guide (how a user starts using the website)

### 1) Start the app

Run backend + frontend, then open http://localhost:5173.

### 2) Sign up / sign in

- Sign up with username/email/password.
- The backend sets an HTTP-only cookie (the UI then unlocks Dashboard/Repo/Chat).

### 3) Add a repo (ingestion)

From Dashboard → **Add Repository**:

- Paste a GitHub URL like `https://github.com/<org>/<repo>`
- Choose a branch

Ingestion runs in the background; the repo appears immediately and becomes usable once indexed.

Important limitation: URL validation currently allows **GitHub HTTPS URLs only** (public repos).

### 4) Explore + Explain

- Repo View → select a file in the tree → Code tab shows content
- Explain tab → choose Beginner/Intermediate/Expert for explanations

### 5) Ask questions in AI Chat

- Open AI Chat → select a repository → ask questions.
- Expand Sources dropdown to see file paths that were referenced.

---

## System architecture

### End-to-end flow

1) **Ingest repo**
- Validate URL
- Create repo record
- Background task clones/reads repo → stores files + chunks in SQLite
- Optional: build embeddings + FAISS index

2) **Retrieve context**
- Prefer FAISS semantic search if enabled
- Otherwise use lexical fallback over stored chunks

3) **Compress / clip**
- Trim context to a token budget
- Optional external compression via ScaleDown
- Clip again to stay under Groq request constraints

4) **LLM answer**
- RAG draft (repo-grounded) if context exists
- General draft (always)
- Blend drafts with Groq into a final answer (~60/40)

### ASCII diagram

```text
┌──────────────┐         ┌────────────────────┐
│  Frontend    │  HTTP   │      Backend       │
│ (React/Vite) ├────────►│ (FastAPI/Uvicorn)  │
└──────┬───────┘         └───────┬────────────┘
       │                         │
       │                         │  writes/reads
       │                         ▼
       │                 ┌──────────────────┐
       │                 │ SQLite (files,   │
       │                 │ chunks, chat)    │
       │                 └───────┬──────────┘
       │                         │
       │                         │ optional
       │                         ▼
       │                 ┌──────────────────┐
       │                 │ FAISS index +    │
       │                 │ embeddings       │
       │                 └───────┬──────────┘
       │                         │
       │    retrieved context    ▼
       │                 ┌──────────────────┐
       │                 │ RAG pipeline:    │
       │                 │ retrieve+compress│
       │                 └───────┬──────────┘
       │                         │
       │                         ▼
       │                 ┌──────────────────┐
       │                 │ Groq LLM:        │
       │                 │ drafts + blend   │
       │                 └──────────────────┘
```

---

## RAG strategy (important)

What we retrieve:

- **Code chunks** stored during ingestion (overlapping windows)
- A small amount of **file excerpt context** for top referenced files (bounded)

How we reduce context:

- Initial chunk selection is limited by `RAG_TOP_K`
- `compress_context()` trims by token budget (`MAX_CONTEXT_TOKENS`)
- The chat endpoint additionally clips the final merged prompt to avoid Groq “request too large” failures

Why this improves accuracy and cost:

- The model sees fewer irrelevant tokens, so it is more likely to ground answers in the correct files.
- Smaller prompts reduce latency and avoid rate/token limits.

Embeddings on/off:

- Embeddings are **optional**.
- If embeddings are disabled/unconfigured, the system still works using a **lexical fallback** retrieval.

---

## ScaleDown / context compression (practical)

Why we don’t send whole files:

- Whole-file prompts can exceed model limits and cause failures (or slow responses).
- Most questions only need a few definitions and nearby logic.

How it works here:

- The system selects relevant chunks and clips to a token budget.
- If `COMPRESSION_PROVIDER=scaledown`, a best-effort external “summarize/condense” step runs; if it fails, we fall back to local clipping.

Benefits:

- Lower token usage
- Faster responses
- Higher chance the model stays grounded in relevant code

---

## Tech stack

Frontend:
- React + TypeScript + Vite
- Zustand for state
- Tailwind for styling

Backend:
- FastAPI + Uvicorn
- SQLAlchemy + SQLite

LLM provider:
- Groq (chat + blending)

Vector store (optional):
- FAISS on-disk index (only if embeddings are enabled)

---

## Security & multi-tenancy

Multi-user behavior is enforced server-side:

- Repositories and chat history are stored with a `user_id`.
- Endpoints check ownership before returning repo/file/chat data.

Auth model:

- HTTP-only cookie-based auth for the web UI (prevents JS access to the token).
- CORS origins are explicitly configured via `ALLOWED_ORIGINS`.

---

## Demo limitations (honest)

- **Public GitHub HTTPS repos only** (URL validation is currently restricted; no private repo tokens yet).
- Embeddings are optional; many demos should run with `DISABLE_EMBEDDINGS=true` for stability and cost control.
- Groq tiers have request/token constraints; the backend clips context and retries once, but extremely large questions/repos may still require tuning `RAG_TOP_K` / `MAX_CONTEXT_TOKENS`.

---

## Roadmap

Short-term (1–2 weeks):
- Better retrieval heuristics for “related files” selection
- More robust retry/backoff behavior for LLM errors

Mid-term (1–2 months):
- Private repo ingestion (GitHub OAuth + repo access)
- Eval harness (repeatable RAG quality checks)

Long-term:
- Multi-repo workspace chat
- Index incremental updates (avoid full re-ingest)

---

## Why this project is different

- vs ChatGPT: grounded answers + explicit sources; answers are tied to retrieved repo context rather than pure generation.
- vs Copilot: focuses on **understanding and navigation** across an entire repo, not just in-editor code completion.
- vs code search tools: combines retrieval with summarization/explanation and multi-level “explain like I’m…” output.

---

## FAQ (judge-focused)

**Why FAISS?**
- It’s a lightweight, local vector index that can run without a hosted vector DB.

**Why cookies for auth?**
- Web UI friendliness + HTTP-only cookies reduce token exposure to client-side JS.

**How does RAG improve accuracy?**
- By retrieving repo-specific code first, the model has concrete evidence to reference.

**Can I run without embeddings?**
- Yes. Lexical retrieval fallback works with no external embeddings provider.

---

## Common issues / troubleshooting

### Groq error: 413 / “Request too large” / TPM limit exceeded

Mitigations already implemented:
- Context is clipped to a safe token budget and the backend retries once with an even smaller context.

If you still see it:
- Set fewer retrieved chunks: `RAG_TOP_K=2`
- Reduce context budget: `MAX_CONTEXT_TOKENS=1200`
- Disable embeddings: `DISABLE_EMBEDDINGS=true`

### “Groq SDK is not installed”

- Ensure you installed `backend/requirements.txt` in the same environment you run Uvicorn from.

### CORS problems

- Update `ALLOWED_ORIGINS` in `backend/.env` to include your frontend URL.

---

## Scripts

Frontend (from `frontend/`):
- `npm run dev` — dev server
- `npm run build` — production build
- `npm run preview` — preview production build

Backend (from repo root):
- `python -m uvicorn backend.main:app --reload --port 8000`

---

## Repository layout

- `frontend/pages/` — screens (Chat, RepoView, Dashboard, etc.)
- `frontend/components/` — UI + repo components
- `backend/ingestion/` — repo ingest + chunking
- `backend/rag/` — retrieval, compression, LLM calls, query endpoints
- `backend/vectorstore/` — FAISS index + embeddings helpers
- `backend/database/` — models + CRUD

---

## Contributing (optional)

If you’re using this for a demo/hackathon, the fastest contributions are:
- Improve retrieval quality heuristics
- Add evaluation questions and expected outputs
- Tighten UX polish in Explain/Chat

---

## License

No LICENSE file is currently present in this repository.

If you intend this to be open-source, add a license file (e.g., MIT/Apache-2.0) and update this section accordingly.

---

## Security notes

- Do **not** commit real API keys. Prefer using a local-only file like `backend/.env.local` and keep it out of Git.
