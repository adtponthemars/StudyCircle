from fastapi import FastAPI
import app.core.cloudinary_config 
from app.routes.auth_routes import router as auth_router
from fastapi.middleware.cors import CORSMiddleware
from app.routes.profile_route import router as profile_router 
from app.routes.study_materials import router as upload_router 
from app.routes.activity_routes import router as activity_router
from app.routes.recommendation_route import router as recommendation_router
from app.routes.explore_routes import router as explore_router
import joblib
from contextlib import asynccontextmanager
from pathlib import Path 
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "ml_model" / "subject_classifier3.pkl"

# Load model at startup
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic
    print("Loading subject classification model...")
    model = joblib.load(MODEL_PATH)

    app.state.subject_model = joblib.load(MODEL_PATH )
    print("Model loaded successfully!")
    
    yield  # Application runs here

    print("Shutting down application...")

app = FastAPI(lifespan=lifespan)

@app.get("/")
def root():
    return {"message": "API is running"}

app.include_router(auth_router)
app.include_router(profile_router) 
app.include_router(upload_router)
app.include_router(recommendation_router)
app.include_router(explore_router)
app.include_router(activity_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # change to frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



