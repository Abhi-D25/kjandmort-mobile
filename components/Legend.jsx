'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CUISINE_COLORS, getColorThresholds } from '@/lib/color'
import { Palette } from 'lucide-react'

export default function Legend({ maxCount }) {
  const thresholds = getColorThresholds(maxCount)
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Palette className="w-5 h-5" />
          Color Legend
        </CardTitle>
        <CardDescription>
          Countries colored by visit frequency
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {thresholds.map((threshold, index) => {
            const nextThreshold = thresholds[index + 1]
            const color = CUISINE_COLORS[index]
            
            let label
            if (threshold === 0) {
              label = "No visits"
            } else if (nextThreshold) {
              label = threshold === 1 ? "1 visit" : `${threshold}${nextThreshold - 1 > threshold ? '-' + (nextThreshold - 1) : ''} visits`
            } else {
              label = `${threshold}+ visits`
            }
            
            return (
              <div key={threshold} className="flex items-center gap-3">
                <div 
                  className="w-4 h-4 rounded border border-gray-300"
                  style={{ backgroundColor: color }}
                />
                <span className="text-sm text-gray-600">{label}</span>
              </div>
            )
          })}
        </div>
        
        <div className="mt-4 pt-3 border-t text-xs text-gray-500">
          Max visits: {maxCount}
        </div>
      </CardContent>
    </Card>
  )
}