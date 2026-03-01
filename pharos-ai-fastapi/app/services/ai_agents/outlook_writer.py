"""AI daily outlook writing agent (ported from Django version)."""

import json
import logging
from datetime import datetime, timezone
from typing import List, Optional

from openai import OpenAI

from app.config import settings
from app.services.types import DailyOutlookResult, ExtractedArticle

logger = logging.getLogger(__name__)


def _get_client() -> OpenAI:
    return OpenAI(api_key=settings.OPENAI_API_KEY)


def _build_articles_text(articles: List[ExtractedArticle]) -> str:
    parts = []
    for i, art in enumerate(articles[:20], 1):
        content = (art.content or "")[:1500]
        parts.append(
            f"[{i}] SOURCE: {art.source or art.url}\n"
            f"TITLE: {art.title}\n"
            f"CONTENT:\n{content}\n"
        )
    return "\n---\n".join(parts)


def write_daily_outlook(
    articles: List[ExtractedArticle],
    topic_name: str,
    topic_description: str,
    target_date: str,
    deep_research_content: Optional[str] = None,
) -> DailyOutlookResult:
    """Generate a daily intelligence outlook from extracted articles."""
    client = _get_client()

    articles_text = _build_articles_text(articles)

    system_prompt = f"""You are a senior geopolitical intelligence analyst writing a daily briefing for {topic_name}.

Write in a clear, authoritative journalistic style. The briefing should:
- Be 800-1200 words
- Cover key developments chronologically
- Highlight strategic implications
- Cite sources using [number] footnotes
- Be objective and factual

Return a JSON object with:
- title (string): compelling professional headline
- summary (string): 2-3 sentence executive summary
- outlook_text (string): full briefing in markdown
- key_developments (list of strings): 3-5 bullet points
- regional_focus (list of strings): regions/countries involved
- confidence_score (float 0-1): quality confidence
- word_count (integer)
- processing_notes (string)
"""

    user_content = f"Topic: {topic_name}\nDate: {target_date}\nDescription: {topic_description}\n\n"

    if deep_research_content:
        user_content += f"DEEP RESEARCH:\n{deep_research_content[:3000]}\n\n"

    user_content += f"NEWS ARTICLES:\n{articles_text}"

    try:
        response = client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_content},
            ],
            response_format={"type": "json_object"},
            temperature=0.4,
            max_tokens=4000,
        )
        data = json.loads(response.choices[0].message.content or "{}")
        return DailyOutlookResult(
            outlook_text=data.get("outlook_text", ""),
            title=data.get("title", f"{topic_name} Daily Outlook — {target_date}"),
            summary=data.get("summary", ""),
            key_developments=data.get("key_developments", []),
            regional_focus=data.get("regional_focus", []),
            source_count=len(articles),
            confidence_score=float(data.get("confidence_score", 0.7)),
            word_count=data.get("word_count", len((data.get("outlook_text") or "").split())),
            generated_at=datetime.now(timezone.utc),
            processing_notes=data.get("processing_notes", ""),
        )
    except Exception as e:
        logger.error(f"Outlook writer error: {e}")
        return DailyOutlookResult(
            outlook_text=f"Error generating outlook: {e}",
            title=f"{topic_name} Daily Outlook — {target_date}",
            summary="Error generating outlook.",
            key_developments=[],
            regional_focus=[],
            source_count=len(articles),
            confidence_score=0.0,
            word_count=0,
            generated_at=datetime.now(timezone.utc),
            processing_notes=f"Error: {e}",
        )


def enhance_outlook(
    outlook_text: str,
    topic_name: str,
) -> dict:
    """Generate simplified English, annotations, and map config for an outlook."""
    client = _get_client()

    prompt = f"""Given this geopolitical intelligence briefing about {topic_name}, generate enhancements.

BRIEFING:
{outlook_text[:3000]}

Return a JSON object with:
- content_simple (string): same content rewritten in plain English (8th grade reading level), same length
- annotations (list): each item has "term", "type" (Location/Person/Organization/Event/Date/Topic), "description"
  - Include 5-15 key terms from the text that benefit from annotation
- map_config (object): geographic visualization config with:
  - configId (string): "map-{topic_name.lower().replace(' ', '-')}"
  - documentId (string): same
  - viewport: object with center (lat, lon) and zoom (number)
  - markers (list): each has markerId, position (lat, lon), label, type, note
  - shapes (list, optional): conflict zones as GeoJSON polygons
"""

    try:
        response = client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
            temperature=0.3,
            max_tokens=4000,
        )
        return json.loads(response.choices[0].message.content or "{}")
    except Exception as e:
        logger.error(f"Outlook enhancer error: {e}")
        return {"content_simple": outlook_text, "annotations": [], "map_config": {}}
