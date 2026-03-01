"""AI content filtering agent (ported from Django version)."""

import json
import logging
from typing import List, Optional

from openai import OpenAI

from app.config import settings
from app.services.types import ArticleMetadata, ArticleRelevanceResult

logger = logging.getLogger(__name__)


def _get_client() -> OpenAI:
    return OpenAI(api_key=settings.OPENAI_API_KEY)


def _filter_single_article(
    client: OpenAI,
    article: ArticleMetadata,
    topic_name: str,
    topic_description: str,
) -> ArticleRelevanceResult:
    prompt = f"""You are an intelligence analyst filtering news articles for a geopolitical outlook system.

Topic: {topic_name}
Description: {topic_description}

Article to evaluate:
Title: {article.title}
Source: {article.source}
Summary: {article.summary[:500]}

Evaluate whether this article is relevant for generating a daily intelligence outlook on {topic_name}.

Return a JSON object with:
- is_relevant (boolean)
- relevance_score (float 0-1)
- reasoning (string, brief)
- key_topics_matched (list of strings)
- confidence (float 0-1)
"""

    try:
        response = client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
            temperature=0.2,
            max_tokens=500,
        )
        data = json.loads(response.choices[0].message.content or "{}")
        return ArticleRelevanceResult(
            article_id=article.id,
            is_relevant=bool(data.get("is_relevant", False)),
            relevance_score=float(data.get("relevance_score", 0.0)),
            reasoning=data.get("reasoning", ""),
            key_topics_matched=data.get("key_topics_matched", []),
            confidence=float(data.get("confidence", 0.0)),
        )
    except Exception as e:
        logger.error(f"Content filter error for {article.id}: {e}")
        return ArticleRelevanceResult(
            article_id=article.id,
            is_relevant=False,
            relevance_score=0.0,
            reasoning=f"Error: {e}",
            key_topics_matched=[],
            confidence=0.0,
        )


def filter_articles_for_topic(
    articles: List[ArticleMetadata],
    topic_name: str,
    topic_description: str,
    relevance_threshold: float = 0.6,
    max_workers: int = 5,
) -> List[ArticleRelevanceResult]:
    """Filter articles by topic relevance using OpenAI."""
    from concurrent.futures import ThreadPoolExecutor, as_completed

    client = _get_client()
    results: List[ArticleRelevanceResult] = []

    def _worker(art: ArticleMetadata) -> ArticleRelevanceResult:
        return _filter_single_article(client, art, topic_name, topic_description)

    with ThreadPoolExecutor(max_workers=max_workers) as ex:
        futs = {ex.submit(_worker, a): a for a in articles}
        for fut in as_completed(futs):
            results.append(fut.result())

    return results
