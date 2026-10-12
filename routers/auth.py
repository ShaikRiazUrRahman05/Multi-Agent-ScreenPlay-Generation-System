from typing import Any, Dict

from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

from db.mongo import get_user_collection, ensure_indexes
from schemas.user import SignupRequest, LoginRequest, TokenResponse, ProfileWithSettings
from core.security import hash_password, verify_password, create_access_token


router = APIRouter(prefix="/api/auth", tags=["auth"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


@router.on_event("startup")
async def _ensure_db_indexes() -> None:
    await ensure_indexes()


@router.post("/signup", response_model=TokenResponse)
async def signup(payload: SignupRequest) -> TokenResponse:
    users = get_user_collection()
    existing = await users.find_one({"email": payload.email.lower()})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user_doc: Dict[str, Any] = {
        "firstName": payload.firstName.strip(),
        "lastName": payload.lastName.strip(),
        "email": payload.email.lower(),
        "passwordHash": hash_password(payload.password),
        "apiSettings": {
            "useOwnKey": False,
            "openaiKey": None,
            "keyActive": True,
        },
        "createdAt": None,
        "updatedAt": None,
    }

    result = await users.insert_one(user_doc)
    user_id = str(result.inserted_id)
    token = create_access_token(user_id, extra_claims={"email": payload.email.lower()})
    return TokenResponse(access_token=token)


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest) -> TokenResponse:
    users = get_user_collection()
    user = await users.find_one({"email": payload.email.lower()})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not verify_password(payload.password, user.get("passwordHash", "")):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token(str(user["_id"]), extra_claims={"email": user.get("email")})
    return TokenResponse(access_token=token)


def get_current_user_id(token: str = Depends(oauth2_scheme)) -> str:
    # Lazy import to avoid circular
    from core.security import verify_token  # type: ignore

    try:
        payload = verify_token(token)
        sub = payload.get("sub")
        if not sub:
            raise HTTPException(status_code=401, detail="Invalid token")
        return str(sub)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")


