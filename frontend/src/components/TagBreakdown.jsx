import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { TAG_COLORS } from '../utils/formatters.js'

export default function TagBreakdown({ tagCounts, totalNegative }) {
  const data = Object.entries(tagCounts)
    .map(([tag, count]) => ({ tag, count, shortTag: tag.split(' / ')[0] }))
    .sort((a, b) => b.count - a.count)

  if (!data.length) return null

  return (
    <div className="rounded-xl border border-surface-600 bg-surface-800 p-4">
      <h3 className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-1">Issue Breakdown</h3>
      <p className="text-xs text-gray-600 mb-3">
        How often each issue category appears across all reviews (one review can match multiple tags)
      </p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} layout="vertical" margin={{ left: 0, right: 30, top: 0, bottom: 0 }}>
          <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="shortTag" width={90} tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip
            cursor={{ fill: 'rgba(255,255,255,0.04)' }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null
              const d = payload[0].payload
              return (
                <div className="rounded border border-surface-600 bg-surface-900 px-3 py-2 text-xs shadow-lg">
                  <p className="text-white font-medium">{d.tag}</p>
                  <p className="text-gray-400">{d.count} reviews mention this</p>
                </div>
              )
            }}
          />
          <Bar dataKey="count" radius={[0, 3, 3, 0]}>
            {data.map((d) => (
              <Cell key={d.tag} fill={TAG_COLORS[d.tag]?.bar ?? '#6b7280'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
