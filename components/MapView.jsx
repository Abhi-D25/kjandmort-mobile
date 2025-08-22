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
                // Try different property names for country codes
                const countryCode2 = geo.properties.ISO_A2
                const countryCode3 = geo.properties.ISO_A3 || geo.properties.ADM0_A3
                const countryName = geo.properties.NAME || geo.properties.name
                
                // Create mapping for 2-letter to 3-letter codes for visited countries
                const code2to3 = {
                  'FR': 'FRA', 'IN': 'IND', 'IT': 'ITA', 'JP': 'JPN', 'MX': 'MEX', 'TH': 'THA',
                  'US': 'USA', 'CA': 'CAN', 'GB': 'GBR', 'DE': 'DEU', 'ES': 'ESP', 'AU': 'AUS',
                  'BR': 'BRA', 'CN': 'CHN', 'RU': 'RUS', 'KR': 'KOR'
                }
                
                // Try to find country data by various methods
                let countryData = null
                
                // First try direct 2-letter code match (for new database structure)
                if (countryCode2) {
                  countryData = countriesData.find(c => c.country_code === countryCode2)
                }
                
                // Then try 2-letter code converted to 3-letter (for existing database)
                if (!countryData && countryCode2 && code2to3[countryCode2]) {
                  countryData = countriesData.find(c => c.country_code === code2to3[countryCode2])
                }
                
                // Finally try 3-letter code match (for existing database)
                if (!countryData && countryCode3) {
                  countryData = countriesData.find(c => c.country_code === countryCode3)
                }
                
                const visitCount = countryData?.visit_count || 0
                const fillColor = colorForCount(visitCount, maxVisitCount)
                
                // Debug log for countries with visits
                if (visitCount > 0) {
                  console.log(`🗺️ Found visited country: ${countryName} (${countryCode2}→${code2to3[countryCode2] || countryCode3}), Visits: ${visitCount}, Color: ${fillColor}`)
                }
                
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