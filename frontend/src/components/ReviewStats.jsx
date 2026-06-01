import { pct } from '../utils/formatters.js'

export default function ReviewStats({ game, data }) {
  const scoreColor = data.positive_ratio >= 0.8
    ? 'text-green-400'
    : data.positive_ratio >= 0.6
    ? 'text-yellow-400'
    : 'text-red-400'

  return (
    <div className="rounded-xl border border-surface-600 bg-surface-800 overflow-hidden">
      <div className="flex gap-4 p-4 items-center border-b border-surface-600">
        {game.header_image && (
          <img src={game.header_image} alt={game.name} className="h-16 rounded object-cover" />
        )}
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-white truncate">{game.name}</h2>
          <p className="text-xs text-gray-500">{game.developers?.join(', ')} · {game.release_date}</p>
          <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{game.short_description}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-surface-600">
        {[
          { label: 'Analyzed',  value: data.total_reviews.toLocaleString() },
          { label: 'Positive',  value: data.positive.toLocaleString(), extra: `(${pct(data.positive_ratio)})`, color: scoreColor },
          { label: 'Negative',  value: data.negative.toLocaleString() },
          { label: 'Score',     value: pct(data.positive_ratio), color: scoreColor },
        ].map((s) => (
          <div key={s.label} className="bg-surface-800 px-4 py-3">
            <p className="text-xs text-gray-500 mb-0.5">{s.label}</p>
            <p className={`text-lg font-semibold font-mono ${s.color ?? 'text-white'}`}>
              {s.value}
              {s.extra && <span className="text-xs text-gray-500 ml-1">{s.extra}</span>}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
