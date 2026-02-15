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
from schemas.api_models import FileExplainResponse, FileMetricsResponse, RepoAnalyticsResponse
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

    system_prompt = (
        "You are CodeLens AI. Explain the given file using ONLY the provided code context. "
        "Do not speculate. Keep the answer medium-length: concise but meaningfully informative. "
        "If the code context is insufficient, say so briefly and only describe what is supported.\n\n"
        "Output format (plain text):\n"
        "- 6 to 9 bullet points (use '-' bullets).\n"
        "- Each bullet must be one sentence.\n"
        "- No preamble, no code blocks, no long walkthrough.\n"
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
            max_tokens=512,
            temperature=0.15,
        )
    except HTTPException as exc:
        # Convert provider configuration errors into a safe message payload.
        return FileExplainResponse(message=str(exc.detail), referenced_chunks=[])

    explanation = (explanation or "").strip()
    referenced = [int(c.chunk_index) for c in selected_chunks]
    return FileExplainResponse(explanation=explanation, referenced_chunks=referenced)


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
