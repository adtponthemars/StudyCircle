from fastapi import Depends, HTTPException, APIRouter
from app.db.database import study_materials_collection
from app.db.database import users_collection
from app.firebase_auth.firebase import get_current_user
from app.services.utility import recommend_materials
router = APIRouter()

#subjects that user is interested in 
@router.get("/materials/recommended")
async def get_recommended_materials(current_user=Depends(get_current_user)):
    materials = []

    user_id = current_user["uid"]

    # Fetch user
    user = await users_collection.find_one({"firebase_uid": user_id})

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Get interests
    user_subjects = user.get("interests", {}).get("subjects", [])

    if not user_subjects:
        return {
            "message": "No interests found for user",
            "materials": []
        }

    cursor = study_materials_collection.find({
        "subject.id": {"$in": user_subjects}
    }).sort("created_at", -1)

    async for doc in cursor:
        materials.append({
            "id": str(doc["_id"]),
            "title": doc.get("title"),
            "description": doc.get("description"),

            # ✅ UPDATED STRUCTURE
            "arxiv_code": doc.get("arxiv_code"),
            "domain": doc.get("domain"),
            "category": doc.get("category"),
            "subject": doc.get("subject"),

            "material_type": doc.get("material_type"),
            "file_url": doc.get("file_url"),
            "public_id": doc.get("public_id"),
            "uploaded_by": doc.get("uploaded_by"),
            "cover_image": doc.get("cover_image"),

            "views": doc.get("views", 0),
            "downloads": doc.get("downloads", 0),
            "likes": doc.get("likes", 0),
            "created_at": doc.get("created_at")
        })

    return {
        "user_interests": user_subjects,
        "count": len(materials),
        "materials": materials
    }


@router.get("/recommend")
async def get_recommendations(current_user=Depends(get_current_user)):
    user_id = current_user["uid"]

    results = await recommend_materials(user_id)

    return {
    "materials": results
    }
