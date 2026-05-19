from fastapi import APIRouter, Depends,  HTTPException, Query
from datetime import datetime, timezone
from app.db.database import study_materials_collection
from app.db.database import user_activity_collection
from bson import ObjectId
from app.firebase_auth.firebase import get_current_user
from pymongo.errors import DuplicateKeyError
from pydantic import BaseModel
from typing import Optional
from app.services.utility import get_recently_viewed

class TrackEventRequest(BaseModel):
    document_id: str
    action: str

router = APIRouter()

VALID_ACTIONS = ["view", "like", "download"]


# Utility: Validate ObjectId
def validate_object_id(document_id: str):
    try:
        return ObjectId(document_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid document ID")


# Utility: Get document safely
async def get_document(obj_id):
    doc = await study_materials_collection.find_one(
        {"_id": obj_id},
        {"subject": 1, "topics": 1}  
    )
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc

@router.post("/track")
async def track_event(
    request: TrackEventRequest,
    current_user=Depends(get_current_user)
):
    if request.action not in VALID_ACTIONS:
        raise HTTPException(status_code=400, detail="Invalid action")

    user_id = current_user["uid"]
    obj_id = validate_object_id(request.document_id)

    doc = await get_document(obj_id)

    activity = {
        "user_id": user_id,
        "document_id": request.document_id,
        "action": request.action,
        "subject": doc.get("subject"),
        "topics": doc.get("topics", []),
        "timestamp": datetime.now(timezone.utc)
    }

    if request.action in ["like", "download"]:
        try:
            await user_activity_collection.insert_one(activity)
        except DuplicateKeyError:
            return {"message": f"Already {request.action}d", "incremented": False}
    else:
        await user_activity_collection.insert_one(activity)

    update_field = {
        "view": "views",
        "like": "likes",
        "download": "downloads"
    }[request.action]

    await study_materials_collection.update_one(
        {"_id": obj_id},
        {"$inc": {update_field: 1}}
    )

    return {
        "message": f"{request.action.capitalize()} tracked successfully",
        "incremented": True
    }


@router.get("/recently-viewed")
async def recently_viewed(current_user=Depends(get_current_user)):
    user_id = current_user["uid"]

    results = await get_recently_viewed(user_id)

    return {
        "materials": results
    }

@router.get("/{doc_id}/summary")
async def get_document_summary(doc_id: str):
    try:
        obj_id = validate_object_id(doc_id)

        document = await study_materials_collection.find_one({"_id": obj_id})  

        if not document:
            raise HTTPException(status_code=404, detail="Document not found")

        return {
            "success": True,
            "summary": document.get("summary"),
            "title": document.get("title"),
            "topics": document.get("topics"),
            "difficulty": document.get("difficulty")
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/materials/search")
async def search_materials(
    query: Optional[str] = None,
    difficulty: Optional[str] = None,
    subject: Optional[str] = None,
    sort_by: Optional[str] = "new"
):
    filter_query = {}

    #  Text search
    if query:
        filter_query["$text"] = {"$search": query}

    #  Filters
    if difficulty:
        filter_query["difficulty"] = difficulty

    if subject:
        filter_query["subject.name"] = subject

    # Projection
    projection = {}
    if query:
        projection["score"] = {"$meta": "textScore"}

    cursor = study_materials_collection.find(filter_query, projection)

    # Sorting logic
    if query:
        # sort by relevance if searching
        cursor = cursor.sort([("score", {"$meta": "textScore"})])
    else:
        sort_map = {
            "new": ("created_at", -1),
            "views": ("views", -1),
            "likes": ("likes", -1)
        }

        sort_field, order = sort_map.get(sort_by, ("created_at", -1))
        cursor = cursor.sort(sort_field, order)


    results = await cursor.limit(20).to_list(length=20)

    for r in results:
        r["_id"] = str(r["_id"])

    return results