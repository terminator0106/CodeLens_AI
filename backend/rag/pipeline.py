import logging
import time
import json
import tiktoken

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from analytics.metrics import record_query
from auth.dependencies import get_current_user
from database import crud
from database.db import get_db
from schemas.api_models import ChatHistoryMessage, ChatHistoryResponse, QueryRequest, QueryResponse
from .retriever import retrieve_chunks
from .compressor import compress_context
from .llm import generate_answer, blend_general_and_rag_with_groq

logger = logging.getLogger(__name__)

router = APIRouter(tags=["rag"])


def _clip_to_token_budget(text: str, *, encoder, max_tokens: int) -> str:
    if not text or max_tokens <= 0:
        return ""
    tokens = encoder.encode(text)
    if len(tokens) <= max_tokens:
        return text
    return encoder.decode(tokens[:max_tokens])


def _build_rag_user_prompt(
    *,
    merged_context: str,
    question: str,
    system_prompt: str,
    max_completion_tokens: int,
    encoder,
) -> str:
    """Build a Groq-safe prompt by clipping context to a token budget.

    Groq on-demand tiers can reject a single request if total (prompt + completion)
    tokens exceed a TPM cap. We leave headroom for non-context parts.
    """

    # Keep well under the 6k cap to avoid intermittent failures.
    total_budget = 5200
    safety_margin = 200

    prefix = "Context:\n"
    suffix = f"\n\nQuestion: {question}"

    sys_tokens = len(encoder.encode(system_prompt or ""))
    fixed_tokens = len(encoder.encode(prefix + suffix))

    allowed_ctx = total_budget - safety_margin - int(max_completion_tokens or 0) - sys_tokens - fixed_tokens
    if allowed_ctx <= 0:
        return f"Question: {question}"

    clipped_ctx = _clip_to_token_budget(merged_context or "", encoder=encoder, max_tokens=allowed_ctx)
    if not clipped_ctx.strip():
        return f"Question: {question}"
    return f"{prefix}{clipped_ctx}{suffix}"


@router.get("/repos/{repo_id}/chat/history", response_model=ChatHistoryResponse)
def chat_history(repo_id: int, limit: int = 100, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    repo = crud.get_repo_by_id_any(db, repo_id)
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")
    if repo.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")

    rows = crud.list_chat_messages_by_repo(db, user_id=current_user.id, repo_id=repo_id, limit=limit)
    messages: list[ChatHistoryMessage] = []
    for row in rows:
        ts = row.created_at.isoformat() if getattr(row, "created_at", None) else ""
        messages.append(
            ChatHistoryMessage(
                id=f"{row.id}:user",
                role="user",
                content=row.question,
                timestamp=ts,
                sources=[],
            )
        )
        try:
            refs = json.loads(row.referenced_files_json or "[]")
        except Exception:
            refs = []
        messages.append(
            ChatHistoryMessage(
                id=f"{row.id}:ai",
                role="ai",
                content=row.answer,
                timestamp=ts,
                sources=sorted(set(refs or [])),
            )
        )

    return ChatHistoryResponse(repo_id=repo_id, messages=messages)


@router.post("/query", response_model=QueryResponse)
def query(payload: QueryRequest, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Run the RAG pipeline for a repository question."""
    if not payload.question or not payload.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty")

    repo = crud.get_repo_by_id_any(db, payload.repo_id)
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")
    if repo.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")

    start = time.perf_counter()

    level = (getattr(payload, "explain_level", None) or "").strip().lower()
    if level not in {"beginner", "intermediate", "expert"}:
        level = "intermediate"

    cached = crud.get_cached_chat_message(
        db,
        current_user.id,
        payload.repo_id,
        payload.question,
        explain_level=level,
    )
    if cached:
        try:
            referenced_files = json.loads(cached.referenced_files_json or "[]")
        except Exception:
            referenced_files = []
        latency_ms = int((time.perf_counter() - start) * 1000)
        return QueryResponse(
            answer=cached.answer,
            referenced_files=sorted(set(referenced_files or [])),
            token_usage=0,
            latency_ms=latency_ms,
            cached=True,
        )

    chunks, referenced_files = retrieve_chunks(db, payload.repo_id, payload.question)
    referenced_files = sorted(set(referenced_files or []))

    # Build a richer repo context for the LLM by including the top file contents.
    # This improves answer quality, especially when chunks are too small or missing key definitions.
    file_context = ""
    if referenced_files:
        # Include up to a few files to keep prompts bounded.
        files = crud.get_files_by_paths(db, payload.repo_id, referenced_files[:4])
        parts: list[str] = []
        total_chars = 0
        max_total_chars = 10_000
        max_file_chars = 2_500
        for f in files:
            if total_chars >= max_total_chars:
                break
            raw = (getattr(f, "raw_content", "") or "").strip()
            if not raw:
                continue
            clipped = raw[:max_file_chars]
            block = f"File: {f.file_path}\n{clipped}"
            parts.append(block)
            total_chars += len(block)
        if parts:
            file_context = "\n\n".join(parts)

    context = compress_context(chunks) if chunks else ""
    if level == "beginner":
        style = "Explain for a beginner engineer; define jargon briefly; use short paragraphs or bullets."
    elif level == "expert":
        style = "Be expert-concise; focus on interfaces, invariants, and edge cases; avoid fluff."
    else:
        style = "Be concise and practical; include concrete file/function references when available."

    system_prompt = (
        "You are CodeLens AI, a documentation assistant. Answer the question using ONLY the provided context. "
        "Prefer concrete, repo-grounded details (files, functions, behavior). "
        "If the context is insufficient, say you do not know. "
        f"{style} "
        "Keep formatting readable and avoid markdown that relies on asterisks."
    )

    # RAG draft (repo-grounded) if we have any context at all.
    rag_draft = ""
    token_usage_rag = 0
    if context or file_context:
        merged_context = "\n\n".join([p for p in [context, file_context] if p.strip()])
        encoder = tiktoken.get_encoding("cl100k_base")
        rag_max_tokens = 450
        user_prompt = _build_rag_user_prompt(
            merged_context=merged_context,
            question=payload.question,
            system_prompt=system_prompt,
            max_completion_tokens=rag_max_tokens,
            encoder=encoder,
        )

        # Retry once with a smaller context if Groq still rejects the request.
        try:
            rag_draft, token_usage_rag = generate_answer(system_prompt, user_prompt, max_tokens=rag_max_tokens)
        except Exception as exc:
            msg = str(exc)
            if "Request too large" in msg or "Error code: 413" in msg or "rate_limit_exceeded" in msg:
                smaller_prompt = _build_rag_user_prompt(
                    merged_context=_clip_to_token_budget(merged_context, encoder=encoder, max_tokens=800),
                    question=payload.question,
                    system_prompt=system_prompt,
                    max_completion_tokens=300,
                    encoder=encoder,
                )
                rag_draft, token_usage_rag = generate_answer(system_prompt, smaller_prompt, max_tokens=300)
            else:
                raise

    # General draft (best-effort) even when retrieval is weak.
    general_system = (
        "You are a senior software assistant. Answer using general engineering knowledge. "
        "Do NOT claim repo-specific facts unless they are explicitly provided. "
        "If the question depends on repo details, explain what to look for and how to verify. "
        f"{style} "
        "Keep formatting readable and avoid markdown that relies on asterisks."
    )
    general_user = (
        f"Question: {payload.question}\n\n"
        "If relevant, mention which kinds of files/functions typically contain the answer."
    )
    general_draft, token_usage_general = generate_answer(general_system, general_user, max_tokens=450)

    # Blend the two drafts into one answer (Groq-only).
    answer, token_usage_blend = blend_general_and_rag_with_groq(
        question=payload.question,
        general_draft=general_draft,
        rag_draft=rag_draft,
        referenced_files=referenced_files,
    )

    token_usage = int(token_usage_rag or 0) + int(token_usage_general or 0) + int(token_usage_blend or 0)
    latency_ms = int((time.perf_counter() - start) * 1000)

    record_query(token_usage, latency_ms)
    logger.info("RAG query repo=%s latency=%sms tokens=%s", payload.repo_id, latency_ms, token_usage)

    # Persist the turn for later history + caching.
    try:
        crud.create_chat_message(
            db,
            user_id=current_user.id,
            repo_id=payload.repo_id,
            question=payload.question,
            explain_level=level,
            answer=answer,
            referenced_files=referenced_files,
            token_usage=token_usage,
            latency_ms=latency_ms,
        )
    except Exception:
        logger.exception("Failed to persist chat message")

    return QueryResponse(
        answer=answer,
        referenced_files=referenced_files,
        token_usage=token_usage,
        latency_ms=latency_ms,
        cached=False,
    )
