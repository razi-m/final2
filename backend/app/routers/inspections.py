from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
import os
import httpx
from app.database import get_db
from app.models import Inspection as InspectionModel, Defect as DefectModel, User as UserModel, Report as ReportModel
from app.schemas import InspectionCreate, Inspection as InspectionSchema, InspectionDetail
from app.auth import get_current_user_obj, require_admin
from app.state_machine import validate_transition
from app.config import settings

router = APIRouter()


def _get_owned_inspection(inspection_id: int, db: Session, current_user: UserModel) -> InspectionModel:
    """Fetch an inspection, enforcing that the caller owns it (or is an admin)."""
    inspection = db.query(InspectionModel).filter(InspectionModel.id == inspection_id).first()
    if not inspection:
        raise HTTPException(status_code=404, detail="Inspection not found")
    if current_user.role != "admin" and inspection.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this inspection")
    return inspection

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Only allow known-safe video container extensions for uploads.
ALLOWED_VIDEO_EXTENSIONS = {".mp4", ".mov", ".avi", ".webm", ".mkv"}
# Cap upload size to avoid filling the disk (500 MB).
MAX_UPLOAD_SIZE = 500 * 1024 * 1024

@router.get("/inspections", response_model=List[InspectionSchema])
def list_inspections(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user_obj)
):
    query = db.query(InspectionModel)
    if current_user.role != "admin":
        query = query.filter(InspectionModel.user_id == current_user.id)
    inspections = query.offset(skip).limit(limit).all()
    return inspections

@router.post("/inspections", response_model=InspectionSchema)
def create_inspection(
    inspection: InspectionCreate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user_obj)
):
    db_inspection = InspectionModel()
    db_inspection.title = inspection.title
    db_inspection.description = inspection.description
    db_inspection.status = "created"
    db_inspection.user_id = current_user.id
    db.add(db_inspection)
    db.commit()
    db.refresh(db_inspection)
    return db_inspection

@router.get("/inspections/{inspection_id}", response_model=InspectionDetail)
def get_inspection(
    inspection_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user_obj)
):
    return _get_owned_inspection(inspection_id, db, current_user)

@router.post("/inspections/{inspection_id}/upload")
def upload_video(
    inspection_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user_obj)
):
    inspection = _get_owned_inspection(inspection_id, db, current_user)

    try:
        validate_transition(inspection.status, "video_uploaded")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Validate the extension against an allowlist. The filename is fully
    # attacker-controlled, so we never reuse any other part of it (avoids
    # path traversal and arbitrary file types).
    file_extension = os.path.splitext(file.filename or "")[1].lower()
    if file_extension not in ALLOWED_VIDEO_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type. Allowed: {sorted(ALLOWED_VIDEO_EXTENSIONS)}",
        )

    # Build the destination path from server-controlled values only, then
    # confirm it stays inside UPLOAD_DIR as defense in depth.
    file_path = os.path.join(UPLOAD_DIR, f"inspection_{inspection_id}{file_extension}")
    if os.path.commonpath([os.path.abspath(file_path), os.path.abspath(UPLOAD_DIR)]) != os.path.abspath(UPLOAD_DIR):
        raise HTTPException(status_code=400, detail="Invalid file path")

    # Stream the upload to disk while enforcing the size cap.
    bytes_written = 0
    try:
        with open(file_path, "wb") as buffer:
            while chunk := file.file.read(1024 * 1024):
                bytes_written += len(chunk)
                if bytes_written > MAX_UPLOAD_SIZE:
                    raise HTTPException(
                        status_code=413,
                        detail=f"File too large. Maximum size is {MAX_UPLOAD_SIZE // (1024 * 1024)} MB",
                    )
                buffer.write(chunk)
    except HTTPException:
        if os.path.exists(file_path):
            os.remove(file_path)
        raise

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
    current_user: UserModel = Depends(get_current_user_obj)
):
    inspection = _get_owned_inspection(inspection_id, db, current_user)

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
    
    except HTTPException:
        inspection.status = "failed"
        db.commit()
        raise
    except Exception as e:
        inspection.status = "failed"
        db.commit()
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@router.post("/inspections/{inspection_id}/approve")
def approve_inspection(
    inspection_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(require_admin)
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
        model = genai.GenerativeModel('gemini-1.5-flash')
        
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

STRICT INSTRUCTIONS:
1. Use ONLY the exact defect types provided in the input list above (pothole, crack, corrosion).
2. Do NOT infer new structural issues or use terms like "spalling", "deformation", "settlement", or "structural damage" unless explicitly listed in Defects Found.
3. Do NOT add engineering interpretations beyond what is supported by the data.
4. If no defects are listed, state "No anomalies detected."

Please provide:
1. Executive Summary
2. Detailed Findings
3. Recommendations
4. Conclusion
"""
        
        response = model.generate_content(prompt)
        report_content = response.text
        
        # Post-process validation: Remove forbidden terms
        import re
        FORBIDDEN_TERMS = [r"spalling", r"deformation", r"settlement", r"structural damage"]
        for term in FORBIDDEN_TERMS:
             # Remove lines containing forbidden terms (case-insensitive)
             report_content = re.sub(f"(?i)^.*{term}.*$", "", report_content, flags=re.MULTILINE)
        
        # Remove empty lines resulting from deletion
        report_content = re.sub(r"\n\s*\n", "\n\n", report_content).strip()
        
        # The core FPDF fonts only support latin-1, but Gemini emits UTF-8
        # (em-dashes, smart quotes, bullets). Transliterate to a latin-1-safe
        # form so PDF generation never crashes on those characters.
        def _latin1(text: str) -> str:
            return text.encode("latin-1", "replace").decode("latin-1")

        pdf = FPDF()
        pdf.add_page()
        pdf.set_font("Arial", "B", 16)
        pdf.multi_cell(0, 10, _latin1(f"Inspection Report: {inspection.title}"))
        pdf.ln(10)

        pdf.set_font("Arial", size=12)
        for line in report_content.split('\n'):
            # multi_cell wraps long lines; an empty string would error, so
            # emit a blank spacer line instead.
            pdf.multi_cell(0, 8, _latin1(line) if line else " ")
        
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
        print(f"Report generation failed for inspection {inspection_id}: {e}")
        try:
            inspection = db.query(InspectionModel).filter(InspectionModel.id == inspection_id).first()
            if inspection:
                inspection.status = "failed"
                db.commit()
        except Exception:
            pass
    finally:
        db.close()