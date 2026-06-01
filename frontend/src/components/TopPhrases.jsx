export default function TopPhrases({ negative, positive }) {
  if (!negative?.length && !positive?.length) return null
  const maxNeg = negative[0]?.count ?? 1

  return (
    <div className="rounded-xl border border-surface-600 bg-surface-800 p-4">
      <h3 className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-3">Top Phrases</h3>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-red-400 font-medium mb-2">In negative reviews</p>
          <div className="flex flex-col gap-1.5">
            {negative.slice(0, 12).map(({ phrase, count }) => (
              <div key={phrase} className="flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs text-gray-300 font-mono truncate">{phrase}</span>
                    <span className="text-xs text-gray-500 ml-2 shrink-0">{count}</span>
                  </div>
                  <div className="h-1 w-full rounded-full bg-surface-600">
                    <div
                      className="h-1 rounded-full bg-red-500"
                      style={{ width: `${Math.round((count / maxNeg) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs text-green-400 font-medium mb-2">In positive reviews</p>
          <div className="flex flex-wrap gap-2">
            {positive.slice(0, 12).map(({ phrase, count }) => (
              <span
                key={phrase}
                className="rounded-full bg-green-900/40 border border-green-700/40 px-2 py-0.5 text-xs text-green-300 font-mono"
              >
                {phrase} <span className="text-green-600">{count}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
