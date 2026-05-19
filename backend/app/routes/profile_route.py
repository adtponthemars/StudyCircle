from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi import APIRouter
from app.db.database import users_collection
from app.firebase_auth.firebase import verify_firebase_token
from app.pydantic_model.user_schema import ProfileSetupRequest
from datetime import datetime, timezone

router = APIRouter()
security = HTTPBearer()

@router.get("/profile")
async def get_profile(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    id_token = credentials.credentials
    decoded = verify_firebase_token(id_token)

    if not decoded:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user = await users_collection.find_one(
        {"firebase_uid": decoded["uid"]},
        {"_id": 0}
    )

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user


@router.post("/profile/setup")
async def setup_profile(
    payload: ProfileSetupRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    # Extract Firebase token
    id_token = credentials.credentials
    decoded = verify_firebase_token(id_token)

    if not decoded:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    firebase_uid = decoded["uid"]

    update_result = await users_collection.update_one(
        {"firebase_uid": firebase_uid},
        {
            "$set": {
                "academic_info": payload.academic_info.model_dump(),
                "interests": payload.interests.model_dump(),
                "bio": payload.bio,
                "updated_at": datetime.now(timezone.utc)
            }
        }
    )

    if update_result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")

    return {"message": "Profile updated successfully"}