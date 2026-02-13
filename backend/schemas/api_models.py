from typing import List, Optional
from typing import Dict

from pydantic import BaseModel, ConfigDict, Field


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    profile_image_url: Optional[str] = None


class SignupRequest(BaseModel):
    email: str
    password: str = Field(min_length=8)
    remember_me: bool = False


class LoginRequest(BaseModel):
    email: str
    password: str
    remember_me: bool = False


class AuthResponse(BaseModel):
    user: UserResponse


class RepoIngestRequest(BaseModel):
    repo_url: str
    branch: Optional[str] = "main"


class RepoResponse(BaseModel):
    id: int
    repo_url: str
    repo_name: str
    created_at: str
    status: str
    file_count: int


class RepoIngestResponse(BaseModel):
    # Required stable fields (critical for frontend completion)
    repo_id: int
    files: int
    chunks: int

    # Backward-compatible fields used by existing frontend code
    id: int
    repo_url: str
    repo_name: str
    created_at: str
    status: str
    file_count: int


class RepoReingestRequest(BaseModel):
    """Request body for re-running ingestion on an existing repository."""

    branch: Optional[str] = "main"


class FileResponse(BaseModel):
    id: int
    file_path: str
    language: Optional[str] = None


class RepoFilesResponse(BaseModel):
    repo_id: int
    files: List[FileResponse]


class FileContentResponse(BaseModel):
    file_path: str
    language: Optional[str] = None
    content: str


class FileExplainResponse(BaseModel):
    # When chunks exist
    explanation: Optional[str] = None
    referenced_chunks: List[int] = []

    # When no chunks exist
    message: Optional[str] = None


class FileMetricsResponse(BaseModel):
    lines: int
    chunks: int
    avg_chunk_size: int


class RepoAnalyticsResponse(BaseModel):
    files: int
    chunks: int
    languages: Dict[str, int]
    avg_chunk_size: int
    ingestion_time_ms: int


class DashboardOverview(BaseModel):
    total_repos: int
    total_files: int
    total_chunks: int
    last_ingestion_time: Optional[str]


class QueryRequest(BaseModel):
    repo_id: int
    question: str


class QueryResponse(BaseModel):
    answer: str
    referenced_files: List[str]
    token_usage: int
    latency_ms: int
    cached: bool = False


class ChatHistoryMessage(BaseModel):
    id: str
    role: str
    content: str
    timestamp: str


class ChatHistoryResponse(BaseModel):
    repo_id: int
    messages: List[ChatHistoryMessage]


class AnalyticsResponse(BaseModel):
    total_repos: int
    total_files: int
    total_chunks: int
    avg_query_latency_ms: int
    token_usage: int
