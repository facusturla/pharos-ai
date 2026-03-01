from celery import Celery
from app.config import settings

celery_app = Celery(
    "pharos",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
    include=["app.tasks.outlook_tasks"],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_acks_late=True,
    worker_prefetch_multiplier=1,
    beat_schedule={
        # Generate outlooks daily at 06:00 UTC for all active topics
        "generate-daily-outlooks": {
            "task": "app.tasks.outlook_tasks.generate_all_daily_outlooks",
            "schedule": 21600.0,  # every 6 hours
        },
    },
)
