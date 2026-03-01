import uuid
from typing import Optional, List, Any
from datetime import datetime, date
from sqlmodel import SQLModel, Field, Relationship, Column
from sqlalchemy import JSON, Text, UniqueConstraint, Index


# ── Association tables ────────────────────────────────────────────────────────

class TopicRegionLink(SQLModel, table=True):
    __tablename__ = "topic_region"
    topic_slug: str = Field(foreign_key="topic.slug", primary_key=True)
    region_id: int = Field(foreign_key="region.id", primary_key=True)


class TopicActorLink(SQLModel, table=True):
    __tablename__ = "topic_actor"
    topic_slug: str = Field(foreign_key="topic.slug", primary_key=True)
    actor_id: int = Field(foreign_key="actor.id", primary_key=True)


class RSSFeedTopicLink(SQLModel, table=True):
    __tablename__ = "rssfeed_topic"
    rssfeed_id: int = Field(foreign_key="rssfeed.id", primary_key=True)
    topic_slug: str = Field(foreign_key="topic.slug", primary_key=True)


class DailyOutlookRegionLink(SQLModel, table=True):
    __tablename__ = "dailyoutlook_region"
    daily_outlook_id: str = Field(foreign_key="dailyoutlook.id", primary_key=True)
    region_id: int = Field(foreign_key="region.id", primary_key=True)


class DailyOutlookRSSArticleLink(SQLModel, table=True):
    __tablename__ = "dailyoutlook_rssarticle"
    daily_outlook_id: str = Field(foreign_key="dailyoutlook.id", primary_key=True)
    rssarticle_id: int = Field(foreign_key="rssarticle.id", primary_key=True)


# ── Core models ───────────────────────────────────────────────────────────────

class Region(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(max_length=100, unique=True)
    parent_region_id: Optional[int] = Field(default=None, foreign_key="region.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Actor(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(max_length=200)
    actor_type: str = Field(max_length=20)  # PERSON, ORGANIZATION, GOVERNMENT, MILITARY
    description: str = Field(default="", sa_column=Column(Text))
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Topic(SQLModel, table=True):
    slug: str = Field(primary_key=True, max_length=100)
    name: str = Field(max_length=200)
    description: str = Field(sa_column=Column(Text))
    status: str = Field(max_length=20, default="ACTIVE")   # ACTIVE, INACTIVE, MONITORING
    priority: str = Field(max_length=10, default="MEDIUM")  # LOW, MEDIUM, HIGH, CRITICAL
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    rss_feeds: List["RSSFeed"] = Relationship(back_populates="topics", link_model=RSSFeedTopicLink)


class Story(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    topic_slug: str = Field(foreign_key="topic.slug")
    title: str = Field(max_length=500, sa_column=Column(Text))
    status: str = Field(max_length=20, default="DEVELOPING")
    primary_region_id: int = Field(foreign_key="region.id")
    event_timestamp: datetime
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class Alert(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    story_id: int = Field(foreign_key="story.id")
    title: str = Field(max_length=500, sa_column=Column(Text))
    content: str = Field(sa_column=Column(Text))
    importance: int  # 1-4
    source_attribution: str = Field(max_length=200)
    verified: bool = Field(default=False)
    event_timestamp: datetime
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Article(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    story_id: int = Field(foreign_key="story.id", unique=True)
    title: str = Field(max_length=500, sa_column=Column(Text))
    description: str = Field(sa_column=Column(Text))
    content: str = Field(sa_column=Column(Text))
    importance: int
    source_attribution: str = Field(max_length=200)
    verified: bool = Field(default=False)
    event_timestamp: datetime
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


# ── RSS Models ────────────────────────────────────────────────────────────────

class RSSFeed(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(max_length=200)
    url: str = Field(max_length=500, unique=True)
    description: str = Field(default="", sa_column=Column(Text))
    is_active: bool = Field(default=True)
    priority: int = Field(default=2)
    timeout: int = Field(default=30)
    max_articles: int = Field(default=50)
    last_fetched: Optional[datetime] = None
    fetch_errors: int = Field(default=0)
    last_error: str = Field(default="", sa_column=Column(Text))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    topics: List["Topic"] = Relationship(back_populates="rss_feeds", link_model=RSSFeedTopicLink)
    sources: List["RSSSource"] = Relationship(back_populates="rss_feed")


class RSSSource(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    rss_feed_id: int = Field(foreign_key="rssfeed.id")
    title: str = Field(max_length=500, sa_column=Column(Text))
    url: str = Field(max_length=1000)
    summary: str = Field(default="", sa_column=Column(Text))
    published_date: datetime
    guid: str = Field(default="", max_length=500)
    author: str = Field(default="", max_length=200)
    tags: List[Any] = Field(default=[], sa_column=Column(JSON))
    raw_rss_data: dict = Field(default={}, sa_column=Column(JSON))
    processed_at: Optional[datetime] = None
    is_processed: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    rss_feed: Optional["RSSFeed"] = Relationship(back_populates="sources")

    __table_args__ = (
        UniqueConstraint("rss_feed_id", "url", name="unique_rss_feed_url"),
    )


class RSSArticle(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    rss_source_id: int = Field(foreign_key="rsssource.id", unique=True)
    content: str = Field(sa_column=Column(Text))
    cleaned_content: str = Field(default="", sa_column=Column(Text))
    word_count: int = Field(default=0)
    char_count: int = Field(default=0)
    estimated_read_time: int = Field(default=0)
    extraction_method: str = Field(default="", max_length=50)
    extraction_quality: str = Field(default="", max_length=20)
    extraction_time: float = Field(default=0.0)
    extraction_success: bool = Field(default=True)
    extraction_notes: str = Field(default="", sa_column=Column(Text))
    error_message: str = Field(default="", sa_column=Column(Text))
    relevance_score: float = Field(default=0.0)
    is_relevant: bool = Field(default=False)
    relevance_reasoning: str = Field(default="", sa_column=Column(Text))
    relevance_confidence: float = Field(default=0.0)
    key_topics_matched: List[Any] = Field(default=[], sa_column=Column(JSON))
    ai_processed_at: Optional[datetime] = None
    ai_processing_time: float = Field(default=0.0)
    ai_model_used: str = Field(default="", max_length=50)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    rss_source: Optional["RSSSource"] = Relationship()


# ── Outlook Models ────────────────────────────────────────────────────────────

class DailyOutlook(SQLModel, table=True):
    id: str = Field(
        default_factory=lambda: str(uuid.uuid4()),
        primary_key=True,
        max_length=36,
    )
    topic_slug: str = Field(foreign_key="topic.slug")
    slug: str = Field(max_length=200)
    title: str = Field(max_length=500, sa_column=Column(Text))
    summary: str = Field(sa_column=Column(Text))
    content: str = Field(sa_column=Column(Text))
    date: date
    read_time: str = Field(default="", max_length=20)
    key_developments: List[Any] = Field(default=[], sa_column=Column(JSON))
    regional_focus: List[Any] = Field(default=[], sa_column=Column(JSON))
    source_count: int = Field(default=0)
    confidence_score: float = Field(default=0.0)
    word_count: int = Field(default=0)
    processing_stats: dict = Field(default={}, sa_column=Column(JSON))
    content_simple: str = Field(default="", sa_column=Column(Text))
    annotations: List[Any] = Field(default=[], sa_column=Column(JSON))
    map_config: dict = Field(default={}, sa_column=Column(JSON))
    ai_conversation_history: List[Any] = Field(default=[], sa_column=Column(JSON))
    enhancements_generated: bool = Field(default=False)
    enhancements_generated_at: Optional[datetime] = None
    enhancement_processing_time: float = Field(default=0.0)
    deep_research_used: bool = Field(default=False)
    deep_research_content: str = Field(default="", sa_column=Column(Text))
    deep_research_sources_count: int = Field(default=0)
    deep_research_execution_time: float = Field(default=0.0)
    deep_research_sources: List[Any] = Field(default=[], sa_column=Column(JSON))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint("topic_slug", "date", name="unique_topic_date"),
    )


class OutlookProcessingRun(SQLModel, table=True):
    id: str = Field(
        default_factory=lambda: str(uuid.uuid4()),
        primary_key=True,
        max_length=36,
    )
    daily_outlook_id: Optional[str] = Field(default=None, foreign_key="dailyoutlook.id")
    topic_slug: str = Field(foreign_key="topic.slug")
    date: date
    rss_sources_found: int = Field(default=0)
    rss_sources_filtered: int = Field(default=0)
    rss_articles_extracted: int = Field(default=0)
    rss_articles_relevant: int = Field(default=0)
    deep_research_attempted: bool = Field(default=False)
    deep_research_success: bool = Field(default=False)
    deep_research_sources_found: int = Field(default=0)
    deep_research_execution_time: float = Field(default=0.0)
    deep_research_error: str = Field(default="", sa_column=Column(Text))
    rss_parsing_time: float = Field(default=0.0)
    headline_filtering_time: float = Field(default=0.0)
    content_extraction_time: float = Field(default=0.0)
    relevance_analysis_time: float = Field(default=0.0)
    outlook_generation_time: float = Field(default=0.0)
    average_extraction_time: float = Field(default=0.0)
    extraction_success_rate: float = Field(default=0.0)
    ai_processing_costs: dict = Field(default={}, sa_column=Column(JSON))
    phase_errors: dict = Field(default={}, sa_column=Column(JSON))
    status: str = Field(default="PENDING", max_length=20)
    errors: List[Any] = Field(default=[], sa_column=Column(JSON))
    started_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None
