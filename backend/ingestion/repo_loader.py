import logging
import re
import subprocess
import tempfile
import time
from pathlib import Path
from typing import List
import os
import json

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from sqlalchemy.orm import Session

from auth.dependencies import get_current_user
from settings import DATA_DIR, settings
from database import crud
from database.db import get_db
from database.db import SessionLocal
from database.models import CodeChunk, CodeFile
from schemas.api_models import RepoFilesResponse, RepoIngestRequest, RepoResponse, FileResponse, FileContentResponse
from schemas.api_models import RepoIngestResponse, RepoReingestRequest
from schemas.api_models import (
    FileExplainRequest,
    FileExplainResponse,
    FileExplainSymbolRequest,
    FileMetricsResponse,
    RepoAnalyticsResponse,
    WhyWrittenRequest,
)
from vectorstore.faiss_index import add_embeddings
from .file_reader import read_code_files
from .chunker import chunk_text
from rag.llm import generate_answer

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/repos", tags=["repos"])


def _cleanup_repo_record(repo_id: int) -> None:
    """Best-effort cleanup for failed ingestions (delete repo + cascade files/chunks)."""
    cleanup_db: Session = SessionLocal()
    try:
        crud.delete_repo(cleanup_db, repo_id)
    except Exception:
        logger.exception("Repo cleanup failed repo_id=%s", repo_id)
    finally:
        cleanup_db.close()


def _stats_path(repo_id: int) -> Path:
    return DATA_DIR / f"repo_{repo_id}.stats.json"


def _write_repo_stats(repo_id: int, stats: dict) -> None:
    try:
        DATA_DIR.mkdir(parents=True, exist_ok=True)
        _stats_path(repo_id).write_text(json.dumps(stats), encoding="utf-8")
    except Exception:
        logger.exception("Failed to write repo stats repo_id=%s", repo_id)


def _read_repo_stats(repo_id: int) -> dict:
    try:
        path = _stats_path(repo_id)
        if not path.exists():
            return {}
        return json.loads(path.read_text(encoding="utf-8") or "{}")
    except Exception:
        logger.exception("Failed to read repo stats repo_id=%s", repo_id)
        return {}


def _reset_repo_data(db: Session, repo_id: int) -> None:
    """Delete indexed files, chunks, stats, and FAISS index for a repo.

    Used when re-running ingestion so we don't duplicate rows or vectors.
    """

    # Delete chunks first (FK to files), then files themselves.
    try:
        file_ids_subq = db.query(CodeFile.id).filter(CodeFile.repo_id == repo_id).subquery()
        db.query(CodeChunk).filter(CodeChunk.file_id.in_(file_ids_subq)).delete(synchronize_session=False)
        db.query(CodeFile).filter(CodeFile.repo_id == repo_id).delete(synchronize_session=False)
        db.commit()
    except Exception:
        db.rollback()
        logger.exception("Failed to clear existing repo data repo_id=%s", repo_id)
        raise

    # Best-effort cleanup of stats file and FAISS index.
    try:
        stats_file = _stats_path(repo_id)
        if stats_file.exists():
            stats_file.unlink()
    except Exception:
        logger.warning("Failed to delete stats file during reset repo_id=%s", repo_id)

    try:
        from vectorstore.faiss_index import delete_index

        delete_index(DATA_DIR, repo_id)
    except Exception:
        logger.warning("Failed to delete FAISS index during reset repo_id=%s", repo_id)


def _validate_repo_url(url: str) -> None:
    """Validate repository URL format."""
    pattern = r"^https://github.com/[\w\-\.]+/[\w\-\.]+$"
    if not re.match(pattern, url):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid repository URL")


def _repo_name_from_url(url: str) -> str:
    """Extract repository name from URL."""
    return url.rstrip("/").split("/")[-1]


@router.post("/ingest", response_model=RepoIngestResponse)
def ingest_repo(
    payload: RepoIngestRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Start ingestion in the background and return immediately."""
    _validate_repo_url(payload.repo_url)
    repo_name = _repo_name_from_url(payload.repo_url)

    logger.info("Ingestion request accepted url=%s branch=%s user_id=%s", payload.repo_url, payload.branch, current_user.id)

    # Create the repository record immediately so the UI can display it as "processing".
    try:
        repo = crud.create_repo(db, current_user.id, payload.repo_url, repo_name)
    except Exception as exc:
        logger.exception("DB repo create failed")
        raise HTTPException(status_code=500, detail="Failed to create repository record") from exc

    background_tasks.add_task(
        _run_ingestion_task,
        repo_id=repo.id,
        repo_url=payload.repo_url,
        branch=payload.branch,
        user_id=current_user.id,
    )

    # Keep response shape backward compatible, but indicate async start.
    return RepoIngestResponse(
        repo_id=repo.id,
        files=0,
        chunks=0,
        id=repo.id,
        repo_url=repo.repo_url,
        repo_name=repo.repo_name,
        created_at=repo.created_at.isoformat(),
        status="started",
        file_count=0,
    )


@router.post("/{repo_id}/reingest", response_model=RepoIngestResponse)
def reingest_repo(
    repo_id: int,
    payload: RepoReingestRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Re-run ingestion for an existing repository.

    This clears previously indexed files/chunks and associated vector indexes,
    then schedules a fresh ingestion run using the stored repo_url.
    """

    repo = crud.get_repo_by_id_any(db, repo_id)
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")
    if repo.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")

    branch = payload.branch or "main"
    _validate_repo_url(repo.repo_url)

    try:
        _reset_repo_data(db, repo_id)
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to reset repository before re-ingestion")

    background_tasks.add_task(
        _run_ingestion_task,
        repo_id=repo.id,
        repo_url=repo.repo_url,
        branch=branch,
        user_id=current_user.id,
    )

    return RepoIngestResponse(
        repo_id=repo.id,
        files=0,
        chunks=0,
        id=repo.id,
        repo_url=repo.repo_url,
        repo_name=repo.repo_name,
        created_at=repo.created_at.isoformat(),
        status="reingest_started",
        file_count=0,
    )


def _run_ingestion_task(repo_id: int, repo_url: str, branch: str, user_id: int) -> None:
    """Background ingestion task. Must not raise into the request lifecycle."""

    start_total = time.perf_counter()
    db: Session = SessionLocal()
    should_cleanup = False
    ingest_success = False
    try:
        repo = crud.get_repo_by_id_any(db, repo_id)
        if not repo or repo.user_id != user_id:
            logger.warning("Ingestion task abort repo_id=%s (missing or forbidden)", repo_id)
            return

        should_cleanup = True

        logger.info("Ingestion start repo_id=%s url=%s branch=%s", repo_id, repo_url, branch)

        # Embeddings are always optional and must never block ingestion.
        embeddings_enabled = (not settings.disable_embeddings) and bool(os.getenv("OPENROUTER_API_KEY"))

        with tempfile.TemporaryDirectory() as tmpdir:
            root = Path(tmpdir)

            # 1) Clone repository (with timeout and no interactive prompts)
            clone_start = time.perf_counter()
            logger.info("Repo clone start repo_id=%s", repo_id)
            try:
                cmd = [
                    "git",
                    "clone",
                    "--depth",
                    "1",
                    "--single-branch",
                    "--branch",
                    branch,
                    repo_url,
                    str(root),
                ]
                env = dict(os.environ)
                env["GIT_TERMINAL_PROMPT"] = "0"
                subprocess.run(
                    cmd,
                    check=True,
                    env=env,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    text=True,
                    timeout=int(os.getenv("GIT_CLONE_TIMEOUT_SECONDS", "60")),
                )
            except subprocess.TimeoutExpired:
                logger.exception("Repo clone timeout repo_id=%s", repo_id)
                return
            except subprocess.CalledProcessError as exc:
                logger.error(
                    "Repo clone failed repo_id=%s rc=%s stderr=%s",
                    repo_id,
                    exc.returncode,
                    (exc.stderr or "").strip()[:5000],
                )
                return
            except Exception:
                logger.exception("Repo clone unexpected failure repo_id=%s", repo_id)
                return
            finally:
                logger.info("Repo clone end repo_id=%s elapsed_ms=%s", repo_id, int((time.perf_counter() - clone_start) * 1000))

            # 2) Reject large repos
            try:
                repo_size_mb = sum(p.stat().st_size for p in root.rglob("*") if p.is_file()) / (1024 * 1024)
            except Exception:
                logger.exception("Repo size check failed repo_id=%s", repo_id)
                return
            if repo_size_mb > settings.max_repo_size_mb:
                logger.warning("Repo too large repo_id=%s size_mb=%.2f", repo_id, repo_size_mb)
                return

            # 3) Read files
            read_start = time.perf_counter()
            try:
                code_files = read_code_files(root)
            except Exception:
                logger.exception("File extraction failed repo_id=%s", repo_id)
                return
            logger.info(
                "File extraction end repo_id=%s files=%s elapsed_ms=%s",
                repo_id,
                len(code_files),
                int((time.perf_counter() - read_start) * 1000),
            )
            if not code_files:
                logger.warning("No readable source files repo_id=%s", repo_id)
                return

            # 4) Insert files + chunks in bulk (single transaction)
            chunk_start = time.perf_counter()
            total_chunks = 0
            file_rows: List[CodeFile] = []
            language_counts: dict[str, int] = {}
            for relative_path, language, content in code_files:
                lang_key = (language or "unknown").strip() or "unknown"
                language_counts[lang_key] = language_counts.get(lang_key, 0) + 1
                file_rows.append(
                    CodeFile(
                        repo_id=repo_id,
                        file_path=relative_path,
                        language=language,
                        raw_content=content,
                    )
                )

            try:
                db.add_all(file_rows)
                db.flush()  # assign file IDs
            except Exception:
                db.rollback()
                logger.exception("DB file bulk insert failed repo_id=%s", repo_id)
                return

            file_by_path = {f.file_path: f for f in file_rows}
            chunk_rows: List[CodeChunk] = []
            embed_text_batch: List[str] = []
            embed_chunk_refs: List[CodeChunk] = []
            embed_file_paths: List[str] = []

            for relative_path, _language, content in code_files:
                db_file = file_by_path.get(relative_path)
                if not db_file or not db_file.id:
                    continue
                try:
                    chunks = chunk_text(content)
                except Exception:
                    logger.exception("Chunking failed repo_id=%s path=%s", repo_id, relative_path)
                    continue

                total_chunks += len(chunks)
                for idx, (chunk_text_content, token_count) in enumerate(chunks):
                    chunk_row = CodeChunk(
                        file_id=int(db_file.id),
                        chunk_index=idx,
                        chunk_content=chunk_text_content,
                        token_count=token_count,
                    )
                    chunk_rows.append(chunk_row)
                    if embeddings_enabled:
                        embed_text_batch.append(chunk_text_content)
                        embed_chunk_refs.append(chunk_row)
                        embed_file_paths.append(relative_path)

            if total_chunks == 0:
                db.rollback()
                logger.warning("No chunks produced repo_id=%s", repo_id)
                return

            insert_start = time.perf_counter()
            try:
                # Bulk insert chunks (fast path). return_defaults populates chunk IDs when supported.
                db.bulk_save_objects(chunk_rows, return_defaults=True)
                db.commit()
                ingest_success = True
            except Exception:
                db.rollback()
                logger.exception("DB chunk bulk insert failed repo_id=%s", repo_id)
                return
            logger.info(
                "DB insert end repo_id=%s files=%s chunks=%s elapsed_ms=%s",
                repo_id,
                len(file_rows),
                len(chunk_rows),
                int((time.perf_counter() - insert_start) * 1000),
            )
            logger.info(
                "Chunking end repo_id=%s elapsed_ms=%s",
                repo_id,
                int((time.perf_counter() - chunk_start) * 1000),
            )

            # Persist deterministic analytics stats (no DB/schema changes).
            ingestion_time_ms = int((time.perf_counter() - start_total) * 1000)
            avg_chunk_size = int(sum(c.token_count for c in chunk_rows) / len(chunk_rows)) if chunk_rows else 0
            _write_repo_stats(
                repo_id,
                {
                    "files": len(file_rows),
                    "chunks": len(chunk_rows),
                    "languages": language_counts,
                    "avg_chunk_size": avg_chunk_size,
                    "ingestion_time_ms": ingestion_time_ms,
                },
            )

            # 5) Optional embeddings generation + FAISS insertion
            if not embeddings_enabled:
                logger.info("Embeddings disabled repo_id=%s (lexical-only)", repo_id)
            else:
                embed_start = time.perf_counter()
                try:
                    from vectorstore.embeddings import embed_texts

                    vectors = embed_texts(embed_text_batch)
                    logger.info(
                        "Embedding end repo_id=%s texts=%s vectors=%s elapsed_ms=%s",
                        repo_id,
                        len(embed_text_batch),
                        len(vectors),
                        int((time.perf_counter() - embed_start) * 1000),
                    )

                    # Build metadata aligned with vectors order.
                    metadata_batch: list[dict] = []
                    usable_vectors: list[list[float]] = []
                    for vec, chunk_row, file_path in zip(vectors, embed_chunk_refs, embed_file_paths):
                        if getattr(chunk_row, "id", None) is None:
                            continue
                        usable_vectors.append(vec)
                        metadata_batch.append(
                            {
                                "chunk_id": int(chunk_row.id),
                                "file_path": file_path,
                                "token_count": int(chunk_row.token_count),
                            }
                        )

                    if usable_vectors and metadata_batch:
                        faiss_start = time.perf_counter()
                        try:
                            add_embeddings(DATA_DIR, repo_id, usable_vectors, metadata_batch)
                            logger.info(
                                "FAISS insertion end repo_id=%s vectors=%s elapsed_ms=%s",
                                repo_id,
                                len(usable_vectors),
                                int((time.perf_counter() - faiss_start) * 1000),
                            )
                        except Exception:
                            logger.exception("FAISS insertion failed repo_id=%s; continuing", repo_id)
                    else:
                        logger.warning("No chunk IDs available for FAISS metadata repo_id=%s; skipping", repo_id)
                except Exception:
                    logger.exception("Embeddings generation failed repo_id=%s; continuing lexical-only", repo_id)

            logger.info(
                "Ingestion complete repo_id=%s files=%s chunks=%s elapsed_ms=%s",
                repo_id,
                len(code_files),
                total_chunks,
                int((time.perf_counter() - start_total) * 1000),
            )
    finally:
        if should_cleanup and not ingest_success:
            _cleanup_repo_record(repo_id)
        db.close()


@router.get("", response_model=List[RepoResponse])
def list_repos(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """List repositories for the current user."""
    repos = crud.list_repos_by_user(db, current_user.id)
    response = []
    for repo in repos:
        file_count = crud.count_files_by_repo(db, repo.id)
        status_value = "indexed" if file_count > 0 else "processing"
        response.append(
            RepoResponse(
                id=repo.id,
                repo_url=repo.repo_url,
                repo_name=repo.repo_name,
                created_at=repo.created_at.isoformat(),
                status=status_value,
                file_count=file_count,
            )
        )
    return response


@router.get("/{repo_id}/files", response_model=RepoFilesResponse)
def list_repo_files(repo_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """List file metadata for a repository."""
    repo = crud.get_repo_by_id_any(db, repo_id)
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")
    if repo.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
    files = crud.list_files_by_repo(db, repo_id)
    file_entries = [
        FileResponse(id=entry.id, file_path=entry.file_path, language=entry.language)
        for entry in files
    ]
    return RepoFilesResponse(repo_id=repo_id, files=file_entries)


@router.get("/{repo_id}/files/{file_id}", response_model=FileContentResponse)
def get_file_content(
    repo_id: int,
    file_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Return full content for a file within a repository."""
    repo = crud.get_repo_by_id_any(db, repo_id)
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")
    if repo.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
    code_file = crud.get_file_by_id(db, repo_id, file_id)
    if not code_file:
        raise HTTPException(status_code=404, detail="File not found")
    return FileContentResponse(
        file_path=code_file.file_path,
        language=code_file.language,
        content=code_file.raw_content,
    )


@router.post("/{repo_id}/files/{file_id}/explain", response_model=FileExplainResponse)
def explain_file(
    repo_id: int,
    file_id: int,
    payload: FileExplainRequest = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Explain THIS FILE using ONLY its indexed code chunks (strict file-scoped RAG)."""
    repo = crud.get_repo_by_id_any(db, repo_id)
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")
    if repo.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")

    code_file = crud.get_file_by_id(db, repo_id, file_id)
    if not code_file:
        raise HTTPException(status_code=404, detail="File not found")

    chunks = crud.list_chunks_by_file(db, code_file.id)
    if not chunks:
        return FileExplainResponse(message="No indexed code found for this file", referenced_chunks=[])

    def _normalize_level(level: str | None) -> str:
        raw = (level or "").strip().lower()
        if raw in {"beginner", "intermediate", "expert"}:
            return raw
        return "intermediate"

    level = _normalize_level(getattr(payload, "level", None) if payload is not None else None)

    # If the LLM isn't configured, return a non-hallucinated message instead of a 500.
    # (Explain is LLM-backed by design, but it must fail clearly when keys are missing.)
    provider = (settings.llm_provider or "").strip().lower() or "groq"
    if provider == "groq" and not os.getenv("GROQ_API_KEY"):
        return FileExplainResponse(message="LLM is not configured (GROQ_API_KEY is not set).", referenced_chunks=[])
    if provider == "openrouter" and not os.getenv("OPENROUTER_API_KEY"):
        return FileExplainResponse(message="LLM is not configured (OPENROUTER_API_KEY is not set).", referenced_chunks=[])

    # Build a context strictly from this file's chunks.
    max_tokens = max(200, int(settings.max_context_tokens or 1800))
    selected_chunks = []
    token_budget = 0
    for ch in chunks:
        if token_budget + int(ch.token_count) > max_tokens:
            break
        selected_chunks.append(ch)
        token_budget += int(ch.token_count)

    if not selected_chunks:
        # If first chunk is too big, still include it.
        selected_chunks = [chunks[0]]

    context = "\n\n".join(
        [f"[chunk_index={c.chunk_index}]\n{c.chunk_content}" for c in selected_chunks]
    )

    if level == "beginner":
        fmt = (
            "Output format (plain text):\n"
            "- 6 to 9 bullet points (use '-' bullets).\n"
            "- Each bullet must be one sentence.\n"
            "- No preamble, no code blocks.\n"
            "Style: explain for a new engineer; define acronyms briefly; keep it concrete."
        )
    elif level == "expert":
        fmt = (
            "Output format (plain text):\n"
            "- 4 to 7 bullet points (use '-' bullets).\n"
            "- Each bullet must be one sentence.\n"
            "- No preamble, no code blocks.\n"
            "Style: expert concise; focus on invariants, edge cases, and interfaces."
        )
    else:
        fmt = (
            "Output format (plain text):\n"
            "- 6 to 9 bullet points (use '-' bullets).\n"
            "- Each bullet must be one sentence.\n"
            "- No preamble, no code blocks.\n"
            "Style: concise but meaningfully informative."
        )

    system_prompt = (
        "You are CodeLens AI. Explain the given file using ONLY the provided code context. "
        "Do not speculate. If the code context is insufficient, say so briefly and only describe what is supported.\n\n"
        f"{fmt}\n"
        "Coverage requirements (include what applies): purpose, key responsibilities, important inputs/outputs, "
        "notable dependencies/integrations, and any important edge cases/assumptions visible in the code."
    )
    user_prompt = (
        f"File: {code_file.file_path}\nLanguage: {code_file.language}\n\n"
        f"Indexed code context (from this file only):\n{context}\n\n"
        "Task: Provide the minimal explanation in the required bullet format."
    )

    try:
        explanation, _token_usage = generate_answer(
            system_prompt,
            user_prompt,
            max_tokens=512 if level != "expert" else 384,
            temperature=0.15,
        )
    except HTTPException as exc:
        # Convert provider configuration errors into a safe message payload.
        return FileExplainResponse(message=str(exc.detail), referenced_chunks=[])

    explanation = (explanation or "").strip()
    referenced = [int(c.chunk_index) for c in selected_chunks]
    return FileExplainResponse(explanation=explanation, referenced_chunks=referenced)


def _slice_lines(text: str, start_line: int, end_line: int, *, max_chars: int = 6000) -> str:
    lines = (text or "").splitlines()
    n = len(lines)
    s = max(1, min(int(start_line), max(1, n)))
    e = max(s, min(int(end_line), n))
    snippet = "\n".join(lines[s - 1 : e])
    if len(snippet) > max_chars:
        snippet = snippet[:max_chars] + "\n…"
    return snippet


def _file_header(text: str, *, max_lines: int = 80, max_chars: int = 3000) -> str:
    lines = (text or "").splitlines()[: max(0, int(max_lines))]
    header = "\n".join(lines)
    if len(header) > max_chars:
        header = header[:max_chars] + "\n…"
    return header


def _require_groq_or_message() -> str | None:
    provider = (settings.llm_provider or "").strip().lower() or "groq"
    if provider != "groq":
        return "This feature is Groq-only in this build." 
    if not os.getenv("GROQ_API_KEY"):
        return "LLM is not configured (GROQ_API_KEY is not set)."
    return None


@router.post("/{repo_id}/files/{file_id}/explain_symbol", response_model=FileExplainResponse)
def explain_symbol(
    repo_id: int,
    file_id: int,
    payload: FileExplainSymbolRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    repo = crud.get_repo_by_id_any(db, repo_id)
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")
    if repo.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")

    code_file = crud.get_file_by_id(db, repo_id, file_id)
    if not code_file:
        raise HTTPException(status_code=404, detail="File not found")

    msg = _require_groq_or_message()
    if msg:
        return FileExplainResponse(message=msg, referenced_chunks=[])

    raw = code_file.raw_content or ""
    fn = (payload.function_name or "").strip()
    start_line = int(payload.start_line or 1)
    end_line = int(payload.end_line or start_line)
    level = (payload.level or "").strip().lower()
    if level not in {"beginner", "intermediate", "expert"}:
        level = "intermediate"

    snippet = _slice_lines(raw, start_line, end_line, max_chars=7000)
    header = _file_header(raw)

    if level == "beginner":
        fmt = (
            "- 5 to 8 bullet points (use '-' bullets).\n"
            "- Each bullet must be one sentence.\n"
            "- No preamble, no code blocks.\n"
            "Style: beginner-friendly and concrete; define jargon briefly."
        )
    elif level == "expert":
        fmt = (
            "- 4 to 7 bullet points (use '-' bullets).\n"
            "- Each bullet must be one sentence.\n"
            "- No preamble, no code blocks.\n"
            "Style: expert concise; focus on invariants, edge cases, and side effects."
        )
    else:
        fmt = (
            "- 6 to 9 bullet points (use '-' bullets).\n"
            "- Each bullet must be one sentence.\n"
            "- No preamble, no code blocks.\n"
            "Style: concise, practical."
        )

    system_prompt = (
        "You are CodeLens AI. Explain ONLY the selected function using ONLY the provided file context. "
        "Do not speculate beyond what is shown. If context is insufficient, say so briefly.\n\n"
        "Output format (plain text):\n"
        f"{fmt}"
    )

    user_prompt = (
        f"File: {code_file.file_path}\nLanguage: {code_file.language}\n\n"
        f"File header (for imports/types only):\n{header}\n\n"
        f"Selected function: {fn} (lines {start_line}-{end_line})\n\n"
        f"Function code:\n{snippet}\n\n"
        "Task: Explain what this function does, its inputs/outputs, side effects, and any visible edge cases."
    )

    try:
        explanation, _token_usage = generate_answer(
            system_prompt,
            user_prompt,
            max_tokens=384 if level == "expert" else 512,
            temperature=0.1,
        )
    except HTTPException as exc:
        return FileExplainResponse(message=str(exc.detail), referenced_chunks=[])

    return FileExplainResponse(explanation=(explanation or "").strip(), referenced_chunks=[])


@router.post("/{repo_id}/files/{file_id}/why_written", response_model=FileExplainResponse)
def why_written(
    repo_id: int,
    file_id: int,
    payload: WhyWrittenRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    repo = crud.get_repo_by_id_any(db, repo_id)
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")
    if repo.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")

    code_file = crud.get_file_by_id(db, repo_id, file_id)
    if not code_file:
        raise HTTPException(status_code=404, detail="File not found")

    msg = _require_groq_or_message()
    if msg:
        return FileExplainResponse(message=msg, referenced_chunks=[])

    raw = code_file.raw_content or ""
    level = (payload.level or "").strip().lower()
    if level not in {"beginner", "intermediate", "expert"}:
        level = "intermediate"

    header = _file_header(raw)
    scope = "file"
    snippet = ""
    if payload.function_name and payload.start_line and payload.end_line:
        fn = (payload.function_name or "").strip()
        scope = f"function {fn}"
        snippet = _slice_lines(raw, int(payload.start_line), int(payload.end_line), max_chars=7000)

    system_prompt = (
        "You are CodeLens AI. Answer using ONLY the provided code. "
        "Do not invent repository context. Avoid confident claims about intent you cannot support.\n\n"
        "Output format (plain text):\n"
        "- One short paragraph (3 to 5 sentences).\n"
        "- No bullets, no code blocks.\n"
        "Style: thoughtful, grounded in observable tradeoffs (readability, performance, API design, safety)."
    )

    user_prompt = (
        f"File: {code_file.file_path}\nLanguage: {code_file.language}\n\n"
        f"File header:\n{header}\n\n"
        + (f"Selected function code:\n{snippet}\n\n" if snippet else "")
        + f"Question: Why might this {scope} be written this way?"
    )

    try:
        explanation, _token_usage = generate_answer(
            system_prompt,
            user_prompt,
            max_tokens=256,
            temperature=0.2,
        )
    except HTTPException as exc:
        return FileExplainResponse(message=str(exc.detail), referenced_chunks=[])

    return FileExplainResponse(explanation=(explanation or "").strip(), referenced_chunks=[])


@router.get("/{repo_id}/risk_radar")
def risk_radar(
    repo_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Deterministic risk heuristics.

    The UI expects file-scoped results. Use:
    GET /repos/{repo_id}/files/{file_id}/risk_radar
    """
    raise HTTPException(
        status_code=400,
        detail="Risk radar is file-scoped. Call /repos/{repo_id}/files/{file_id}/risk_radar instead.",
    )


@router.get("/{repo_id}/files/{file_id}/risk_radar")
def risk_radar_file(
    repo_id: int,
    file_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Deterministic file-level risk heuristics (no AI)."""
    repo = crud.get_repo_by_id_any(db, repo_id)
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")
    if repo.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")

    code_file = crud.get_file_by_id(db, repo_id, file_id)
    if not code_file:
        raise HTTPException(status_code=404, detail="File not found")

    security_hits: list[str] = []
    perf_hits: list[str] = []
    maintain_hits: list[str] = []

    secret_re = re.compile(r"(api[_-]?key|secret|token|password)\s*[:=]\s*['\"][^'\"]{8,}['\"]", re.IGNORECASE)
    eval_re = re.compile(r"\b(eval|exec)\s*\(")
    shell_re = re.compile(r"shell\s*=\s*True")
    xss_re = re.compile(r"dangerouslySetInnerHTML")
    sql_re = re.compile(r"\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b", re.IGNORECASE)
    type_suppress_re = re.compile(
        r"(#\s*type:\s*ignore\b|@ts-ignore\b|@ts-expect-error\b|\bas\s+any\b|:\s*any\b|<any>\b)",
        re.IGNORECASE,
    )

    path = (code_file.file_path or "").strip().replace("\\", "/")
    raw = code_file.raw_content or ""

    if raw:
        # Security
        if secret_re.search(raw):
            security_hits.append(f"{path}: possible hardcoded secret-like value")
        if eval_re.search(raw):
            security_hits.append(f"{path}: uses eval/exec")
        if shell_re.search(raw):
            security_hits.append(f"{path}: uses shell=True")
        if xss_re.search(raw):
            security_hits.append(f"{path}: uses dangerouslySetInnerHTML")
        if sql_re.search(raw) and re.search(r"execute\(.*\+|f\".*(SELECT|INSERT|UPDATE|DELETE)", raw, re.IGNORECASE):
            security_hits.append(f"{path}: possible dynamic SQL construction")

        # Performance
        if len(raw) > 300_000:
            perf_hits.append(f"{path}: very large file ({len(raw)} chars)")
        if re.search(r"for\s*\(.*\)\s*\{[\s\S]{0,2000}for\s*\(", raw):
            perf_hits.append(f"{path}: nested loops pattern")
        if re.search(r"\.map\(.*\.map\(", raw):
            perf_hits.append(f"{path}: nested map pattern")

        # Maintainability
        lines = raw.splitlines()
        if len(lines) > 1200:
            maintain_hits.append(f"{path}: very long file ({len(lines)} lines)")
        if re.search(r"TODO|FIXME", raw):
            maintain_hits.append(f"{path}: contains TODO/FIXME")
        if type_suppress_re.search(raw):
            maintain_hits.append(f"{path}: suppresses type checking")

    def _stable_top(items: list[str], n: int = 12) -> list[str]:
        seen: set[str] = set()
        out: list[str] = []
        for it in items:
            s = (it or "").strip()
            if not s or s in seen:
                continue
            seen.add(s)
            out.append(s)
            if len(out) >= n:
                break
        return out

    security_out = _stable_top(security_hits)
    perf_out = _stable_top(perf_hits)
    maintain_out = _stable_top(maintain_hits)

    notes: dict[str, str] = {}
    needs_notes = (len(security_out) == 0) or (len(perf_out) == 0) or (len(maintain_out) == 0)

    if needs_notes:
        header = _file_header(raw)
        msg = _require_groq_or_message()
        if msg:
            # Fallback if AI provider is not configured.
            if len(security_out) == 0:
                notes["security"] = "Looks clean — no obvious security red flags detected in this file."
            if len(perf_out) == 0:
                notes["performance"] = "Looks good — no obvious performance hotspots detected in this file."
            if len(maintain_out) == 0:
                notes["maintainability"] = "Looks maintainable — no obvious maintainability issues detected in this file."
        else:
            system_prompt = (
                "You are CodeLens AI. Generate short, optimistic status notes for a file risk scan. "
                "Be cautious: say 'no obvious signals' rather than guarantees.\n\n"
                "Return STRICT JSON only, no markdown, no extra keys.\n"
                "Schema: {\"security\": string, \"performance\": string, \"maintainability\": string}"
            )

            user_prompt = (
                f"File: {path}\nLanguage: {code_file.language}\n\n"
                f"File header:\n{header}\n\n"
                "Write one sentence per category (max ~14 words each)."
            )

            try:
                raw_notes, _token_usage = generate_answer(
                    system_prompt,
                    user_prompt,
                    max_tokens=128,
                    temperature=0.2,
                )
                parsed = json.loads((raw_notes or "").strip() or "{}")
                if isinstance(parsed, dict):
                    if len(security_out) == 0:
                        notes["security"] = str(parsed.get("security") or "").strip()
                    if len(perf_out) == 0:
                        notes["performance"] = str(parsed.get("performance") or "").strip()
                    if len(maintain_out) == 0:
                        notes["maintainability"] = str(parsed.get("maintainability") or "").strip()
            except Exception:
                # If AI output is malformed, fall back to safe optimistic notes.
                if len(security_out) == 0:
                    notes["security"] = "Looks clean — no obvious security red flags detected in this file."
                if len(perf_out) == 0:
                    notes["performance"] = "Looks good — no obvious performance hotspots detected in this file."
                if len(maintain_out) == 0:
                    notes["maintainability"] = "Looks maintainable — no obvious maintainability issues detected in this file."

    return {
        "security": security_out,
        "performance": perf_out,
        "maintainability": maintain_out,
        "notes": notes,
    }


@router.get("/{repo_id}/files/{file_id}/metrics", response_model=FileMetricsResponse)
def file_metrics(
    repo_id: int,
    file_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Deterministic file-level metrics (no AI)."""
    repo = crud.get_repo_by_id_any(db, repo_id)
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")
    if repo.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")

    code_file = crud.get_file_by_id(db, repo_id, file_id)
    if not code_file:
        raise HTTPException(status_code=404, detail="File not found")

    lines = len((code_file.raw_content or "").splitlines())
    chunk_count = crud.count_chunks_by_file(db, code_file.id)
    avg_chunk = crud.avg_chunk_size_by_file(db, code_file.id)
    return FileMetricsResponse(lines=lines, chunks=chunk_count, avg_chunk_size=avg_chunk)


@router.get("/{repo_id}/analytics", response_model=RepoAnalyticsResponse)
def repo_analytics(
    repo_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Deterministic per-repo analytics (no AI)."""
    repo = crud.get_repo_by_id_any(db, repo_id)
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")
    if repo.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")

    base = crud.get_repo_analytics(db, repo_id)
    stats = _read_repo_stats(repo_id)
    ingestion_time_ms = int(stats.get("ingestion_time_ms") or 0)
    return RepoAnalyticsResponse(
        files=int(base.get("files") or 0),
        chunks=int(base.get("chunks") or 0),
        languages=dict(base.get("languages") or {}),
        avg_chunk_size=int(base.get("avg_chunk_size") or 0),
        ingestion_time_ms=ingestion_time_ms,
    )


@router.delete("/{repo_id}")
def delete_repository(
    repo_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Delete a repository and all its associated data (files, chunks, FAISS index, chat history)."""
    repo = crud.get_repo_by_id_any(db, repo_id)
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")
    if repo.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")

    try:
        crud.delete_repo(db, repo_id)
        # Best-effort cleanup of stats file and FAISS index
        try:
            stats_file = _stats_path(repo_id)
            if stats_file.exists():
                stats_file.unlink()
        except Exception:
            logger.warning("Failed to delete stats file for repo_id=%s", repo_id)

        try:
            from vectorstore.faiss_index import delete_index
            delete_index(DATA_DIR, repo_id)
        except Exception:
            logger.warning("Failed to delete FAISS index for repo_id=%s", repo_id)

        logger.info("Repository deleted repo_id=%s user_id=%s", repo_id, current_user.id)
        return {"status": "deleted", "repo_id": repo_id}
    except Exception as exc:
        logger.exception("Failed to delete repository repo_id=%s", repo_id)
        raise HTTPException(status_code=500, detail="Failed to delete repository") from exc
