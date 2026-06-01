import { useQuery } from '@tanstack/react-query'

async function fetchAnalysis(appId) {
  const res = await fetch(`/api/analyze/${appId}`)
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail ?? `Error ${res.status}`)
  }
  return res.json()
}

export function useGameData(appId) {
  return useQuery({
    queryKey: ['game', appId],
    queryFn: () => fetchAnalysis(appId),
    enabled: !!appId,
    retry: 0,
    staleTime: 1000 * 60 * 30,   // cache for 30 min
  })
}
