from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from settings import settings
from database.db import get_db
from database import crud
from schemas.api_models import AuthResponse, LoginRequest, SignupRequest, UserResponse
from .security import create_access_token, get_password_hash, verify_password
from .dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", response_model=AuthResponse)
def signup(payload: SignupRequest, response: Response, db: Session = Depends(get_db)):
    """Register a new user and set auth cookie."""
    existing = crud.get_user_by_email(db, payload.email)
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    hashed = get_password_hash(payload.password)
    user = crud.create_user(db, payload.email, hashed)
    token = create_access_token(str(user.id), user.email)
    response.set_cookie(
        settings.cookie_name,
        token,
        httponly=True,
        samesite="lax",
        secure=settings.secure_cookies,
        max_age=int(timedelta(minutes=settings.access_token_expire_minutes).total_seconds()),
    )
    return AuthResponse(user=UserResponse.model_validate(user))


@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest, response: Response, db: Session = Depends(get_db)):
    """Authenticate a user and set auth cookie."""
    user = crud.get_user_by_email(db, payload.email)
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    token = create_access_token(str(user.id), user.email)
    response.set_cookie(
        settings.cookie_name,
        token,
        httponly=True,
        samesite="lax",
        secure=settings.secure_cookies,
        max_age=int(timedelta(minutes=settings.access_token_expire_minutes).total_seconds()),
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
