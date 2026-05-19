import os
import firebase_admin
from firebase_admin import credentials, auth
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi import HTTPException, Depends

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

SERVICE_ACCOUNT_PATH = os.path.join(BASE_DIR, "firebase-service-account.json")

cred = credentials.Certificate(SERVICE_ACCOUNT_PATH)
firebase_admin.initialize_app(cred)

security = HTTPBearer()

def verify_firebase_token(id_token: str):
    try:
        decoded_token = auth.verify_id_token(id_token)
        return decoded_token
    except Exception as e:
        print("FIREBASE VERIFY ERROR:", e)
        return None



def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    token = credentials.credentials  

    decoded_token = verify_firebase_token(token)

    if not decoded_token:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    return decoded_token


