import { useState } from 'react'
import { exportReviewsCsv, exportSummaryCsv } from '../utils/exportCsv.js'

export default function ExportButton({ gameName, data, isPro }) {
  const [open, setOpen] = useState(false)

  function handle(type) {
    setOpen(false)
    if (type === 'reviews') exportReviewsCsv(gameName, data.reviews)
    if (type === 'summary') exportSummaryCsv(gameName, data)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 rounded-lg border border-surface-600 bg-surface-700 px-3 py-1.5 text-xs text-gray-300 hover:border-gray-500 hover:text-white transition-colors"
      >
        ↓ Export CSV
        <span className="text-gray-600">▾</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-20 w-52 rounded-lg border border-surface-600 bg-surface-800 shadow-xl overflow-hidden">
            <button
              onClick={() => handle('summary')}
              className="w-full px-4 py-2.5 text-left text-xs text-gray-300 hover:bg-surface-700 transition-colors"
            >
              <div className="font-medium text-white">Export Summary</div>
              <div className="text-gray-500">Tag counts, scores, top phrases</div>
            </button>
            <div className="border-t border-surface-700" />
            <button
              onClick={() => isPro ? handle('reviews') : null}
              className={`w-full px-4 py-2.5 text-left text-xs transition-colors
                ${isPro
                  ? 'text-gray-300 hover:bg-surface-700'
                  : 'opacity-50 cursor-not-allowed'}`}
            >
              <div className="font-medium text-white flex items-center gap-2">
                Export Reviews
                {!isPro && <span className="rounded-full bg-yellow-500/20 px-1.5 py-0.5 text-yellow-400 text-xs">Pro</span>}
              </div>
              <div className="text-gray-500">
                {isPro ? 'One row per review with tags' : 'Upgrade to export all reviews'}
              </div>
            </button>
          </div>
        </>
      )}
    </div>
  )
}
