import os
from pathlib import Path
from typing import Iterable, List, Tuple

from settings import settings

IGNORED_DIRS = {".git", "node_modules", "dist", "build", "__pycache__", ".venv"}
IGNORED_EXTENSIONS = {".png", ".jpg", ".jpeg", ".gif", ".svg", ".ico", ".lock"}


def should_ignore_path(path: Path) -> bool:
    """Return True if a path should be skipped during ingestion."""
    if any(part in IGNORED_DIRS for part in path.parts):
        return True
    if path.suffix.lower() in IGNORED_EXTENSIONS:
        return True
    return False


def detect_language(path: Path) -> str:
    """Infer a language from file extension."""
    ext = path.suffix.lower().lstrip(".")
    return ext or "text"


def read_code_files(root: Path) -> List[Tuple[str, str, str]]:
    """Return list of (relative_path, language, content) respecting size limits."""

    results = []
    file_count = 0
    for dirpath, _, filenames in os.walk(root):
        for filename in filenames:
            path = Path(dirpath) / filename
            if should_ignore_path(path):
                continue
            file_count += 1
            if file_count > settings.max_files:
                return results
            size_kb = path.stat().st_size / 1024
            if size_kb > settings.max_file_size_kb:
                continue
            try:
                content = path.read_text(encoding="utf-8", errors="ignore")
            except OSError:
                continue
            if "\x00" in content:
                continue
            relative_path = str(path.relative_to(root))
            language = detect_language(path)
            results.append((relative_path, language, content))
    return results
