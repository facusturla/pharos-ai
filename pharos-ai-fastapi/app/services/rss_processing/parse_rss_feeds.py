"""RSS feed parsing service (ported from Django version)."""

import feedparser
import hashlib
import logging
import re
import time
from datetime import datetime, timezone
from typing import Dict, List, Optional, Tuple
from urllib.parse import urlparse

from app.services.types import ArticleMetadata, RSSFeedConfig

logger = logging.getLogger(__name__)


def _generate_article_id(url: str, title: str) -> str:
    return hashlib.md5(f"{url}:{title}".encode()).hexdigest()


def _normalize_datetime(date_string: Optional[str], published_parsed: Optional[tuple]) -> datetime:
    if published_parsed:
        try:
            return datetime(*published_parsed[:6], tzinfo=timezone.utc)
        except (TypeError, ValueError):
            pass
    if date_string:
        try:
            from dateutil import parser
            return parser.parse(date_string)
        except Exception:
            pass
    return datetime.now(timezone.utc)


def _extract_article_summary(entry: dict) -> str:
    for field in ["summary", "description", "content", "subtitle"]:
        content = getattr(entry, field, None)
        if content:
            if isinstance(content, list) and content:
                content = content[0].get("value", "") if isinstance(content[0], dict) else str(content[0])
            if isinstance(content, str) and content.strip():
                return re.sub(r"<[^>]+>", "", content).strip()[:500]
    return ""


def _parse_single_feed(feed_config: RSSFeedConfig) -> Tuple[List[ArticleMetadata], Optional[str]]:
    try:
        logger.info(f"Parsing RSS feed: {feed_config.name}")
        t0 = time.time()
        feed = feedparser.parse(feed_config.url)
        logger.info(f"Feed parsed in {time.time()-t0:.2f}s: {feed_config.name}")

        if not feed.entries:
            return [], f"No entries in {feed_config.name}"

        articles: List[ArticleMetadata] = []
        for entry in feed.entries[: feed_config.max_articles]:
            try:
                title = getattr(entry, "title", "").strip()
                url = getattr(entry, "link", "").strip()
                if not title or not url:
                    continue
                articles.append(
                    ArticleMetadata(
                        id=_generate_article_id(url, title),
                        title=title,
                        url=url,
                        summary=_extract_article_summary(entry),
                        published_date=_normalize_datetime(
                            getattr(entry, "published", None),
                            getattr(entry, "published_parsed", None),
                        ),
                        source=feed_config.name,
                        raw_content=str(entry),
                        guid=getattr(entry, "guid", getattr(entry, "id", "")),
                        author=getattr(entry, "author", ""),
                        tags=[t.term for t in getattr(entry, "tags", []) if hasattr(t, "term")],
                    )
                )
            except Exception as e:
                logger.warning(f"Entry error in {feed_config.name}: {e}")

        return articles, None

    except Exception as e:
        msg = f"Failed to parse {feed_config.name}: {e}"
        logger.error(msg)
        return [], msg


def parse_rss_feeds(
    rss_feeds: List[RSSFeedConfig],
    timeout: int = 30,
    max_total_articles: int = 200,
) -> Dict:
    """Parse multiple RSS feeds and return aggregated results."""
    t0 = time.time()
    active = [f for f in rss_feeds if f.is_active]

    if not active:
        return {
            "articles": [], "total_articles": 0, "successful_feeds": 0,
            "failed_feeds": 0, "errors": ["No active feeds"], "processing_time": 0.0, "feed_results": {},
        }

    all_articles: List[ArticleMetadata] = []
    errors: List[str] = []
    feed_results: Dict = {}
    successful = failed = 0

    for cfg in active:
        fs = time.time()
        articles, error = _parse_single_feed(cfg)
        ft = time.time() - fs
        if error:
            failed += 1
            errors.append(error)
            feed_results[cfg.name] = {"success": False, "articles_count": 0, "error": error, "processing_time": ft}
        else:
            successful += 1
            all_articles.extend(articles)
            feed_results[cfg.name] = {"success": True, "articles_count": len(articles), "error": None, "processing_time": ft}

    all_articles.sort(key=lambda x: x.published_date, reverse=True)
    if len(all_articles) > max_total_articles:
        all_articles = all_articles[:max_total_articles]

    return {
        "articles": all_articles,
        "total_articles": len(all_articles),
        "successful_feeds": successful,
        "failed_feeds": failed,
        "errors": errors,
        "processing_time": time.time() - t0,
        "feed_results": feed_results,
    }
