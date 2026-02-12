import logging

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from auth.dependencies import get_current_user
from database.db import get_db
from database import crud
from schemas.api_models import AnalyticsResponse, DashboardOverview

logger = logging.getLogger(__name__)
router = APIRouter(tags=["analytics"])

_query_count = 0
_total_latency_ms = 0
_total_tokens = 0


def record_query(token_usage: int, latency_ms: int) -> None:
    """Record a single query for usage analytics."""
    global _query_count
    global _total_latency_ms
    global _total_tokens
    _query_count += 1
    _total_latency_ms += latency_ms
    _total_tokens += token_usage


@router.get("/dashboard/overview", response_model=DashboardOverview)
def dashboard_overview(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Return dashboard overview metrics for the current user."""
    overview = crud.get_dashboard_overview(db, current_user.id)
    return DashboardOverview(**overview)


@router.get("/analytics/usage", response_model=AnalyticsResponse)
def analytics_usage(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Return usage analytics for the current user."""
    overview = crud.get_dashboard_overview(db, current_user.id)
    total_chunks = overview["total_chunks"]
    avg_latency = int(_total_latency_ms / _query_count) if _query_count else 0
    return AnalyticsResponse(
        total_repos=overview["total_repos"],
        total_files=overview["total_files"],
        total_chunks=total_chunks,
        avg_query_latency_ms=avg_latency,
        token_usage=_total_tokens,
    )
