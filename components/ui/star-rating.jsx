'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

export function StarRating({ 
  value = 0, 
  onChange, 
  size = 'md',
  readOnly = false,
  showValue = true,
  className = ''
}) {
  const [hoverValue, setHoverValue] = useState(0)
  
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8'
  }
  
  const handleStarClick = (rating) => {
    if (!readOnly && onChange) {
      onChange(rating)
    }
  }
  
  const handleStarHover = (rating) => {
    if (!readOnly) {
      setHoverValue(rating)
    }
  }
  
  const handleMouseLeave = () => {
    if (!readOnly) {
      setHoverValue(0)
    }
  }
  
  const getStarState = (starIndex) => {
    const currentValue = hoverValue || value
    return starIndex <= currentValue
  }
  
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div 
        className="flex items-center gap-0.5"
        onMouseLeave={handleMouseLeave}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleStarClick(star)}
            onMouseEnter={() => handleStarHover(star)}
            disabled={readOnly}
            className={cn(
              "transition-colors duration-200 ease-in-out",
              !readOnly && "cursor-pointer",
              readOnly && "cursor-default"
            )}
            aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
          >
            <Star
              className={cn(
                sizeClasses[size],
                "transition-colors duration-200",
                getStarState(star)
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300 hover:text-yellow-300"
              )}
            />
          </button>
        ))}
      </div>
      
      {showValue && value > 0 && (
        <span className="text-sm font-medium text-gray-600 ml-2">
          {value}/5
        </span>
      )}
      
      {!readOnly && hoverValue > 0 && (
        <span className="text-sm text-gray-500 ml-2">
          {hoverValue}/5
        </span>
      )}
    </div>
  )
}

export default StarRating
