from datetime import datetime, timezone

def create_user_document(firebase_uid: str, email: str, name: str):
    return {
        "firebase_uid": firebase_uid,
        "email": email,
        "name": name,
        "role": "student",
        "profile_completed": False,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    }

def serialize_user(user: dict):
    return {
        "id": str(user["_id"]),
        "firebase_uid": user["firebase_uid"],
        "email": user["email"],
        "name": user["name"],
        "role": user["role"],
        "profile_completed": user["profile_completed"],
        "created_at": user["created_at"],
        "updated_at": user.get("updated_at")
    }
