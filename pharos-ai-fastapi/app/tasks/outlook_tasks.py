import logging
from datetime import date, datetime
from typing import Optional

from app.celery_app import celery_app

logger = logging.getLogger(__name__)


@celery_app.task(bind=True, name="app.tasks.outlook_tasks.generate_outlook_for_topic", max_retries=2)
def generate_outlook_for_topic(self, topic_slug: str, target_date: Optional[str] = None):
    """Generate a daily outlook for a single topic."""
    from app.database import engine
    from sqlmodel import Session
    from app.services.orchestration.daily_outlook_orchestrator import generate_daily_outlook_for_topic

    parsed_date = date.fromisoformat(target_date) if target_date else date.today()

    logger.info(f"Generating outlook for {topic_slug} on {parsed_date}")

    try:
        with Session(engine) as session:
            result = generate_daily_outlook_for_topic(topic_slug, parsed_date, session)
            if result:
                logger.info(f"✅ Outlook generated: {result.id}")
                return {"success": True, "outlook_id": result.id, "topic": topic_slug, "date": str(parsed_date)}
            else:
                logger.error(f"❌ Outlook generation failed for {topic_slug}")
                return {"success": False, "topic": topic_slug, "date": str(parsed_date)}
    except Exception as exc:
        logger.error(f"Task error for {topic_slug}: {exc}", exc_info=True)
        raise self.retry(exc=exc, countdown=60)


@celery_app.task(name="app.tasks.outlook_tasks.generate_all_daily_outlooks")
def generate_all_daily_outlooks(target_date: Optional[str] = None):
    """Generate outlooks for ALL active topics. Called by Celery Beat."""
    from app.database import engine
    from sqlmodel import Session, select
    from app.models.models import Topic

    parsed_date = date.fromisoformat(target_date) if target_date else date.today()

    with Session(engine) as session:
        topics = session.exec(select(Topic).where(Topic.status == "ACTIVE")).all()

    logger.info(f"Scheduling outlook generation for {len(topics)} topics on {parsed_date}")

    task_ids = []
    for topic in topics:
        task = generate_outlook_for_topic.delay(topic.slug, str(parsed_date))
        task_ids.append(task.id)
        logger.info(f"Queued: {topic.slug} → task {task.id}")

    return {"queued": len(task_ids), "task_ids": task_ids, "date": str(parsed_date)}
