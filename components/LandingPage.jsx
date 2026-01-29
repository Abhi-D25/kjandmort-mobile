'use client'

import { useState, useEffect } from 'react'

export default function LandingPage({ onSwitchToMap }) {
  const [titleVisible, setTitleVisible] = useState(false)
  const [imageVisible, setImageVisible] = useState(false)
  const [buttonVisible, setButtonVisible] = useState(false)

  useEffect(() => {
    // Animate title first
    const titleTimer = setTimeout(() => {
      setTitleVisible(true)
    }, 500)

    // Animate image after title
    const imageTimer = setTimeout(() => {
      setImageVisible(true)
    }, 1000)

    // Animate button last
    const buttonTimer = setTimeout(() => {
      setButtonVisible(true)
    }, 1500)

    return () => {
      clearTimeout(titleTimer)
      clearTimeout(imageTimer)
      clearTimeout(buttonTimer)
    }
  }, [])

  const handleImageClick = () => {
    if (onSwitchToMap) {
      onSwitchToMap()
    }
  }

  const handleButtonClick = () => {
    if (onSwitchToMap) {
      onSwitchToMap()
    }
  }

  return (
    <div className="relative h-screen w-full overflow-hidden bg-gradient-to-br from-navy-900 via-blue-900 to-indigo-900">
      {/* Title - Positioned at top */}
      <div className="absolute top-4 md:top-8 left-0 right-0 z-10 px-4">
        <div className={`transition-all duration-1500 ease-out transform ${
          titleVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
        }`}>
          <div className="bg-gradient-to-r from-blue-600/90 via-indigo-600/90 to-blue-600/90 backdrop-blur-md border-b-4 border-blue-400/50 shadow-2xl rounded-lg">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-serif font-bold text-white text-center py-4 md:py-8 px-2 md:px-4 animate-pulse leading-tight">
              King Julien and Mort's World Tour
            </h1>
          </div>
        </div>
      </div>

      {/* Image - Positioned in center */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 px-4">
        <div className={`transition-all duration-1000 ease-out transform ${
          imageVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 opacity-0 scale-95'
        }`}>
          <img 
            src="https://customer-assets.emergentagent.com/job_74a423f5-a363-49c8-932a-8852309584b5/artifacts/8sfdsf0i_kj%26mort.png"
            alt="King Julien and Mort's World Tour"
            className="max-w-xs sm:max-w-sm md:max-w-xl max-h-64 sm:max-h-80 md:max-h-96 object-contain cursor-pointer hover:scale-105 active:scale-95 transition-all duration-300 shadow-2xl rounded-lg touch-manipulation"
            onClick={handleImageClick}
          />
        </div>
      </div>

      {/* Button - Positioned at bottom */}
      <div className="absolute bottom-4 md:bottom-8 left-1/2 transform -translate-x-1/2 z-10 px-4 w-full max-w-sm">
        <div className={`transition-all duration-1000 ease-out transform ${
          buttonVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 opacity-0 scale-95'
        }`}>
          <button
            onClick={handleButtonClick}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:from-blue-800 active:to-indigo-800 text-white font-bold py-4 md:py-3 px-6 rounded-full text-base md:text-sm shadow-2xl border-2 border-blue-400/50 transform hover:scale-105 active:scale-95 transition-all duration-300 whitespace-nowrap touch-manipulation"
          >
            🗺️ Go to Map View
          </button>
        </div>
      </div>

      {/* Floating particles background effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-2 h-2 bg-blue-400 rounded-full animate-ping opacity-60"></div>
        <div className="absolute top-40 right-20 w-3 h-3 bg-indigo-400 rounded-full animate-ping opacity-60" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-40 left-20 w-2 h-2 bg-blue-300 rounded-full animate-ping opacity-60" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 right-10 w-3 h-3 bg-indigo-300 rounded-full animate-ping opacity-60" style={{ animationDelay: '3s' }}></div>
      </div>
    </div>
  )
}