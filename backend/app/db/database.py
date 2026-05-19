from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import MONGO_URI
# MONGO_URL = "mongodb://localhost:27017"

client = AsyncIOMotorClient(MONGO_URI)

db = client.studyapp

users_collection = db.users
study_materials_collection = db.study_materials
taxonomy_collection = db.taxonomy 
user_activity_collection = db.user_activity

