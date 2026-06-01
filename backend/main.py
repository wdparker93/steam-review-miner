"""ReviewMiner API — FastAPI backend."""

import os
import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from steam import fetch_game_info, fetch_all_reviews
from analyzer import analyze

# ── Config ────────────────────────────────────────────────────────────────────

FREE_REVIEW_LIMIT = 30
PRO_REVIEW_LIMIT  = 2000

LS_API_KEY = os.getenv("LEMONSQUEEZY_API_KEY", "")
LS_VALIDATE_URL = "https://api.lemonsqueezy.com/v1/licenses/validate"

ALLOWED_ORIGINS = [
    o.strip()
    for o in os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:5175").split(",")
    if o.strip()
]

# ── App ───────────────────────────────────────────────────────────────────────

app = FastAPI(title="ReviewMiner API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# ── LemonSqueezy license validation ───────────────────────────────────────────

async def validate_ls_license(license_key: str) -> bool:
    """Return True if the license key is valid and active."""
    if not license_key or not LS_API_KEY:
        return False
    try:
        async with httpx.AsyncClient(timeout=8) as client:
            r = await client.post(
                LS_VALIDATE_URL,
                json={"license_key": license_key, "instance_name": "reviewminer-web"},
                headers={"Authorization": f"Bearer {LS_API_KEY}", "Accept": "application/json"},
            )
            if not r.is_success:
                return False
            body = r.json()
            return body.get("valid", False) and body.get("license_key", {}).get("status") == "active"
    except Exception:
        return False


class LicenseRequest(BaseModel):
    license_key: str


@app.post("/api/validate-license")
async def validate_license(req: LicenseRequest):
    valid = await validate_ls_license(req.license_key)
    return {"valid": valid}


# ── Game endpoints ─────────────────────────────────────────────────────────────

@app.get("/api/game/{app_id}")
async def game_info(app_id: int):
    info = await fetch_game_info(app_id)
    if not info:
        raise HTTPException(status_code=404, detail=f"App {app_id} not found on Steam")
    return info


@app.get("/api/analyze/{app_id}")
async def analyze_game(app_id: int, language: str = "english", license_key: str = ""):
    info = await fetch_game_info(app_id)
    if not info:
        raise HTTPException(status_code=404, detail=f"App {app_id} not found on Steam")

    is_pro = await validate_ls_license(license_key)
    limit  = PRO_REVIEW_LIMIT if is_pro else FREE_REVIEW_LIMIT

    raw = await fetch_all_reviews(app_id, language=language, limit=limit)
    if not raw:
        raise HTTPException(status_code=422, detail="No reviews found for this game")

    result = analyze(raw)
    result["is_pro"]      = is_pro
    result["limit_hit"]   = not is_pro and len(raw) >= FREE_REVIEW_LIMIT
    result["review_cap"]  = PRO_REVIEW_LIMIT if is_pro else FREE_REVIEW_LIMIT
    return {"game": info, **result}


@app.get("/healthz")
def health():
    return {"status": "ok"}
