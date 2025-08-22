'use client'

import { useEffect, useState } from 'react'
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps'
import { colorForCount } from '@/lib/color'

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"

export default function MapView({ countriesData = [], maxVisitCount, onCountryClick, isLoading }) {

  const handleGeographyClick = async (geo) => {
    const countryCode = geo.properties.ISO_A2
    if (countryCode && onCountryClick) {
      // Create mapping for finding the right country data
      const code2to3 = {
        'FR': 'FRA', 'IN': 'IND', 'IT': 'ITA', 'JP': 'JPN', 'MX': 'MEX', 'TH': 'THA',
        'US': 'USA', 'CA': 'CAN', 'GB': 'GBR', 'DE': 'DEU', 'ES': 'ESP', 'AU': 'AUS',
        'BR': 'BRA', 'CN': 'CHN', 'RU': 'RUS', 'KR': 'KOR'
      }
      
      // Try to find country data
      let countryData = countriesData.find(c => c.country_code === countryCode)
      if (!countryData && code2to3[countryCode]) {
        countryData = countriesData.find(c => c.country_code === code2to3[countryCode])
      }
      
      const visitCount = countryData?.visit_count || 0
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
                // Log available properties for debugging
                if (!geo.debugLogged) {
                  console.log('🔍 Available geo properties:', Object.keys(geo.properties))
                  geo.debugLogged = true
                }
                
                // Try different property names that might contain country codes
                const props = geo.properties
                const countryCode2 = props.ISO_A2 || props.iso_a2 || props.adm0_a3 || props.ADM0_A3
                const countryName = props.NAME || props.name || props.NAME_EN || props.name_en
                
                // Create comprehensive mapping for 2-letter to 3-letter codes
                const code2to3 = {
                  'FR': 'FRA', 'IN': 'IND', 'IT': 'ITA', 'JP': 'JPN', 'MX': 'MEX', 'TH': 'THA',
                  'US': 'USA', 'CA': 'CAN', 'GB': 'GBR', 'DE': 'DEU', 'ES': 'ESP', 'AU': 'AUS',
                  'BR': 'BRA', 'CN': 'CHN', 'RU': 'RUS', 'KR': 'KOR', 'AR': 'ARG', 'CL': 'CHL',
                  'PE': 'PER', 'CO': 'COL', 'VE': 'VEN', 'EC': 'ECU', 'BO': 'BOL', 'UY': 'URY',
                  'PY': 'PRY', 'GY': 'GUY', 'SR': 'SUR', 'FK': 'FLK', 'GF': 'GUF', 'ZA': 'ZAF',
                  'EG': 'EGY', 'LY': 'LBY', 'SD': 'SDN', 'TD': 'TCD', 'NE': 'NER', 'ML': 'MLI',
                  'MR': 'MRT', 'SN': 'SEN', 'GM': 'GMB', 'GW': 'GNB', 'GN': 'GIN', 'SL': 'SLE',
                  'LR': 'LBR', 'CI': 'CIV', 'GH': 'GHA', 'TG': 'TGO', 'BJ': 'BEN', 'BF': 'BFA',
                  'NR': 'NRU', 'NG': 'NGA', 'CM': 'CMR', 'CF': 'CAF', 'GQ': 'GNQ', 'GA': 'GAB',
                  'CG': 'COG', 'CD': 'COD', 'AO': 'AGO', 'ZM': 'ZMB', 'ZW': 'ZWE', 'NA': 'NAM',
                  'BW': 'BWA', 'SZ': 'SWZ', 'LS': 'LSO', 'MZ': 'MOZ', 'MW': 'MWI', 'TZ': 'TZA',
                  'KE': 'KEN', 'UG': 'UGA', 'RW': 'RWA', 'BI': 'BDI', 'ET': 'ETH', 'ER': 'ERI',
                  'DJ': 'DJI', 'SO': 'SOM', 'MG': 'MDG', 'MU': 'MUS', 'SC': 'SYC', 'KM': 'COM'
                }
                
                // Name-based mapping as fallback for major countries
                const nameToCode3 = {
                  'France': 'FRA',
                  'India': 'IND', 
                  'Italy': 'ITA',
                  'Japan': 'JPN',
                  'Mexico': 'MEX',
                  'Thailand': 'THA',
                  'United States of America': 'USA',
                  'United States': 'USA',
                  'China': 'CHN',
                  'Germany': 'DEU',
                  'Brazil': 'BRA',
                  'United Kingdom': 'GBR'
                }
                
                // Try to find country data using multiple approaches
                let countryData = null
                
                // First try direct 2-letter code match (for future 2-letter database)
                if (countryCode2) {
                  countryData = countriesData.find(c => c.country_code === countryCode2)
                }
                
                // Then try 2-letter to 3-letter conversion (for current 3-letter database)
                if (!countryData && countryCode2 && code2to3[countryCode2]) {
                  countryData = countriesData.find(c => c.country_code === code2to3[countryCode2])
                }
                
                // Finally try name-based matching
                if (!countryData && countryName && nameToCode3[countryName]) {
                  countryData = countriesData.find(c => c.country_code === nameToCode3[countryName])
                }
                
                const visitCount = countryData?.visit_count || 0
                const fillColor = colorForCount(visitCount, maxVisitCount)
                
                // Log debug info for countries with visits or specific test countries
                if (visitCount > 0 || ['France', 'India', 'Italy', 'Japan', 'Mexico', 'Thailand'].includes(countryName)) {
                  console.log(`🗺️ ${countryName} (${countryCode2}→${code2to3[countryCode2] || nameToCode3[countryName]}): ${visitCount} visits, Color: ${fillColor}`)
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