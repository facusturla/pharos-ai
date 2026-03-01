"""Daily outlook generation orchestrator (ported from Django version)."""

import logging
import re
import time
from datetime import datetime, date, timezone
from typing import Optional

from sqlmodel import Session, select

from app.models.models import (
    DailyOutlook, OutlookProcessingRun, Topic, RSSFeed, Region, DailyOutlookRegionLink,
)
from app.services.types import (
    ArticleMetadata, DailyOutlookState, RSSFeedConfig, ArticleRelevanceResult,
)
from app.services.rss_processing.parse_rss_feeds import parse_rss_feeds
from app.services.content_extraction.scrape_article_content import extract_article_content
from app.services.ai_agents.content_filter import filter_articles_for_topic
from app.services.ai_agents.outlook_writer import write_daily_outlook, enhance_outlook

logger = logging.getLogger(__name__)


def _slugify(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")


def _estimate_read_time(text: str) -> str:
    words = len(text.split())
    minutes = max(1, round(words / 200))
    return f"{minutes} min"


def generate_daily_outlook_for_topic(
    topic_slug: str,
    target_date: Optional[date] = None,
    session: Session = None,
) -> Optional[DailyOutlook]:
    """
    Full pipeline: RSS → filter → scrape → AI filter → write → enhance → save.
    Returns the saved DailyOutlook or None on failure.
    """
    if session is None:
        raise ValueError("DB session required")

    target_date = target_date or date.today()

    topic = session.get(Topic, topic_slug)
    if not topic:
        logger.error(f"Topic not found: {topic_slug}")
        return None

    # Create processing run record
    run = OutlookProcessingRun(
        topic_slug=topic_slug,
        date=target_date,
        status="PROCESSING",
        started_at=datetime.now(timezone.utc),
    )
    session.add(run)
    session.commit()
    session.refresh(run)

    try:
        # ── 1. Fetch RSS feeds ────────────────────────────────────────────────
        t0 = time.time()
        rss_feeds_db = session.exec(
            select(RSSFeed)
            .join(RSSFeed.topics)  # type: ignore
            .where(Topic.slug == topic_slug, RSSFeed.is_active == True)
        ).all()

        feed_configs = [
            RSSFeedConfig(
                name=f.name, url=f.url, is_active=f.is_active,
                timeout=f.timeout, max_articles=f.max_articles, priority=f.priority,
            )
            for f in rss_feeds_db
        ]

        rss_result = parse_rss_feeds(feed_configs)
        articles: list[ArticleMetadata] = rss_result["articles"]
        run.rss_sources_found = len(articles)
        run.rss_parsing_time = time.time() - t0
        logger.info(f"[{topic_slug}] RSS: {len(articles)} articles from {rss_result['successful_feeds']} feeds")

        if not articles:
            raise RuntimeError("No articles found from RSS feeds")

        # ── 2. Content extraction ─────────────────────────────────────────────
        t0 = time.time()
        extraction_result = extract_article_content(articles)
        extracted = extraction_result["extracted_articles"]
        run.rss_articles_extracted = len(extracted)
        run.content_extraction_time = time.time() - t0
        logger.info(f"[{topic_slug}] Extracted: {len(extracted)} articles")

        if not extracted:
            raise RuntimeError("No articles could be extracted")

        # ── 3. AI relevance filtering ─────────────────────────────────────────
        t0 = time.time()
        # Convert extracted articles to ArticleMetadata for filter
        meta_for_filter = [
            a for a in articles
            if any(e.id == a.id and (e.word_count or 0) > 20 for e in extracted)
        ]

        relevance_results: list[ArticleRelevanceResult] = filter_articles_for_topic(
            meta_for_filter, topic.name, topic.description
        )
        run.relevance_analysis_time = time.time() - t0

        relevant_ids = {r.article_id for r in relevance_results if r.is_relevant and r.relevance_score >= 0.6}
        relevant_extracted = [e for e in extracted if e.id in relevant_ids]
        run.rss_articles_relevant = len(relevant_extracted)
        logger.info(f"[{topic_slug}] Relevant: {len(relevant_extracted)} articles")

        if not relevant_extracted:
            # Fall back to all extracted if nothing passes threshold
            relevant_extracted = extracted[:10]

        # ── 4. Write outlook ──────────────────────────────────────────────────
        t0 = time.time()
        outlook_result = write_daily_outlook(
            articles=relevant_extracted,
            topic_name=topic.name,
            topic_description=topic.description,
            target_date=str(target_date),
        )
        run.outlook_generation_time = time.time() - t0
        logger.info(f"[{topic_slug}] Outlook written: {outlook_result.word_count} words")

        # ── 5. Enhance (simplified English, annotations, map) ─────────────────
        enhancements = enhance_outlook(outlook_result.outlook_text, topic.name)

        # ── 6. Save DailyOutlook to DB ────────────────────────────────────────
        slug = _slugify(f"{topic_slug}-{target_date}")

        # Check if one already exists for this topic+date
        existing = session.exec(
            select(DailyOutlook)
            .where(DailyOutlook.topic_slug == topic_slug, DailyOutlook.date == target_date)
        ).first()

        if existing:
            # Update in place
            outlook_db = existing
        else:
            outlook_db = DailyOutlook(topic_slug=topic_slug, date=target_date, slug=slug)
            session.add(outlook_db)

        outlook_db.title = outlook_result.title
        outlook_db.summary = outlook_result.summary
        outlook_db.content = outlook_result.outlook_text
        outlook_db.slug = slug
        outlook_db.read_time = _estimate_read_time(outlook_result.outlook_text)
        outlook_db.key_developments = outlook_result.key_developments
        outlook_db.regional_focus = outlook_result.regional_focus
        outlook_db.source_count = outlook_result.source_count
        outlook_db.confidence_score = outlook_result.confidence_score
        outlook_db.word_count = outlook_result.word_count
        outlook_db.content_simple = enhancements.get("content_simple", "")
        outlook_db.annotations = enhancements.get("annotations", [])
        outlook_db.map_config = enhancements.get("map_config", {})
        outlook_db.enhancements_generated = True
        outlook_db.enhancements_generated_at = datetime.now(timezone.utc)
        outlook_db.updated_at = datetime.now(timezone.utc)

        session.commit()
        session.refresh(outlook_db)

        # Save region links
        for region_name in (outlook_result.regional_focus or []):
            region = session.exec(select(Region).where(Region.name == region_name)).first()
            if not region:
                region = Region(name=region_name)
                session.add(region)
                session.commit()
                session.refresh(region)
            existing_link = session.exec(
                select(DailyOutlookRegionLink).where(
                    DailyOutlookRegionLink.daily_outlook_id == outlook_db.id,
                    DailyOutlookRegionLink.region_id == region.id,
                )
            ).first()
            if not existing_link:
                session.add(DailyOutlookRegionLink(daily_outlook_id=outlook_db.id, region_id=region.id))

        # Update run record
        run.daily_outlook_id = outlook_db.id
        run.status = "SUCCESS"
        run.completed_at = datetime.now(timezone.utc)
        session.add(run)
        session.commit()

        logger.info(f"[{topic_slug}] ✅ Outlook saved: {outlook_db.id}")
        return outlook_db

    except Exception as e:
        logger.error(f"[{topic_slug}] Pipeline failed: {e}", exc_info=True)
        run.status = "FAILED"
        run.errors = [str(e)]
        run.completed_at = datetime.now(timezone.utc)
        session.add(run)
        session.commit()
        return None
