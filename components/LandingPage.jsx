'use client'

import { useState, useEffect } from 'react'

export default function LandingPage({ onSwitchToMap }) {
  const [titleVisible, setTitleVisible] = useState(false)
  const [imageVisible, setImageVisible] = useState(false)
  const [buttonVisible, setButtonVisible] = useState(false)

  // One staged entrance: title, then artwork, then the call to action
  useEffect(() => {
    const titleTimer = setTimeout(() => setTitleVisible(true), 300)
    const imageTimer = setTimeout(() => setImageVisible(true), 700)
    const buttonTimer = setTimeout(() => setButtonVisible(true), 1100)
    return () => {
      clearTimeout(titleTimer)
      clearTimeout(imageTimer)
      clearTimeout(buttonTimer)
    }
  }, [])

  return (
    <div className="relative h-screen w-full overflow-hidden bg-gradient-to-br from-purple-950 via-indigo-950 to-purple-900">
      {/* Title */}
      <div className="absolute top-4 md:top-8 left-0 right-0 z-10 px-4">
        <div className={`transition-all duration-1000 ease-out transform ${
          titleVisible ? 'translate-y-0 opacity-100' : '-translate-y-8 opacity-0'
        }`}>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-serif font-bold text-purple-50 text-center py-4 md:py-8 px-2 md:px-4 leading-tight [text-wrap:balance] drop-shadow-lg">
            King Julien and Mort's World Tour
          </h1>
        </div>
      </div>

      {/* Artwork */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 px-4">
        <div className={`transition-all duration-1000 ease-out transform ${
          imageVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-6 opacity-0 scale-95'
        }`}>
          <img
            src="/landing-hero.jpg"
            alt="King Julien and Mort hugging on top of a globe surrounded by dishes from around the world"
            width={800}
            height={800}
            className="max-w-xs sm:max-w-sm md:max-w-xl max-h-64 sm:max-h-80 md:max-h-96 object-contain cursor-pointer hover:scale-[1.03] active:scale-95 transition-transform duration-300 shadow-2xl shadow-purple-950/60 rounded-2xl touch-manipulation"
            onClick={() => onSwitchToMap?.()}
          />
        </div>
      </div>

      {/* Call to action */}
      <div className="absolute bottom-6 md:bottom-10 left-1/2 transform -translate-x-1/2 z-10 px-4 w-full max-w-sm">
        <div className={`transition-all duration-1000 ease-out transform ${
          buttonVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
        }`}>
          <button
            onClick={() => onSwitchToMap?.()}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:from-purple-700 active:to-indigo-700 text-white font-semibold py-4 md:py-3.5 px-6 rounded-full text-base shadow-lg shadow-purple-950/50 transition-colors duration-200 whitespace-nowrap touch-manipulation focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-300"
          >
            Start the Tour
          </button>
        </div>
      </div>

      {/* Faint starfield accents */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-20 left-10 w-2 h-2 bg-purple-400/60 rounded-full"></div>
        <div className="absolute top-40 right-20 w-3 h-3 bg-indigo-400/50 rounded-full"></div>
        <div className="absolute top-1/3 left-1/4 w-1.5 h-1.5 bg-purple-300/40 rounded-full"></div>
        <div className="absolute bottom-40 left-20 w-2 h-2 bg-purple-300/50 rounded-full"></div>
        <div className="absolute bottom-24 right-12 w-3 h-3 bg-indigo-300/40 rounded-full"></div>
        <div className="absolute top-2/3 right-1/3 w-1.5 h-1.5 bg-purple-400/40 rounded-full"></div>
      </div>
    </div>
  )
}
