import { useState } from 'react'
import { useGameData } from './hooks/useGameData.js'
import GameSearch from './components/GameSearch.jsx'
import ReviewStats from './components/ReviewStats.jsx'
import TagBreakdown from './components/TagBreakdown.jsx'
import SentimentTimeline from './components/SentimentTimeline.jsx'
import TopPhrases from './components/TopPhrases.jsx'
import ReviewList from './components/ReviewList.jsx'

export default function App() {
  const [appId, setAppId] = useState(null)
  const { data, isLoading, isError, error } = useGameData(appId)

  return (
    <div className="min-h-screen bg-surface-900">
      {/* Header */}
      <header className="border-b border-surface-700 bg-surface-800 px-6 py-3 flex items-center justify-between">
        <button onClick={() => setAppId(null)} className="text-sm font-semibold text-white hover:text-blue-400 transition-colors">
          ReviewMiner
        </button>
        <span className="text-xs text-gray-600">Steam Review Analytics for Indie Devs</span>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        {/* Search — always visible at top when a game is loaded */}
        {appId && (
          <div className="mb-4 flex gap-2">
            <input
              placeholder="Enter another App ID…"
              className="flex-1 max-w-sm rounded-lg border border-surface-600 bg-surface-800 px-4 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
              onKeyDown={(e) => { if (e.key === 'Enter') setAppId(e.target.value.match(/\d+/)?.[0] ?? null) }}
            />
            <button
              onClick={() => setAppId(null)}
              className="rounded-lg border border-surface-600 px-4 py-2 text-sm text-gray-300 hover:border-gray-400 hover:text-white transition-colors"
            >
              ← New search
            </button>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center gap-4 py-24 text-gray-500">
            <div className="animate-spin text-3xl">⟳</div>
            <p className="text-sm">Fetching up to 2,000 reviews from Steam…</p>
            <p className="text-xs text-gray-600">This takes 15–45 seconds depending on review count.</p>
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="rounded-xl border border-red-800 bg-red-900/20 p-6 text-center">
            <p className="text-red-300 font-medium">{error?.message}</p>
            <button onClick={() => setAppId(null)} className="mt-3 text-sm text-gray-400 hover:text-white underline">
              Try another game
            </button>
          </div>
        )}

        {/* No game selected */}
        {!appId && !isLoading && <GameSearch onSearch={setAppId} loading={isLoading} />}

        {/* Results */}
        {data && !isLoading && (
          <div className="flex flex-col gap-4">
            <ReviewStats game={data.game} data={data} />

            <div className="grid sm:grid-cols-2 gap-4">
              <TagBreakdown tagCounts={data.tag_counts} totalNegative={data.negative} />
              <TopPhrases negative={data.top_negative_phrases} positive={data.top_positive_phrases} />
            </div>

            <SentimentTimeline timeline={data.timeline} />
            <ReviewList reviews={data.reviews} />
          </div>
        )}
      </main>
    </div>
  )
}
