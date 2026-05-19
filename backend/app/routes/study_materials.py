from fastapi import APIRouter, UploadFile, File, Request, Form, Depends,  HTTPException
from app.services.text_extractor import extract_text_from_pdf, extract_text_from_docx, extract_text_from_pptx, generate_pdf_thumbnail
from app.db.database import taxonomy_collection
from app.db.database import study_materials_collection
from datetime import datetime, timezone
import cloudinary.uploader 
import cloudinary.utils
from typing import Optional
from fastapi.concurrency import run_in_threadpool
from bson import ObjectId
from pydantic import BaseModel
from app.firebase_auth.firebase import get_current_user
from app.ml_model.subject_info import get_subject_info
from app.services.gemini_service import analyze_with_gemini
import re
router = APIRouter()

SUPPORTED_TYPES = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",  # docx
    "application/vnd.openxmlformats-officedocument.presentationml.presentation"  # pptx
]

@router.post("/upload")
async def upload_document(
    request: Request,
    file: UploadFile = File(...),
    title: str = Form(""),
    description: str = Form(None),
    current_user=Depends(get_current_user)
):
    user_id = current_user["uid"]

    # ✅ Validate file type
    if file.content_type not in SUPPORTED_TYPES:
        raise HTTPException(status_code=400, detail="Unsupported file type")

    file_bytes = await file.read()

    # ✅ Decide resource type
    if file.content_type == "application/pdf":
        resource_type = "raw"   # allows preview
    else:
        resource_type = "raw"     # prevents ZIP error

    # ✅ Upload to Cloudinary
    upload_result = await run_in_threadpool(
        cloudinary.uploader.upload,
        file_bytes,
        resource_type=resource_type,
        folder="study_materials"
    )

    public_id = upload_result["public_id"]

    # ✅ Always generate working file URL (raw access)
    file_url = cloudinary.utils.cloudinary_url(
        public_id,
        resource_type="raw",
        secure=True,
        
    )[0]

    # ✅ Generate cover image
    if file.content_type == "application/pdf":
        thumbnail_bytes = generate_pdf_thumbnail(file_bytes)

        thumb_upload = await run_in_threadpool(
            cloudinary.uploader.upload,
            thumbnail_bytes,
            resource_type="image",
            folder="study_materials/thumbnails"
        )

        cover_image = thumb_upload["secure_url"]
    else:
        cover_image = None

    # ✅ Extract text based on type
    if file.content_type == "application/pdf":
        text = extract_text_from_pdf(file_bytes)
    elif "word" in file.content_type:
        text = extract_text_from_docx(file_bytes)
    elif "presentation" in file.content_type:
        text = extract_text_from_pptx(file_bytes)
    else:
        text = ""

    if not text.strip():
        text = "No text extracted"

    cleaned_text = re.sub(r'\s+', ' ', text).strip()

    # ✅ SUBJECT MODEL
    subject_model = request.app.state.subject_model
    predicted_arxiv_code = subject_model.predict([cleaned_text])[0]

    taxonomy = await taxonomy_collection.find_one({
        "arxiv_code": predicted_arxiv_code
    })

    if not taxonomy:
        raise HTTPException(status_code=400, detail="No taxonomy mapping found")

    # ✅ GEMINI ANALYSIS
    ai_data = await run_in_threadpool(analyze_with_gemini, cleaned_text)

    if not ai_data:
        ai_data = {
            "summary": None,
            "topics": [],
            "tags": [],
            "difficulty": None
        }

    final_title = title.strip() if title.strip() else ai_data.get("suggested_title", "Untitled Document")
    final_description = description.strip() if description and description.strip() else ai_data.get("suggested_description", "")

    # ✅ DATABASE OBJECT
    study_material = {
        "title": final_title,
        "filename": file.filename,
        "description": final_description,

        "arxiv_code": predicted_arxiv_code,
        "domain": taxonomy["domain"],
        "category": taxonomy["category"],
        "subject": taxonomy["subject"],

        "summary": ai_data.get("summary"),
        "topics": ai_data.get("topics", []),
        "tags": ai_data.get("tags", []),
        "difficulty": ai_data.get("difficulty"),

        "content_preview": cleaned_text[:1000],
        "word_count": len(cleaned_text.split()),

        "material_type": file.content_type,

        # ✅ FIXED FIELDS
        "file_url": file_url,
        "public_id": public_id,
        "cover_image": cover_image,

        "uploaded_by": user_id,

        "views": 0,
        "downloads": 0,
        "likes": 0,

        "created_at": datetime.now(timezone.utc)
    }

    result = await study_materials_collection.insert_one(study_material)

    return {
        "id": str(result.inserted_id),
        "title": final_title,
        "description": final_description,

        "subject": taxonomy["subject"],
        "category": taxonomy["category"],
        "domain": taxonomy["domain"],

        "summary": study_material["summary"],
        "topics": study_material["topics"],
        "tags": study_material["tags"],
        "difficulty": study_material["difficulty"],

        "cover_image": cover_image,
        "file_url": file_url
    }


# # --------------------GET MATERIALS -------------------
@router.get("/materials")
async def get_study_materials():
    materials = []

    cursor = study_materials_collection.find().sort("created_at", -1)

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
            "cover_image": doc.get("cover_image"),
            "material_type": doc.get("material_type"),
            "filename": doc.get("filename"),

            "file_url": doc.get("file_url"),
            "public_id": doc.get("public_id"),
            "uploaded_by": doc.get("uploaded_by"),

            "views": doc.get("views", 0),
            "downloads": doc.get("downloads", 0),
            "likes": doc.get("likes", 0),
            "created_at": doc.get("created_at")
        })

    return materials
# -------------------ADD LIKES --------------
@router.post("/materials/{material_id}/like")
async def like_material(material_id: str):
    result = await study_materials_collection.update_one(
        {"_id": ObjectId(material_id)},
        {"$inc": {"likes": 1}}
    )

    if result.modified_count == 0:
        return {"error": "Material not found"}
    
    print("Received ID:", material_id)
    return {"message": "Liked successfully"}

# ----------------------------------------------------------------------------
@router.get("/my-materials")
async def get_my_materials(current_user=Depends(get_current_user)):
    user_id = current_user["uid"]

    materials = []

    cursor = study_materials_collection.find({
        "uploaded_by": user_id
    }).sort("created_at", -1)

    async for doc in cursor:
        materials.append({
            "id": str(doc["_id"]),
            "title": doc.get("title"),
            "description": doc.get("description"),

            # ✅ CONSISTENT STRUCTURE
            "arxiv_code": doc.get("arxiv_code"),
            "domain": doc.get("domain"),
            "category": doc.get("category"),
            "subject": doc.get("subject"),

            "material_type": doc.get("material_type"),
            "filename": doc.get("filename"),

            "file_url": doc.get("file_url"),
            "cover_image": doc.get("cover_image"),

            "likes": doc.get("likes", 0),
            "views": doc.get("views", 0),
            "downloads": doc.get("downloads", 0),
            "created_at": doc.get("created_at")
        })

    return materials


# ------------------------------------------------------------------
#UPDATE STUDY MATERIALS
class UpdateMaterialRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None

@router.put("/materials/{material_id}")
async def update_material(
    material_id: str,
    payload: UpdateMaterialRequest,
    current_user=Depends(get_current_user)
):
    user_id = current_user["uid"]

    # Find material
    material = await study_materials_collection.find_one({
        "_id": ObjectId(material_id)
    })

    if not material:
        raise HTTPException(status_code=404, detail="Material not found")

    # Ownership check 🔥
    if material["uploaded_by"] != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to edit this material")

    # 🔥 Build dynamic update object
    update_data = {}

    if payload.title is not None:
        update_data["title"] = payload.title

    if payload.description is not None:
        update_data["description"] = payload.description

    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")

    # ✅ Update in DB
    await study_materials_collection.update_one(
        {"_id": ObjectId(material_id)},
        {
            "$set": update_data
        }
    )

    return {"message": "Material updated successfully"}

#DELETE STUDY MATERIAL
@router.delete("/materials/{material_id}")
async def delete_material(material_id: str, current_user=Depends(get_current_user)):
    user_id = current_user["uid"]

    # Find material
    material = await study_materials_collection.find_one({
        "_id": ObjectId(material_id)
    })

    if not material:
        raise HTTPException(status_code=404, detail="Material not found")

    # Ownership check 🔥
    if material["uploaded_by"] != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this material")

    # Delete
    await study_materials_collection.delete_one({
        "_id": ObjectId(material_id)
    })

    return {"message": "Material deleted successfully"}