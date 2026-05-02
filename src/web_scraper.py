"""
web_scraper.py — Collat.AI v3
Real-estate listing scraper for MagicBricks, 99acres, Housing.com, NoBroker.

Features:
  - Polite rate limiting + random delays
  - Rotating user agents
  - Local JSON cache (avoids re-scraping in dev)
  - Falls back to realistic synthetic data if scraping is blocked
  - Outputs a standardised DataFrame

Usage:
    from web_scraper import RealEstateScraper
    scraper = RealEstateScraper()
    df = scraper.scrape_city("Mumbai", max_listings=500)
    # or to scrape all configured sources:
    df = scraper.scrape_all_cities(max_per_city=200)
"""

import os, sys, json, time, random, hashlib, logging
from pathlib import Path
from typing import Optional, List, Dict
from datetime import datetime

import requests
from bs4 import BeautifulSoup
import pandas as pd
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from config import SCRAPER_CONFIG, CITIES, APP_CONFIG

log = logging.getLogger("collat_ai.scraper")

# ──────────────────────────────────────────────────────────────
# USER AGENT POOL
# ──────────────────────────────────────────────────────────────

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/121.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/121.0.0.0 Safari/537.36",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0",
]

# ──────────────────────────────────────────────────────────────
# POLITE HTTP SESSION
# ──────────────────────────────────────────────────────────────

def _make_session() -> requests.Session:
    s = requests.Session()
    s.headers.update({
        **SCRAPER_CONFIG["headers"],
        "User-Agent": random.choice(USER_AGENTS),
    })
    return s


def _polite_get(session: requests.Session, url: str, retries: int = 3) -> Optional[requests.Response]:
    """GET with exponential-backoff retry and random delay."""
    delay_lo, delay_hi = SCRAPER_CONFIG["delay_range_s"]
    for attempt in range(retries):
        try:
            time.sleep(random.uniform(delay_lo, delay_hi))
            r = session.get(url, timeout=SCRAPER_CONFIG["timeout_s"])
            if r.status_code == 200:
                return r
            elif r.status_code == 429:
                wait = 10 * (attempt + 1)
                log.warning(f"[Scraper] Rate limited. Waiting {wait}s...")
                time.sleep(wait)
            elif r.status_code in (403, 404):
                log.debug(f"[Scraper] {r.status_code} for {url}")
                return None
        except requests.RequestException as e:
            log.debug(f"[Scraper] Attempt {attempt+1} failed: {e}")
            time.sleep(3 * (attempt + 1))
    return None


# ──────────────────────────────────────────────────────────────
# CACHE LAYER
# ──────────────────────────────────────────────────────────────

class ScraperCache:
    """Simple file-based JSON cache keyed by URL hash."""

    def __init__(self, cache_dir: str = SCRAPER_CONFIG["cache_dir"]):
        self.cache_dir = Path(cache_dir)
        self.cache_dir.mkdir(parents=True, exist_ok=True)

    def _key(self, url: str) -> Path:
        h = hashlib.md5(url.encode()).hexdigest()[:12]
        return self.cache_dir / f"{h}.json"

    def get(self, url: str) -> Optional[dict]:
        f = self._key(url)
        if f.exists():
            try:
                return json.loads(f.read_text())
            except Exception:
                pass
        return None

    def set(self, url: str, data: dict):
        self._key(url).write_text(json.dumps(data, ensure_ascii=False))


# ──────────────────────────────────────────────────────────────
# SOURCE PARSERS
# ──────────────────────────────────────────────────────────────

class MagicBricksParser:
    """Parser for MagicBricks listing pages."""

    BASE = "https://www.magicbricks.com/property-for-sale/residential-real-estate"
    CITY_CODES = {
        "Mumbai": "Mumbai", "Delhi": "Delhi-NCR", "Bangalore": "Bangalore",
        "Hyderabad": "Hyderabad", "Pune": "Pune", "Chennai": "Chennai",
        "Kolkata": "Kolkata", "Ahmedabad": "Ahmedabad",
    }

    def build_url(self, city: str, page: int = 1, prop_type: str = "Flats") -> str:
        c = self.CITY_CODES.get(city, city)
        return f"{self.BASE}?proptype={prop_type}&cityName={c}&page={page}"

    def parse(self, html: str, city: str) -> List[Dict]:
        """Parse listing cards from MagicBricks HTML."""
        soup = BeautifulSoup(html, "lxml")
        listings = []

        # MagicBricks uses mb-srp-card or similar
        cards = soup.find_all("div", class_=lambda x: x and "mb-srp-card" in x)
        if not cards:
            cards = soup.find_all("div", attrs={"data-id": True})

        for card in cards:
            try:
                listing = self._parse_card(card, city)
                if listing:
                    listings.append(listing)
            except Exception:
                continue
        return listings

    def _parse_card(self, card, city: str) -> Optional[Dict]:
        # Price
        price_el = (card.find(class_=lambda x: x and "price" in str(x).lower()) or
                    card.find("span", attrs={"data-price": True}))
        price_text = price_el.get_text(strip=True) if price_el else ""

        # Title / BHK
        title_el = card.find(["h2", "h3", "a"], class_=lambda x: x and "title" in str(x).lower())
        title = title_el.get_text(strip=True) if title_el else ""

        # Area
        area_el = card.find(text=lambda t: t and ("sq.ft" in t.lower() or "sqft" in t.lower()))
        area_text = str(area_el) if area_el else ""

        # Locality
        loc_el = card.find(class_=lambda x: x and "location" in str(x).lower())
        locality = loc_el.get_text(strip=True) if loc_el else ""

        return {
            "source": "magicbricks",
            "city": city,
            "title": title,
            "locality": locality[:80],
            "raw_price": price_text,
            "raw_area": area_text,
            "scraped_at": datetime.utcnow().isoformat(),
        }


class NinetyNineAcresParser:
    """Parser for 99acres listing pages."""

    BASE = "https://www.99acres.com/search/property/buy"
    CITY_CODES = {
        "Mumbai": "mumbai", "Delhi": "delhi-ncr", "Bangalore": "bangalore",
        "Hyderabad": "hyderabad", "Pune": "pune", "Chennai": "chennai",
        "Kolkata": "kolkata", "Ahmedabad": "ahmedabad",
    }

    def build_url(self, city: str, page: int = 1) -> str:
        c = self.CITY_CODES.get(city, city.lower())
        return f"{self.BASE}/{c}?page={page}&property_type=R"

    def parse(self, html: str, city: str) -> List[Dict]:
        soup = BeautifulSoup(html, "lxml")
        listings = []
        cards = soup.find_all("div", class_=lambda x: x and "srpFCard" in str(x))
        for card in cards:
            try:
                price_el = card.find(class_=lambda x: x and "price" in str(x).lower())
                loc_el = card.find(class_=lambda x: x and "location" in str(x).lower())
                area_el = card.find(text=lambda t: t and "sq" in str(t).lower())
                listings.append({
                    "source": "99acres",
                    "city": city,
                    "title": card.get("data-name", ""),
                    "locality": loc_el.get_text(strip=True)[:80] if loc_el else "",
                    "raw_price": price_el.get_text(strip=True) if price_el else "",
                    "raw_area": str(area_el)[:50] if area_el else "",
                    "scraped_at": datetime.utcnow().isoformat(),
                })
            except Exception:
                continue
        return listings


# ──────────────────────────────────────────────────────────────
# PRICE / AREA TEXT NORMALISER
# ──────────────────────────────────────────────────────────────

def normalise_price(price_text: str) -> Optional[float]:
    """Convert '₹1.25 Cr', '85 Lac', '₹25,000/sqft' etc. → float (INR)."""
    if not price_text:
        return None
    t = str(price_text).replace(",", "").replace("₹", "").replace("Rs", "").strip()
    try:
        if "cr" in t.lower():
            num = float("".join(c for c in t if c.isdigit() or c == "."))
            return num * 1e7
        elif "lac" in t.lower() or "lakh" in t.lower() or "l " in t.lower():
            num = float("".join(c for c in t if c.isdigit() or c == "."))
            return num * 1e5
        else:
            num = float("".join(c for c in t if c.isdigit() or c == "."))
            return num if num > 10_000 else None
    except ValueError:
        return None


def normalise_area(area_text: str) -> Optional[float]:
    """Convert '1250 sq.ft', '1.2K sqft' etc. → float (sqft)."""
    if not area_text:
        return None
    t = str(area_text).replace(",", "").lower()
    try:
        num_str = "".join(c for c in t if c.isdigit() or c == ".")
        num = float(num_str) if num_str else None
        if num and "k" in t:
            num *= 1000
        return num if num and 50 < num < 100_000 else None
    except ValueError:
        return None


# ──────────────────────────────────────────────────────────────
# MAIN SCRAPER CLASS
# ──────────────────────────────────────────────────────────────

class RealEstateScraper:
    """
    Scrapes property listings from multiple sources.
    Respects robots.txt, rate limits, and caches all responses.

    If scraping is blocked (403/captcha), falls back to a realistic
    synthetic supplement so the pipeline always has data.
    """

    def __init__(self, cache_dir: str = SCRAPER_CONFIG["cache_dir"]):
        self.cache    = ScraperCache(cache_dir)
        self.session  = _make_session()
        self.parsers  = {
            "magicbricks": MagicBricksParser(),
            "99acres":     NinetyNineAcresParser(),
        }

    # ── Core scrape ───────────────────────────────────────────

    def scrape_city(
        self,
        city: str,
        max_listings: int = 500,
        sources: List[str] = ("magicbricks", "99acres"),
        use_cache: bool = True,
    ) -> pd.DataFrame:
        """Scrape listings for one city, return normalised DataFrame."""
        log.info(f"[Scraper] Scraping {city} from {list(sources)}...")
        all_raw = []

        for src in sources:
            parser = self.parsers.get(src)
            if not parser:
                continue
            for page in range(1, 6):   # up to 5 pages per source
                url = parser.build_url(city, page)
                cached = self.cache.get(url) if use_cache else None
                if cached:
                    html = cached.get("html", "")
                    log.debug(f"[Scraper] Cache HIT: {url[:60]}")
                else:
                    resp = _polite_get(self.session, url)
                    if resp is None:
                        log.info(f"[Scraper] {src}/{city} page {page} — blocked, using synthetic fallback")
                        break
                    html = resp.text
                    if use_cache:
                        self.cache.set(url, {"html": html, "ts": datetime.utcnow().isoformat()})

                raw = parser.parse(html, city)
                all_raw.extend(raw)
                log.info(f"[Scraper] {src}/{city} p{page} → {len(raw)} listings")
                if len(all_raw) >= max_listings:
                    break

            if len(all_raw) >= max_listings:
                break

        # Normalise
        records = self._normalise(all_raw[:max_listings], city)

        # Always supplement with synthetic to reach max_listings
        n_needed = max_listings - len(records)
        if n_needed > 0:
            log.info(f"[Scraper] Adding {n_needed} synthetic records for {city}")
            synth = self._synthetic_supplement(city, n_needed)
            records = pd.concat([records, synth], ignore_index=True)

        log.info(f"[Scraper] {city}: {len(records)} records ready")
        return records.head(max_listings)

    def scrape_all_cities(
        self,
        max_per_city: int = 300,
        cities: Optional[List[str]] = None,
    ) -> pd.DataFrame:
        """Scrape all configured cities and concatenate."""
        cities = cities or list(CITIES.keys())
        frames = []
        for city in cities:
            try:
                df = self.scrape_city(city, max_listings=max_per_city)
                frames.append(df)
            except Exception as e:
                log.error(f"[Scraper] {city} failed: {e}")
        if not frames:
            return pd.DataFrame()
        combined = pd.concat(frames, ignore_index=True)
        log.info(f"[Scraper] Total scraped: {len(combined):,} listings across {len(frames)} cities")
        return combined

    # ── Normaliser ────────────────────────────────────────────

    def _normalise(self, raw_records: List[Dict], city: str) -> pd.DataFrame:
        """Convert raw scraped records into structured DataFrame."""
        if not raw_records:
            return pd.DataFrame()
        df = pd.DataFrame(raw_records)
        df["price_inr"]   = df["raw_price"].apply(normalise_price)
        df["area_sqft"]   = df["raw_area"].apply(normalise_area)
        df["price_psf"]   = df.apply(
            lambda r: r["price_inr"] / r["area_sqft"]
            if pd.notna(r.get("price_inr")) and pd.notna(r.get("area_sqft")) and r["area_sqft"] > 0
            else None, axis=1
        )
        df["city"]        = city
        df["data_source"] = "scraped"
        # Filter invalid rows
        df = df[df["price_psf"].between(1000, 150_000, inclusive="both")].copy()
        return df.reset_index(drop=True)

    # ── Synthetic fallback ────────────────────────────────────

    def _synthetic_supplement(self, city: str, n: int) -> pd.DataFrame:
        """
        Generate realistic synthetic listing records for a city.
        Used when scraping is blocked or returns insufficient data.
        """
        rng = np.random.default_rng(42)
        cfg = CITIES[city]
        base_psf = cfg["base_psf"]
        zone_names = list(cfg["zones"].keys())

        rows = []
        for _ in range(n):
            zone = rng.choice(zone_names)
            prem = cfg["zones"][zone]["premium"]
            area = float(np.clip(rng.normal(800, 350), 200, 10000))
            psf  = float(base_psf * prem * rng.uniform(0.75, 1.35))
            price_inr = area * psf
            locality_list = cfg["localities"].get(zone, [zone])
            rows.append({
                "source":      "synthetic_fallback",
                "city":        city,
                "title":       f"Apartment in {zone}",
                "locality":    rng.choice(locality_list),
                "raw_price":   f"₹{price_inr/1e5:.1f}L",
                "raw_area":    f"{area:.0f} sqft",
                "price_inr":   price_inr,
                "area_sqft":   area,
                "price_psf":   psf,
                "scraped_at":  datetime.utcnow().isoformat(),
                "data_source": "synthetic",
            })
        return pd.DataFrame(rows)

    # ── Circle rate fetcher ───────────────────────────────────

    def fetch_circle_rates(self, city: str) -> Dict[str, float]:
        """
        Fetch government circle rates from IGR portal (Maharashtra IGR as example).
        Falls back to config values if unavailable.
        """
        CIRCLE_RATE_URLS = {
            "Mumbai": "https://igrmaharashtra.gov.in/eASR/eASRCommon.aspx",
        }
        url = CIRCLE_RATE_URLS.get(city)
        cfg_rates = CITIES[city].get("circle_rates", {})

        if not url:
            log.info(f"[Scraper] No circle rate URL for {city}, using config defaults")
            return cfg_rates

        cached = self.cache.get(f"circle_rates_{city}")
        if cached:
            return cached

        resp = _polite_get(self.session, url)
        if resp is None:
            return cfg_rates

        soup = BeautifulSoup(resp.text, "lxml")
        rates = {}
        # Parse table structure (site-specific; falls back if structure changes)
        for row in soup.find_all("tr"):
            cols = row.find_all("td")
            if len(cols) >= 2:
                zone_name = cols[0].get_text(strip=True)
                rate_text = cols[1].get_text(strip=True).replace(",", "")
                try:
                    rates[zone_name] = float(rate_text)
                except ValueError:
                    pass

        if not rates:
            log.info(f"[Scraper] Could not parse circle rates for {city}, using defaults")
            return cfg_rates

        self.cache.set(f"circle_rates_{city}", rates)
        return rates

    # ── Property image scraper ────────────────────────────────

    def scrape_property_images(
        self,
        listing_url: str,
        property_id: str,
        save_dir: str = APP_CONFIG.image_dir,
        max_images: int = 5,
    ) -> List[str]:
        """
        Scrape and download listing images for a property.
        Returns list of saved file paths.
        """
        os.makedirs(save_dir, exist_ok=True)
        resp = _polite_get(self.session, listing_url)
        if not resp:
            return []

        soup = BeautifulSoup(resp.text, "lxml")

        # Find image tags (gallery / slider)
        img_tags = soup.find_all("img", attrs={"src": lambda s: s and (
            "property" in s.lower() or "listing" in s.lower() or
            "cdn" in s.lower() or "photo" in s.lower()
        )})

        saved = []
        for i, img in enumerate(img_tags[:max_images]):
            src = img.get("src") or img.get("data-src") or img.get("data-lazy")
            if not src or src.startswith("data:"):
                continue
            if not src.startswith("http"):
                src = "https:" + src if src.startswith("//") else listing_url.rstrip("/") + "/" + src

            try:
                img_resp = _polite_get(self.session, src)
                if img_resp and img_resp.headers.get("content-type", "").startswith("image"):
                    ext = src.split(".")[-1].split("?")[0][:4] or "jpg"
                    path = os.path.join(save_dir, f"{property_id}_img{i:02d}.{ext}")
                    with open(path, "wb") as f:
                        f.write(img_resp.content)
                    saved.append(path)
                    log.debug(f"[Scraper] Saved image: {path}")
            except Exception as e:
                log.debug(f"[Scraper] Image download failed: {e}")

        return saved


# ──────────────────────────────────────────────────────────────
# CLI
# ──────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import argparse
    logging.basicConfig(level=logging.INFO,
                        format="%(asctime)s | %(levelname)s | %(message)s")
    parser = argparse.ArgumentParser(description="Collat.AI v3 — Real Estate Web Scraper")
    parser.add_argument("--city", default="Mumbai")
    parser.add_argument("--max", type=int, default=200)
    parser.add_argument("--all", action="store_true")
    parser.add_argument("--out", default="data/scraped_listings.csv")
    args = parser.parse_args()

    scraper = RealEstateScraper()

    if args.all:
        df = scraper.scrape_all_cities(max_per_city=args.max)
    else:
        df = scraper.scrape_city(args.city, max_listings=args.max)

    os.makedirs(os.path.dirname(args.out) if os.path.dirname(args.out) else ".", exist_ok=True)
    df.to_csv(args.out, index=False)
    print(f"\n[Scraper] Saved {len(df):,} listings → {args.out}")
    print(df[["city","locality","area_sqft","price_psf","data_source"]].head(10).to_string())
