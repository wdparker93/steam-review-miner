import { useState, useEffect, useCallback } from 'react'

const LS_KEY = 'rm_license_key'

export function useLicense() {
  const [licenseKey, setLicenseKeyRaw] = useState(() => localStorage.getItem(LS_KEY) ?? '')
  const [isPro, setIsPro] = useState(false)
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState('')

  // Validate stored key on mount
  useEffect(() => {
    const stored = localStorage.getItem(LS_KEY)
    if (stored) validate(stored, false)
  }, [])

  const validate = useCallback(async (key, showError = true) => {
    if (!key) { setIsPro(false); return false }
    setChecking(true)
    setError('')
    try {
      const res = await fetch('/api/validate-license', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ license_key: key }),
      })
      const body = await res.json()
      setIsPro(!!body.valid)
      if (!body.valid && showError) setError('License key not valid or expired.')
      return !!body.valid
    } catch {
      if (showError) setError('Could not reach server to validate key.')
      return false
    } finally {
      setChecking(false)
    }
  }, [])

  const setLicenseKey = useCallback(async (key) => {
    setLicenseKeyRaw(key)
    localStorage.setItem(LS_KEY, key)
    return validate(key)
  }, [validate])

  const clearLicense = useCallback(() => {
    setLicenseKeyRaw('')
    setIsPro(false)
    localStorage.removeItem(LS_KEY)
  }, [])

  return { licenseKey, isPro, checking, error, setLicenseKey, clearLicense }
}
