from datetime import datetime, timedelta
from typing import Optional

from jose import JWTError, jwt
from passlib.context import CryptContext

from settings import settings

# NOTE:
# - bcrypt is flaky on some Windows/Python 3.13 setups and has a 72-byte limit.
# - pbkdf2_sha256 is stable and has no such limit.
# Keep the auth flow simple and reliable by using PBKDF2 for new hashes.
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plaintext password against a hash."""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash a plaintext password."""
    # Explicitly choose PBKDF2 so hashing is deterministic and avoids bcrypt constraints.
    return pwd_context.hash(password, scheme="pbkdf2_sha256")


def create_access_token(subject: str, email: str, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token for a user."""
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.access_token_expire_minutes))
    to_encode = {"sub": subject, "email": email, "exp": expire}
    return jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)


def decode_token(token: str) -> Optional[dict]:
    """Decode a JWT token into a payload dict."""
    try:
        return jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
    except JWTError:
        return None
