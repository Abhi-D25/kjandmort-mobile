'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CUISINE_HEAT_PALETTE, getColorThresholds, colorForCount } from '@/lib/color'
import { Palette } from 'lucide-react'

export default function Legend({ maxCount }) {
  const thresholds = getColorThresholds(maxCount)
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base md:text-lg flex items-center gap-2">
          <Palette className="w-4 h-4 md:w-5 md:h-5" />
          Visit Heat Scale
        </CardTitle>
        <CardDescription className="text-xs md:text-sm">
          Darker means more visits
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-wrap gap-1 md:gap-2 mb-2 md:mb-3">
          {thresholds.slice(1).map((threshold, index) => {
            const color = colorForCount(threshold, maxCount)
            const isLast = index === thresholds.length - 2
            
            let label
            if (threshold === 1) {
              label = "1"
            } else if (isLast) {
              label = `${threshold}+`
            } else {
              const prevThreshold = thresholds[index]
              if (threshold - prevThreshold === 1) {
                label = threshold.toString()
              } else {
                label = `${prevThreshold + 1}-${threshold}`
              }
            }
            
            return (
              <div key={`legend-${index}-${threshold}`} className="flex items-center gap-1 md:gap-2">
                <div 
                  className="w-5 h-5 md:w-6 md:h-6 rounded border border-gray-300 flex items-center justify-center"
                  style={{ backgroundColor: color }}
                >
                  <span className="text-xs font-medium text-gray-700">
                    {label}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
        
        {/* White swatch for no visits */}
        <div className="flex items-center gap-2 pt-2 border-t">
          <div className="w-5 h-5 md:w-6 md:h-6 rounded border-2 border-gray-300 bg-white"></div>
          <span className="text-xs md:text-sm text-gray-600">No visits</span>
        </div>
        
        <div className="mt-2 md:mt-3 pt-2 border-t text-xs text-gray-500">
          Max visits: {maxCount}
        </div>
      </CardContent>
    </Card>
  )
}