'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { getColorForCount } from '@/lib/color'

// Dynamically import Globe component to avoid SSR issues
const Globe = dynamic(() => import('react-globe.gl'), { 
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
    </div>
  )
})

export default function GlobeView({ countriesData = [], maxVisitCount, onCountryClick, isLoading }) {
  const globeRef = useRef()
  const [globeData, setGlobeData] = useState([])
  const [countriesGeoData, setCountriesGeoData] = useState(null)

  // Load countries geo data
  useEffect(() => {
    const loadGeoData = async () => {
      try {
        const response = await fetch('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson')
        const geoData = await response.json()
        setCountriesGeoData(geoData)
      } catch (error) {
        console.error('Error loading geo data:', error)
      }
    }
    
    loadGeoData()
  }, [])

  // Process countries data for globe visualization
  useEffect(() => {
    if (!countriesGeoData || !countriesData.length) return

    const processedData = countriesGeoData.features.map(feature => {
      const countryCode = feature.properties.ISO_A2 || feature.properties.ADM0_A3
      const countryData = countriesData.find(c => c.country_code === countryCode)
      const visitCount = countryData?.visit_count || 0
      
      return {
        ...feature,
        properties: {
          ...feature.properties,
          visitCount,
          color: getColorForCount(visitCount, maxVisitCount),
          name: countryData?.name || feature.properties.NAME
        }
      }
    })

    setGlobeData(processedData)
  }, [countriesData, countriesGeoData, maxVisitCount])

  // Handle country click
  const handleCountryClick = (polygon) => {
    if (polygon && polygon.properties) {
      const countryCode = polygon.properties.ISO_A2 || polygon.properties.ADM0_A3
      if (countryCode && onCountryClick) {
        onCountryClick(countryCode)
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading globe...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full">
      <Globe
        ref={globeRef}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        polygonsData={globeData}
        polygonAltitude={0.01}
        polygonCapColor={(d) => d.properties.color}
        polygonSideColor={(d) => d.properties.color}
        polygonStrokeColor={() => '#111'}
        polygonLabel={(d) => `
          <div style="background: rgba(0,0,0,0.8); color: white; padding: 8px; border-radius: 4px; font-size: 12px;">
            <strong>${d.properties.name}</strong><br/>
            Visits: ${d.properties.visitCount || 0}
          </div>
        `}
        onPolygonClick={handleCountryClick}
        polygonStrokeWidth={0.1}
        animateIn={true}
        width={undefined}
        height={undefined}
      />
    </div>
  )
}