from fastapi import Cookie, Depends, HTTPException, status
from sqlalchemy.orm import Session

from settings import settings
from database.db import get_db
from database import crud
from .security import decode_token


def get_current_user(
    db: Session = Depends(get_db),
    auth_cookie: str | None = Cookie(default=None, alias=settings.cookie_name),
):
    """Resolve the current user from the auth cookie."""
    if not auth_cookie:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    payload = decode_token(auth_cookie)
    if not payload or "sub" not in payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    user = crud.get_user_by_id(db, int(payload["sub"]))
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user
