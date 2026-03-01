from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql://pharos:pharos@localhost:5433/pharos_db"

    # Redis / Celery
    REDIS_URL: str = "redis://localhost:6380/0"
    CELERY_BROKER_URL: str = "redis://localhost:6380/0"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6380/1"

    # OpenAI
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4o"
    OPENAI_REASONING_MODEL: str = "o3-mini"

    # Scraping settings
    SCRAPING_MAX_WORKERS: int = 10
    SCRAPING_MAX_RETRIES: int = 2
    SCRAPING_CONNECTION_TIMEOUT: int = 5
    SCRAPING_REQUEST_TIMEOUT: int = 10
    SCRAPING_DOWNLOAD_TIMEOUT: int = 15

    # App settings
    DEBUG: bool = False
    SECRET_KEY: str = "changeme"
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://localhost:3001"

    class Config:
        env_file = ".env"
        extra = "ignore"

    def get_allowed_origins(self) -> list[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",")]


settings = Settings()
