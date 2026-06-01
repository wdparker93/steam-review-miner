# ReviewMiner — Deployment & Monetization Plan

Estimated time to live: **~2 hours**

---

## Pricing

| Tier | Price | What you get |
|---|---|---|
| **Free** | $0 forever | 30 reviews per analysis, any game, no account |
| **Pro Monthly** | $14/month | 2,000 reviews per game, unlimited games |
| **Pro Annual** | $99/year | Same as Pro Monthly, ~41% savings |

Free tier is the hook — a developer pastes their App ID, sees real signal from 30 reviews,
and immediately understands why they want 2,000.

---

## Step 1 — LemonSqueezy product setup (~15 min)

You already have a LemonSqueezy account. Log in and:

1. Go to **Store → Products → New Product**
2. Name: `ReviewMiner Pro`
3. Add two **Variants**:
   - `Pro Monthly` → $14.00 → Billing: Monthly → check **License keys**
   - `Pro Annual`  → $99.00 → Billing: One-time (annual) → check **License keys**
4. Under **License keys**: set "Activation limit" to 1 (one device/instance per key)
5. Save. Copy the **Checkout URL** for each variant — you'll paste these into the frontend.
6. Go to **Settings → API** → create an API key. Copy it — this is `LEMONSQUEEZY_API_KEY`.

---

## Step 2 — Deploy the backend to Railway (~20 min)

Railway handles Python/FastAPI with zero config.

1. Go to **railway.app** → New Project → Deploy from GitHub repo
2. Select `wdparker93/steam-review-miner`
3. Set the **Root Directory** to `backend`
4. Railway auto-detects the `Procfile` and runs uvicorn
5. Under **Variables**, add:
   ```
   LEMONSQUEEZY_API_KEY=<your LS API key>
   ALLOWED_ORIGINS=https://your-vercel-app.vercel.app
   ```
   (You'll update ALLOWED_ORIGINS after Vercel gives you a URL in Step 3)
6. Railway assigns a URL like `https://reviewminer-backend.railway.app` — copy it

---

## Step 3 — Deploy the frontend to Vercel (~15 min)

1. Go to **vercel.com** → New Project → Import `steam-review-miner`
2. Set **Root Directory** to `frontend`
3. Framework preset: **Vite**
4. Under **Environment Variables**, add:
   ```
   VITE_BACKEND_URL=https://reviewminer-backend.railway.app
   VITE_LS_MONTHLY_URL=<LemonSqueezy monthly checkout URL>
   VITE_LS_ANNUAL_URL=<LemonSqueezy annual checkout URL>
   ```
5. Edit `frontend/vercel.json` — replace `your-railway-app.railway.app` with your actual Railway URL
6. Deploy. Vercel gives you `https://steam-review-miner.vercel.app` (or set a custom domain)
7. Go back to Railway → update `ALLOWED_ORIGINS` to your Vercel URL → redeploy

---

## Step 4 — Wire up backend URL in frontend (~10 min)

Update `frontend/src/hooks/useGameData.js` — replace the hardcoded `/api` proxy with:

```js
const API_BASE = import.meta.env.VITE_BACKEND_URL ?? ''

async function fetchAnalysis(appId, licenseKey = '') {
  const params = new URLSearchParams({ ...(licenseKey && { license_key: licenseKey }) })
  const res = await fetch(`${API_BASE}/api/analyze/${appId}?${params}`)
  // ...
}
```

And add the upgrade prompt to the results page — when `data.limit_hit === true`, show:
> "Showing 30 of X reviews. [Upgrade to Pro →] to analyze up to 2,000."

---

## Step 5 — Add license key entry to the UI (~20 min)

Add a small "Enter license key" input to the header or a settings panel.
- On submit, call `POST /api/validate-license` → `{ license_key }`
- If `valid: true`, store key in `localStorage` and re-run analysis
- Show a ✓ Pro badge in the header when active

---

## Step 6 — Test the full payment flow (~15 min)

1. Open your LemonSqueezy product in test mode
2. Use the test checkout to buy a license
3. Copy the license key from the confirmation email
4. Paste it into ReviewMiner
5. Confirm that 2,000 reviews load instead of 30
6. Confirm the ✓ Pro badge appears

---

## Step 7 — Go live checklist

- [ ] Railway backend deployed and returning 200 on `/healthz`
- [ ] Vercel frontend deployed and loading at public URL
- [ ] CORS set correctly (Railway ALLOWED_ORIGINS = Vercel URL)
- [ ] LemonSqueezy product in **Live** mode (not test)
- [ ] Full payment flow tested with real card
- [ ] Free tier limit (30 reviews) confirmed working without a key
- [ ] Pro tier (2,000 reviews) confirmed working with a valid key
- [ ] Reddit post ready to go (see `marketing/reddit-gamedev-post.md`)

---

## Ongoing costs

| Service | Cost |
|---|---|
| Railway (backend) | ~$5/month (hobby plan) or usage-based |
| Vercel (frontend) | Free (hobby tier is plenty) |
| LemonSqueezy | 5% + $0.50 per transaction |
| **Total at 0 subscribers** | ~$5/month |
| **Break-even** | 1 Pro subscriber at $14/month |

---

## First 30-day goal

200 free signups, 15 paid conversions = $210 MRR.
Post to r/gamedev once live. One credible engagement in a game-dev Discord
(GDC, Indie Dev Monday) converts better than 10 Reddit posts.
