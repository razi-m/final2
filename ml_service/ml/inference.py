import torch
import torchvision.transforms as transforms
from PIL import Image
import cv2
import numpy as np
from typing import List, Dict
from ml.config import CLASSES, IMG_SIZE, CONFIDENCE_THRESHOLD, MAX_FRAMES, FRAME_SAMPLE_RATE

def extract_frames(video_path: str, fps: int = 1, max_frames: int = MAX_FRAMES) -> List[np.ndarray]:
    """Extract frames from video at specified FPS."""
    frames = []
    cap = cv2.VideoCapture(video_path)
    
    if not cap.isOpened():
        raise ValueError(f"Could not open video: {video_path}")
    
    video_fps = cap.get(cv2.CAP_PROP_FPS)
    frame_interval = int(video_fps / fps) if video_fps > 0 else 30
    
    frame_count = 0
    frame_number = 0
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        
        if frame_count % frame_interval == 0:
            frames.append(frame)
            frame_number += 1
            
            if frame_number >= max_frames:
                break
        
        frame_count += 1
    
    cap.release()
    return frames

def preprocess_frames(frames: List[np.ndarray]) -> torch.Tensor:
    """Preprocess frames for model inference."""
    transform = transforms.Compose([
        transforms.ToPILImage(),
        transforms.Resize((IMG_SIZE, IMG_SIZE)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])
    
    processed = [transform(frame) for frame in frames]
    return torch.stack(processed)

def run_inference(model, frames: List[np.ndarray], device: str = "cpu") -> List[Dict]:
    """Run model inference on frames and return detected defects."""
    if not frames:
        return []
    
    model.eval()
    model.to(device)
    
    batch_size = 32
    all_defects = []
    
    transform = transforms.Compose([
        transforms.ToPILImage(),
        transforms.Resize((IMG_SIZE, IMG_SIZE)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])
    
    with torch.no_grad():
        for i in range(0, len(frames), batch_size):
            batch_frames = frames[i:i + batch_size]
            
            processed = [transform(frame) for frame in batch_frames]
            batch_tensor = torch.stack(processed).to(device)
            
            outputs = model(batch_tensor)
            probabilities = torch.sigmoid(outputs)
            
            for j, probs in enumerate(probabilities):
                frame_number = i + j
                
                for class_idx, prob in enumerate(probs):
                    confidence = prob.item()
                    if confidence >= CONFIDENCE_THRESHOLD:
                        all_defects.append({
                            "frame_number": frame_number,
                            "defect_type": CLASSES[class_idx],
                            "confidence": confidence
                        })
    
    return all_defects