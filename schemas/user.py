from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class SignupRequest(BaseModel):
    firstName: str = Field(..., min_length=1, max_length=100)
    lastName: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class Profile(BaseModel):
    firstName: str = ""
    lastName: str = ""
    email: EmailStr
    phone: Optional[str] = ""
    location: Optional[str] = ""
    bio: Optional[str] = ""
    profession: Optional[str] = ""
    company: Optional[str] = ""


class ProfileUpdate(BaseModel):
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    bio: Optional[str] = None
    profession: Optional[str] = None
    company: Optional[str] = None


class APISettings(BaseModel):
    useOwnKey: bool = False
    openaiKey: Optional[str] = None  # Will be stored encrypted if provided
    keyActive: bool = True


class ProfileWithSettings(Profile):
    apiSettings: APISettings = APISettings()


