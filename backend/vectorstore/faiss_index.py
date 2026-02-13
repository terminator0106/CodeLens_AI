import logging
from pathlib import Path
from typing import Dict, List, Tuple

try:
    import faiss  # type: ignore
    _FAISS_AVAILABLE = True
except Exception:  # pragma: no cover
    faiss = None  # type: ignore
    _FAISS_AVAILABLE = False
import numpy as np

from .metadata import load_metadata, save_metadata

logger = logging.getLogger(__name__)

INDEXES: Dict[int, "faiss.IndexFlatL2"] = {}
METADATA: Dict[int, List[dict]] = {}


def _index_path(base_dir: Path, repo_id: int) -> Path:
    return base_dir / f"repo_{repo_id}.index"


def load_indexes_from_disk(base_dir: Path) -> None:
    """Load any persisted FAISS indexes into memory."""
    if not _FAISS_AVAILABLE:
        logger.warning("FAISS not available; vector search disabled")
        return
    for path in base_dir.glob("repo_*.index"):
        try:
            repo_id = int(path.stem.split("_")[1])
        except (IndexError, ValueError):
            continue
        index = faiss.read_index(str(path))
        INDEXES[repo_id] = index
        METADATA[repo_id] = load_metadata(base_dir, repo_id)
        logger.info("Loaded FAISS index for repo %s with %s vectors", repo_id, index.ntotal)


def save_index(base_dir: Path, repo_id: int) -> None:
    """Persist the FAISS index and metadata for a repo."""
    if not _FAISS_AVAILABLE:
        return
    if repo_id not in INDEXES:
        return
    faiss.write_index(INDEXES[repo_id], str(_index_path(base_dir, repo_id)))
    save_metadata(base_dir, repo_id, METADATA.get(repo_id, []))


def add_embeddings(base_dir: Path, repo_id: int, embeddings: List[List[float]], metadata: List[dict]) -> None:
    """Add embeddings and metadata to a repo index and persist them."""
    if not _FAISS_AVAILABLE:
        return
    vectors = np.array(embeddings, dtype="float32")
    if repo_id not in INDEXES:
        INDEXES[repo_id] = faiss.IndexFlatL2(vectors.shape[1])
        METADATA[repo_id] = []
    INDEXES[repo_id].add(vectors)
    METADATA[repo_id].extend(metadata)
    save_index(base_dir, repo_id)


def search(repo_id: int, query_vector: List[float], top_k: int) -> Tuple[List[int], List[float]]:
    """Search the FAISS index for nearest neighbors."""
    if not _FAISS_AVAILABLE:
        return [], []
    if repo_id not in INDEXES:
        return [], []
    index = INDEXES[repo_id]
    vector = np.array([query_vector], dtype="float32")
    distances, indices = index.search(vector, top_k)
    return indices[0].tolist(), distances[0].tolist()


def get_metadata(repo_id: int) -> List[dict]:
    """Return metadata rows for a repo index."""
    return METADATA.get(repo_id, [])


def delete_index(base_dir: Path, repo_id: int) -> None:
    """Delete the FAISS index and metadata for a repo from memory and disk."""
    # Remove from memory
    if repo_id in INDEXES:
        del INDEXES[repo_id]
    if repo_id in METADATA:
        del METADATA[repo_id]
    
    # Remove from disk
    try:
        index_file = _index_path(base_dir, repo_id)
        if index_file.exists():
            index_file.unlink()
        
        from .metadata import metadata_path
        metadata_file = metadata_path(base_dir, repo_id)
        if metadata_file.exists():
            metadata_file.unlink()
    except Exception:
        logger.exception("Failed to delete index files for repo %s", repo_id)
