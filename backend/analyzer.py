"""Review tagging, phrase extraction, and timeline bucketing."""

import re
from collections import Counter
from datetime import datetime, timezone

# ── Tag definitions ───────────────────────────────────────────────────────────

TAGS: dict[str, list[str]] = {
    "Bug / Crash": [
        "crash", "crashes", "crashing", "bug", "bugs", "buggy", "broken", "freeze",
        "freezes", "freezing", "error", "errors", "glitch", "glitches", "softlock",
        "stuck", "not working", "doesn't work", "doesnt work", "corrupted", "corrupt",
    ],
    "Performance": [
        "fps", "lag", "lags", "laggy", "stutter", "stutters", "stuttering",
        "performance", "frame rate", "framerate", "frames", "slow", "loading",
        "load time", "load times", "optimization", "optimized", "unoptimized",
    ],
    "Content / Length": [
        "short", "too short", "hours", "hour", "content", "lacking content",
        "ending", "story", "length", "brief", "replayability", "replay value",
        "no content", "empty", "finished in", "completed in",
    ],
    "Difficulty": [
        "hard", "too hard", "easy", "too easy", "difficult", "difficulty",
        "unfair", "impossible", "challenge", "challenging", "unbalanced", "balance",
        "overpowered", "op", "cheap", "rng", "punishing",
    ],
    "Price / Value": [
        "price", "expensive", "overpriced", "worth", "cheap", "cost", "value",
        "money", "sale", "discount", "refund", "not worth", "waste of money",
        "free", "pay", "paid",
    ],
    "Controls / UI": [
        "controls", "control", "keybind", "keybinding", "keybindings", "interface",
        "ui", "ux", "menu", "mouse", "keyboard", "controller", "button", "buttons",
        "mapping", "clunky", "clunky controls", "rebind", "input",
    ],
}

# Lower-cased for matching
_TAG_LOWER: dict[str, list[str]] = {
    tag: [k.lower() for k in kws] for tag, kws in TAGS.items()
}

STOPWORDS = {
    "the", "a", "an", "and", "or", "but", "is", "it", "in", "on", "at", "to",
    "for", "of", "with", "this", "that", "was", "are", "be", "have", "has",
    "i", "you", "we", "they", "he", "she", "not", "so", "very", "just", "get",
    "its", "my", "your", "their", "our", "do", "if", "no", "yes", "can", "will",
    "would", "could", "should", "as", "from", "by", "game", "games", "play",
    "playing", "played", "there", "also", "more", "some", "all", "one", "than",
    "then", "when", "which", "what", "how", "who", "had", "been", "about",
    "up", "out", "into", "over", "after", "like", "really", "still", "even",
    "only", "other", "time", "way",
}


# ── Per-review tagging ────────────────────────────────────────────────────────

def tag_review(text: str) -> list[str]:
    lower = text.lower()
    return [tag for tag, kws in _TAG_LOWER.items() if any(kw in lower for kw in kws)]


# ── Phrase extraction ─────────────────────────────────────────────────────────

def _ngrams(words: list[str], n: int) -> list[str]:
    return [" ".join(words[i : i + n]) for i in range(len(words) - n + 1)]


def top_phrases(reviews: list[str], n: int = 20) -> list[dict]:
    """Return the top n bigrams from a set of review texts, stopword-filtered."""
    counter: Counter = Counter()
    for text in reviews:
        words = [w for w in re.findall(r"[a-z]+", text.lower()) if w not in STOPWORDS and len(w) > 2]
        counter.update(_ngrams(words, 2))
    return [{"phrase": phrase, "count": count} for phrase, count in counter.most_common(n)]


# ── Sentiment timeline ────────────────────────────────────────────────────────

def sentiment_timeline(reviews: list[dict], bucket_days: int = 14) -> list[dict]:
    """
    Bucket reviews by creation date and return weekly positive ratio.
    Each bucket: { date, positive, negative, ratio }
    """
    if not reviews:
        return []

    # Convert timestamps to dates, build (timestamp, voted_up) pairs
    points = [
        (r["timestamp_created"], r.get("voted_up", False))
        for r in reviews
        if "timestamp_created" in r
    ]
    if not points:
        return []

    points.sort(key=lambda x: x[0])
    min_ts = points[0][0]
    max_ts = points[-1][0]

    bucket_secs = bucket_days * 86400
    num_buckets = max(1, int((max_ts - min_ts) / bucket_secs) + 1)

    buckets: list[dict] = [
        {"date": datetime.fromtimestamp(min_ts + i * bucket_secs, tz=timezone.utc).strftime("%Y-%m-%d"),
         "positive": 0, "negative": 0}
        for i in range(num_buckets)
    ]

    for ts, up in points:
        idx = min(int((ts - min_ts) / bucket_secs), num_buckets - 1)
        if up:
            buckets[idx]["positive"] += 1
        else:
            buckets[idx]["negative"] += 1

    for b in buckets:
        total = b["positive"] + b["negative"]
        b["ratio"] = round(b["positive"] / total, 3) if total else None
        b["total"] = total

    return buckets


# ── Full analysis ─────────────────────────────────────────────────────────────

def analyze(raw_reviews: list[dict]) -> dict:
    tag_counts: Counter = Counter()
    negative_texts: list[str] = []
    positive_texts: list[str] = []

    processed = []
    for r in raw_reviews:
        text = r.get("review", "") or ""
        tags = tag_review(text)
        tag_counts.update(tags)
        voted_up = r.get("voted_up", False)

        if not voted_up and text:
            negative_texts.append(text)
        elif voted_up and text:
            positive_texts.append(text)

        processed.append({
            "review_id":       r.get("recommendationid"),
            "author":          r.get("author", {}).get("steamid"),
            "playtime_hours":  round(r.get("author", {}).get("playtime_forever", 0) / 60, 1),
            "text":            text[:1000],   # cap stored text
            "voted_up":        voted_up,
            "votes_helpful":   r.get("votes_up", 0),
            "timestamp":       r.get("timestamp_created"),
            "tags":            tags,
        })

    total    = len(raw_reviews)
    positive = sum(1 for r in raw_reviews if r.get("voted_up"))
    negative = total - positive

    return {
        "total_reviews":    total,
        "positive":         positive,
        "negative":         negative,
        "positive_ratio":   round(positive / total, 3) if total else 0,
        "tag_counts":       dict(tag_counts.most_common()),
        "top_negative_phrases": top_phrases(negative_texts, n=20),
        "top_positive_phrases": top_phrases(positive_texts, n=10),
        "timeline":         sentiment_timeline(raw_reviews),
        "reviews":          processed[:500],   # return first 500 for the list view
    }
