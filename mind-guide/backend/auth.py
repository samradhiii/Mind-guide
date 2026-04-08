import os
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional

import bcrypt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt


JWT_ALGORITHM = "HS256"
JWT_EXPIRY_MINUTES = 60 * 24 * 7


def _get_secret_key() -> str:
    secret = os.getenv("JWT_SECRET")
    if not secret:
        secret = "dev-secret-change-me"
    return secret


def hash_password(password: str) -> str:
    password_bytes = password.encode("utf-8")
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(password_bytes, salt).decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))
    except ValueError:
        return False


def create_access_token(payload: Dict[str, Any]) -> str:
    now = datetime.now(timezone.utc)
    exp = now + timedelta(minutes=JWT_EXPIRY_MINUTES)

    to_encode = dict(payload)
    to_encode.update({"iat": int(now.timestamp()), "exp": int(exp.timestamp())})

    return jwt.encode(to_encode, _get_secret_key(), algorithm=JWT_ALGORITHM)


bearer_scheme = HTTPBearer(auto_error=False)


def decode_token(token: str) -> Dict[str, Any]:
    try:
        decoded = jwt.decode(token, _get_secret_key(), algorithms=[JWT_ALGORITHM])
        return decoded
    except JWTError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token") from e


def get_current_user_id(credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme)) -> str:
    if not credentials or not credentials.credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing authorization")

    decoded = decode_token(credentials.credentials)
    user_id = decoded.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")

    return str(user_id)
