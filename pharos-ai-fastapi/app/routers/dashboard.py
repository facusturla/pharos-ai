from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from datetime import datetime
from app.database import get_session
from app.models.models import Topic, DailyOutlook, Region
from app.schemas.schemas import DashboardResponse, DashboardData, DashboardMeta, DashboardOutlookEntry, OutlookSummary

router = APIRouter()


@router.get("/dashboard/", response_model=DashboardResponse)
def get_dashboard_outlooks(session: Session = Depends(get_session)):
    topics = session.exec(select(Topic).where(Topic.status == "ACTIVE")).all()

    latest_outlooks: list[DashboardOutlookEntry] = []
    for topic in topics:
        # Get the most recent outlook for this topic
        result = session.exec(
            select(DailyOutlook)
            .where(DailyOutlook.topic_slug == topic.slug)
            .order_by(DailyOutlook.date.desc())  # type: ignore
            .limit(1)
        ).first()

        entry_outlook = None
        if result:
            regions = _get_outlook_regions(session, result.id)
            entry_outlook = OutlookSummary(
                id=result.id,
                title=result.title,
                summary=result.summary,
                date=str(result.date),
                readTime=result.read_time,
                regions=regions,
                publishedAt=result.created_at.isoformat(),
                confidenceScore=result.confidence_score,
                sourceCount=result.source_count,
                wordCount=result.word_count,
            )

        latest_outlooks.append(
            DashboardOutlookEntry(
                topic_id=topic.slug,
                topic_name=topic.name,
                latest_outlook=entry_outlook,
            )
        )

    return DashboardResponse(
        data=DashboardData(latest_outlooks=latest_outlooks),
        meta=DashboardMeta(
            timestamp=datetime.utcnow().isoformat(),
            version="1.0",
            total_topics=len(topics),
        ),
    )


def _get_outlook_regions(session: Session, outlook_id: str) -> list[str]:
    from app.models.models import DailyOutlookRegionLink
    links = session.exec(
        select(DailyOutlookRegionLink).where(DailyOutlookRegionLink.daily_outlook_id == outlook_id)
    ).all()
    if not links:
        return []
    region_ids = [l.region_id for l in links]
    regions = session.exec(select(Region).where(Region.id.in_(region_ids))).all()  # type: ignore
    return [r.name for r in regions]
