# RAG pipeline documentation

This doc explains how CodeLens AI answers repo questions using Retrieval-Augmented Generation (RAG).

## Goals

- Ground answers in the repository
- Provide sources (file paths) to support trust
- Stay within LLM provider limits (Groq request/token caps)
- Keep analytics deterministic

## Key modules

- Retrieval: `backend/rag/retriever.py`
- Prompt/context compression: `backend/rag/compressor.py`
- LLM calls: `backend/rag/llm.py` (single place for LLM I/O)
- Orchestration endpoint: `backend/rag/pipeline.py`

## Endpoints

- POST `/query` — answer a question for a repo
- GET `/repos/{repo_id}/chat/history` — return structured history (with sources on AI messages)

## Retrieval strategy

1. Retrieve top chunks for a question:
   - Prefer semantic retrieval (FAISS) if embeddings are enabled
   - Otherwise use a lexical fallback

2. Collect referenced file paths as `referenced_files`.

## Context construction

The pipeline uses two sources of context:

- **Chunk context**: retrieved chunks compressed by token budget
- **File context**: small excerpts from a few top referenced files

The file context is bounded (e.g., only a few files and a per-file char limit) to prevent runaway prompts.

## Compression and clipping

Two layers are used:

1. `compress_context(chunks)` trims chunk context based on `MAX_CONTEXT_TOKENS`.
2. The final prompt builder clips merged context with a fixed token budget to stay under Groq constraints.

If Groq still rejects the prompt (e.g. 413 / request too large), the backend retries once with an even smaller context.

## Answer generation (two-draft blend)

To balance helpfulness and groundedness, the system generates:

- **RAG draft**: uses repo context (only if context exists)
- **General draft**: uses general engineering knowledge (always)

Then it blends them using Groq into a final answer.

Blending rules (conceptually):

- Keep roughly ~60% general guidance and ~40% repo-grounded content
- Never invent repo-specific facts unless they appear in the repo-grounded draft

## Sources (UX)

The backend returns `referenced_files` separately.

- The frontend uses this list to render a Sources dropdown.
- The sources list is also persisted for chat history.

## Deterministic analytics

Analytics aggregation is kept deterministic by ensuring LLM calls are centralized and metrics are recorded outside the LLM module.

## Tuning knobs

- `RAG_TOP_K` — fewer chunks = smaller prompts and faster responses
- `MAX_CONTEXT_TOKENS` — hard budget for chunk compression
- Chunking settings: `CHUNK_SIZE_TOKENS` / `CHUNK_OVERLAP_TOKENS`
- Embeddings on/off: `DISABLE_EMBEDDINGS`
