from pydantic_settings import BaseSettings
import os
from pathlib import Path
from dotenv import load_dotenv

env_path = Path(__file__).resolve().parent.parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

class Settings(BaseSettings):
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "https://rftonfanpyofetgbpqzk.supabase.co")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")
    JWT_SECRET: str = os.getenv("JWT_SECRET", "super-secret-educational-platform-key-2026-adaptativa")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "480"))
    CORS_ORIGINS: list[str] = [
        "http://localhost:4200",
        "http://localhost:4201",
        "http://127.0.0.1:4200",
        "http://127.0.0.1:4201",
    ]

settings = Settings()
