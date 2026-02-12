from datetime import timedelta
import secrets
from urllib.parse import urlencode

import httpx
from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from settings import settings
from database.db import get_db
from database import crud
from schemas.api_models import AuthResponse, LoginRequest, SignupRequest, UserResponse
from .security import create_access_token, get_password_hash, verify_password
from .dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])


def _session_ttl_seconds(remember_me: bool) -> int:
    # Product requirement:
    # - remember_me=true  => keep user logged in for at least 30 days
    # - remember_me=false => keep user logged in for at least 2 days
    days = 30 if remember_me else 2
    return int(timedelta(days=days).total_seconds())


def _frontend_redirect(path: str) -> str:
    base = (settings.frontend_base_url or "http://localhost:5173").rstrip("/")
    normalized = path if path.startswith("/") else f"/{path}"
    # Frontend uses HashRouter (/#/...) in this project.
    return f"{base}/#{normalized}"


@router.post("/signup", response_model=AuthResponse)
def signup(payload: SignupRequest, response: Response, db: Session = Depends(get_db)):
    """Register a new user and set auth cookie."""
    existing = crud.get_user_by_email(db, payload.email)
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    hashed = get_password_hash(payload.password)
    user = crud.create_user(db, payload.email, hashed)

    ttl_seconds = _session_ttl_seconds(getattr(payload, "remember_me", False))
    token = create_access_token(str(user.id), user.email, expires_delta=timedelta(seconds=ttl_seconds))
    response.set_cookie(
        settings.cookie_name,
        token,
        httponly=True,
        samesite="lax",
        secure=settings.secure_cookies,
        max_age=ttl_seconds,
        expires=ttl_seconds,
    )
    return AuthResponse(user=UserResponse.model_validate(user))


@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest, response: Response, db: Session = Depends(get_db)):
    """Authenticate a user and set auth cookie."""
    user = crud.get_user_by_email(db, payload.email)
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    ttl_seconds = _session_ttl_seconds(getattr(payload, "remember_me", False))
    token = create_access_token(str(user.id), user.email, expires_delta=timedelta(seconds=ttl_seconds))
    response.set_cookie(
        settings.cookie_name,
        token,
        httponly=True,
        samesite="lax",
        secure=settings.secure_cookies,
        max_age=ttl_seconds,
        expires=ttl_seconds,
    )
    return AuthResponse(user=UserResponse.model_validate(user))


@router.post("/logout")
def logout(response: Response):
    """Clear the auth cookie."""
    response.delete_cookie(settings.cookie_name)
    return {"status": "logged_out"}


@router.get("/me", response_model=UserResponse)
def me(current_user=Depends(get_current_user)):
    """Return the current authenticated user."""
    return UserResponse.model_validate(current_user)


@router.get("/oauth/github/start")
async def github_oauth_start(request: Request, remember_me: bool = False):
    if not settings.github_client_id or not settings.github_client_secret:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="GitHub OAuth is not configured")

    state = secrets.token_urlsafe(32)
    redirect_uri = str(request.url_for("github_oauth_callback"))
    params = {
        "client_id": settings.github_client_id,
        "redirect_uri": redirect_uri,
        "scope": "read:user user:email",
        "state": state,
    }
    url = f"https://github.com/login/oauth/authorize?{urlencode(params)}"
    resp = RedirectResponse(url=url, status_code=302)
    resp.set_cookie("oauth_state", state, httponly=True, samesite="lax", secure=settings.secure_cookies, max_age=600)
    resp.set_cookie("oauth_remember", "1" if remember_me else "0", httponly=True, samesite="lax", secure=settings.secure_cookies, max_age=600)
    return resp


@router.get("/oauth/github/callback", name="github_oauth_callback")
async def github_oauth_callback(request: Request, response: Response, code: str | None = None, state: str | None = None, db: Session = Depends(get_db)):
    expected_state = request.cookies.get("oauth_state")
    remember_flag = request.cookies.get("oauth_remember")
    remember_me = remember_flag == "1"

    if not code or not state or not expected_state or state != expected_state:
        return RedirectResponse(url=_frontend_redirect("/login"), status_code=302)

    redirect_uri = str(request.url_for("github_oauth_callback"))
    async with httpx.AsyncClient(timeout=20) as client:
        token_resp = await client.post(
            "https://github.com/login/oauth/access_token",
            headers={"Accept": "application/json"},
            data={
                "client_id": settings.github_client_id,
                "client_secret": settings.github_client_secret,
                "code": code,
                "redirect_uri": redirect_uri,
            },
        )
        token_data = token_resp.json() if token_resp.headers.get("content-type", "").startswith("application/json") else {}
        access_token = token_data.get("access_token")
        if not access_token:
            return RedirectResponse(url=_frontend_redirect("/login"), status_code=302)

        email = None
        emails_resp = await client.get(
            "https://api.github.com/user/emails",
            headers={
                "Accept": "application/vnd.github+json",
                "Authorization": f"Bearer {access_token}",
                "X-GitHub-Api-Version": "2022-11-28",
            },
        )
        if emails_resp.status_code == 200:
            emails = emails_resp.json() or []
            for item in emails:
                if item.get("primary") and item.get("verified") and item.get("email"):
                    email = item.get("email")
                    break
            if not email:
                for item in emails:
                    if item.get("verified") and item.get("email"):
                        email = item.get("email")
                        break

        if not email:
            user_resp = await client.get(
                "https://api.github.com/user",
                headers={
                    "Accept": "application/vnd.github+json",
                    "Authorization": f"Bearer {access_token}",
                    "X-GitHub-Api-Version": "2022-11-28",
                },
            )
            if user_resp.status_code == 200:
                email = (user_resp.json() or {}).get("email")

    if not email:
        return RedirectResponse(url=_frontend_redirect("/login"), status_code=302)

    user = crud.get_user_by_email(db, email)
    if not user:
        random_password = secrets.token_urlsafe(32)
        user = crud.create_user(db, email, get_password_hash(random_password))

    ttl_seconds = _session_ttl_seconds(remember_me)
    token = create_access_token(str(user.id), user.email, expires_delta=timedelta(seconds=ttl_seconds))
    redirect = RedirectResponse(url=_frontend_redirect("/dashboard"), status_code=302)
    redirect.set_cookie(
        settings.cookie_name,
        token,
        httponly=True,
        samesite="lax",
        secure=settings.secure_cookies,
        max_age=ttl_seconds,
        expires=ttl_seconds,
    )
    redirect.delete_cookie("oauth_state")
    redirect.delete_cookie("oauth_remember")
    return redirect


@router.get("/oauth/google/start")
async def google_oauth_start(request: Request, remember_me: bool = False):
    if not settings.google_client_id or not settings.google_client_secret:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Google OAuth is not configured")

    state = secrets.token_urlsafe(32)
    redirect_uri = str(request.url_for("google_oauth_callback"))
    params = {
        "client_id": settings.google_client_id,
        "redirect_uri": redirect_uri,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "online",
        "prompt": "select_account",
        "state": state,
    }
    url = f"https://accounts.google.com/o/oauth2/v2/auth?{urlencode(params)}"
    resp = RedirectResponse(url=url, status_code=302)
    resp.set_cookie("oauth_state", state, httponly=True, samesite="lax", secure=settings.secure_cookies, max_age=600)
    resp.set_cookie("oauth_remember", "1" if remember_me else "0", httponly=True, samesite="lax", secure=settings.secure_cookies, max_age=600)
    return resp


@router.get("/oauth/google/callback", name="google_oauth_callback")
async def google_oauth_callback(request: Request, code: str | None = None, state: str | None = None, db: Session = Depends(get_db)):
    expected_state = request.cookies.get("oauth_state")
    remember_flag = request.cookies.get("oauth_remember")
    remember_me = remember_flag == "1"

    if not code or not state or not expected_state or state != expected_state:
        return RedirectResponse(url=_frontend_redirect("/login"), status_code=302)

    redirect_uri = str(request.url_for("google_oauth_callback"))
    async with httpx.AsyncClient(timeout=20) as client:
        token_resp = await client.post(
            "https://oauth2.googleapis.com/token",
            data={
                "client_id": settings.google_client_id,
                "client_secret": settings.google_client_secret,
                "code": code,
                "grant_type": "authorization_code",
                "redirect_uri": redirect_uri,
            },
            headers={"Accept": "application/json"},
        )
        if token_resp.status_code != 200:
            return RedirectResponse(url=_frontend_redirect("/login"), status_code=302)
        token_data = token_resp.json() or {}
        access_token = token_data.get("access_token")
        if not access_token:
            return RedirectResponse(url=_frontend_redirect("/login"), status_code=302)

        userinfo = await client.get(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            headers={"Authorization": f"Bearer {access_token}"},
        )
        if userinfo.status_code != 200:
            return RedirectResponse(url=_frontend_redirect("/login"), status_code=302)
        email = (userinfo.json() or {}).get("email")

    if not email:
        return RedirectResponse(url=_frontend_redirect("/login"), status_code=302)

    user = crud.get_user_by_email(db, email)
    if not user:
        random_password = secrets.token_urlsafe(32)
        user = crud.create_user(db, email, get_password_hash(random_password))

    ttl_seconds = _session_ttl_seconds(remember_me)
    token = create_access_token(str(user.id), user.email, expires_delta=timedelta(seconds=ttl_seconds))
    redirect = RedirectResponse(url=_frontend_redirect("/dashboard"), status_code=302)
    redirect.set_cookie(
        settings.cookie_name,
        token,
        httponly=True,
        samesite="lax",
        secure=settings.secure_cookies,
        max_age=ttl_seconds,
        expires=ttl_seconds,
    )
    redirect.delete_cookie("oauth_state")
    redirect.delete_cookie("oauth_remember")
    return redirect
