import logging
from settings import DATA_DIR, settings
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

from analytics.metrics import router as analytics_router
from auth.routes import router as auth_router
from ingestion.repo_loader import router as repo_router
from rag.pipeline import router as rag_router
from database.db import init_db
from vectorstore.faiss_index import load_indexes_from_disk


def build_app() -> FastAPI:
    """Create the FastAPI app and wire up middleware, routers, and startup hooks."""

    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s %(name)s %(message)s",
    )

    app = FastAPI(title=settings.app_name)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(_: Request, __: RequestValidationError):
        return JSONResponse(status_code=400, content={"error": "Invalid input", "detail": "Invalid input"})

    @app.exception_handler(HTTPException)
    async def http_exception_handler(_: Request, exc: HTTPException):
        if isinstance(exc.detail, dict):
            payload = exc.detail
            if "error" not in payload and "detail" in payload:
                payload["error"] = payload["detail"]
            if "detail" not in payload and "error" in payload:
                payload["detail"] = payload["error"]
            return JSONResponse(status_code=exc.status_code, content=payload)
        message = str(exc.detail)
        return JSONResponse(status_code=exc.status_code, content={"error": message, "detail": message})

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(_: Request, exc: Exception):
        logging.exception("Unhandled error", exc_info=exc)
        return JSONResponse(status_code=500, content={"error": "Internal server error", "detail": "Internal server error"})

    @app.get("/health")
    def health() -> dict:
        """Liveness check endpoint."""
        return {"status": "ok"}

    app.include_router(auth_router)
    app.include_router(repo_router)
    app.include_router(rag_router)
    app.include_router(analytics_router)

    @app.on_event("startup")
    def on_startup() -> None:
        init_db(settings.database_url)
        DATA_DIR.mkdir(parents=True, exist_ok=True)
        load_indexes_from_disk(DATA_DIR)

    return app
