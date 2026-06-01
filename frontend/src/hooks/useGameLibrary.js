import { useState, useCallback } from 'react'

const LS_KEY      = 'rm_library'
const FREE_LIMIT  = 1   // free users: one saved game in dashboard
const PRO_LIMIT   = Infinity

function load() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) ?? '{}') }
  catch { return {} }
}

function save(lib) {
  localStorage.setItem(LS_KEY, JSON.stringify(lib))
}

export function useGameLibrary(isPro) {
  const [library, setLibrary] = useState(load)

  const savedGames = Object.values(library)
    .sort((a, b) => b.cached_at - a.cached_at)

  const limit    = isPro ? PRO_LIMIT : FREE_LIMIT
  const canAdd   = savedGames.length < limit
  const isFull   = !isPro && savedGames.length >= FREE_LIMIT

  const addGame = useCallback((appId, gameInfo, analysisData) => {
    setLibrary(prev => {
      const next = {
        ...prev,
        [appId]: {
          app_id:           appId,
          name:             gameInfo.name,
          header_image:     gameInfo.header_image,
          developers:       gameInfo.developers,
          positive_ratio:   analysisData.positive_ratio,
          positive:         analysisData.positive,
          negative:         analysisData.negative,
          total_reviews:    analysisData.total_reviews,
          tag_counts:       analysisData.tag_counts,
          top_negative_phrases: analysisData.top_negative_phrases?.slice(0, 5),
          is_pro:           analysisData.is_pro,
          cached_at:        Date.now(),
        },
      }
      save(next)
      return next
    })
  }, [])

  const removeGame = useCallback((appId) => {
    setLibrary(prev => {
      const next = { ...prev }
      delete next[String(appId)]
      save(next)
      return next
    })
  }, [])

  return { savedGames, addGame, removeGame, canAdd, isFull }
}
