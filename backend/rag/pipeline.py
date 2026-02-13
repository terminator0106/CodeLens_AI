import logging
import time
import json

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from analytics.metrics import record_query
from auth.dependencies import get_current_user
from database import crud
from database.db import get_db
from schemas.api_models import ChatHistoryMessage, ChatHistoryResponse, QueryRequest, QueryResponse
from .retriever import retrieve_chunks
from .compressor import compress_context
from .llm import generate_answer, refine_answer_with_openrouter

logger = logging.getLogger(__name__)

router = APIRouter(tags=["rag"])


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
            )
        )
        try:
            refs = json.loads(row.referenced_files_json or "[]")
        except Exception:
            refs = []
        content = row.answer
        if refs:
            content = f"{content}\n\nSources:\n" + "\n".join(f"• {p}" for p in refs)
        messages.append(
            ChatHistoryMessage(
                id=f"{row.id}:ai",
                role="ai",
                content=content,
                timestamp=ts,
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

    cached = crud.get_cached_chat_message(db, current_user.id, payload.repo_id, payload.question)
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
    if not chunks:
        # STRICT RAG RULE: Do not call the LLM if we have no grounded context.
        latency_ms = int((time.perf_counter() - start) * 1000)
        return QueryResponse(
            answer="I couldn’t find relevant code in this repository.",
            referenced_files=[],
            token_usage=0,
            latency_ms=latency_ms,
            cached=False,
        )

    context = compress_context(chunks)
    system_prompt = (
        "You are CodeLens AI, a documentation assistant. Answer the question using ONLY the provided context. "
        "Prefer concrete, repo-grounded details (files, functions, behavior). "
        "If the context is insufficient, say you do not know. "
        "Keep formatting readable and avoid markdown that relies on asterisks."
    )

    user_prompt = f"Context:\n{context}\n\nQuestion: {payload.question}"
    rag_draft, token_usage_main = generate_answer(system_prompt, user_prompt)

    answer, token_usage_refine = refine_answer_with_openrouter(
        question=payload.question,
        rag_draft=rag_draft,
        referenced_files=sorted(set(referenced_files)),
    )

    token_usage = int(token_usage_main or 0) + int(token_usage_refine or 0)
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
            answer=answer,
            referenced_files=sorted(set(referenced_files)),
            token_usage=token_usage,
            latency_ms=latency_ms,
        )
    except Exception:
        logger.exception("Failed to persist chat message")

    return QueryResponse(
        answer=answer,
        referenced_files=sorted(set(referenced_files)),
        token_usage=token_usage,
        latency_ms=latency_ms,
        cached=False,
    )
