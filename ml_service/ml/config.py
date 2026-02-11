import os
from dotenv import load_dotenv

# Get the project root directory (parent of ml_service folder)
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Load .env from project root
env_path = os.path.join(PROJECT_ROOT, ".env")
load_dotenv(env_path)

MODEL_PATH = os.getenv("MODEL_PATH", "model_multilabel.pth")
CLASSES = ["Pothole", "Crack", "Manhole", "Corrosion"]
IMG_SIZE = 224
CONFIDENCE_THRESHOLD = 0.6
MAX_FRAMES = 300
FRAME_SAMPLE_RATE = 1