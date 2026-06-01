export const pct = (n) => `${Math.round((n ?? 0) * 100)}%`

export const relativeDate = (ts) => {
  if (!ts) return '—'
  const d = new Date(ts * 1000)
  const diff = (Date.now() - d.getTime()) / 86400000
  if (diff < 1)  return 'today'
  if (diff < 7)  return `${Math.round(diff)}d ago`
  if (diff < 30) return `${Math.round(diff / 7)}w ago`
  if (diff < 365) return `${Math.round(diff / 30)}mo ago`
  return `${Math.round(diff / 365)}y ago`
}

export const TAG_COLORS = {
  'Bug / Crash':     { bar: '#ef4444', bg: 'bg-red-500/20',    text: 'text-red-400'    },
  'Performance':     { bar: '#f97316', bg: 'bg-orange-500/20', text: 'text-orange-400' },
  'Content / Length':{ bar: '#eab308', bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
  'Difficulty':      { bar: '#a855f7', bg: 'bg-purple-500/20', text: 'text-purple-400' },
  'Price / Value':   { bar: '#3b82f6', bg: 'bg-blue-500/20',   text: 'text-blue-400'   },
  'Controls / UI':   { bar: '#14b8a6', bg: 'bg-teal-500/20',   text: 'text-teal-400'   },
}
