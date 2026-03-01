from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select, func
from typing import Optional
from app.database import get_session
from app.models.models import Topic, RSSFeed, RSSFeedTopicLink
from app.schemas.schemas import AvailableTopicsResponse, TopicOut

router = APIRouter()


@router.get("/topics/available/", response_model=AvailableTopicsResponse)
def get_available_topics(session: Session = Depends(get_session)):
    topics = session.exec(select(Topic).where(Topic.status == "ACTIVE").order_by(Topic.name)).all()  # type: ignore

    out = []
    for t in topics:
        # Count active RSS feeds for this topic
        feeds_count = session.exec(
            select(func.count())
            .select_from(RSSFeedTopicLink)
            .join(RSSFeed, RSSFeed.id == RSSFeedTopicLink.rssfeed_id)  # type: ignore
            .where(RSSFeedTopicLink.topic_slug == t.slug, RSSFeed.is_active == True)
        ).one()

        out.append(TopicOut(
            id=t.slug,
            name=t.name,
            description=t.description,
            priority={"LOW": 1, "MEDIUM": 2, "HIGH": 3, "CRITICAL": 4}.get(t.priority, 2),
            active_rss_feeds_count=feeds_count,
            created_at=t.created_at.isoformat(),
        ))

    return AvailableTopicsResponse(
        available_topics=out,
        count=len(out),
        description="Active geopolitical topics with available intelligence outlooks",
    )
