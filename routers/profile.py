from typing import Any, Dict, Optional

from fastapi import APIRouter, HTTPException, Depends

from db.mongo import get_user_collection
from routers.auth import get_current_user_id
from schemas.user import ProfileWithSettings, ProfileUpdate, APISettings
from core.security import encrypt_value, decrypt_value
from bson import ObjectId


router = APIRouter(prefix="/api/profile", tags=["profile"])


def _project_user_doc(user: Dict[str, Any]) -> ProfileWithSettings:
    api_settings = user.get("apiSettings") or {}
    # Do not expose raw encrypted value
    masked = None
    if api_settings.get("openaiKey"):
        masked = "sk-********"  # mask in response
    return ProfileWithSettings(
        firstName=user.get("firstName", ""),
        lastName=user.get("lastName", ""),
        email=user.get("email", ""),
        phone=user.get("phone", ""),
        location=user.get("location", ""),
        bio=user.get("bio", ""),
        profession=user.get("profession", ""),
        company=user.get("company", ""),
        apiSettings=APISettings(
            useOwnKey=bool(api_settings.get("useOwnKey", False)),
            openaiKey=masked,
            keyActive=bool(api_settings.get("keyActive", True)),
        ),
    )


@router.get("/me", response_model=ProfileWithSettings)
async def get_me(user_id: str = Depends(get_current_user_id)) -> ProfileWithSettings:
    users = get_user_collection()
    oid = ObjectId(user_id) if ObjectId.is_valid(user_id) else user_id
    user = await users.find_one({"_id": oid})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return _project_user_doc(user)


@router.put("/me", response_model=ProfileWithSettings)
async def update_me(payload: ProfileUpdate, user_id: str = Depends(get_current_user_id)) -> ProfileWithSettings:
    users = get_user_collection()

    update_doc: Dict[str, Any] = {k: v for k, v in payload.model_dump(exclude_unset=True).items() if v is not None}

    if not update_doc:
        user = await users.find_one({"_id": user_id})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return _project_user_doc(user)

    oid = ObjectId(user_id) if ObjectId.is_valid(user_id) else user_id
    await users.update_one({"_id": oid}, {"$set": update_doc})
    user = await users.find_one({"_id": oid})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return _project_user_doc(user)


@router.put("/me/api-settings", response_model=ProfileWithSettings)
async def update_api_settings(settings: APISettings, user_id: str = Depends(get_current_user_id)) -> ProfileWithSettings:
    users = get_user_collection()

    to_set: Dict[str, Any] = {
        "apiSettings.useOwnKey": settings.useOwnKey,
        "apiSettings.keyActive": settings.keyActive,
    }
    if settings.openaiKey:
        to_set["apiSettings.openaiKey"] = encrypt_value(settings.openaiKey)

    oid = ObjectId(user_id) if ObjectId.is_valid(user_id) else user_id
    await users.update_one({"_id": oid}, {"$set": to_set})
    user = await users.find_one({"_id": oid})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return _project_user_doc(user)


