import os
import base64
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional

from dotenv import load_dotenv
from jose import JWTError, jwt
from passlib.context import CryptContext
from cryptography.fernet import Fernet, InvalidToken


load_dotenv()


SECRET_KEY: str = os.getenv("SECRET_KEY", "")
JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "10080"))  # 7 days

if not SECRET_KEY:
    # Delay hard failure until first actual usage to allow server to boot with helpful error
    SECRET_KEY = ""

password_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")


def create_access_token(subject: str, extra_claims: Optional[Dict[str, Any]] = None, expires_minutes: Optional[int] = None) -> str:
    if not SECRET_KEY:
        raise RuntimeError("SECRET_KEY is not set")
    to_encode: Dict[str, Any] = {"sub": subject}
    if extra_claims:
        to_encode.update(extra_claims)
    expire = datetime.now(timezone.utc) + timedelta(minutes=expires_minutes or ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    token = jwt.encode(to_encode, SECRET_KEY, algorithm=JWT_ALGORITHM)
    return token


def verify_token(token: str) -> Dict[str, Any]:
    if not SECRET_KEY:
        raise RuntimeError("SECRET_KEY is not set")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[JWT_ALGORITHM])
        return payload
    except JWTError as exc:  # includes ExpiredSignatureError
        raise ValueError("Invalid token") from exc


def hash_password(password: str) -> str:
    return password_context.hash(password)


def verify_password(password: str, hashed: str) -> bool:
    return password_context.verify(password, hashed)


def _derive_fernet_key(secret: str) -> bytes:
    # Use a 32-byte key via base64 urlsafe encoding; if secret is short, pad deterministically
    # WARNING: For production, rotate keys safely and use a KMS/VAULT.
    if not secret:
        raise RuntimeError("SECRET_KEY is not set")
    # Ensure length >= 32
    raw = secret.encode("utf-8")
    if len(raw) < 32:
        raw = (raw * (32 // len(raw) + 1))[:32]
    key = base64.urlsafe_b64encode(raw[:32])
    return key


def encrypt_value(plaintext: str) -> str:
    fernet = Fernet(_derive_fernet_key(SECRET_KEY))
    token = fernet.encrypt(plaintext.encode("utf-8"))
    return token.decode("utf-8")


def decrypt_value(ciphertext: str) -> str:
    fernet = Fernet(_derive_fernet_key(SECRET_KEY))
    try:
        value = fernet.decrypt(ciphertext.encode("utf-8"))
        return value.decode("utf-8")
    except InvalidToken as exc:
        raise ValueError("Invalid encrypted value") from exc


