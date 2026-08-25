'use client'

import { useEffect } from 'react'

export default function PWAUpdater() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return

    // When a new service worker takes control, reload to get fresh content
    let refreshing = false
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return
      refreshing = true
      window.location.reload()
    })

    // Proactively check for service worker updates on page load,
    // then periodically every 60 seconds. This is important for
    // standalone PWA mode where there are no navigation events
    // to trigger the browser's automatic update check.
    const checkForUpdate = () => {
      navigator.serviceWorker.ready.then((registration) => {
        registration.update()
      })
    }

    checkForUpdate()
    const interval = setInterval(checkForUpdate, 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  return null
}
