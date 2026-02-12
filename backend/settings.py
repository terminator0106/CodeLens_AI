import os
from pathlib import Path
from typing import List

BASE_DIR = Path(__file__).resolve().parent
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(dotenv_path=BASE_DIR / ".env")
DATA_DIR = BASE_DIR / "vectorstore" / "data"


class Settings:
    """Application configuration loaded from environment variables."""

    @staticmethod
    def _normalize_database_url(value: str) -> str:
        """Normalize DATABASE_URL so relative sqlite paths are stable.

        If DATABASE_URL is set to something like `sqlite:///./codelens.db`, the
        resolved file depends on the current working directory (which varies
        based on how Uvicorn is launched). We resolve relative sqlite paths
        against `backend/` so local development is consistent.
        """

        raw = (value or "").strip()
        prefix = "sqlite:///./"
        if raw.startswith(prefix):
            relative_path = raw[len("sqlite:///") :]
            absolute_path = (BASE_DIR / relative_path).resolve()
            return f"sqlite:///{absolute_path.as_posix()}"
        return raw

    def __init__(self) -> None:
        self.app_name = os.getenv("APP_NAME", "CodeLens AI Backend")
        self.database_url = self._normalize_database_url(
            os.getenv("DATABASE_URL", "sqlite:///./codelens.db")
        )
        self.secret_key = os.getenv("SECRET_KEY", "change-me")
        self.algorithm = os.getenv("ALGORITHM", "HS256")
        self.access_token_expire_minutes = int(
            os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60")
        )
        self.cookie_name = os.getenv("COOKIE_NAME", "codelens_auth")
        self.secure_cookies = os.getenv("SECURE_COOKIES", "false").lower() == "true"
        self.frontend_base_url = os.getenv("FRONTEND_BASE_URL", "http://localhost:5173")
        self.allowed_origins = self._parse_origins(
            os.getenv(
                "ALLOWED_ORIGINS",
                "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000",
            )
        )
        self.max_repo_size_mb = int(os.getenv("MAX_REPO_SIZE_MB", "200"))
        self.max_file_size_kb = int(os.getenv("MAX_FILE_SIZE_KB", "512"))
        self.max_files = int(os.getenv("MAX_FILES", "5000"))
        # Chunking defaults tuned for fewer, larger chunks (faster ingest) while preserving overlap.
        self.chunk_size_tokens = int(os.getenv("CHUNK_SIZE_TOKENS", "1000"))
        self.chunk_overlap_tokens = int(os.getenv("CHUNK_OVERLAP_TOKENS", "100"))

        # Embeddings are optional; set DISABLE_EMBEDDINGS=true to force lexical-only mode.
        self.disable_embeddings = os.getenv("DISABLE_EMBEDDINGS", "false").lower() == "true"
        self.embeddings_batch_size = int(os.getenv("EMBEDDINGS_BATCH_SIZE", "64"))
        self.embedding_model = os.getenv("EMBEDDING_MODEL", "text-embedding-3-small")
        self.chat_model = os.getenv("CHAT_MODEL", "gpt-4o-mini")
        self.llm_provider = os.getenv("LLM_PROVIDER", "groq")
        self.groq_model = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")
        self.top_k = int(os.getenv("RAG_TOP_K", "4"))
        self.max_context_tokens = int(os.getenv("MAX_CONTEXT_TOKENS", "1800"))

        # Optional OAuth (for GitHub/Google login). If client creds are not set,
        # OAuth endpoints will return 503 with a clear message.
        self.github_client_id = os.getenv("GITHUB_CLIENT_ID", "")
        self.github_client_secret = os.getenv("GITHUB_CLIENT_SECRET", "")
        self.google_client_id = os.getenv("GOOGLE_CLIENT_ID", "")
        self.google_client_secret = os.getenv("GOOGLE_CLIENT_SECRET", "")

        # Optional external compression provider (defaults to local token trimming)
        self.compression_provider = os.getenv("COMPRESSION_PROVIDER", "local")
        self.scaledown_api_key = os.getenv("SCALEDOWN_API_KEY", "")
        self.scaledown_api_url = os.getenv("SCALEDOWN_API_URL", "")

    @staticmethod
    def _parse_origins(value: str) -> List[str]:
        return [origin.strip() for origin in value.split(",") if origin.strip()]


settings = Settings()
