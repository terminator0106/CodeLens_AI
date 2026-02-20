# Troubleshooting

This doc covers common dev/demo issues.

## Backend won’t start

### Missing dependencies

- Ensure you installed `backend/requirements.txt` in the same Python environment that runs Uvicorn.

### SQLite path confusion

`DATABASE_URL` defaults to `sqlite:///./codelens.db`. The backend normalizes relative paths against `backend/` so the DB is stable regardless of how Uvicorn is launched.

## Frontend can’t talk to backend

### CORS error

- Ensure `ALLOWED_ORIGINS` contains your frontend URL (Vite dev server defaults to `http://localhost:3000`).
- Restart the backend after changing env.

### Auth cookie not being sent

- The frontend uses `credentials: 'include'`. Ensure your requests go to the same backend host/port configured by `VITE_API_BASE_URL`.

## Groq errors

### 413 / Request too large / TPM exceeded

Why it happens:

- Prompt + completion tokens exceed provider constraints.

Mitigations already implemented:

- The backend clips merged context to a token budget.
- The backend retries once with an even smaller context.

If it still happens:

- Lower `RAG_TOP_K` (e.g., `2`)
- Lower `MAX_CONTEXT_TOKENS` (e.g., `1200`)
- Disable embeddings: `DISABLE_EMBEDDINGS=true`

### Groq SDK not installed

- Install backend requirements.
- Verify `groq` is installed in your venv.

## Embeddings / FAISS

### FAISS not available

The FAISS module is optional. If FAISS is not available, vector search is disabled and retrieval should fall back to lexical mode.

### OPENROUTER_API_KEY not set

Embeddings require OpenRouter.

- Set `OPENROUTER_API_KEY` and `DISABLE_EMBEDDINGS=false`, or
- Keep `DISABLE_EMBEDDINGS=true` and rely on lexical retrieval.

## Ingestion issues

### “Invalid repository URL”

Only GitHub HTTPS URLs matching:

- `https://github.com/<org>/<repo>`

are accepted.

### Repo too large

Large repos may hit `MAX_REPO_SIZE_MB`, `MAX_FILES`, or `MAX_FILE_SIZE_KB` limits.

Tune these settings carefully for demos.
