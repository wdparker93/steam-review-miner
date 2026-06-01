import GameCard from './GameCard.jsx'

export default function Dashboard({ savedGames, isPro, isFull, onOpen, onRemove, onNewSearch, lsMonthlyUrl, lsAnnualUrl }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-white">My Games</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {isPro
              ? `${savedGames.length} game${savedGames.length !== 1 ? 's' : ''} tracked`
              : `${savedGames.length} of 1 free slot used`}
          </p>
        </div>
        <button
          onClick={onNewSearch}
          disabled={isFull && !isPro}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          + Analyze a game
        </button>
      </div>

      {/* Pro upgrade banner */}
      {isFull && !isPro && (
        <div className="mb-4 rounded-xl border border-yellow-700/50 bg-yellow-900/20 p-4">
          <p className="text-sm font-medium text-yellow-300 mb-1">Upgrade to Pro to track unlimited games</p>
          <p className="text-xs text-yellow-600 mb-3">
            Free accounts save 1 game. Pro unlocks unlimited games, 2,000 reviews per analysis, and full CSV export.
          </p>
          <div className="flex gap-2">
            {lsMonthlyUrl && (
              <a href={lsMonthlyUrl} target="_blank" rel="noopener noreferrer"
                className="rounded-lg bg-yellow-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-yellow-500 transition-colors">
                $14/month
              </a>
            )}
            {lsAnnualUrl && (
              <a href={lsAnnualUrl} target="_blank" rel="noopener noreferrer"
                className="rounded-lg border border-yellow-600 px-3 py-1.5 text-xs font-medium text-yellow-300 hover:bg-yellow-900/40 transition-colors">
                $99/year — best value
              </a>
            )}
          </div>
        </div>
      )}

      {savedGames.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-20 text-center">
          <div className="text-4xl">🎮</div>
          <h3 className="text-base font-medium text-gray-300">No games tracked yet</h3>
          <p className="text-sm text-gray-500 max-w-sm">
            Analyze a game and it'll be saved here automatically.
          </p>
          <button
            onClick={onNewSearch}
            className="mt-1 rounded-lg border border-surface-600 px-4 py-2 text-sm text-gray-300 hover:border-blue-600 hover:text-blue-400 transition-colors"
          >
            Analyze your first game →
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {savedGames.map(game => (
            <GameCard
              key={game.app_id}
              game={game}
              onOpen={onOpen}
              onRemove={onRemove}
            />
          ))}
        </div>
      )}
    </div>
  )
}
