import logging
import time

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from analytics.metrics import record_query
from auth.dependencies import get_current_user
from database import crud
from database.db import get_db
from schemas.api_models import QueryRequest, QueryResponse
from .retriever import retrieve_chunks
from .compressor import compress_context
from .llm import generate_answer

logger = logging.getLogger(__name__)

router = APIRouter(tags=["rag"])


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
    chunks, referenced_files = retrieve_chunks(db, payload.repo_id, payload.question)
    if not chunks:
        # STRICT RAG RULE: Do not call the LLM if we have no grounded context.
        latency_ms = int((time.perf_counter() - start) * 1000)
        return QueryResponse(
            answer="I couldn’t find relevant code in this repository.",
            referenced_files=[],
            token_usage=0,
            latency_ms=latency_ms,
        )

    context = compress_context(chunks)
    system_prompt = (
        "You are CodeLens AI, a documentation assistant. Answer the question using the provided context. "
        "If the context is insufficient, say you do not know."
    )

    user_prompt = f"Context:\n{context}\n\nQuestion: {payload.question}"
    answer, token_usage = generate_answer(system_prompt, user_prompt)
    latency_ms = int((time.perf_counter() - start) * 1000)

    record_query(token_usage, latency_ms)
    logger.info("RAG query repo=%s latency=%sms tokens=%s", payload.repo_id, latency_ms, token_usage)

    return QueryResponse(
        answer=answer,
        referenced_files=sorted(set(referenced_files)),
        token_usage=token_usage,
        latency_ms=latency_ms,
    )
