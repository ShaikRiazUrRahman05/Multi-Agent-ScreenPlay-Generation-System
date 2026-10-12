import os
from typing import Optional

from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorCollection


load_dotenv()


MONGO_URI: Optional[str] = os.getenv("MONGO_URI")
MONGO_DB_NAME: str = os.getenv("MONGO_DB_NAME", "cinema_agent")

if not MONGO_URI:
    # Delay hard failure until first use; routes can handle and report clear errors
    MONGO_URI = ""

_client: Optional[AsyncIOMotorClient] = None


def get_client() -> AsyncIOMotorClient:
    global _client
    if _client is None:
        if not MONGO_URI:
            raise RuntimeError("MONGO_URI is not set")
        _client = AsyncIOMotorClient(MONGO_URI)
    return _client


def get_db():
    return get_client()[MONGO_DB_NAME]


def get_user_collection() -> AsyncIOMotorCollection:
    return get_db()["users"]


async def ensure_indexes() -> None:
    """Create necessary indexes if they do not already exist."""
    users = get_user_collection()
    # Unique email index
    await users.create_index("email", name="uniq_email", unique=True)

