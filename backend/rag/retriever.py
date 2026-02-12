import logging
import re
from typing import List, Tuple

from sqlalchemy.orm import Session

from settings import settings
from database import crud
from vectorstore.embeddings import embed_query
from vectorstore.faiss_index import get_metadata, search

logger = logging.getLogger(__name__)


def retrieve_chunks(db: Session, repo_id: int, question: str) -> Tuple[List[str], List[str]]:
    """Retrieve top-k chunk contents and file paths for a repo."""

    # Preferred path: semantic retrieval via FAISS if embeddings are configured and an index exists.
    indices, metadata = [], []
    if not settings.disable_embeddings:
        try:
            query_vector = embed_query(question)
            indices, _ = search(repo_id, query_vector, settings.top_k)
            metadata = get_metadata(repo_id)
        except Exception:
            indices, metadata = [], []

    if indices and metadata:
        chunk_ids: List[int] = []
        referenced_files: List[str] = []
        for idx in indices:
            if idx == -1 or idx >= len(metadata):
                continue
            chunk_ids.append(int(metadata[idx]["chunk_id"]))
            referenced_files.append(str(metadata[idx]["file_path"]))

        chunks = crud.get_chunks_by_ids(db, chunk_ids)
        chunk_map = {chunk.id: chunk.chunk_content for chunk in chunks}
        ordered_chunks = [chunk_map[cid] for cid in chunk_ids if cid in chunk_map]
        logger.info("Retrieved %s chunks via FAISS for repo %s", len(ordered_chunks), repo_id)
        return ordered_chunks, referenced_files

    # Fallback path: lexical retrieval over DB chunks (works without any external API keys).
    lexical_limit = max(200, settings.top_k * 50)
    rows = crud.search_chunks_lexical(db, repo_id, question, limit=lexical_limit)
    if not rows:
        # If nothing matches, still return a few chunks so the LLM has context.
        rows = crud.search_chunks_lexical(db, repo_id, "", limit=lexical_limit)
    if not rows:
        return [], []

    terms = [t for t in re.split(r"\W+", question.lower()) if len(t) >= 3]
    scored: List[tuple[int, str, str]] = []  # (score, chunk_content, file_path)
    for chunk_content, file_path in rows:
        text = (chunk_content or "").lower()
        score = 0
        for term in terms:
            if term in text:
                score += text.count(term)
        scored.append((score, chunk_content, file_path))

    scored.sort(key=lambda x: x[0], reverse=True)
    top = scored[: settings.top_k]
    if top and top[0][0] == 0:
        # If no terms matched at all, still return the first few chunks so the LLM has some context.
        top = scored[: settings.top_k]

    ordered_chunks = [c for _, c, _ in top]
    referenced_files = [p for _, _, p in top]
    logger.info("Retrieved %s chunks via lexical fallback for repo %s", len(ordered_chunks), repo_id)
    return ordered_chunks, referenced_files
