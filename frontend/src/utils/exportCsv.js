function escapeCsv(val) {
  const s = String(val ?? '')
  return s.includes(',') || s.includes('"') || s.includes('\n')
    ? `"${s.replace(/"/g, '""')}"`
    : s
}

function buildCsv(rows) {
  return rows.map(row => row.map(escapeCsv).join(',')).join('\n')
}

function download(filename, content) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function exportReviewsCsv(gameName, reviews) {
  const header = ['Date', 'Sentiment', 'Playtime (hrs)', 'Helpful Votes', 'Tags', 'Review Text']
  const rows   = reviews.map(r => [
    r.timestamp ? new Date(r.timestamp * 1000).toISOString().slice(0, 10) : '',
    r.voted_up ? 'Positive' : 'Negative',
    r.playtime_hours ?? '',
    r.votes_helpful ?? '',
    (r.tags ?? []).join('; '),
    r.text ?? '',
  ])
  download(
    `${gameName.replace(/[^a-z0-9]/gi, '_')}_reviews.csv`,
    buildCsv([header, ...rows])
  )
}

export function exportSummaryCsv(gameName, data) {
  const { positive_ratio, positive, negative, total_reviews, tag_counts,
          top_negative_phrases, top_positive_phrases } = data

  const rows = [
    ['ReviewMiner — Summary Export'],
    ['Game', gameName],
    ['Total Analyzed', total_reviews],
    ['Positive', positive],
    ['Negative', negative],
    ['Score', `${Math.round(positive_ratio * 100)}%`],
    [],
    ['Issue Category', 'Count', '% of Reviews'],
    ...Object.entries(tag_counts ?? {}).map(([tag, count]) => [
      tag, count, `${((count / total_reviews) * 100).toFixed(1)}%`,
    ]),
    [],
    ['Top Negative Phrases', 'Count'],
    ...(top_negative_phrases ?? []).map(p => [p.phrase, p.count]),
    [],
    ['Top Positive Phrases', 'Count'],
    ...(top_positive_phrases ?? []).map(p => [p.phrase, p.count]),
  ]

  download(
    `${gameName.replace(/[^a-z0-9]/gi, '_')}_summary.csv`,
    buildCsv(rows)
  )
}
