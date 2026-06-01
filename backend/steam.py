"""Steam store API client."""

import asyncio
import httpx

REVIEWS_URL = "https://store.steampowered.com/appreviews/{app_id}"
GAME_URL    = "https://store.steampowered.com/api/appdetails"
MAX_REVIEWS = 2000   # cap per analysis request to stay polite


async def fetch_game_info(app_id: int) -> dict | None:
    async with httpx.AsyncClient(timeout=10) as client:
        r = await client.get(GAME_URL, params={"appids": app_id, "filters": "basic"})
        r.raise_for_status()
        data = r.json()
        entry = data.get(str(app_id), {})
        if not entry.get("success"):
            return None
        d = entry["data"]
        return {
            "app_id":      app_id,
            "name":        d.get("name", ""),
            "header_image": d.get("header_image", ""),
            "short_description": d.get("short_description", ""),
            "developers":  d.get("developers", []),
            "genres":      [g["description"] for g in d.get("genres", [])],
            "release_date": d.get("release_date", {}).get("date", ""),
        }


async def fetch_all_reviews(app_id: int, language: str = "english", limit: int = MAX_REVIEWS) -> list[dict]:
    """Page through Steam's review cursor until we hit limit or the end."""
    reviews = []
    cursor  = "*"
    async with httpx.AsyncClient(timeout=15) as client:
        while len(reviews) < limit:
            params = {
                "json":         1,
                "language":     language,
                "filter":       "recent",
                "review_type":  "all",
                "purchase_type":"steam",
                "num_per_page": 100,
                "cursor":       cursor,
            }
            r = await client.get(REVIEWS_URL.format(app_id=app_id), params=params)
            r.raise_for_status()
            body = r.json()

            if body.get("success") != 1:
                break

            batch = body.get("reviews", [])
            if not batch:
                break

            reviews.extend(batch)
            cursor = body.get("cursor", "")
            if not cursor:
                break

            await asyncio.sleep(0.3)   # polite pacing

    return reviews
