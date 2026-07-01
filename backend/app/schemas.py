from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class UserBase(BaseModel):
    username: str
    role: str = "admin"

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: Optional[int] = None
    created_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str

class TokenData(BaseModel):
    username: Optional[str] = None

class DefectBase(BaseModel):
    frame_number: int
    defect_type: str
    confidence: float

class DefectCreate(DefectBase):
    inspection_id: int

class Defect(DefectBase):
    id: Optional[int] = None
    inspection_id: Optional[int] = None
    timestamp: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class ReportBase(BaseModel):
    pdf_path: str

class Report(ReportBase):
    id: Optional[int] = None
    inspection_id: Optional[int] = None
    generated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class InspectionBase(BaseModel):
    title: str
    description: Optional[str] = None

class InspectionCreate(InspectionBase):
    pass

class InspectionUpdate(BaseModel):
    status: Optional[str] = None

class Inspection(InspectionBase):
    id: Optional[int] = None
    status: Optional[str] = "created"
    video_path: Optional[str] = None
    user_id: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    defects: List[Defect] = []
    report: Optional[Report] = None
    
    class Config:
        from_attributes = True

class InspectionDetail(Inspection):
    pass

class LoginRequest(BaseModel):
    username: str
    password: str

class AnalysisResult(BaseModel):
    defects: List[dict]