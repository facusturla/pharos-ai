"""Multi-library intelligent scraping funnel (ported from Django version)."""

import logging
import random
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import Any, Dict, List, Optional, Tuple

import requests
import urllib3
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

from app.config import settings
from app.services.types import ArticleMetadata, ExtractedArticle, ExtractionQuality, ExtractionResult

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
logger = logging.getLogger(__name__)

# ── Library availability ──────────────────────────────────────────────────────
try:
    from newspaper import Article as NewspaperArticle
    NEWSPAPER = True
except ImportError:
    NEWSPAPER = False

try:
    import trafilatura
    TRAFILATURA = True
except ImportError:
    TRAFILATURA = False

try:
    from goose3 import Goose, Configuration as GooseConfig
    GOOSE = True
except ImportError:
    GOOSE = False

try:
    from readability import Document as ReadabilityDoc
    READABILITY = True
except ImportError:
    READABILITY = False

try:
    from boilerpy3 import extractors as bp3
    BOILERPY3 = True
except ImportError:
    BOILERPY3 = False

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/91 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/91 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/91 Safari/537.36",
]

QUALITY_THRESHOLDS = {"excellent": 600, "good": 400, "acceptable": 100, "poor": 20}


def _assess_quality(word_count: int) -> ExtractionQuality:
    if word_count >= QUALITY_THRESHOLDS["excellent"]:
        return ExtractionQuality.EXCELLENT
    if word_count >= QUALITY_THRESHOLDS["good"]:
        return ExtractionQuality.GOOD
    if word_count >= QUALITY_THRESHOLDS["acceptable"]:
        return ExtractionQuality.ACCEPTABLE
    if word_count >= QUALITY_THRESHOLDS["poor"]:
        return ExtractionQuality.POOR
    return ExtractionQuality.UNUSABLE


def _get_session() -> requests.Session:
    s = requests.Session()
    retry = Retry(total=settings.SCRAPING_MAX_RETRIES, backoff_factor=0.5, status_forcelist=[429,500,502,503,504])
    adapter = HTTPAdapter(max_retries=retry)
    s.mount("http://", adapter)
    s.mount("https://", adapter)
    return s


def _download(url: str) -> Tuple[Optional[bytes], Optional[str]]:
    sess = _get_session()
    timeout = (settings.SCRAPING_CONNECTION_TIMEOUT, settings.SCRAPING_REQUEST_TIMEOUT)
    for attempt in range(2):
        try:
            r = sess.get(url, timeout=timeout, headers={"User-Agent": random.choice(USER_AGENTS)},
                         verify=(attempt == 0), allow_redirects=True)
            r.raise_for_status()
            return r.content, None
        except requests.exceptions.SSLError:
            if attempt == 0:
                continue
            return None, "SSL error"
        except Exception as e:
            if attempt == 1:
                return None, str(e)
    return None, "All attempts failed"


def _failed(method: str, t0: float, msg: str) -> ExtractionResult:
    return ExtractionResult(method=method, success=False, word_count=0, char_count=0,
                            extraction_time=time.time()-t0, title="", authors="", publish_date="",
                            text="", error_message=msg, quality_score=ExtractionQuality.UNUSABLE, metadata={})


def _extract_boilerpy3(html: Optional[bytes]) -> ExtractionResult:
    t0 = time.time()
    if not BOILERPY3:
        return _failed("boilerpy3", t0, "not installed")
    try:
        ex = bp3.ArticleExtractor()
        text = ex.get_content(html.decode("utf-8", errors="ignore") if html else "")
        if not text or not text.strip():
            raise ValueError("empty")
        wc = len(text.split())
        return ExtractionResult("boilerpy3", True, wc, len(text), time.time()-t0, "", "", "", text, "", _assess_quality(wc), {})
    except Exception as e:
        return _failed("boilerpy3", t0, str(e))


def _extract_trafilatura(url: str, html: Optional[bytes]) -> ExtractionResult:
    t0 = time.time()
    if not TRAFILATURA:
        return _failed("trafilatura", t0, "not installed")
    try:
        text = trafilatura.extract(html, include_comments=False, include_tables=False) if html else None
        meta = trafilatura.extract_metadata(html) if html else None
        if not text:
            raise ValueError("empty")
        wc = len(text.split())
        return ExtractionResult("trafilatura", True, wc, len(text), time.time()-t0,
                                meta.title if meta else "", meta.author if meta else "",
                                meta.date if meta else "", text, "", _assess_quality(wc), {})
    except Exception as e:
        return _failed("trafilatura", t0, str(e))


def _extract_newspaper(url: str, html: Optional[bytes]) -> ExtractionResult:
    t0 = time.time()
    if not NEWSPAPER:
        return _failed("newspaper", t0, "not installed")
    try:
        art = NewspaperArticle(url)
        art.config.browser_user_agent = random.choice(USER_AGENTS)
        art.config.request_timeout = settings.SCRAPING_DOWNLOAD_TIMEOUT
        if html:
            art.set_html(html.decode("utf-8", errors="ignore"))
            art.parse()
        else:
            art.download(); art.parse()
        if not art.text.strip():
            raise ValueError("empty")
        wc = len(art.text.split())
        return ExtractionResult("newspaper", True, wc, len(art.text), time.time()-t0,
                                art.title, ", ".join(art.authors),
                                str(art.publish_date) if art.publish_date else "",
                                art.text, "", _assess_quality(wc), {})
    except Exception as e:
        return _failed("newspaper", t0, str(e))


def _extract_goose(url: str, html: Optional[bytes]) -> ExtractionResult:
    t0 = time.time()
    if not GOOSE:
        return _failed("goose3", t0, "not installed")
    try:
        cfg = GooseConfig()
        cfg.browser_user_agent = random.choice(USER_AGENTS)
        cfg.http_timeout = settings.SCRAPING_DOWNLOAD_TIMEOUT
        g = Goose(cfg)
        art = g.extract(raw_html=html.decode("utf-8", errors="ignore")) if html else g.extract(url=url)
        if not art.cleaned_text or not art.cleaned_text.strip():
            raise ValueError("empty")
        wc = len(art.cleaned_text.split())
        return ExtractionResult("goose3", True, wc, len(art.cleaned_text), time.time()-t0,
                                art.title, ", ".join(art.authors) if art.authors else "",
                                str(art.publish_date) if art.publish_date else "",
                                art.cleaned_text, "", _assess_quality(wc), {})
    except Exception as e:
        return _failed("goose3", t0, str(e))


def _extract_readability(html: Optional[bytes]) -> ExtractionResult:
    import re
    from html import unescape
    t0 = time.time()
    if not READABILITY:
        return _failed("readability", t0, "not installed")
    try:
        decoded = html.decode("utf-8", errors="ignore") if html else ""
        doc = ReadabilityDoc(decoded)
        text = unescape(re.sub(r"<[^>]+>", "", doc.summary())).strip()
        if not text:
            raise ValueError("empty")
        wc = len(text.split())
        return ExtractionResult("readability", True, wc, len(text), time.time()-t0,
                                doc.title(), "", "", text, "", _assess_quality(wc), {})
    except Exception as e:
        return _failed("readability", t0, str(e))


PHASES = {
    1: ["boilerpy3", "trafilatura"],
    2: ["readability", "goose3"],
    3: ["newspaper"],
}


def _run_phase(phase: int, url: str, html: Optional[bytes]) -> Optional[ExtractionResult]:
    extractors = {
        "boilerpy3": lambda: _extract_boilerpy3(html),
        "trafilatura": lambda: _extract_trafilatura(url, html),
        "newspaper": lambda: _extract_newspaper(url, html),
        "goose3": lambda: _extract_goose(url, html),
        "readability": lambda: _extract_readability(html),
    }
    methods = PHASES[phase]
    results: Dict[str, ExtractionResult] = {}
    with ThreadPoolExecutor(max_workers=len(methods)) as ex:
        futs = {ex.submit(extractors[m]): m for m in methods if m in extractors}
        for fut in as_completed(futs):
            results[futs[fut]] = fut.result()
    viable = [r for r in results.values() if r.success and r.word_count >= 20]
    if not viable:
        return None
    excellent = [r for r in viable if r.word_count >= 600]
    return max(excellent or viable, key=lambda x: x.word_count)


def extract_single_article(url: str, article_id: str) -> ExtractedArticle:
    html, err = _download(url)
    if err:
        logger.warning(f"Download failed for {url}: {err}")

    winner: Optional[ExtractionResult] = None
    for phase in [1, 2, 3]:
        winner = _run_phase(phase, url, html)
        if winner:
            break

    if winner:
        return ExtractedArticle(
            id=article_id, url=url, title=winner.title, content=winner.text,
            word_count=winner.word_count, extraction_method=winner.method,
            extraction_quality=winner.quality_score.value,
            extraction_time=winner.extraction_time, authors=winner.authors,
            publish_date=winner.publish_date, metadata=winner.metadata,
        )
    return ExtractedArticle(
        id=article_id, url=url, title="", content="", word_count=0,
        extraction_method="", extraction_quality=ExtractionQuality.UNUSABLE.value,
        error_message="All methods failed",
    )


def extract_article_content(articles: List[ArticleMetadata], max_workers: Optional[int] = None) -> Dict[str, Any]:
    max_workers = max_workers or settings.SCRAPING_MAX_WORKERS
    t0 = time.time()
    extracted: List[ExtractedArticle] = []
    errors: List[str] = []

    def _worker(art: ArticleMetadata) -> Optional[ExtractedArticle]:
        try:
            return extract_single_article(art.url, art.id)
        except Exception as e:
            errors.append(f"{art.id}: {e}")
            return None

    with ThreadPoolExecutor(max_workers=max_workers) as ex:
        for result in as_completed({ex.submit(_worker, a): a for a in articles}):
            r = result.result()
            if r:
                extracted.append(r)

    return {
        "extracted_articles": extracted,
        "successful_extractions": len(extracted),
        "failed_extractions": len(errors),
        "processing_time_seconds": time.time() - t0,
        "errors": errors,
    }
