from typing import List
import os

from openai import OpenAI

from settings import settings

_client: OpenAI | None = None


def _get_client() -> OpenAI:
    global _client
    if _client is not None:
        return _client

    if not os.getenv("OPENAI_API_KEY"):
        raise RuntimeError("OPENAI_API_KEY is not set")

    _client = OpenAI()
    return _client


def embed_texts(texts: List[str]) -> List[List[float]]:
    """Generate embeddings for a list of texts."""

    if settings.disable_embeddings:
        raise RuntimeError("Embeddings are disabled (DISABLE_EMBEDDINGS=true)")

    client = _get_client()
    if not texts:
        return []

    batch_size = max(1, int(getattr(settings, "embeddings_batch_size", 64)))
    vectors: List[List[float]] = []
    for i in range(0, len(texts), batch_size):
        batch = texts[i : i + batch_size]
        response = client.embeddings.create(model=settings.embedding_model, input=batch)
        vectors.extend([item.embedding for item in response.data])
    return vectors


def embed_query(text: str) -> List[float]:
    """Generate a single embedding for the query text."""

    if settings.disable_embeddings:
        raise RuntimeError("Embeddings are disabled (DISABLE_EMBEDDINGS=true)")

    client = _get_client()
    response = client.embeddings.create(model=settings.embedding_model, input=[text])
    return response.data[0].embedding
