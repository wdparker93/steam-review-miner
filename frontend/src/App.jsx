import { useState } from 'react'
import { useGameData }      from './hooks/useGameData.js'
import { useLicense }       from './hooks/useLicense.js'
import { useGameLibrary }   from './hooks/useGameLibrary.js'
import GameSearch           from './components/GameSearch.jsx'
import ReviewStats          from './components/ReviewStats.jsx'
import TagBreakdown         from './components/TagBreakdown.jsx'
import SentimentTimeline    from './components/SentimentTimeline.jsx'
import TopPhrases           from './components/TopPhrases.jsx'
import ReviewList           from './components/ReviewList.jsx'
import ExportButton         from './components/ExportButton.jsx'
import Dashboard            from './components/Dashboard.jsx'

const LS_CHECKOUT_URL = 'https://app.lemonsqueezy.com/share/1121206'
const LS_MONTHLY_URL = import.meta.env.VITE_LS_MONTHLY_URL ?? LS_CHECKOUT_URL
const LS_ANNUAL_URL  = import.meta.env.VITE_LS_ANNUAL_URL  ?? LS_CHECKOUT_URL

// ── License key input (inline header widget) ──────────────────────────────────
function LicenseWidget({ isPro, licenseKey, checking, error, onSubmit, onClear }) {
  const [show, setShow] = useState(false)
  const [val,  setVal]  = useState('')

  if (isPro) return (
    <div className="flex items-center gap-2">
      <span className="rounded-full bg-yellow-500/20 border border-yellow-600/50 px-2.5 py-0.5 text-xs font-medium text-yellow-400">
        ✓ Pro
      </span>
      <button onClick={onClear} className="text-xs text-gray-600 hover:text-gray-400">Sign out</button>
    </div>
  )

  return (
    <div className="relative">
      {!show ? (
        <button
          onClick={() => setShow(true)}
          className="text-xs text-gray-500 hover:text-blue-400 underline transition-colors"
        >
          Enter license key
        </button>
      ) : (
        <form
          onSubmit={async (e) => {
            e.preventDefault()
            const ok = await onSubmit(val.trim())
            if (ok) setShow(false)
          }}
          className="flex gap-1.5 items-center"
        >
          <input
            autoFocus
            type="text"
            value={val}
            onChange={(e) => setVal(e.target.value)}
            placeholder="XXXX-XXXX-XXXX-XXXX"
            className="rounded border border-surface-600 bg-surface-700 px-2 py-1 text-xs text-white placeholder-gray-600 focus:border-blue-500 focus:outline-none w-44"
          />
          <button
            type="submit"
            disabled={checking || !val.trim()}
            className="rounded bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-500 disabled:opacity-50"
          >
            {checking ? '…' : 'Activate'}
          </button>
          <button type="button" onClick={() => setShow(false)} className="text-xs text-gray-600 hover:text-gray-400">✕</button>
          {error && <p className="text-xs text-red-400 ml-1">{error}</p>}
        </form>
      )}
    </div>
  )
}

// ── Upgrade banner shown when free limit is hit ───────────────────────────────
function UpgradeBanner({ totalInDb, onActivate }) {
  return (
    <div className="rounded-xl border border-yellow-700/40 bg-yellow-900/10 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-yellow-300">
        Showing <strong>30 of {totalInDb?.toLocaleString() ?? '?'}</strong> reviews.
        Upgrade to Pro to analyze up to 2,000.
      </p>
      <div className="flex gap-2">
        <a href={LS_MONTHLY_URL} target="_blank" rel="noopener noreferrer"
          className="rounded-lg bg-yellow-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-yellow-500 transition-colors">
          $14/month
        </a>
        <a href={LS_ANNUAL_URL} target="_blank" rel="noopener noreferrer"
          className="rounded-lg border border-yellow-600 px-3 py-1.5 text-xs font-medium text-yellow-300 hover:bg-yellow-900/40 transition-colors">
          $99/year
        </a>
        <button onClick={onActivate}
          className="rounded-lg border border-surface-600 px-3 py-1.5 text-xs text-gray-400 hover:border-gray-400 transition-colors">
          I have a key
        </button>
      </div>
    </div>
  )
}

// ── Main app ──────────────────────────────────────────────────────────────────
export default function App() {
  const [view,   setView]   = useState('search')   // 'search' | 'dashboard' | 'analysis'
  const [appId,  setAppId]  = useState(null)
  const [showKey, setShowKey] = useState(false)

  const { licenseKey, isPro, checking, error, setLicenseKey, clearLicense } = useLicense()
  const { savedGames, addGame, removeGame, canAdd, isFull } = useGameLibrary(isPro)
  const { data, isLoading, isError, error: fetchError } = useGameData(appId, licenseKey)

  // Auto-save to library when analysis completes
  if (data && appId && !isLoading) {
    const isAlreadySaved = savedGames.some(g => String(g.app_id) === String(appId))
    if (!isAlreadySaved && (isPro || canAdd)) {
      addGame(appId, data.game, data)
    }
  }

  function openGame(id) {
    setAppId(id)
    setView('analysis')
  }

  function handleSearch(id) {
    setAppId(id)
    setView('analysis')
  }

  return (
    <div className="min-h-screen bg-surface-900">
      {/* ── Header ── */}
      <header className="border-b border-surface-700 bg-surface-800 px-6 py-3">
        <div className="mx-auto max-w-5xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setView('search')}
              className="text-sm font-semibold text-white hover:text-blue-400 transition-colors"
            >
              ReviewMiner
            </button>
            <nav className="flex items-center gap-1">
              <button
                onClick={() => setView('dashboard')}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs transition-colors
                  ${view === 'dashboard'
                    ? 'bg-surface-700 text-white'
                    : 'text-gray-500 hover:text-gray-200'}`}
              >
                Dashboard
                {savedGames.length > 0 && (
                  <span className="rounded-full bg-blue-600 px-1.5 py-0 text-xs text-white leading-4">
                    {savedGames.length}
                  </span>
                )}
              </button>
            </nav>
          </div>

          <LicenseWidget
            isPro={isPro}
            licenseKey={licenseKey}
            checking={checking}
            error={error}
            onSubmit={setLicenseKey}
            onClear={clearLicense}
          />
        </div>
      </header>

      {/* ── Views ── */}
      <main className="mx-auto max-w-5xl px-4 py-6">

        {/* Search */}
        {view === 'search' && (
          <GameSearch onSearch={handleSearch} loading={false} />
        )}

        {/* Dashboard */}
        {view === 'dashboard' && (
          <Dashboard
            savedGames={savedGames}
            isPro={isPro}
            isFull={isFull}
            onOpen={openGame}
            onRemove={removeGame}
            onNewSearch={() => setView('search')}
            lsMonthlyUrl={LS_MONTHLY_URL}
            lsAnnualUrl={LS_ANNUAL_URL}
          />
        )}

        {/* Analysis */}
        {view === 'analysis' && (
          <>
            {/* Back + search bar */}
            <div className="mb-4 flex gap-2">
              <button
                onClick={() => setView(savedGames.length ? 'dashboard' : 'search')}
                className="rounded-lg border border-surface-600 px-3 py-2 text-xs text-gray-400 hover:text-white transition-colors"
              >
                ← Back
              </button>
              <input
                placeholder="Enter another App ID…"
                className="flex-1 max-w-xs rounded-lg border border-surface-600 bg-surface-800 px-4 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const id = e.target.value.match(/\d+/)?.[0]
                    if (id) { setAppId(id); e.target.value = '' }
                  }
                }}
              />
            </div>

            {isLoading && (
              <div className="flex flex-col items-center gap-4 py-24 text-gray-500">
                <div className="animate-spin text-3xl">⟳</div>
                <p className="text-sm">Fetching reviews from Steam…</p>
                <p className="text-xs text-gray-600">
                  {isPro ? 'Up to 2,000 reviews — may take 30–60s' : '30 reviews — should be quick'}
                </p>
              </div>
            )}

            {isError && (
              <div className="rounded-xl border border-red-800 bg-red-900/20 p-6 text-center">
                <p className="text-red-300 font-medium">{fetchError?.message}</p>
              </div>
            )}

            {data && !isLoading && (
              <div className="flex flex-col gap-4">
                {/* Stats + export */}
                <div className="flex flex-col gap-3">
                  <ReviewStats game={data.game} data={data} />
                  <div className="flex justify-end">
                    <ExportButton gameName={data.game.name} data={data} isPro={isPro} />
                  </div>
                </div>

                {/* Upgrade banner */}
                {data.limit_hit && (
                  <UpgradeBanner
                    totalInDb={data.game?.total_reviews}
                    onActivate={() => setShowKey(true)}
                  />
                )}

                <div className="grid sm:grid-cols-2 gap-4">
                  <TagBreakdown tagCounts={data.tag_counts} />
                  <TopPhrases negative={data.top_negative_phrases} positive={data.top_positive_phrases} />
                </div>

                <SentimentTimeline timeline={data.timeline} />
                <ReviewList reviews={data.reviews} />
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
