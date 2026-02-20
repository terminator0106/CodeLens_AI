# Security & privacy

This doc describes the major security-relevant behaviors of the website.

## Authentication

- Signup/login sets an **HTTP-only cookie**.
- The cookie name is configurable via `COOKIE_NAME` (default `codelens_auth`).
- Cookie settings:
  - `httponly=True`
  - `samesite='lax'`
  - `secure` is controlled by `SECURE_COOKIES` (should be true in HTTPS production)

Session TTL:

- `remember_me=false` keeps the user logged in for ~2 days
- `remember_me=true` keeps the user logged in for ~30 days

## Authorization & multi-tenancy

The backend enforces ownership checks:

- Repos belong to a user (`repo.user_id`).
- Chat history is filtered by user id + repo id.
- Endpoints check `repo.user_id == current_user.id` before returning data.

## CORS

CORS allowlist is configured via `ALLOWED_ORIGINS`.

- `allow_credentials=True` is enabled, so origins must be explicit.

## Secrets handling

- Do not commit `.env` files with real keys.
- Prefer local env files ignored by Git (e.g. `backend/.env.local`).

## File upload (profile images)

- Content-type must start with `image/`.
- Size limit: 5MB.
- Files are stored under `backend/vectorstore/data/uploads/profile_images/`.

Note: for production, you may want to:

- store uploads in an object store
- scan uploads
- enforce stricter file type validation and file extension handling

## LLM / data leakage considerations

- Chat requests send retrieved repo context to the LLM provider.
- If you ingest proprietary repositories, assume code excerpts may be sent externally.

Mitigations:

- Disable embeddings (optional) to reduce external provider calls.
- Keep `MAX_CONTEXT_TOKENS` small.
- Add a redaction layer if your threat model requires it.
