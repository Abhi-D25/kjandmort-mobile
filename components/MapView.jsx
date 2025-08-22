'use client'

import { useEffect, useState } from 'react'
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps'
import { colorForCount } from '@/lib/color'

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"

export default function MapView({ countriesData = [], maxVisitCount, onCountryClick, isLoading }) {
  const [markers, setMarkers] = useState([])

  // Create markers for small countries or countries with high visit counts
  useEffect(() => {
    if (!countriesData.length) return

    const countryMarkers = countriesData
      .filter(country => (country.visit_count || 0) > 0)
      .map(country => ({
        name: country.name,
        coordinates: getCountryCenter(country.country_code),
        visitCount: country.visit_count || 0,
        countryCode: country.country_code
      }))
      .filter(marker => marker.coordinates) // Only include countries with known coordinates

    setMarkers(countryMarkers)
  }, [countriesData])

  // Simple country center coordinates (you could expand this list)
  const getCountryCenter = (countryCode) => {
    const centers = {
      'USA': [-95.7129, 37.0902],
      'CAN': [-106.3468, 56.1304],
      'BRA': [-51.9253, -14.2351],
      'CHN': [104.1954, 35.8617],
      'RUS': [105.3188, 61.5240],
      'AUS': [133.7751, -25.2744],
      'IND': [78.9629, 20.5937],
      'GBR': [-3.4360, 55.3781],
      'FRA': [2.2137, 46.2276],
      'DEU': [10.4515, 51.1657],
      'ITA': [12.5674, 41.8719],
      'ESP': [-3.7492, 40.4637],
      'JPN': [138.2529, 36.2048],
      'KOR': [127.7669, 35.9078],
      'MEX': [-102.5528, 23.6345],
      'ARG': [-63.6167, -38.4161],
      'EGY': [30.8025, 26.8206],
      'ZAF': [22.9375, -30.5595],
      'NGA': [8.6753, 9.0820],
      'THA': [100.9925, 15.8700],
      'IDN': [113.9213, -0.7893],
      'MYS': [101.9758, 4.2105],
      'SGP': [103.8198, 1.3521],
      'PHL': [121.7740, 12.8797],
      'VNM': [108.2772, 14.0583]
    }
    return centers[countryCode] || null
  }

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

  const handleMarkerClick = async (marker) => {
    if (onCountryClick) {
      // Markers only exist for countries with visits > 0
      onCountryClick(marker.countryCode, marker.visitCount)
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
                const countryData = countriesData.find(c => c.country_code === countryCode)
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
                        fill: "#A855F7",
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
          
          {/* Markers for visited countries */}
          {markers.map((marker, index) => (
            <Marker
              key={index}
              coordinates={marker.coordinates}
              onClick={() => handleMarkerClick(marker)}
            >
              <circle
                r={Math.max(4, Math.min(12, 4 + marker.visitCount * 2))}
                fill="#7C3AED"
                stroke="#FFFFFF"
                strokeWidth={2}
                style={{ cursor: "pointer" }}
              />
              {marker.visitCount > 3 && (
                <text
                  textAnchor="middle"
                  dy={4}
                  fontSize={10}
                  fill="white"
                  fontWeight="bold"
                  style={{ cursor: "pointer", pointerEvents: "none" }}
                >
                  {marker.visitCount}
                </text>
              )}
            </Marker>
          ))}
        </ZoomableGroup>
      </ComposableMap>
    </div>
  )
}