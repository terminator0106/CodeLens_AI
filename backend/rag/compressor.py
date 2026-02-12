from typing import List
import json
import logging
import urllib.request
import urllib.error

import tiktoken

from settings import settings

logger = logging.getLogger(__name__)


def _scaledown_compress(text: str) -> str:
    """Best-effort external compression via ScaleDown.

    This is intentionally tolerant: if the service is not configured or errors,
    we fall back to local behavior so the app keeps working.
    """

    if not settings.scaledown_api_key or not settings.scaledown_api_url:
        return text

    try:
        payload = json.dumps({"text": text}).encode("utf-8")
        req = urllib.request.Request(
            settings.scaledown_api_url,
            data=payload,
            method="POST",
            headers={
                "Content-Type": "application/json",
                # Generic bearer header; if ScaleDown expects a different header,
                # set up a small shim endpoint or tell me the required format.
                "Authorization": f"Bearer {settings.scaledown_api_key}",
            },
        )
        with urllib.request.urlopen(req, timeout=15) as resp:
            raw = resp.read().decode("utf-8", errors="replace")
        data = json.loads(raw) if raw else {}

        # Try a few common response shapes.
        for key in ("compressed_text", "compressed", "text", "output"):
            if isinstance(data, dict) and isinstance(data.get(key), str) and data.get(key):
                return data[key]

        return text
    except Exception as exc:
        logger.info("ScaleDown compression unavailable; falling back to local (%s)", type(exc).__name__)
        return text


def compress_context(chunks: List[str]) -> str:
    """Trim context to a token budget by concatenating top chunks."""

    encoder = tiktoken.get_encoding("cl100k_base")
    max_tokens = settings.max_context_tokens
    selected = []
    total_tokens = 0

    for chunk in chunks:
        tokens = encoder.encode(chunk)
        if total_tokens + len(tokens) > max_tokens:
            break
        selected.append(chunk)
        total_tokens += len(tokens)

    local = "\n\n".join(selected)

    # Optional external compression step (safe fallback).
    provider = (settings.compression_provider or "").strip().lower()
    if provider == "scaledown":
        local = _scaledown_compress(local)

    # Ensure we still respect the token budget after any compression.
    tokens = encoder.encode(local)
    if len(tokens) > max_tokens:
        local = encoder.decode(tokens[:max_tokens])
    return local
