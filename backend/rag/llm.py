import os
from typing import Tuple

from fastapi import HTTPException
from openai import OpenAI

from settings import settings

_client: OpenAI | None = None
_groq_client = None


def _get_openai_client() -> OpenAI:
    global _client
    if _client is not None:
        return _client
    if not os.getenv("OPENAI_API_KEY"):
        raise HTTPException(status_code=503, detail="OPENAI_API_KEY is not configured")
    _client = OpenAI()
    return _client


def _get_groq_client():
    global _groq_client
    if _groq_client is not None:
        return _groq_client
    if not os.getenv("GROQ_API_KEY"):
        raise HTTPException(status_code=503, detail="GROQ_API_KEY is not configured")
    try:
        from groq import Groq  # type: ignore
    except (ModuleNotFoundError, ImportError) as exc:
        raise HTTPException(
            status_code=503,
            detail=(
                "Groq SDK is not installed in the running Python environment. "
                "Install the 'groq' package (and make sure Uvicorn is started from the same venv)."
            ),
        ) from exc
    _groq_client = Groq()
    return _groq_client


def generate_answer(system_prompt: str, user_prompt: str) -> Tuple[str, int]:
    """Generate a natural-language answer from prompts.

    CORE PRODUCT PRINCIPLE: This module is the ONLY place we talk to an LLM.
    All analytics/metrics must remain deterministic elsewhere.
    """

    provider = (settings.llm_provider or "").strip().lower()

    # Default to Groq if configured; fallback to OpenAI if that is configured.
    if provider == "groq" or (provider == "" and os.getenv("GROQ_API_KEY")):
        client = _get_groq_client()
        try:
            response = client.chat.completions.create(
                model=settings.groq_model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                temperature=0.2,
                top_p=1,
                max_tokens=1024,
                stream=False,
            )
        except TypeError:
            # Some Groq SDK versions use `max_completion_tokens`.
            response = client.chat.completions.create(
                model=settings.groq_model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                temperature=0.2,
                top_p=1,
                max_completion_tokens=1024,
                stream=False,
            )

        answer = getattr(response.choices[0].message, "content", "") or ""
        usage = getattr(response, "usage", None)
        token_usage = int(getattr(usage, "total_tokens", 0) or 0)
        return answer, token_usage

    # OpenAI provider
    client = _get_openai_client()
    response = client.chat.completions.create(
        model=settings.chat_model,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.2,
    )
    answer = response.choices[0].message.content or ""
    token_usage = response.usage.total_tokens if response.usage else 0
    return answer, int(token_usage)
