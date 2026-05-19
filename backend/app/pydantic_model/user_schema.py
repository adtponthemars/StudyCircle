from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime

'''BaseModel → defines API schemas, EmailStr → validates emails, List & Optional → define flexible structured data, datetime → handle timestamps'''


class AcademicInfo(BaseModel):
    level: str  # "school" | "college" | "none"
    grade: Optional[str] = None            # only for school
    course_name: Optional[str] = None      # only for college
    semester: Optional[str] = None         # only for college


class InterestProfile(BaseModel):
    subjects: List[str] = Field(default_factory=list)


class UserBase(BaseModel):
    name: str
    email: EmailStr
    firebase_uid: str
    role: str = "student"


class UserResponse(UserBase):
    id: str
    academic_info: AcademicInfo
    interests: InterestProfile
    bio: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None


class ProfileSetupRequest(BaseModel):
    academic_info: AcademicInfo
    interests: InterestProfile
    bio: Optional[str] = None
    