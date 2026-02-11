from pydantic_settings import BaseSettings
from functools import lru_cache
import os

# Get the project root directory (parent of backend folder)
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

class Settings(BaseSettings):
    DATABASE_URL: str
    GEMINI_API_KEY: str
    JWT_SECRET: str
    ML_SERVICE_URL: str = "http://localhost:8001"
    MODEL_PATH: str
    
    class Config:
        env_file = os.path.join(PROJECT_ROOT, ".env")
        env_file_encoding = "utf-8"

@lru_cache()
def get_settings():
    return Settings()

settings = get_settings()