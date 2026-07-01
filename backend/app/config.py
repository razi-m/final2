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
    ADMIN_USERNAME: str = "admin"
    ADMIN_PASSWORD: str = ""
    ALLOWED_ORIGINS: str = "http://localhost:5173"

    class Config:
        env_file = os.path.join(PROJECT_ROOT, ".env")
        env_file_encoding = "utf-8"
        extra = "ignore"

@lru_cache()
def get_settings():
    return Settings()

settings = get_settings()