import { useState } from 'react'

function extractAppId(input) {
  // Accept raw app ID or full Steam URL
  const urlMatch = input.match(/\/app\/(\d+)/)
  if (urlMatch) return urlMatch[1]
  if (/^\d+$/.test(input.trim())) return input.trim()
  return null
}

export default function GameSearch({ onSearch, loading }) {
  const [value, setValue] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    const appId = extractAppId(value)
    if (!appId) {
      setError('Enter a Steam App ID (e.g. 413150) or a full Steam store URL.')
      return
    }
    onSearch(appId)
  }

  return (
    <div className="flex flex-col items-center gap-6 py-16 px-4">
      <h1 className="text-3xl font-bold text-white">ReviewMiner</h1>
      <p className="text-gray-400 text-center max-w-md">
        Paste a Steam App ID or store URL to get a structured breakdown of your game's reviews.
      </p>
      <form onSubmit={handleSubmit} className="w-full max-w-lg flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="413150  or  https://store.steampowered.com/app/413150"
          className="flex-1 rounded-lg border border-surface-600 bg-surface-800 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !value.trim()}
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Analyzing…' : 'Analyze'}
        </button>
      </form>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <p className="text-xs text-gray-600">
        Try: <button className="underline hover:text-gray-400" onClick={() => { setValue('413150'); }}>Stardew Valley</button>
        {' · '}
        <button className="underline hover:text-gray-400" onClick={() => { setValue('367520'); }}>Hollow Knight</button>
        {' · '}
        <button className="underline hover:text-gray-400" onClick={() => { setValue('1145360'); }}>Hades</button>
      </p>
    </div>
  )
}
