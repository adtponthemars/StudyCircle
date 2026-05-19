from app.db.database import users_collection
from app.firebase_auth.firebase import verify_firebase_token
from app.models.user_model import create_user_document

async def authenticate_user_service(token: str):

    decoded = verify_firebase_token(token)

    if not decoded:
        return None

    firebase_uid = decoded["uid"]
    email = decoded.get("email")
    name = decoded.get("name")

    user = await users_collection.find_one({"firebase_uid": firebase_uid})

    if not user:
        new_user = create_user_document(firebase_uid, email, name)
        result = await users_collection.insert_one(new_user)
        new_user["_id"] = result.inserted_id
        return {
            "user":new_user,
            "is_new_user":True,
            "profile_created": False
        }

    return {
        "user": user,
        "is_new_user": False,
        "profile_completed": user["profile_completed"]
    }
