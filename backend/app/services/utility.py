from app.db.database import user_activity_collection, study_materials_collection
from datetime import datetime
from bson import ObjectId

ACTION_WEIGHTS = {
    "view": 1,
    "like": 5,
    "download": 7
}

def serialize_doc(doc):
    return {
        "id": str(doc["_id"]), 
        "title": doc.get("title"),
        "description": doc.get("description"),
        "cover_image": doc.get("cover_image"),
        "file_url": doc.get("file_url"),
        "views": doc.get("views", 0),
        "likes": doc.get("likes", 0),
        "downloads": doc.get("downloads", 0),
        "created_at": (
            doc.get("created_at").isoformat()
            if isinstance(doc.get("created_at"), datetime)
            else doc.get("created_at")
        ),
        "subject": doc.get("subject"),
        "topics": doc.get("topics", [])
    }

async def recommend_materials(user_id: str, limit: int = 10):
    # Get user activity
    activities = await user_activity_collection.find(
        {"user_id": user_id}
    ).to_list(length=1000)

    if not activities:
        trending = await study_materials_collection.find()\
            .sort("views", -1)\
            .limit(limit)\
            .to_list(length=limit)

        return [serialize_doc(doc) for doc in trending]

    # preference profile
    subject_scores = {}
    topic_scores = {}

    for act in activities:
        weight = ACTION_WEIGHTS.get(act["action"], 0)

        
        subject_data = act.get("subject")
        if isinstance(subject_data, dict):
            subject = subject_data.get("name")
        else:
            subject = subject_data

       
        topics_data = act.get("topics", [])
        topics = []
        for t in topics_data:
            if isinstance(t, dict):
                topics.append(t.get("name"))
            else:
                topics.append(t)

        if subject:
            subject_scores[subject] = subject_scores.get(subject, 0) + weight

        for topic in topics:
            topic_scores[topic] = topic_scores.get(topic, 0) + weight

    # 3️⃣ Top preferences
    top_subjects = sorted(subject_scores, key=subject_scores.get, reverse=True)[:3]
    top_topics = sorted(topic_scores, key=topic_scores.get, reverse=True)[:5]

    # 4️⃣ Fetch candidates
    candidates = await study_materials_collection.find({
        "$or": [
            {"subject": {"$in": top_subjects}},
            {"topics": {"$in": top_topics}}
        ]
    }).to_list(length=100)

    def score(doc):
        s = 0

        if doc.get("subject") in top_subjects:
            s += 5

        topic_overlap = set(doc.get("topics", [])) & set(top_topics)
        s += len(topic_overlap) * 3

        # popularity boost
        s += doc.get("views", 0) * 0.01
        s += doc.get("likes", 0) * 0.05

        return s

    ranked = sorted(candidates, key=score, reverse=True)

    # Return serialized data
    return [serialize_doc(doc) for doc in ranked[:limit]]

async def get_recently_viewed(user_id: str, limit: int = 6):
    # Get latest view activities
    activities = await user_activity_collection.find(
        {
            "user_id": user_id,
            "action": "view"
        }
    ).sort("timestamp", -1).to_list(length=50)  # get more to deduplicate

    # 2️⃣ Remove duplicates (keep latest per document)
    seen = set()
    unique_doc_ids = []

    for act in activities:
        doc_id = act["document_id"]
        if doc_id not in seen:
            seen.add(doc_id)
            unique_doc_ids.append(doc_id)

    # limit to required count
    unique_doc_ids = unique_doc_ids[:limit]

    if not unique_doc_ids:
        return []

    # 3️⃣ Fetch documents
    object_ids = [ObjectId(doc_id) for doc_id in unique_doc_ids]

    docs = await study_materials_collection.find({
        "_id": {"$in": object_ids}
    }).to_list(length=limit)

    # 4️⃣ Serialize
    return [serialize_doc(doc) for doc in docs]

