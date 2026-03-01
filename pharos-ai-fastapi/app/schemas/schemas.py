from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime, date


# ── Topic schemas ─────────────────────────────────────────────────────────────

class TopicOut(BaseModel):
    id: str
    name: str
    description: str
    priority: int
    active_rss_feeds_count: int
    created_at: str


class AvailableTopicsResponse(BaseModel):
    available_topics: List[TopicOut]
    count: int
    description: str


# ── Dashboard schemas ─────────────────────────────────────────────────────────

class OutlookSummary(BaseModel):
    id: str
    title: str
    summary: str
    date: str
    readTime: str
    regions: List[str]
    publishedAt: str
    confidenceScore: Optional[float] = None
    sourceCount: Optional[int] = None
    wordCount: Optional[int] = None


class DashboardOutlookEntry(BaseModel):
    topic_id: str
    topic_name: str
    latest_outlook: Optional[OutlookSummary]


class DashboardData(BaseModel):
    latest_outlooks: List[DashboardOutlookEntry]


class DashboardMeta(BaseModel):
    timestamp: str
    version: str
    total_topics: int


class DashboardResponse(BaseModel):
    success: bool = True
    data: DashboardData
    meta: DashboardMeta


# ── Outlook list schemas ──────────────────────────────────────────────────────

class OutlookListItem(BaseModel):
    id: str
    title: str
    summary: str
    topic: str
    date: str
    readTime: str
    regions: List[str]
    publishedAt: str
    confidenceScore: float
    sourceCount: int
    wordCount: int


class PaginationInfo(BaseModel):
    total: int
    limit: int
    offset: int
    hasNext: bool
    hasPrevious: bool
    nextOffset: Optional[int]
    previousOffset: Optional[int]


class OutlookListFilters(BaseModel):
    topic: Optional[str]
    dateFrom: Optional[str]
    dateTo: Optional[str]


class OutlookListData(BaseModel):
    outlooks: List[OutlookListItem]
    pagination: PaginationInfo
    filters: OutlookListFilters


class OutlookListResponse(BaseModel):
    success: bool = True
    data: OutlookListData
    meta: Optional[dict] = None


# ── Outlook detail schemas ────────────────────────────────────────────────────

class AnnotationOut(BaseModel):
    term: str
    type: str
    description: str


class SourceOut(BaseModel):
    id: str
    url: str
    title: str


class OutlookContent(BaseModel):
    standard: str
    easierEnglish: str


class OutlookDetailData(BaseModel):
    id: str
    title: str
    summary: str
    topic: str
    topicSlug: str
    date: str
    readTime: str
    regions: List[str]
    publishedAt: str
    content: OutlookContent
    annotations: List[AnnotationOut]
    sources: List[SourceOut]
    mapConfig: Any


class OutlookDetailResponse(BaseModel):
    success: bool = True
    data: OutlookDetailData
    meta: Optional[dict] = None


# ── Calendar schemas ──────────────────────────────────────────────────────────

class CalendarDateItem(BaseModel):
    date: str
    outlook_slug: str
    title: str
    has_content: bool
    created_at: str
    confidence_score: float
    source_count: int


class TopicCalendarData(BaseModel):
    topic_slug: str
    topic_name: str
    dates: List[CalendarDateItem]
    year: int
    month: Optional[int]
    total_dates: int


class TopicCalendarResponse(BaseModel):
    success: bool = True
    data: TopicCalendarData
    meta: Optional[dict] = None


class DashboardOutlookItem(BaseModel):
    id: str
    title: str
    summary: str
    topic: str
    topic_slug: str
    readTime: str
    regions: List[str]
    publishedAt: str
    confidence_score: float
    source_count: int
    word_count: int


class OutlooksByDateData(BaseModel):
    date: str
    formatted_date: str
    total_active_topics: int
    outlooks_available: int
    coverage_percentage: float
    outlooks: List[DashboardOutlookItem]


class OutlooksByDateResponse(BaseModel):
    success: bool = True
    data: OutlooksByDateData
    meta: Optional[dict] = None
