# Reddit Post — r/gamedev

**Suggested subreddits (post to one at a time, space them a week apart):**
- r/gamedev — primary target, 1.2M members, allows tools/resources
- r/indiegaming — good secondary, more player-facing framing needed
- r/steam_dev (if applicable)

**Best posting time:** Tuesday–Thursday, 9–11am EST

**Title (pick one):**

> I got tired of manually reading 500 Steam reviews to figure out what to patch, so I built a tool that categorizes them automatically — free to try

> I built a Steam review analyzer for indie devs — paste your App ID, get a breakdown of what players are actually complaining about

---

## Post body

---

I released a small game last year and after a few months had ~400 reviews. Every time I sat down to prioritize my next patch, I'd spend an hour reading through them, trying to keep a mental tally of how many people mentioned crashes vs. how many were complaining about difficulty vs. how many just thought it was too short.

Eventually I gave up and built a tool instead. It's called **ReviewMiner**.

**What it does:**

- Paste any Steam App ID (or store URL) — it pulls up to 2,000 recent reviews
- Automatically tags each review across 6 issue categories: Bug/Crash, Performance, Content/Length, Difficulty, Price/Value, Controls/UI
- Shows which categories appear most frequently with a bar chart
- Surfaces the most common two-word phrases in negative reviews (so you see "collision detection" not just "gameplay feels bad")
- Plots your review sentiment over time so you can see if a patch actually moved the needle
- Click any category to filter and read the actual reviews that match

**It's free to try** — no account needed, just paste an App ID. I ran it on Hades and the top negative phrase was "early access" (from people who reviewed during EA and never updated). On a smaller indie game I tried, "save file" appeared 23 times in negative reviews. That dev had no idea saving was a known issue.

[Link when live]

I'm still polishing it so feedback is genuinely welcome — especially from devs who have tried other approaches to managing review feedback. Happy to add features if there's something obviously missing.

---

**Notes for posting:**
- Replace [Link when live] with actual URL before posting
- Consider attaching a screenshot of a recognizable game's results (Stardew, Hollow Knight, Hades) — visual proof of concept matters
- Respond to every comment for the first 2 hours — early engagement boosts visibility
- If asked about pricing, mention the free tier does 30 reviews and paid unlocks 2,000
- Don't post the same content to multiple subreddits simultaneously — space by at least 1 week
