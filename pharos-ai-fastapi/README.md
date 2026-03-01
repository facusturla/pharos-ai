# Pharos AI — FastAPI Backend

Geopolitical intelligence backend, migrated from Django to **FastAPI + SQLModel**.

## Stack

| Component | Tech |
|---|---|
| API | FastAPI 0.115 |
| ORM | SQLModel + SQLAlchemy |
| Database | PostgreSQL 16 |
| Queue | Celery + Redis |
| AI | OpenAI GPT-4o |
| Scraping | trafilatura / newspaper3k / goose3 / boilerpy3 |

## Ports

| Service | Port |
|---|---|
| FastAPI | 8100 |
| PostgreSQL | 5433 |
| Redis | 6380 |
| Flower (Celery UI) | 5556 |

## Quick Start

```bash
# 1. Copy env
cp .env.example .env
# Edit .env — set OPENAI_API_KEY

# 2. Start all services
docker compose up --build

# 3. Run migrations
docker compose exec web alembic upgrade head

# 4. API docs
open http://localhost:8100/api/docs
```

## API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/api/news/dashboard/` | Latest outlook per topic |
| GET | `/api/news/outlooks/` | Paginated outlook list |
| GET | `/api/news/outlooks/{id}/` | Full outlook detail |
| GET | `/api/news/topics/available/` | Active topics |
| GET | `/api/news/topics/{slug}/calendar-dates/` | Dates with outlooks |
| GET | `/api/news/calendar/date/{date}/` | All outlooks for a date |
| POST | `/api/admin/generate-outlook` | Trigger single topic generation |
| POST | `/api/admin/generate-all-outlooks` | Trigger all topics |

## Manual Outlook Generation

```bash
# Via API (triggers Celery task)
curl -X POST "http://localhost:8100/api/admin/generate-outlook?topic_slug=middle-east"

# Or run directly (for testing, no Celery needed)
docker compose exec web python -c "
from app.database import engine
from sqlmodel import Session
from app.services.orchestration.daily_outlook_orchestrator import generate_daily_outlook_for_topic
with Session(engine) as s:
    result = generate_daily_outlook_for_topic('middle-east', session=s)
    print(result)
"
```

## Development (without Docker)

```bash
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt

# Run Postgres + Redis locally, then:
cp .env.example .env  # edit DATABASE_URL and REDIS_URL to localhost

alembic upgrade head
uvicorn app.main:app --reload --port 8100
```
