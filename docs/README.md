# CodeLens AI Documentation

This folder contains detailed project documentation for the CodeLens AI website.

## Start here

- **Website walkthrough (user view):** [website-walkthrough.md](./website-walkthrough.md)
- **Architecture overview (high level):** [architecture.md](./architecture.md)
- **API reference (backend endpoints + payloads):** [api-reference.md](./api-reference.md)

## Deep dives

- **Frontend (React/Vite/Tailwind/Zustand):** [frontend.md](./frontend.md)
- **Backend (FastAPI/SQLite/SQLAlchemy):** [backend.md](./backend.md)
- **RAG pipeline (retrieval, compression, blending, sources):** [rag.md](./rag.md)
- **Security & multi-tenancy:** [security.md](./security.md)
- **Troubleshooting:** [troubleshooting.md](./troubleshooting.md)

## How to keep docs accurate

- Prefer referencing the **actual routes** and **Pydantic schemas** in `backend/`.
- If you change an endpoint shape, update [api-reference.md](./api-reference.md).
- If you change ingestion/retrieval behavior, update [rag.md](./rag.md).
