from datetime import datetime
import re
from typing import Iterable, List, Optional, Sequence

from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from .models import CodeChunk, CodeFile, Repository, User


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """Fetch a user by email."""
    return db.query(User).filter(User.email == email).first()


def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
    """Fetch a user by id."""
    return db.query(User).filter(User.id == user_id).first()


def create_user(db: Session, email: str, hashed_password: str) -> User:
    """Create and persist a new user."""
    user = User(email=email, hashed_password=hashed_password)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def list_repos_by_user(db: Session, user_id: int) -> List[Repository]:
    """List repositories for a user."""
    return db.query(Repository).filter(Repository.user_id == user_id).all()


def count_files_by_repo(db: Session, repo_id: int) -> int:
    """Count files in a repository."""
    return int(db.query(func.count(CodeFile.id)).filter(CodeFile.repo_id == repo_id).scalar() or 0)


def get_repo_by_id(db: Session, repo_id: int, user_id: int) -> Optional[Repository]:
    """Fetch a repository scoped to a user."""
    return (
        db.query(Repository)
        .filter(Repository.id == repo_id, Repository.user_id == user_id)
        .first()
    )


def get_repo_by_id_any(db: Session, repo_id: int) -> Optional[Repository]:
    """Fetch a repository without scoping (used for 403 vs 404 decisions)."""
    return db.query(Repository).filter(Repository.id == repo_id).first()


def create_repo(db: Session, user_id: int, repo_url: str, repo_name: str) -> Repository:
    """Create a repository record."""
    repo = Repository(user_id=user_id, repo_url=repo_url, repo_name=repo_name)
    db.add(repo)
    db.commit()
    db.refresh(repo)
    return repo


def delete_repo(db: Session, repo_id: int) -> None:
    """Delete a repository and cascade-delete its files/chunks."""
    repo = db.query(Repository).filter(Repository.id == repo_id).first()
    if not repo:
        return
    db.delete(repo)
    db.commit()


def create_code_file(db: Session, repo_id: int, file_path: str, language: str, raw_content: str) -> CodeFile:
    """Persist a code file for a repository."""
    code_file = CodeFile(
        repo_id=repo_id,
        file_path=file_path,
        language=language,
        raw_content=raw_content,
    )
    db.add(code_file)
    db.commit()
    db.refresh(code_file)
    return code_file


def create_code_chunk(
    db: Session,
    file_id: int,
    chunk_index: int,
    chunk_content: str,
    token_count: int,
) -> CodeChunk:
    """Persist a single code chunk."""
    chunk = CodeChunk(
        file_id=file_id,
        chunk_index=chunk_index,
        chunk_content=chunk_content,
        token_count=token_count,
    )
    db.add(chunk)
    db.commit()
    db.refresh(chunk)
    return chunk


def list_files_by_repo(db: Session, repo_id: int) -> List[CodeFile]:
    """List code files for a repository."""
    return db.query(CodeFile).filter(CodeFile.repo_id == repo_id).all()


def get_file_by_id(db: Session, repo_id: int, file_id: int) -> Optional[CodeFile]:
    """Fetch a code file by id within a repository."""
    return (
        db.query(CodeFile)
        .filter(CodeFile.repo_id == repo_id, CodeFile.id == file_id)
        .first()
    )


def list_chunks_by_file(db: Session, file_id: int) -> List[CodeChunk]:
    """List chunks for a specific file, ordered by chunk_index."""
    return db.query(CodeChunk).filter(CodeChunk.file_id == file_id).order_by(CodeChunk.chunk_index.asc()).all()


def count_chunks_by_file(db: Session, file_id: int) -> int:
    """Count chunks for a specific file."""
    return int(db.query(func.count(CodeChunk.id)).filter(CodeChunk.file_id == file_id).scalar() or 0)


def avg_chunk_size_by_file(db: Session, file_id: int) -> int:
    """Average chunk token count for a specific file."""
    avg_val = db.query(func.avg(CodeChunk.token_count)).filter(CodeChunk.file_id == file_id).scalar()
    return int(avg_val or 0)


def get_repo_analytics(db: Session, repo_id: int) -> dict:
    """Deterministic per-repo analytics (no AI)."""
    file_count = int(db.query(func.count(CodeFile.id)).filter(CodeFile.repo_id == repo_id).scalar() or 0)
    chunk_count = (
        db.query(func.count(CodeChunk.id))
        .join(CodeFile, CodeChunk.file_id == CodeFile.id)
        .filter(CodeFile.repo_id == repo_id)
        .scalar()
        or 0
    )
    avg_chunk = (
        db.query(func.avg(CodeChunk.token_count))
        .join(CodeFile, CodeChunk.file_id == CodeFile.id)
        .filter(CodeFile.repo_id == repo_id)
        .scalar()
        or 0
    )

    lang_rows = (
        db.query(CodeFile.language, func.count(CodeFile.id))
        .filter(CodeFile.repo_id == repo_id)
        .group_by(CodeFile.language)
        .all()
    )
    languages: dict[str, int] = {}
    for lang, count in lang_rows:
        key = (lang or "unknown").strip() or "unknown"
        languages[key] = int(count or 0)

    return {
        "files": file_count,
        "chunks": int(chunk_count),
        "languages": languages,
        "avg_chunk_size": int(avg_chunk),
    }


def list_chunks_by_repo(db: Session, repo_id: int) -> List[CodeChunk]:
    """List code chunks for a repository."""
    return (
        db.query(CodeChunk)
        .join(CodeFile, CodeChunk.file_id == CodeFile.id)
        .filter(CodeFile.repo_id == repo_id)
        .all()
    )


def list_chunks_with_file_paths(db: Session, repo_id: int) -> List[tuple[str, str]]:
    """Return (chunk_content, file_path) rows for a repository."""
    return (
        db.query(CodeChunk.chunk_content, CodeFile.file_path)
        .join(CodeFile, CodeChunk.file_id == CodeFile.id)
        .filter(CodeFile.repo_id == repo_id)
        .all()
    )


def search_chunks_lexical(db: Session, repo_id: int, question: str, limit: int = 200) -> List[tuple[str, str]]:
    """Lexical retrieval via SQL LIKE, returning (chunk_content, file_path).

    This is the no-embeddings fallback. It narrows candidates in SQL, then the retriever can score in Python.
    """

    terms = [t for t in re.split(r"\W+", (question or "").lower()) if len(t) >= 3]
    q = (
        db.query(CodeChunk.chunk_content, CodeFile.file_path)
        .join(CodeFile, CodeChunk.file_id == CodeFile.id)
        .filter(CodeFile.repo_id == repo_id)
    )
    if terms:
        conditions = [func.lower(CodeChunk.chunk_content).like(f"%{term}%") for term in terms[:12]]
        q = q.filter(or_(*conditions))
    return q.limit(max(1, int(limit))).all()


def get_chunks_by_ids(db: Session, chunk_ids: Sequence[int]) -> List[CodeChunk]:
    """Fetch chunks by id list."""
    if not chunk_ids:
        return []
    return db.query(CodeChunk).filter(CodeChunk.id.in_(chunk_ids)).all()


def get_dashboard_overview(db: Session, user_id: int) -> dict:
    """Aggregate dashboard metrics for the given user."""
    repo_count = db.query(func.count(Repository.id)).filter(Repository.user_id == user_id).scalar() or 0
    file_count = (
        db.query(func.count(CodeFile.id))
        .join(Repository, CodeFile.repo_id == Repository.id)
        .filter(Repository.user_id == user_id)
        .scalar()
        or 0
    )
    chunk_count = (
        db.query(func.count(CodeChunk.id))
        .join(CodeFile, CodeChunk.file_id == CodeFile.id)
        .join(Repository, CodeFile.repo_id == Repository.id)
        .filter(Repository.user_id == user_id)
        .scalar()
        or 0
    )
    last_ingestion = (
        db.query(func.max(Repository.created_at))
        .filter(Repository.user_id == user_id)
        .scalar()
    )

    return {
        "total_repos": repo_count,
        "total_files": file_count,
        "total_chunks": chunk_count,
        "last_ingestion_time": last_ingestion.isoformat() if last_ingestion else None,
    }


def get_repo_languages(db: Session, repo_id: int) -> List[str]:
    """Return detected languages for a repository."""
    rows = db.query(CodeFile.language).filter(CodeFile.repo_id == repo_id).all()
    return [row[0] for row in rows if row[0]]
