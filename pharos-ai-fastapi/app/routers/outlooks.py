from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select, func
from datetime import datetime
from typing import Optional
from app.database import get_session
from app.models.models import DailyOutlook, Topic, Region, DailyOutlookRegionLink
from app.schemas.schemas import (
    OutlookListResponse, OutlookListData, OutlookListItem, PaginationInfo, OutlookListFilters,
    OutlookDetailResponse, OutlookDetailData, OutlookContent, AnnotationOut, SourceOut,
)

router = APIRouter()


def _get_regions(session: Session, outlook_id: str) -> list[str]:
    links = session.exec(
        select(DailyOutlookRegionLink).where(DailyOutlookRegionLink.daily_outlook_id == outlook_id)
    ).all()
    if not links:
        return []
    ids = [l.region_id for l in links]
    regions = session.exec(select(Region).where(Region.id.in_(ids))).all()  # type: ignore
    return [r.name for r in regions]


def _outlook_to_list_item(o: DailyOutlook, regions: list[str]) -> OutlookListItem:
    topic_name = o.topic_slug  # fallback if join not done
    return OutlookListItem(
        id=o.id,
        title=o.title,
        summary=o.summary,
        topic=topic_name,
        date=str(o.date),
        readTime=o.read_time,
        regions=regions,
        publishedAt=o.created_at.isoformat(),
        confidenceScore=o.confidence_score,
        sourceCount=o.source_count,
        wordCount=o.word_count,
    )


@router.get("/outlooks/", response_model=OutlookListResponse)
def list_outlooks(
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0),
    topic: Optional[str] = Query(None),
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    session: Session = Depends(get_session),
):
    query = select(DailyOutlook).order_by(DailyOutlook.date.desc())  # type: ignore

    if topic:
        # try slug first, then name match
        topic_obj = session.get(Topic, topic)
        if not topic_obj:
            topic_obj = session.exec(select(Topic).where(Topic.name.ilike(f"%{topic}%"))).first()  # type: ignore
        if topic_obj:
            query = query.where(DailyOutlook.topic_slug == topic_obj.slug)

    if date_from:
        query = query.where(DailyOutlook.date >= date_from)  # type: ignore
    if date_to:
        query = query.where(DailyOutlook.date <= date_to)  # type: ignore

    total = session.exec(select(func.count()).select_from(query.subquery())).one()
    outlooks = session.exec(query.offset(offset).limit(limit)).all()

    items = []
    for o in outlooks:
        regions = _get_regions(session, o.id)
        topic_obj = session.get(Topic, o.topic_slug)
        item = _outlook_to_list_item(o, regions)
        if topic_obj:
            item.topic = topic_obj.name
        items.append(item)

    next_offset = offset + limit if offset + limit < total else None
    prev_offset = offset - limit if offset > 0 else None

    return OutlookListResponse(
        data=OutlookListData(
            outlooks=items,
            pagination=PaginationInfo(
                total=total,
                limit=limit,
                offset=offset,
                hasNext=next_offset is not None,
                hasPrevious=prev_offset is not None,
                nextOffset=next_offset,
                previousOffset=prev_offset,
            ),
            filters=OutlookListFilters(topic=topic, dateFrom=date_from, dateTo=date_to),
        ),
        meta={"timestamp": datetime.utcnow().isoformat(), "version": "1.0"},
    )


@router.get("/outlooks/{outlook_id}/", response_model=OutlookDetailResponse)
def get_outlook_detail(outlook_id: str, session: Session = Depends(get_session)):
    outlook = session.get(DailyOutlook, outlook_id)
    if not outlook:
        raise HTTPException(status_code=404, detail="Outlook not found")

    topic_obj = session.get(Topic, outlook.topic_slug)
    topic_name = topic_obj.name if topic_obj else outlook.topic_slug
    regions = _get_regions(session, outlook.id)

    # Build annotations from JSON field
    annotations = []
    for ann in (outlook.annotations or []):
        if isinstance(ann, dict):
            annotations.append(AnnotationOut(
                term=ann.get("term", ""),
                type=ann.get("type", ann.get("annotation_type", "")),
                description=ann.get("description", ""),
            ))

    # Build sources from deep_research_sources or empty
    sources = []
    for i, src in enumerate((outlook.deep_research_sources or []), start=1):
        if isinstance(src, dict):
            sources.append(SourceOut(
                id=str(src.get("id", i)),
                url=src.get("url", ""),
                title=src.get("title", ""),
            ))

    return OutlookDetailResponse(
        data=OutlookDetailData(
            id=str(outlook.id),
            title=outlook.title,
            summary=outlook.summary,
            topic=topic_name,
            topicSlug=outlook.topic_slug,
            date=str(outlook.date),
            readTime=outlook.read_time,
            regions=regions,
            publishedAt=outlook.created_at.isoformat(),
            content=OutlookContent(
                standard=outlook.content,
                easierEnglish=outlook.content_simple or outlook.content,
            ),
            annotations=annotations,
            sources=sources,
            mapConfig=outlook.map_config or {},
        ),
        meta={"timestamp": datetime.utcnow().isoformat(), "version": "1.0"},
    )
