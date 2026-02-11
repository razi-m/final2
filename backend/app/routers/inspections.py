from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
import os
import shutil
import httpx
from app.database import get_db
from app.models import Inspection as InspectionModel, Defect as DefectModel, User as UserModel, Report as ReportModel
from app.schemas import InspectionCreate, Inspection as InspectionSchema, InspectionDetail
from app.auth import get_current_user
from app.state_machine import validate_transition
from app.config import settings

router = APIRouter()

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.get("/inspections", response_model=List[InspectionSchema])
def list_inspections(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    inspections = db.query(InspectionModel).offset(skip).limit(limit).all()
    return inspections

@router.post("/inspections", response_model=InspectionSchema)
def create_inspection(
    inspection: InspectionCreate,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    user = db.query(UserModel).filter(UserModel.username == current_user).first()
    db_inspection = InspectionModel()
    db_inspection.title = inspection.title
    db_inspection.description = inspection.description
    db_inspection.status = "created"
    db_inspection.user_id = user.id
    db.add(db_inspection)
    db.commit()
    db.refresh(db_inspection)
    return db_inspection

@router.get("/inspections/{inspection_id}", response_model=InspectionDetail)
def get_inspection(
    inspection_id: int, 
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    inspection = db.query(InspectionModel).filter(InspectionModel.id == inspection_id).first()
    if not inspection:
        raise HTTPException(status_code=404, detail="Inspection not found")
    return inspection

@router.post("/inspections/{inspection_id}/upload")
def upload_video(
    inspection_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    inspection = db.query(InspectionModel).filter(InspectionModel.id == inspection_id).first()
    if not inspection:
        raise HTTPException(status_code=404, detail="Inspection not found")
    
    try:
        validate_transition(inspection.status, "video_uploaded")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    file_extension = os.path.splitext(file.filename)[1]
    file_path = os.path.join(UPLOAD_DIR, f"inspection_{inspection_id}{file_extension}")
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    inspection.video_path = file_path
    inspection.status = "video_uploaded"
    db.commit()
    db.refresh(inspection)
    
    return {"message": "Video uploaded successfully", "status": inspection.status}

@router.post("/inspections/{inspection_id}/analyze")
async def analyze_inspection(
    inspection_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    inspection = db.query(InspectionModel).filter(InspectionModel.id == inspection_id).first()
    if not inspection:
        raise HTTPException(status_code=404, detail="Inspection not found")
    
    try:
        validate_transition(inspection.status, "analyzing")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    if not inspection.video_path:
        raise HTTPException(status_code=400, detail="No video uploaded for this inspection")
    
    inspection.status = "analyzing"
    db.commit()
    
    try:
        async with httpx.AsyncClient(timeout=300.0) as client:
            response = await client.post(
                f"{settings.ML_SERVICE_URL}/analyze",
                json={"video_path": inspection.video_path}
            )
            response.raise_for_status()
            analysis_results = response.json()
        
        for defect_data in analysis_results.get("defects", []):
            defect = DefectModel()
            defect.inspection_id = inspection_id
            defect.frame_number = defect_data["frame_number"]
            defect.defect_type = defect_data["defect_type"]
            defect.confidence = defect_data["confidence"]
            db.add(defect)
        
        inspection.status = "analysis_completed"
        db.commit()
        
        return {"message": "Analysis completed", "defects_found": len(analysis_results.get("defects", []))}
    
    except Exception as e:
        inspection.status = "failed"
        db.commit()
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@router.post("/inspections/{inspection_id}/approve")
def approve_inspection(
    inspection_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    inspection = db.query(InspectionModel).filter(InspectionModel.id == inspection_id).first()
    if not inspection:
        raise HTTPException(status_code=404, detail="Inspection not found")
    
    try:
        validate_transition(inspection.status, "approved")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    inspection.status = "approved"
    db.commit()
    
    background_tasks.add_task(generate_report_task, inspection_id)
    
    return {"message": "Inspection approved, report generation started"}

async def generate_report_task(inspection_id: int):
    """Background task to generate PDF report using Gemini."""
    from app.database import SessionLocal
    from fpdf import FPDF
    import google.generativeai as genai
    
    db = SessionLocal()
    try:
        inspection = db.query(InspectionModel).filter(InspectionModel.id == inspection_id).first()
        if not inspection:
            return
        
        defects = db.query(DefectModel).filter(DefectModel.inspection_id == inspection_id).all()
        
        genai.configure(api_key=settings.GEMINI_API_KEY)
        model = genai.GenerativeModel('gemini-pro')
        
        defect_summary = "\n".join([
            f"- {d.defect_type} detected in frame {d.frame_number} with {d.confidence:.2%} confidence"
            for d in defects
        ]) if defects else "No defects detected."
        
        prompt = f"""Generate a professional infrastructure inspection report for:
        
Title: {inspection.title}
Description: {inspection.description or 'N/A'}
Status: {inspection.status}

Defects Found:
{defect_summary}

Please provide:
1. Executive Summary
2. Detailed Findings
3. Recommendations
4. Conclusion
"""
        
        response = model.generate_content(prompt)
        report_content = response.text
        
        pdf = FPDF()
        pdf.add_page()
        pdf.set_font("Arial", "B", 16)
        pdf.cell(0, 10, f"Inspection Report: {inspection.title}", ln=True)
        pdf.ln(10)
        
        pdf.set_font("Arial", size=12)
        for line in report_content.split('\n'):
            pdf.cell(0, 10, line, ln=True)
        
        reports_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "reports")
        os.makedirs(reports_dir, exist_ok=True)
        pdf_path = os.path.join(reports_dir, f"report_{inspection_id}.pdf")
        pdf.output(pdf_path)
        
        report = ReportModel()
        report.inspection_id = inspection_id
        report.pdf_path = pdf_path
        db.add(report)
        db.commit()
        
    except Exception as e:
        print(f"Report generation failed: {e}")
    finally:
        db.close()