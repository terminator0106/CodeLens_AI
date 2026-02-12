import json
from pathlib import Path
from typing import Any, Dict, List


def metadata_path(base_dir: Path, repo_id: int) -> Path:
    """Return path to metadata JSON for the repo."""
    return base_dir / f"repo_{repo_id}_meta.json"


def load_metadata(base_dir: Path, repo_id: int) -> List[Dict[str, Any]]:
    """Load metadata JSON for a repo."""
    path = metadata_path(base_dir, repo_id)
    if not path.exists():
        return []
    return json.loads(path.read_text(encoding="utf-8"))


def save_metadata(base_dir: Path, repo_id: int, items: List[Dict[str, Any]]) -> None:
    """Persist metadata JSON for a repo."""
    path = metadata_path(base_dir, repo_id)
    path.write_text(json.dumps(items, ensure_ascii=True), encoding="utf-8")
