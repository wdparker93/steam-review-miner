import { useState } from 'react'
import { relativeDate, TAG_COLORS } from '../utils/formatters.js'

const FILTERS = ['All', 'Negative', 'Positive', 'Bug / Crash', 'Performance', 'Content / Length', 'Difficulty', 'Price / Value', 'Controls / UI']

export default function ReviewList({ reviews }) {
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')

  const visible = reviews.filter((r) => {
    if (filter === 'Negative' && r.voted_up) return false
    if (filter === 'Positive' && !r.voted_up) return false
    if (!['All', 'Negative', 'Positive'].includes(filter) && !r.tags.includes(filter)) return false
    if (search && !r.text.toLowerCase().includes(search.toLowerCase())) return false
    return true
  }).slice(0, 100)

  return (
    <div className="rounded-xl border border-surface-600 bg-surface-800 p-4">
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-3 py-0.5 text-xs transition-colors border
                ${filter === f
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'border-surface-600 text-gray-400 hover:border-gray-500 hover:text-gray-200'}`}
            >
              {f}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search review text…"
          className="rounded border border-surface-600 bg-surface-700 px-3 py-1 text-xs text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none sm:ml-auto"
        />
      </div>

      <p className="text-xs text-gray-600 mb-3">{visible.length} reviews shown</p>

      <div className="flex flex-col divide-y divide-surface-700">
        {visible.map((r) => (
          <div key={r.review_id} className="py-3">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-medium ${r.voted_up ? 'text-green-400' : 'text-red-400'}`}>
                {r.voted_up ? '▲ Positive' : '▼ Negative'}
              </span>
              <span className="text-xs text-gray-600">{relativeDate(r.timestamp)}</span>
              {r.playtime_hours > 0 && (
                <span className="text-xs text-gray-600">{r.playtime_hours}h played</span>
              )}
              {r.tags.map((tag) => (
                <span
                  key={tag}
                  className={`rounded-full px-2 py-0 text-xs ${TAG_COLORS[tag]?.bg ?? 'bg-gray-700'} ${TAG_COLORS[tag]?.text ?? 'text-gray-300'}`}
                >
                  {tag.split(' / ')[0]}
                </span>
              ))}
            </div>
            <p className="text-sm text-gray-300 line-clamp-3">{r.text || <span className="text-gray-600 italic">No text</span>}</p>
          </div>
        ))}
        {visible.length === 0 && (
          <p className="py-8 text-center text-gray-600 text-sm">No reviews match this filter.</p>
        )}
      </div>
    </div>
  )
}
