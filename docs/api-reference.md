# API reference

This is a practical reference of the backend endpoints used by the website.

Base URL (dev): `http://localhost:8000`

Notes:

- The frontend uses `credentials: 'include'`, so cookie auth is required for protected endpoints.
- Error responses are normalized by the backend exception handlers into:
  - `{ "error": "...", "detail": "..." }`

## Health

### GET `/health`

Returns:

```json
{ "status": "ok" }
```

## Auth

All auth endpoints are under `/auth`.

### POST `/auth/signup`

Body:

```json
{ "username": "alice", "email": "alice@example.com", "password": "********", "remember_me": false }
```

Returns:

```json
{ "user": { "id": 1, "username": "alice", "email": "alice@example.com", "profile_image_url": null } }
```

Side-effect: sets HTTP-only cookie (`COOKIE_NAME`).

### POST `/auth/login`

Body:

```json
{ "email": "alice@example.com", "password": "********", "remember_me": false }
```

Returns: same as signup.

### POST `/auth/logout`

Clears auth cookie.

### GET `/auth/me`

Returns current user profile.

### POST `/auth/profile-image`

Multipart form upload.

- Field name: `file`
- Accepts `image/*`
- 5MB limit (enforced)

Returns updated user profile.

### OAuth (optional)

- GET `/auth/oauth/github/start`
- GET `/auth/oauth/github/callback`
- GET `/auth/oauth/google/start`
- GET `/auth/oauth/google/callback`

If OAuth client credentials are not configured, these endpoints return `503`.

## Repositories

All repo endpoints are under `/repos`.

### POST `/repos/ingest`

Body:

```json
{ "repo_url": "https://github.com/org/repo", "branch": "main" }
```

Returns immediately (async ingestion started):

```json
{
  "repo_id": 123,
  "files": 0,
  "chunks": 0,
  "id": 123,
  "repo_url": "https://github.com/org/repo",
  "repo_name": "repo",
  "created_at": "2026-02-20T00:00:00",
  "status": "started",
  "file_count": 0
}
```

### POST `/repos/{repo_id}/reingest`

Body:

```json
{ "branch": "main" }
```

Clears indexed data and starts ingestion again.

### GET `/repos`

Returns list of repos for the current user.

### GET `/repos/{repo_id}/files`

Returns the file list for a repo:

```json
{ "repo_id": 123, "files": [{ "id": 1, "file_path": "backend/main.py", "language": "python" }] }
```

### GET `/repos/{repo_id}/files/{file_id}`

Returns file content:

```json
{ "file_path": "backend/main.py", "language": "python", "content": "..." }
```

### POST `/repos/{repo_id}/files/{file_id}/explain`

Body:

```json
{ "level": "beginner" }
```

Returns:

```json
{ "explanation": "...", "referenced_chunks": [1,2,3] }
```

### POST `/repos/{repo_id}/files/{file_id}/explain_symbol`

Body:

```json
{ "function_name": "my_func", "start_line": 10, "end_line": 42, "level": "expert" }
```

Returns:

```json
{ "explanation": "...", "referenced_chunks": [] }
```

### POST `/repos/{repo_id}/files/{file_id}/why_written`

Body:

```json
{ "function_name": "my_func", "start_line": 10, "end_line": 42, "level": "intermediate" }
```

### GET `/repos/{repo_id}/analytics`

Returns ingest stats and repo-wide analytics.

### GET `/repos/{repo_id}/files/{file_id}/metrics`

Returns file metrics.

### GET `/repos/{repo_id}/risk_radar`
### GET `/repos/{repo_id}/files/{file_id}/risk_radar`

Risk radar endpoints exist for repo/file-level risk analysis.

### DELETE `/repos/{repo_id}`

Deletes the repo and associated data.

## Chat / RAG

### GET `/repos/{repo_id}/chat/history`

Query params:

- `limit` (default 100)

Returns structured messages with `sources` on the AI turns:

```json
{
  "repo_id": 123,
  "messages": [
    {"id":"1:user","role":"user","content":"...","timestamp":"...","sources":[]},
    {"id":"1:ai","role":"ai","content":"...","timestamp":"...","sources":["backend/main.py"]}
  ]
}
```

### POST `/query`

Body:

```json
{ "repo_id": 123, "question": "Where is auth handled?", "explain_level": "intermediate" }
```

Returns:

```json
{ "answer": "...", "referenced_files": ["backend/auth/routes.py"], "token_usage": 1234, "latency_ms": 321, "cached": false }
```

## Analytics

### GET `/dashboard/overview`

Returns totals for the current user.

### GET `/analytics/usage`

Returns token usage + query latency summary.

## cURL examples

Signup:

```bash
curl -i http://localhost:8000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","email":"alice@example.com","password":"password123","remember_me":false}'
```

Ask a question (requires cookie from login/signup):

```bash
curl -i http://localhost:8000/query \
  -H "Content-Type: application/json" \
  --cookie "codelens_auth=..." \
  -d '{"repo_id":123,"question":"How does ingestion work?","explain_level":"intermediate"}'
```
