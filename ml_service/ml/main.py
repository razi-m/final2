from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict
import torch
import torchvision.models as models
from contextlib import asynccontextmanager
import os
from ml.config import MODEL_PATH, CLASSES
from ml.inference import extract_frames, run_inference

model = None

def load_model():
    """Load the PyTorch MobileNetV3 Small model."""
    global model
    
    try:
        device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"Loading model from {MODEL_PATH} on {device}")
        
        model = models.mobilenet_v3_small(num_classes=len(CLASSES))
        
        state_dict = torch.load(MODEL_PATH, map_location=device)
        model.load_state_dict(state_dict)
        model.to(device)
        model.eval()
        
        print(f"Model loaded successfully with {len(CLASSES)} classes: {CLASSES}")
        return True
    except Exception as e:
        print(f"Failed to load model: {e}")
        return False

@asynccontextmanager
async def lifespan(app: FastAPI):
    success = load_model()
    if not success:
        print("Warning: Model failed to load, service will continue but inference will fail")
    yield
    print("Shutting down ML service...")

app = FastAPI(title="HackSav ML Service", lifespan=lifespan)

class AnalyzeRequest(BaseModel):
    video_path: str

class DefectResult(BaseModel):
    frame_number: int
    defect_type: str
    confidence: float

class AnalyzeResponse(BaseModel):
    defects: List[DefectResult]
    total_frames_analyzed: int

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "device": str(next(model.parameters()).device) if model else "N/A"
    }

@app.post("/analyze", response_model=AnalyzeResponse)
def analyze_video(request: AnalyzeRequest):
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    if not os.path.exists(request.video_path):
        raise HTTPException(status_code=404, detail=f"Video file not found: {request.video_path}")
    
    try:
        frames = extract_frames(request.video_path)
        
        if not frames:
            return AnalyzeResponse(defects=[], total_frames_analyzed=0)
        
        device = "cuda" if torch.cuda.is_available() else "cpu"
        defects = run_inference(model, frames, device)
        
        return AnalyzeResponse(
            defects=[DefectResult(**d) for d in defects],
            total_frames_analyzed=len(frames)
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.post("/reload-model")
def reload_model():
    """Reload model from disk."""
    success = load_model()
    if success:
        return {"message": "Model reloaded successfully"}
    else:
        raise HTTPException(status_code=500, detail="Failed to reload model")