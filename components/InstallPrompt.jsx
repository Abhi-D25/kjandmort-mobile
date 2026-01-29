'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Download, X, Smartphone } from 'lucide-react'

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Check if already installed
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone ||
      document.referrer.includes('android-app://');
    
    setIsStandalone(isInStandaloneMode)

    // Check if dismissed before
    const isDismissed = localStorage.getItem('pwa-install-dismissed')
    if (isDismissed) {
      const dismissedTime = parseInt(isDismissed)
      // Show again after 7 days
      if (Date.now() - dismissedTime < 7 * 24 * 60 * 60 * 1000) {
        setDismissed(true)
      }
    }

    // Check if iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
    setIsIOS(isIOSDevice)

    // Listen for beforeinstallprompt event (Chrome, Edge, etc.)
    const handleBeforeInstall = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)

    // Show iOS prompt after a delay if not installed
    if (isIOSDevice && !isInStandaloneMode && !isDismissed) {
      setTimeout(() => {
        setShowPrompt(true)
      }, 3000)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      setShowPrompt(false)
    }
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    localStorage.setItem('pwa-install-dismissed', Date.now().toString())
    setDismissed(true)
    setShowPrompt(false)
  }

  // Don't show if already installed, dismissed, or no prompt available
  if (isStandalone || dismissed || !showPrompt) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 animate-in slide-in-from-bottom-4 duration-300">
      <Card className="bg-gradient-to-r from-purple-600 to-pink-600 border-0 shadow-2xl">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="bg-white/20 rounded-full p-2 flex-shrink-0">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-semibold text-sm mb-1">
                Install Cuisine Tour App
              </h3>
              {isIOS ? (
                <p className="text-white/90 text-xs mb-3">
                  Tap <span className="inline-flex items-center bg-white/20 px-1 rounded mx-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                    </svg>
                  </span> then "Add to Home Screen"
                </p>
              ) : (
                <p className="text-white/90 text-xs mb-3">
                  Get quick access from your home screen with offline support!
                </p>
              )}
              <div className="flex gap-2">
                {!isIOS && deferredPrompt && (
                  <Button
                    size="sm"
                    onClick={handleInstall}
                    className="bg-white text-purple-700 hover:bg-white/90 text-xs h-8"
                  >
                    <Download className="w-3 h-3 mr-1" />
                    Install Now
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleDismiss}
                  className="text-white/90 hover:text-white hover:bg-white/20 text-xs h-8"
                >
                  Maybe Later
                </Button>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="text-white/70 hover:text-white p-1 -mt-1 -mr-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
