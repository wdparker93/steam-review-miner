"""ReviewMiner API — FastAPI backend."""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from steam import fetch_game_info, fetch_all_reviews
from analyzer import analyze

app = FastAPI(title="ReviewMiner API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:4173"],
    allow_methods=["GET"],
    allow_headers=["*"],
)


@app.get("/api/game/{app_id}")
async def game_info(app_id: int):
    info = await fetch_game_info(app_id)
    if not info:
        raise HTTPException(status_code=404, detail=f"App {app_id} not found on Steam")
    return info


@app.get("/api/analyze/{app_id}")
async def analyze_game(app_id: int, language: str = "english"):
    info = await fetch_game_info(app_id)
    if not info:
        raise HTTPException(status_code=404, detail=f"App {app_id} not found on Steam")

    raw = await fetch_all_reviews(app_id, language=language)
    if not raw:
        raise HTTPException(status_code=422, detail="No reviews found for this game")

    result = analyze(raw)
    return {"game": info, **result}


@app.get("/healthz")
def health():
    return {"status": "ok"}
