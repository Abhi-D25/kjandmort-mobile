'use client'

import { useEffect, useState } from 'react'
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps'
import { colorForCount } from '@/lib/color'

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"

export default function MapView({ countriesData = [], maxVisitCount, onCountryClick, isLoading }) {

  const handleGeographyClick = async (geo) => {
    const countryCode = geo.properties.ISO_A2
    if (countryCode && onCountryClick) {
      // Get visit count for this country
      const countryData = countriesData.find(c => c.country_code === countryCode)
      const visitCount = countryData?.visit_count || 0
      
      // Pass both country code and visit count to parent handler
      onCountryClick(countryCode, visitCount)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full bg-blue-50">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 120,
          center: [0, 0]
        }}
        width={800}
        height={600}
        style={{ width: "100%", height: "100%" }}
      >
        <ZoomableGroup>
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const countryCode = geo.properties.ISO_A2
                const countryCode3 = geo.properties.ISO_A3
                
                // Debug: log a few countries to see the codes
                if (['FR', 'IN', 'IT', 'JP', 'MX', 'TH'].includes(countryCode) || ['FRA', 'IND', 'ITA', 'JPN', 'MEX', 'THA'].includes(countryCode3)) {
                  console.log(`Country: ${geo.properties.NAME}, ISO_A2: ${countryCode}, ISO_A3: ${countryCode3}`)
                }
                
                // Try matching both 2-letter and 3-letter codes
                const countryData = countriesData.find(c => 
                  c.country_code === countryCode || c.country_code === countryCode3
                )
                const visitCount = countryData?.visit_count || 0
                const fillColor = colorForCount(visitCount, maxVisitCount)
                
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={fillColor}
                    stroke="#666"
                    strokeWidth={0.5}
                    onClick={() => handleGeographyClick(geo)}
                    style={{
                      default: {
                        outline: "none",
                        cursor: "pointer"
                      },
                      hover: {
                        fill: visitCount > 0 ? "#7C3AED" : "#E9D5FF",
                        outline: "none",
                        cursor: "pointer"
                      },
                      pressed: {
                        fill: "#7C3AED",
                        outline: "none",
                        cursor: "pointer"
                      },
                    }}
                  />
                )
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
    </div>
  )
}