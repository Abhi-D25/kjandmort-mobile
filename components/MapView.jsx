'use client'

import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps'
import { colorForCount } from '@/lib/color'
import CountryPopup from './CountryPopup'

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"

export default function MapView({ countriesData = [], maxVisitCount, onCountryClick, onDataRefresh, isLoading }) {
  const [popupData, setPopupData] = useState({
    isOpen: false,
    countryName: '',
    countryData: null,
    restaurants: []
  })
  const queryClient = useQueryClient()

  const handleGeographyClick = async (geo) => {
    const countryName = geo.properties.NAME || geo.properties.name
    
    if (!countryName) return
    
    try {
      console.log(`🗺️ Clicked on country: ${countryName}`)
      
      // Name-based mapping for major countries (since geo data only has country names)
      const nameToCode3 = {
        'France': 'FRA', 'India': 'IND', 'Italy': 'ITA', 'Japan': 'JPN', 'Mexico': 'MEX', 'Thailand': 'THA',
        'United States of America': 'US', 'United States': 'US', 'China': 'CN', 'Germany': 'DE', 
        'Brazil': 'BR', 'United Kingdom': 'GB', 'Canada': 'CA', 'Australia': 'AU', 'Russia': 'RU',
        'Argentina': 'AR', 'Chile': 'CL', 'Peru': 'PE', 'Colombia': 'CO', 'Venezuela': 'VE',
        'Spain': 'ES', 'Portugal': 'PT', 'Netherlands': 'NL', 'Belgium': 'BE', 'Switzerland': 'CH',
        'Austria': 'AT', 'Sweden': 'SE', 'Norway': 'NO', 'Denmark': 'DK', 'Finland': 'FI',
        'Poland': 'PL', 'Czech Republic': 'CZ', 'Hungary': 'HU', 'Romania': 'RO', 'Ukraine': 'UA',
        'Turkey': 'TR', 'Greece': 'GR', 'Bulgaria': 'BG', 'Serbia': 'RS', 'Croatia': 'HR',
        'South Africa': 'ZA', 'Egypt': 'EG', 'Nigeria': 'NG', 'Kenya': 'KE', 'Ethiopia': 'ET',
        'Morocco': 'MA', 'Algeria': 'DZ', 'Libya': 'LY', 'Sudan': 'SD', 'Tunisia': 'TN',
        'South Korea': 'KR', 'North Korea': 'KP', 'Mongolia': 'MN', 'Kazakhstan': 'KZ', 
        'Iran': 'IR', 'Iraq': 'IQ', 'Saudi Arabia': 'SA', 'Palestine': 'PS', 'Jordan': 'JO',
        'Indonesia': 'ID', 'Malaysia': 'MY', 'Philippines': 'PH', 'Vietnam': 'VN', 'Myanmar': 'MM',
        'Bangladesh': 'BD', 'Pakistan': 'PK', 'Afghanistan': 'AF', 'Sri Lanka': 'LK', 'Nepal': 'NP',
        'New Zealand': 'NZ', 'Papua New Guinea': 'PG', 'Madagascar': 'MG', 'Tanzania': 'TZ',
        'Mozambique': 'MZ', 'Zimbabwe': 'ZW', 'Botswana': 'BW', 'Namibia': 'NA', 'Zambia': 'ZM',
        'Angola': 'AO', 'Democratic Republic of the Congo': 'CD', 'Republic of the Congo': 'CG',
        'Central African Republic': 'CF', 'Chad': 'TD', 'Niger': 'NE', 'Mali': 'ML', 'Burkina Faso': 'BF',
        'Senegal': 'SN', 'Guinea': 'GN', 'Sierra Leone': 'SL', 'Liberia': 'LR', 'Ivory Coast': 'CI',
        'Ghana': 'GH', 'Togo': 'TG', 'Benin': 'BJ', 'Cameroon': 'CM', 'Equatorial Guinea': 'GQ',
        'Gabon': 'GA', 'Uruguay': 'UY', 'Paraguay': 'PY', 'Bolivia': 'BO', 'Ecuador': 'EC',
        'Guyana': 'GY', 'Suriname': 'SR', 'French Guiana': 'GF'
      }
      
      // Find country code using name-based mapping
      let countryCode = null
      const mappedCode3 = nameToCode3[countryName]
      
      if (mappedCode3) {
        countryCode = mappedCode3
      } else {
        // Fallback: try to find by similar name in countriesData
        const countryData = countriesData.find(c => 
          c.name.toLowerCase() === countryName.toLowerCase() ||
          countryName.toLowerCase().includes(c.name.toLowerCase()) ||
          c.name.toLowerCase().includes(countryName.toLowerCase())
        )
        if (countryData) {
          countryCode = countryData.country_code
        }
      }
      
      console.log(`🔍 Found country code: ${countryCode} for ${countryName}`)
      
      if (!countryCode) {
        console.warn(`⚠️ Could not find country code for: ${countryName}`)
        return
      }
      
      // Fetch full country details including restaurants
      try {
        console.log(`🔍 Fetching country details for code: ${countryCode}`)
        const response = await fetch(`/api/country?code=${countryCode}`)
        
        if (!response.ok) {
          throw new Error(`Failed to fetch country details: ${response.status}`)
        }
        
        const fullCountryData = await response.json()
        console.log(`✅ Loaded country details:`, fullCountryData)
        
        // Open popup with full country data
        setPopupData({
          isOpen: true,
          countryName,
          countryData: fullCountryData,
          restaurants: fullCountryData.restaurants || []
        })
        
      } catch (error) {
        console.error('❌ Error fetching country details:', error)
        // Fallback: show basic popup without restaurants
        setPopupData({
          isOpen: true,
          countryName,
          countryData: { 
            name: countryName, 
            cuisine_style: 'Local', 
            visit_count: 0,
            id: null
          },
          restaurants: []
        })
      }
      
    } catch (error) {
      console.error('Error handling country click:', error)
    }
  }

  const closePopup = () => {
    setPopupData({
      isOpen: false,
      countryName: '',
      countryData: null,
      restaurants: []
    })
  }

  // Handle data refresh from popup (when visits are added/edited/deleted)
  const handleDataRefresh = () => {
    console.log('🔄 Data refresh requested from popup - clearing all caches')
    // Clear all caches completely
    queryClient.clear()
    if (onDataRefresh) {
      onDataRefresh() // This should trigger parent to reload countries data
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 md:h-32 md:w-32 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm md:text-base">Loading map...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="w-full h-full bg-blue-50 relative">
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{
            scale: 120,
            center: [0, 0]
          }}
          width={800}
          height={600}
          style={{ 
            width: "100%", 
            height: "100%", 
            cursor: "pointer",
            minHeight: "400px"
          }}
        >
          <ZoomableGroup
            maxZoom={4}
            minZoom={1}
            center={[0, 0]}
            zoom={1}
          >
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo, index) => {
                  const countryName = geo.properties.NAME || geo.properties.name
                  
                  // Name-based mapping for finding country data - use comprehensive mapping
                  const nameToCode3 = {
                    'France': 'FRA', 'India': 'IND', 'Italy': 'ITA', 'Japan': 'JPN', 'Mexico': 'MEX', 'Thailand': 'THA',
                    'United States of America': 'USA', 'United States': 'USA', 'China': 'CHN', 'Germany': 'DEU', 
                    'Brazil': 'BRA', 'United Kingdom': 'GBR', 'Canada': 'CAN', 'Australia': 'AUS', 'Russia': 'RU',
                    'Argentina': 'AR', 'Chile': 'CL', 'Peru': 'PE', 'Colombia': 'CO', 'Venezuela': 'VE',
                    'Spain': 'ES', 'Portugal': 'PT', 'Netherlands': 'NL', 'Belgium': 'BE', 'Switzerland': 'CH',
                    'Austria': 'AT', 'Sweden': 'SE', 'Norway': 'NO', 'Denmark': 'DK', 'Finland': 'FI',
                    'Poland': 'PL', 'Czech Republic': 'CZ', 'Hungary': 'HU', 'Romania': 'RO', 'Ukraine': 'UA',
                    'Turkey': 'TR', 'Greece': 'GR', 'Bulgaria': 'BG', 'Serbia': 'RS', 'Croatia': 'HR',
                    'South Africa': 'ZA', 'Egypt': 'EG', 'Nigeria': 'NG', 'Kenya': 'KE', 'Ethiopia': 'ET',
                    'Morocco': 'MA', 'Algeria': 'DZ', 'Libya': 'LY', 'Sudan': 'SD', 'Tunisia': 'TN',
                    'South Korea': 'KR', 'North Korea': 'KP', 'Mongolia': 'MN', 'Kazakhstan': 'KZ', 
                    'Iran': 'IR', 'Iraq': 'IQ', 'Saudi Arabia': 'SA', 'Palestine': 'PS', 'Jordan': 'JO',
                    'Indonesia': 'ID', 'Malaysia': 'MY', 'Philippines': 'PH', 'Vietnam': 'VN', 'Myanmar': 'MM',
                    'Bangladesh': 'BD', 'Pakistan': 'PK', 'Afghanistan': 'AF', 'Sri Lanka': 'LK', 'Nepal': 'NP',
                    'New Zealand': 'NZ', 'Papua New Guinea': 'PG', 'Madagascar': 'MG', 'Tanzania': 'TZ',
                    'Mozambique': 'MZ', 'Zimbabwe': 'ZW', 'Botswana': 'BW', 'Namibia': 'NA', 'Zambia': 'ZM',
                    'Angola': 'AO', 'Democratic Republic of the Congo': 'CD', 'Republic of the Congo': 'CG',
                    'Central African Republic': 'CF', 'Chad': 'TD', 'Niger': 'NE', 'Mali': 'ML', 'Burkina Faso': 'BF',
                    'Senegal': 'SN', 'Guinea': 'GN', 'Sierra Leone': 'SL', 'Liberia': 'LR', 'Ivory Coast': 'CI',
                    'Ghana': 'GH', 'Togo': 'TG', 'Benin': 'BJ', 'Cameroon': 'CM', 'Equatorial Guinea': 'GQ',
                    'Gabon': 'GA', 'Uruguay': 'UY', 'Paraguay': 'PY', 'Bolivia': 'BO', 'Ecuador': 'EC',
                    'Guyana': 'GY', 'Suriname': 'SR', 'French Guiana': 'GF'
                  }
                  
                  // Try to find country data
                  let countryData = null
                  const mappedCode3 = nameToCode3[countryName]
                  
                  if (mappedCode3) {
                    countryData = countriesData.find(c => c.country_code === mappedCode3)
                  }
                  
                  // Fallback: try name matching
                  if (!countryData) {
                    countryData = countriesData.find(c => 
                      c.name.toLowerCase() === countryName.toLowerCase() ||
                      countryName.toLowerCase().includes(c.name.toLowerCase()) ||
                      c.name.toLowerCase().includes(countryName.toLowerCase())
                    )
                  }
                  
                  const visitCount = countryData?.visit_count || 0
                  const fillColor = colorForCount(visitCount, maxVisitCount)
                  
                  // Debug log for countries with visits
                  if (visitCount > 0) {
                    console.log(`🎨 ${countryName}: ${visitCount} visits, Color: ${fillColor}`)
                  }
                  
                  return (
                    <Geography
                      key={`${geo.rsmKey}-${index}`}
                      geography={geo}
                      fill={fillColor}
                      stroke="#666"
                      strokeWidth={0.5}
                      onClick={() => handleGeographyClick(geo)}
                      onMouseEnter={() => {
                        // Optional: add hover effect
                      }}
                      style={{
                        default: {
                          outline: "none",
                          cursor: "pointer",
                          pointerEvents: "all"
                        },
                        hover: {
                          fill: visitCount > 0 ? "#7C3AED" : "#E9D5FF",
                          outline: "none",
                          cursor: "pointer",
                          pointerEvents: "all"
                        },
                        pressed: {
                          fill: "#7C3AED",
                          outline: "none",
                          cursor: "pointer",
                          pointerEvents: "all"
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
      
      <CountryPopup
        isOpen={popupData.isOpen}
        onClose={closePopup}
        countryName={popupData.countryName}
        countryData={popupData.countryData}
        restaurants={popupData.restaurants}
        onDataRefresh={handleDataRefresh}
      />
    </>
  )
}