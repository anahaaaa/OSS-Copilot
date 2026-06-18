from datetime import datetime, timedelta
from jose import JWTError, jwt
from app.core.config import settings


def create_access_token(user_id: str) -> str:
    expire = datetime.utcnow() + timedelta(minutes = settings.jwt_expire_minutes)

    payload = {
        "sub":str(user_id),
        "exp":expire,
        "iat":datetime.utcnow()
    }

    return jwt.encode(
        payload,
        settings.jwt_secret_key,
        algorithm=settings.jwt_algorithm
    )


def verify_access_token(token: str) -> str | None:
    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm]
        )

        user_id = payload.get("sub")
        if user_id is None:
            return None
        return user_id

    except JWTError:
        return None