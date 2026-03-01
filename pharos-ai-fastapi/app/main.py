from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from datetime import date
from typing import Optional

from app.config import settings
from app.database import create_db_and_tables
from app.routers import dashboard, outlooks, topics, calendar

app = FastAPI(
    title="Pharos Intelligence API",
    description="Geopolitical intelligence backend — FastAPI edition",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_allowed_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
API_PREFIX = "/api/news"

app.include_router(dashboard.router, prefix=API_PREFIX, tags=["dashboard"])
app.include_router(outlooks.router, prefix=API_PREFIX, tags=["outlooks"])
app.include_router(topics.router, prefix=API_PREFIX, tags=["topics"])
app.include_router(calendar.router, prefix=API_PREFIX, tags=["calendar"])


# ── Startup ───────────────────────────────────────────────────────────────────
@app.on_event("startup")
def on_startup():
    create_db_and_tables()


# ── Health / trigger endpoints ────────────────────────────────────────────────
@app.get("/api/health")
def health():
    return {"status": "ok", "version": "1.0.0"}


@app.post("/api/admin/generate-outlook")
def trigger_generate_outlook(topic_slug: str, target_date: Optional[str] = None):
    """Manually trigger outlook generation for a topic (queues a Celery task)."""
    from app.tasks.outlook_tasks import generate_outlook_for_topic
    task = generate_outlook_for_topic.delay(topic_slug, target_date)
    return {"task_id": task.id, "topic": topic_slug, "date": target_date or str(date.today())}


@app.post("/api/admin/generate-all-outlooks")
def trigger_generate_all(target_date: Optional[str] = None):
    """Manually trigger outlook generation for all active topics."""
    from app.tasks.outlook_tasks import generate_all_daily_outlooks
    task = generate_all_daily_outlooks.delay(target_date)
    return {"task_id": task.id, "date": target_date or str(date.today())}
