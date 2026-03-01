from fastapi import APIRouter, Depends, Query, HTTPException
from sqlmodel import Session, select
from datetime import datetime, date
from typing import Optional
import calendar as cal_module

from app.database import get_session
from app.models.models import Topic, DailyOutlook
from app.schemas.schemas import (
    TopicCalendarResponse, TopicCalendarData, CalendarDateItem,
    OutlooksByDateResponse, OutlooksByDateData, DashboardOutlookItem,
)

router = APIRouter()


@router.get("/topics/{topic_slug}/calendar-dates/", response_model=TopicCalendarResponse)
def get_topic_calendar_dates(
    topic_slug: str,
    year: Optional[int] = Query(None),
    month: Optional[int] = Query(None),
    session: Session = Depends(get_session),
):
    topic = session.get(Topic, topic_slug)
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")

    now = datetime.utcnow()
    year = year or now.year

    query = (
        select(DailyOutlook)
        .where(DailyOutlook.topic_slug == topic_slug)
    )

    if month:
        _, last_day = cal_module.monthrange(year, month)
        date_from = date(year, month, 1)
        date_to = date(year, month, last_day)
        query = query.where(DailyOutlook.date >= date_from, DailyOutlook.date <= date_to)  # type: ignore
    else:
        date_from = date(year, 1, 1)
        date_to = date(year, 12, 31)
        query = query.where(DailyOutlook.date >= date_from, DailyOutlook.date <= date_to)  # type: ignore

    outlooks = session.exec(query.order_by(DailyOutlook.date.desc())).all()  # type: ignore

    dates = [
        CalendarDateItem(
            date=str(o.date),
            outlook_slug=o.id,
            title=o.title,
            has_content=bool(o.content),
            created_at=o.created_at.isoformat(),
            confidence_score=o.confidence_score,
            source_count=o.source_count,
        )
        for o in outlooks
    ]

    return TopicCalendarResponse(
        data=TopicCalendarData(
            topic_slug=topic_slug,
            topic_name=topic.name,
            dates=dates,
            year=year,
            month=month,
            total_dates=len(dates),
        ),
        meta={"timestamp": datetime.utcnow().isoformat(), "version": "1.0"},
    )


@router.get("/calendar/date/{date_str}/", response_model=OutlooksByDateResponse)
def get_outlooks_by_date(
    date_str: str,
    session: Session = Depends(get_session),
):
    try:
        target_date = date.fromisoformat(date_str)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD.")

    outlooks = session.exec(
        select(DailyOutlook)
        .where(DailyOutlook.date == target_date)
        .order_by(DailyOutlook.created_at.desc())  # type: ignore
    ).all()

    # Count active topics
    topics_count = session.exec(
        select(Topic).where(Topic.status == "ACTIVE")
    ).all()
    total_topics = len(topics_count)

    items = []
    for o in outlooks:
        topic_obj = session.get(Topic, o.topic_slug)
        topic_name = topic_obj.name if topic_obj else o.topic_slug

        from app.routers.dashboard import _get_outlook_regions
        regions = _get_outlook_regions(session, o.id)

        items.append(DashboardOutlookItem(
            id=o.id,
            title=o.title,
            summary=o.summary,
            topic=topic_name,
            topic_slug=o.topic_slug,
            readTime=o.read_time,
            regions=regions,
            publishedAt=o.created_at.isoformat(),
            confidence_score=o.confidence_score,
            source_count=o.source_count,
            word_count=o.word_count,
        ))

    coverage = round(len(items) / total_topics * 100, 1) if total_topics > 0 else 0.0
    formatted = target_date.strftime("%A, %B %-d, %Y")

    return OutlooksByDateResponse(
        data=OutlooksByDateData(
            date=date_str,
            formatted_date=formatted,
            total_active_topics=total_topics,
            outlooks_available=len(items),
            coverage_percentage=coverage,
            outlooks=items,
        ),
        meta={"timestamp": datetime.utcnow().isoformat(), "version": "1.0"},
    )
