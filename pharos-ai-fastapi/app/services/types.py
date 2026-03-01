"""Shared data types for Pharos AI pipeline (ported from Django version)."""

from dataclasses import dataclass, field
from typing import Dict, List, Optional, Any
from datetime import datetime
from enum import Enum


class ExtractionQuality(str, Enum):
    EXCELLENT = "excellent"
    GOOD = "good"
    ACCEPTABLE = "acceptable"
    POOR = "poor"
    UNUSABLE = "unusable"


@dataclass
class ArticleMetadata:
    id: str
    title: str
    url: str
    summary: str
    published_date: datetime
    source: str
    raw_content: str
    guid: Optional[str] = None
    author: Optional[str] = None
    tags: List[str] = field(default_factory=list)


@dataclass
class HeadlineFilterResult:
    selected_article_ids: List[str]
    reasoning: str
    total_evaluated: int
    selected_count: int
    confidence: float
    topic_name: str


@dataclass
class ArticleRelevanceResult:
    article_id: str
    is_relevant: bool
    relevance_score: float
    reasoning: str
    key_topics_matched: List[str]
    confidence: float = 0.0


@dataclass
class ExtractionResult:
    method: str
    success: bool
    word_count: int
    char_count: int
    extraction_time: float
    title: str
    authors: str
    publish_date: str
    text: str
    error_message: str
    quality_score: ExtractionQuality
    metadata: Dict[str, Any]


@dataclass
class ExtractedArticle:
    id: str
    url: str
    title: str
    content: str
    summary: str = ""
    published_date: Optional[datetime] = None
    source: str = ""
    word_count: Optional[int] = None
    extraction_method: str = ""
    extraction_quality: Optional[str] = None
    extraction_time: float = 0.0
    raw_content: str = ""
    error_message: Optional[str] = None
    authors: str = ""
    publish_date: str = ""
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class DailyOutlookResult:
    outlook_text: str
    title: str
    summary: str
    key_developments: List[str]
    regional_focus: List[str]
    source_count: int
    confidence_score: float
    word_count: int
    generated_at: datetime
    processing_notes: str = ""
    conversation_history: List[Dict[str, str]] = field(default_factory=list)


@dataclass
class ProcessingStats:
    total_articles_found: int
    relevant_articles_count: int
    successfully_extracted: int
    processing_time_seconds: float
    phase_breakdown: Dict[str, Dict[str, Any]]
    success_rate: float
    extraction_methods_used: List[str]


@dataclass
class RSSFeedConfig:
    name: str
    url: str
    is_active: bool = True
    topics: List[str] = field(default_factory=list)
    timeout: int = 30
    max_articles: int = 50
    priority: int = 2


@dataclass
class DailyOutlookState:
    topic: Optional[str] = None
    date: Optional[str] = None
    rss_feeds: List[RSSFeedConfig] = field(default_factory=list)
    max_total_articles: int = 50
    relevance_threshold: float = 0.6
    timeout: int = 300
    article_metadata: List[ArticleMetadata] = field(default_factory=list)
    relevant_articles: List[ArticleMetadata] = field(default_factory=list)
    relevance_results: List[ArticleRelevanceResult] = field(default_factory=list)
    extracted_content: List[ExtractedArticle] = field(default_factory=list)
    daily_outlook: Optional[DailyOutlookResult] = None
    errors: List[str] = field(default_factory=list)
    processing_stats: Optional[ProcessingStats] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    current_phase: Optional[str] = None
