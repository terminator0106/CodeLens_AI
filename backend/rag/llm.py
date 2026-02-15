import os
from typing import Tuple

from fastapi import HTTPException
import httpx

from settings import settings

_groq_client = None


def _get_openrouter_key() -> str:
    key = (os.getenv("OPENROUTER_API_KEY") or "").strip()
    if not key:
        raise HTTPException(status_code=503, detail="OPENROUTER_API_KEY is not configured")
    return key


def _openrouter_headers() -> dict:
    headers = {
        "Authorization": f"Bearer {_get_openrouter_key()}",
        "Content-Type": "application/json",
    }
    # Optional (recommended by OpenRouter)
    referer = (os.getenv("OPENROUTER_SITE_URL") or "").strip()
    title = (os.getenv("OPENROUTER_APP_NAME") or "").strip()
    if referer:
        headers["HTTP-Referer"] = referer
    if title:
        headers["X-Title"] = title
    return headers


def _openrouter_chat_completion(
    *,
    model: str,
    system_prompt: str,
    user_prompt: str,
    temperature: float = 0.2,
    top_p: float = 1,
    max_tokens: int = 1024,
) -> Tuple[str, int]:
    base_url = (getattr(settings, "openrouter_base_url", "") or "https://openrouter.ai/api/v1").rstrip("/")
    url = f"{base_url}/chat/completions"

    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        "temperature": temperature,
        "top_p": top_p,
        "max_tokens": max_tokens,
    }

    try:
        with httpx.Client(timeout=60) as client:
            resp = client.post(url, headers=_openrouter_headers(), json=payload)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=503, detail="OpenRouter request failed") from exc

    if resp.status_code >= 400:
        # Try to surface provider error message
        try:
            detail = resp.json()
        except Exception:
            detail = {"error": resp.text[:500]}
        raise HTTPException(status_code=503, detail=detail)

    data = resp.json()
    answer = (((data.get("choices") or [{}])[0]).get("message") or {}).get("content") or ""
    usage = data.get("usage") or {}
    token_usage = int(usage.get("total_tokens") or 0)
    return answer, token_usage


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


def generate_answer(
    system_prompt: str,
    user_prompt: str,
    *,
    max_tokens: int = 1024,
    temperature: float = 0.2,
) -> Tuple[str, int]:
    """Generate a natural-language answer from prompts.

    CORE PRODUCT PRINCIPLE: This module is the ONLY place we talk to an LLM.
    All analytics/metrics must remain deterministic elsewhere.
    """

    provider = (settings.llm_provider or "").strip().lower()

    # Default to Groq if configured; fallback to OpenRouter if that is configured.
    if provider == "groq" or (provider == "" and os.getenv("GROQ_API_KEY")):
        client = _get_groq_client()
        try:
            response = client.chat.completions.create(
                model=settings.groq_model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                temperature=temperature,
                top_p=1,
                max_tokens=max_tokens,
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
                temperature=temperature,
                top_p=1,
                max_completion_tokens=max_tokens,
                stream=False,
            )

        answer = getattr(response.choices[0].message, "content", "") or ""
        usage = getattr(response, "usage", None)
        token_usage = int(getattr(usage, "total_tokens", 0) or 0)
        return answer, token_usage

    # OpenRouter provider
    model = (settings.chat_model or "").strip() or "openai/gpt-4o-mini"
    return _openrouter_chat_completion(
        model=model,
        system_prompt=system_prompt,
        user_prompt=user_prompt,
        temperature=temperature,
        top_p=1,
        max_tokens=max_tokens,
    )


def refine_answer_with_openrouter(
    *,
    question: str,
    rag_draft: str,
    referenced_files: list[str],
) -> Tuple[str, int]:
    """Refine a RAG-grounded draft using OpenRouter as a helper.

    Goal: keep the response mostly grounded in the retrieved context (roughly 80%),
    while using OpenAI for readability and small, clearly-marked best-practice additions (up to ~20%).

    If OpenRouter is not configured, return the original draft with 0 token usage.
    """

    if not os.getenv("OPENROUTER_API_KEY"):
        return rag_draft, 0

    files_hint = "\n".join(f"- {p}" for p in (referenced_files or [])[:40])
    system_prompt = (
        "You are a senior software assistant. You will refine an existing draft answer that was generated "
        "from repository context.\n\n"
        "Hard rules:\n"
        "- Preserve the draft's factual content and file references.\n"
        "- Keep at least 80% of the final answer semantically identical to the draft.\n"
        "- You may add up to ~20% extra content, but ONLY as general best-practices or clarifications, "
        "and you must not introduce repository-specific claims that aren't in the draft.\n"
        "- Do not mention these rules.\n"
        "- Keep formatting readable (short sections/bullets) and avoid markdown that relies on asterisks."
    )

    user_prompt = (
        f"Question:\n{question}\n\n"
        f"Referenced files (from retrieval):\n{files_hint or '- (none)'}\n\n"
        f"Draft answer (keep most of this):\n{rag_draft}\n\n"
        "Return the refined answer only."
    )

    model = (settings.chat_model or "").strip() or "openai/gpt-4o-mini"
    return _openrouter_chat_completion(
        model=model,
        system_prompt=system_prompt,
        user_prompt=user_prompt,
        temperature=0.2,
        top_p=1,
        max_tokens=512,
    )
