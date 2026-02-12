from typing import List, Tuple
import logging
import os

import tiktoken

from settings import settings

logger = logging.getLogger(__name__)


def chunk_text(text: str) -> List[Tuple[str, int]]:
    """Chunk text into token-limited segments with overlap."""

    encoder = tiktoken.get_encoding("cl100k_base")
    tokens = encoder.encode(text)
    chunks = []
    start = 0
    chunk_size = settings.chunk_size_tokens
    overlap = settings.chunk_overlap_tokens

    if chunk_size <= 0:
        raise ValueError("CHUNK_SIZE_TOKENS must be > 0")

    # Guard against infinite loops / memory blowups.
    # If overlap >= chunk_size, `start` may not advance (or can even go backwards), causing an infinite loop.
    if overlap < 0:
        overlap = 0
    if overlap >= chunk_size:
        logger.warning(
            "Invalid overlap (%s) for chunk_size (%s); clamping overlap to %s",
            overlap,
            chunk_size,
            max(chunk_size - 1, 0),
        )
        overlap = max(chunk_size - 1, 0)

    max_chunks = int(os.getenv("MAX_CHUNKS_PER_FILE", "5000"))

    while start < len(tokens):
        if len(chunks) >= max_chunks:
            logger.warning("Max chunks per file reached (%s); truncating chunking", max_chunks)
            break
        end = min(start + chunk_size, len(tokens))
        chunk_tokens = tokens[start:end]
        chunk_text = encoder.decode(chunk_tokens)
        chunks.append((chunk_text, len(chunk_tokens)))

        next_start = end - overlap
        # Ensure forward progress even in pathological settings.
        if next_start <= start:
            next_start = end
        start = next_start

    return chunks
