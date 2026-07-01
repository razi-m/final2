from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
import os
from app.database import get_db
from app.models import Report, Inspection, User
from app.auth import get_current_user_obj

router = APIRouter()

@router.get("/reports/{inspection_id}/download")
def download_report(
    inspection_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_obj)
):
    inspection = db.query(Inspection).filter(Inspection.id == inspection_id).first()
    if not inspection:
        raise HTTPException(status_code=404, detail="Inspection not found")
    if current_user.role != "admin" and inspection.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this report")

    report = db.query(Report).filter(Report.inspection_id == inspection_id).first()

    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    if not os.path.exists(report.pdf_path):
        raise HTTPException(status_code=404, detail="PDF file not found")
    
    return FileResponse(
        report.pdf_path,
        media_type="application/pdf",
        filename=f"inspection_report_{inspection_id}.pdf"
    )