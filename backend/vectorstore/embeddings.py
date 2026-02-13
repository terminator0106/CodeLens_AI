from typing import List
import os

import httpx

from settings import settings


def _get_openrouter_key() -> str:
    key = (os.getenv("OPENROUTER_API_KEY") or "").strip()
    if not key:
        raise RuntimeError("OPENROUTER_API_KEY is not set")
    return key


def _headers() -> dict:
    headers = {
        "Authorization": f"Bearer {_get_openrouter_key()}",
        "Content-Type": "application/json",
    }
    referer = (os.getenv("OPENROUTER_SITE_URL") or "").strip()
    title = (os.getenv("OPENROUTER_APP_NAME") or "").strip()
    if referer:
        headers["HTTP-Referer"] = referer
    if title:
        headers["X-Title"] = title
    return headers


def _embeddings_endpoint() -> str:
    base_url = (getattr(settings, "openrouter_base_url", "") or "https://openrouter.ai/api/v1").rstrip("/")
    return f"{base_url}/embeddings"


def embed_texts(texts: List[str]) -> List[List[float]]:
    """Generate embeddings for a list of texts."""

    if settings.disable_embeddings:
        raise RuntimeError("Embeddings are disabled (DISABLE_EMBEDDINGS=true)")

    if not texts:
        return []

    batch_size = max(1, int(getattr(settings, "embeddings_batch_size", 64)))
    vectors: List[List[float]] = []
    for i in range(0, len(texts), batch_size):
        batch = texts[i : i + batch_size]

        payload = {"model": settings.embedding_model, "input": batch}
        with httpx.Client(timeout=60) as client:
            resp = client.post(_embeddings_endpoint(), headers=_headers(), json=payload)
        if resp.status_code >= 400:
            raise RuntimeError(f"OpenRouter embeddings failed: {resp.status_code} {resp.text[:500]}")
        data = resp.json()
        vectors.extend([item["embedding"] for item in (data.get("data") or []) if "embedding" in item])
    return vectors


def embed_query(text: str) -> List[float]:
    """Generate a single embedding for the query text."""

    if settings.disable_embeddings:
        raise RuntimeError("Embeddings are disabled (DISABLE_EMBEDDINGS=true)")

    payload = {"model": settings.embedding_model, "input": [text]}
    with httpx.Client(timeout=60) as client:
        resp = client.post(_embeddings_endpoint(), headers=_headers(), json=payload)
    if resp.status_code >= 400:
        raise RuntimeError(f"OpenRouter embeddings failed: {resp.status_code} {resp.text[:500]}")
    data = resp.json()
    return (data.get("data") or [{}])[0].get("embedding") or []
