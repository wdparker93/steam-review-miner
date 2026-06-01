import { TAG_COLORS, pct } from '../utils/formatters.js'

const TOP_TAGS = 3

function ScoreBadge({ ratio }) {
  const pctVal = Math.round(ratio * 100)
  const color  = ratio >= 0.8 ? 'text-green-400 border-green-700'
    : ratio >= 0.6 ? 'text-yellow-400 border-yellow-700'
    : 'text-red-400 border-red-700'
  return (
    <span className={`rounded-full border px-2 py-0.5 text-xs font-mono font-semibold ${color}`}>
      {pctVal}%
    </span>
  )
}

export default function GameCard({ game, onOpen, onRemove }) {
  const topTags = Object.entries(game.tag_counts ?? {})
    .sort(([, a], [, b]) => b - a)
    .slice(0, TOP_TAGS)

  const topPhrase = game.top_negative_phrases?.[0]?.phrase

  return (
    <div className="group relative rounded-xl border border-surface-600 bg-surface-800 overflow-hidden hover:border-gray-500 transition-colors">
      {/* Header image as subtle background */}
      {game.header_image && (
        <div
          className="absolute inset-0 opacity-10 bg-cover bg-center"
          style={{ backgroundImage: `url(${game.header_image})` }}
        />
      )}

      <div className="relative p-4">
        {/* Remove button */}
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(game.app_id) }}
          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 text-xs transition-all"
          title="Remove from dashboard"
        >
          ✕
        </button>

        <div className="flex items-start gap-3 mb-3">
          {game.header_image && (
            <img src={game.header_image} alt="" className="h-10 w-16 rounded object-cover shrink-0" />
          )}
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-white truncate">{game.name}</h3>
            <p className="text-xs text-gray-500 truncate">{game.developers?.join(', ')}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <ScoreBadge ratio={game.positive_ratio} />
          <span className="text-xs text-gray-500">{game.total_reviews.toLocaleString()} reviews</span>
          {game.is_pro && (
            <span className="text-xs text-yellow-500 border border-yellow-700/50 rounded-full px-1.5 py-0.5">Pro</span>
          )}
        </div>

        {/* Top issue tags */}
        <div className="flex flex-wrap gap-1 mb-2">
          {topTags.map(([tag, count]) => (
            <span
              key={tag}
              className={`rounded-full px-2 py-0.5 text-xs ${TAG_COLORS[tag]?.bg ?? 'bg-gray-700'} ${TAG_COLORS[tag]?.text ?? 'text-gray-300'}`}
            >
              {tag.split(' / ')[0]} · {count}
            </span>
          ))}
        </div>

        {/* Top complaint */}
        {topPhrase && (
          <p className="text-xs text-gray-500 italic truncate">
            Top complaint: "<span className="text-gray-300">{topPhrase}</span>"
          </p>
        )}

        <button
          onClick={() => onOpen(String(game.app_id))}
          className="mt-3 w-full rounded-lg border border-surface-600 py-1.5 text-xs text-gray-400 hover:border-blue-600 hover:text-blue-400 transition-colors"
        >
          Open full analysis →
        </button>
      </div>
    </div>
  )
}
