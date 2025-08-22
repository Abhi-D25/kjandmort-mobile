'use client'

import { useEffect, useState } from 'react'
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

  const handleGeographyClick = async (geo) => {
    const countryName = geo.properties.NAME || geo.properties.name
    
    if (!countryName) return
    
    try {
      console.log(`🗺️ Clicked on country: ${countryName}`)
      
      // Name-based mapping for major countries (since geo data only has country names)
      const nameToCode3 = {
        'France': 'FRA', 'India': 'IND', 'Italy': 'ITA', 'Japan': 'JPN', 'Mexico': 'MEX', 'Thailand': 'THA',
        'United States of America': 'USA', 'United States': 'USA', 'China': 'CHN', 'Germany': 'DEU', 
        'Brazil': 'BRA', 'United Kingdom': 'GBR', 'Canada': 'CAN', 'Australia': 'AUS', 'Russia': 'RUS',
        'Argentina': 'ARG', 'Chile': 'CHL', 'Peru': 'PER', 'Colombia': 'COL', 'Venezuela': 'VEN',
        'Spain': 'ESP', 'Portugal': 'PRT', 'Netherlands': 'NLD', 'Belgium': 'BEL', 'Switzerland': 'CHE',
        'Austria': 'AUT', 'Sweden': 'SWE', 'Norway': 'NOR', 'Denmark': 'DNK', 'Finland': 'FIN',
        'Poland': 'POL', 'Czech Republic': 'CZE', 'Hungary': 'HUN', 'Romania': 'ROU', 'Ukraine': 'UKR',
        'Turkey': 'TUR', 'Greece': 'GRC', 'Bulgaria': 'BGR', 'Serbia': 'SRB', 'Croatia': 'HRV',
        'South Africa': 'ZAF', 'Egypt': 'EGY', 'Nigeria': 'NGA', 'Kenya': 'KEN', 'Ethiopia': 'ETH',
        'Morocco': 'MAR', 'Algeria': 'DZA', 'Libya': 'LBY', 'Sudan': 'SDN', 'Tunisia': 'TUN',
        'South Korea': 'KOR', 'North Korea': 'PRK', 'Mongolia': 'MNG', 'Kazakhstan': 'KAZ', 
        'Iran': 'IRN', 'Iraq': 'IRQ', 'Saudi Arabia': 'SAU', 'Israel': 'ISR', 'Jordan': 'JOR',
        'Indonesia': 'IDN', 'Malaysia': 'MYS', 'Philippines': 'PHL', 'Vietnam': 'VNM', 'Myanmar': 'MMR',
        'Bangladesh': 'BGD', 'Pakistan': 'PAK', 'Afghanistan': 'AFG', 'Sri Lanka': 'LKA', 'Nepal': 'NPL',
        'New Zealand': 'NZL', 'Papua New Guinea': 'PNG', 'Madagascar': 'MDG', 'Tanzania': 'TZA',
        'Mozambique': 'MOZ', 'Zimbabwe': 'ZWE', 'Botswana': 'BWA', 'Namibia': 'NAM', 'Zambia': 'ZMB',
        'Angola': 'AGO', 'Democratic Republic of the Congo': 'COD', 'Republic of the Congo': 'COG',
        'Central African Republic': 'CAF', 'Chad': 'TCD', 'Niger': 'NER', 'Mali': 'MLI', 'Burkina Faso': 'BFA',
        'Senegal': 'SEN', 'Guinea': 'GIN', 'Sierra Leone': 'SLE', 'Liberia': 'LBR', 'Ivory Coast': 'CIV',
        'Ghana': 'GHA', 'Togo': 'TGO', 'Benin': 'BEN', 'Cameroon': 'CMR', 'Equatorial Guinea': 'GNQ',
        'Gabon': 'GAB', 'Uruguay': 'URY', 'Paraguay': 'PRY', 'Bolivia': 'BOL', 'Ecuador': 'ECU',
        'Guyana': 'GUY', 'Suriname': 'SUR', 'French Guiana': 'GUF'
      }
      
      // Find country data using name-based mapping
      let countryData = null
      const mappedCode3 = nameToCode3[countryName]
      
      if (mappedCode3) {
        countryData = countriesData.find(c => c.country_code === mappedCode3)
      }
      
      // Fallback: try to find by similar name
      if (!countryData) {
        countryData = countriesData.find(c => 
          c.name.toLowerCase() === countryName.toLowerCase() ||
          countryName.toLowerCase().includes(c.name.toLowerCase()) ||
          c.name.toLowerCase().includes(countryName.toLowerCase())
        )
      }
      
      console.log(`🔍 Found country data:`, countryData)
      
      // Open popup with country data - CountryPopup will handle loading restaurants
      setPopupData({
        isOpen: true,
        countryName,
        countryData: countryData || { 
          name: countryName, 
          cuisine_style: 'Local', 
          visit_count: 0,
          id: null
        },
        restaurants: [] // Will be loaded by CountryPopup
      })
      
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
    console.log('🔄 Data refresh requested from popup')
    if (onCountryClick) {
      onCountryClick() // This should trigger parent to reload countries data
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
                  
                  // Name-based mapping for finding country data
                  const nameToCode3 = {
                    'France': 'FRA', 'India': 'IND', 'Italy': 'ITA', 'Japan': 'JPN', 'Mexico': 'MEX', 'Thailand': 'THA',
                    'United States of America': 'USA', 'United States': 'USA', 'China': 'CHN', 'Germany': 'DEU', 
                    'Brazil': 'BRA', 'United Kingdom': 'GBR', 'Canada': 'CAN', 'Australia': 'AUS', 'Russia': 'RUS'
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