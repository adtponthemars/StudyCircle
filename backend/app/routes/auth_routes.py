from fastapi import APIRouter, HTTPException, Header
from app.services.auth_service import authenticate_user_service
from app.models.user_model import serialize_user

router = APIRouter()


@router.post("/auth")
async def authenticate_user( authorization: str = Header(None)):

    # HEADER MISSING
    if not authorization:
        raise HTTPException(
            status_code=400,
            detail="Authorization header missing"
        )
    
      # INVALID HEADER FORMAT
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=400,
            detail="Invalid authorization format"
        )
    
     # EXTRACT TOKEN
    token = authorization.split("Bearer ")[1]

     # VERIFY TOKEN
    result = await authenticate_user_service(token)

    if not result:
        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )
    user = result["user"]
    is_new_user = result["is_new_user"]
    profile_completed = result["profile_completed"]

    return {
        "message": (
            "User created"
            if is_new_user
            else "User exists"
        ),

        "is_new_user": is_new_user,

        "profile_completed": profile_completed,

        "user": serialize_user(user)
    }

