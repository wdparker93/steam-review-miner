import { useQuery } from '@tanstack/react-query'

const API_BASE = import.meta.env.VITE_BACKEND_URL ?? ''

async function fetchAnalysis(appId, licenseKey) {
  const params = new URLSearchParams()
  if (licenseKey) params.set('license_key', licenseKey)
  const res = await fetch(`${API_BASE}/api/analyze/${appId}?${params}`)
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail ?? `Error ${res.status}`)
  }
  return res.json()
}

export function useGameData(appId, licenseKey = '') {
  return useQuery({
    queryKey: ['game', appId, !!licenseKey],
    queryFn: () => fetchAnalysis(appId, licenseKey),
    enabled: !!appId,
    retry: 0,
    staleTime: 1000 * 60 * 30,
  })
}
