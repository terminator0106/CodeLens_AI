# Frontend documentation

This doc explains how the website frontend is structured and how it interacts with the backend.

## Tech stack

- React + TypeScript
- Vite
- Tailwind CSS
- Zustand stores
- React Router `HashRouter`

## Routing

Routes are declared in `frontend/App.tsx`.

Public routes:

- `/` Landing
- `/products` Products
- `/solutions` Solutions
- `/docs` Docs
- `/login` Login
- `/signup` Signup

Protected routes:

- `/dashboard`
- `/repo/:id`
- `/chat`
- `/analytics`
- `/settings`

### ProtectedRoute behavior

Protected routes do not redirect to `/login` directly.

Instead:

- If the user is not authenticated and auth loading has completed, the UI opens the **AuthModal**.
- The protected page renders nothing while unauthenticated.

This ensures a consistent modal-based auth UX.

## State management (Zustand)

The app keeps:

- auth session state (user, loading, authenticated)
- UI state (auth modal open state)

Key flow:

- On app startup, `api.getMe()` is called.
- If it succeeds, the auth store is populated.
- If it fails, user is cleared and protected routes will trigger login modal when visited.

## API client

The API wrapper lives in `frontend/services/api.ts`.

Important behavior:

- Uses `credentials: 'include'` so cookies are sent.
- Normalizes errors:
  - on 401 for non-auth endpoints, it logs the user out and opens the login modal.

`VITE_API_BASE_URL` controls the base URL in development.

## Local dev URLs (defaults)

- Frontend dev server: `http://localhost:3000` (configured in `frontend/vite.config.ts`)
- Backend API: `http://localhost:8000`

If you change the frontend port/host, update backend CORS (`ALLOWED_ORIGINS`) accordingly.

## Repo browser UI

Repo View is built from:

- File tree component (builds a hierarchical tree from flat paths)
- Code viewer component

The frontend normalizes path separators (`\` vs `/`) when building the tree so the UI is consistent across platforms.

## Explain UX

Explain calls are cached locally to improve speed.

Cache keys are scoped by:

- user id
- repo id
- file id
- scope (`file` vs symbol scope)
- level (beginner/intermediate/expert)

There is also a “why written” cache.

## Chat UX

Chat features:

- Messages are stored in state
- Chat history is loaded from backend
- AI messages can include `sources` for a dropdown
- The renderer avoids unsafe HTML injection and uses safe tokenization/highlighting

## Styling

The app enforces dark mode by adding the `dark` class on the HTML root.

If you need to support light mode, that behavior would need to be changed.
