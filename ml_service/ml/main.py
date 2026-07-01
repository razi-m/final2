from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional
from contextlib import asynccontextmanager
import os
import time

from ml.src.pipeline import VideoInspectionPipeline
from ml.src.schema import DetectionResult
from ml.src.detectors import CrackSegmentor, PotholeYOLODetector, CorrosionYOLODetector
from pathlib import Path

# Global detectors list to ensure models are loaded once
loaded_detectors = []

# Response Schema
class AnalyzeRequest(BaseModel):
    video_path: str

class DefectResult(BaseModel):
    frame_number: int
    defect_type: str
    confidence: float

class AnalyzeResponse(BaseModel):
    defects: List[DefectResult]
    total_frames_analyzed: int

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load models lazily on first request
    print("ML Service Started. Models will be loaded on demand.")
    yield
    print("Shutting down ML service...")

app = FastAPI(title="HackSav ML Service", lifespan=lifespan)

@app.get("/health")
def health_check():
    return {
        "status": "healthy", 
        "models_loaded": len(loaded_detectors) > 0
    }

# Strict Class Enforcement
VALID_CLASSES = {"pothole", "crack", "corrosion"}

# Only allow analyzing files that live inside the backend's uploads directory.
# This prevents the /analyze endpoint from being abused to read arbitrary
# files on the host (path traversal / local file disclosure).
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
ALLOWED_UPLOAD_DIR = (Path(os.getenv("UPLOAD_DIR", PROJECT_ROOT / "backend" / "uploads"))).resolve()


def _resolve_allowed_video_path(raw_path: str) -> str:
    """Resolve and validate that raw_path stays inside ALLOWED_UPLOAD_DIR."""
    try:
        resolved = Path(raw_path).resolve()
        resolved.relative_to(ALLOWED_UPLOAD_DIR)
    except (ValueError, OSError):
        raise HTTPException(status_code=400, detail="Invalid video path")
    if not resolved.is_file():
        raise HTTPException(status_code=404, detail="Video file not found")
    return str(resolved)

def load_detectors_if_needed():
    global loaded_detectors
    if not loaded_detectors:
        print("Lazy loading ML models...")
        try:
            BASE_DIR = Path(__file__).resolve().parent
            models_dir = BASE_DIR / "models"
            
            loaded_detectors.append(CrackSegmentor(model_path=str(models_dir / "crack_segmentation.pt")))
            loaded_detectors.append(PotholeYOLODetector(model_path=str(models_dir / "pothole_yolo.pt")))
            loaded_detectors.append(CorrosionYOLODetector(model_path=str(models_dir / "corrosion_yolo.pt")))
            print("Models loaded successfully.")
        except Exception as e:
            print(f"Error loading models: {e}")

@app.post("/analyze", response_model=AnalyzeResponse)
def analyze_video(request: AnalyzeRequest):
    safe_video_path = _resolve_allowed_video_path(request.video_path)

    try:
        load_detectors_if_needed()
        
        if not loaded_detectors:
             # Fallback if models failed to load
             print("Warning: No detectors loaded.")
             return AnalyzeResponse(defects=[], total_frames_analyzed=0)
             
        pipeline = VideoInspectionPipeline(safe_video_path, detectors=loaded_detectors)
        
        # Run inference
        results, total_frames = pipeline.run()
        
        # Map results to response schema with Strict Filtering
        defects_response = []
        for res in results:
            defect_type_str = res.defect_type.value
            
            # 1. Enforce Validate Classes
            if defect_type_str not in VALID_CLASSES:
                print(f"Warning: Invalid defect class detected: {defect_type_str}. Ignoring.")
                continue
                
            defects_response.append(DefectResult(
                frame_number=res.frame_index,
                defect_type=defect_type_str,
                confidence=res.confidence_score
            ))
            
        return AnalyzeResponse(
            defects=defects_response,
            total_frames_analyzed=total_frames
        )
            
    except Exception as e:
        print(f"Analysis failed: {e}")
        return AnalyzeResponse(defects=[], total_frames_analyzed=0)
