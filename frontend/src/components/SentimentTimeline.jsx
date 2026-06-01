import { LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts'
import { useState } from 'react'

export default function SentimentTimeline({ timeline }) {
  const [patches, setPatches] = useState([])
  const [input, setInput] = useState('')

  const data = timeline.filter(b => b.total >= 2)
  if (!data.length) return null

  function addPatch(e) {
    e.preventDefault()
    if (input && !patches.includes(input)) setPatches([...patches, input].sort())
    setInput('')
  }

  return (
    <div className="rounded-xl border border-surface-600 bg-surface-800 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-widest text-gray-400">Sentiment Over Time</h3>
          <p className="text-xs text-gray-600 mt-0.5">Positive review ratio per 2-week bucket</p>
        </div>
        <form onSubmit={addPatch} className="flex gap-2">
          <input
            type="date"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="rounded border border-surface-600 bg-surface-700 px-2 py-1 text-xs text-white focus:border-blue-500 focus:outline-none"
          />
          <button
            type="submit"
            className="rounded border border-surface-600 px-2 py-1 text-xs text-gray-300 hover:border-blue-500 hover:text-blue-400"
          >
            + Patch date
          </button>
        </form>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ left: 0, right: 10, top: 4, bottom: 0 }}>
          <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false}
            tickFormatter={(d) => d.slice(0, 7)} interval="preserveStartEnd" />
          <YAxis domain={[0, 1]} tickFormatter={(v) => `${Math.round(v * 100)}%`}
            tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} width={36} />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null
              const d = payload[0].payload
              return (
                <div className="rounded border border-surface-600 bg-surface-900 px-3 py-2 text-xs shadow-lg">
                  <p className="text-gray-400">{label}</p>
                  <p className="text-white">{Math.round((d.ratio ?? 0) * 100)}% positive</p>
                  <p className="text-gray-500">{d.total} reviews</p>
                </div>
              )
            }}
          />
          {patches.map((p) => (
            <ReferenceLine key={p} x={p} stroke="#3b82f6" strokeDasharray="4 2"
              label={{ value: 'patch', fill: '#3b82f6', fontSize: 9 }} />
          ))}
          <Line type="monotone" dataKey="ratio" stroke="#22c55e" strokeWidth={2}
            dot={false} connectNulls />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
