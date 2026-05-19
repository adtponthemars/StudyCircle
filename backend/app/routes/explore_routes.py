from fastapi import APIRouter
from app.db.database import taxonomy_collection
from app.db.database import study_materials_collection
from typing import Optional
router = APIRouter()

@router.get("/domains")
async def get_domains():
    pipeline = [
        {
            "$group": {
                "_id": "$domain.id",
                "name": { "$first": "$domain.name" }
            }
        },
        {
            "$project": {
                "_id": 0,
                "id": "$_id",
                "name": 1
            }
        },
        {
            "$sort": { "name": 1 }
        }
    ]

    domains = await taxonomy_collection.aggregate(pipeline).to_list(None)

    return domains

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
