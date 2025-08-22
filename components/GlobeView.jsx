'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { colorForCount, getStrokeColor, GLOBE_OUTLINES_ENABLED } from '@/lib/color'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Map as MapIcon, Globe as GlobeIcon } from 'lucide-react'

// Dynamically import Globe component to avoid SSR issues
const GlobeGL = dynamic(() => import('react-globe.gl'), { 
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
    </div>
  )
})

export default function GlobeView({ countriesData = [], maxVisitCount, onCountryClick, onSwitchToMap, isLoading }) {
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
          fillColor: colorForCount(visitCount, maxVisitCount),
          strokeColor: getStrokeColor(visitCount, maxVisitCount),
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

  // If globe outlines are disabled, show hero card with tap to explore
  if (!GLOBE_OUTLINES_ENABLED) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <Card className="max-w-md text-center">
          <CardHeader>
            <div className="mx-auto mb-4">
              <GlobeIcon className="w-24 h-24 text-purple-600 mx-auto animate-pulse" />
            </div>
            <CardTitle className="text-2xl">Explore the World</CardTitle>
            <CardDescription>
              Discover cuisines from around the globe and track your culinary adventures
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={onSwitchToMap}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              <MapIcon className="w-4 h-4 mr-2" />
              Tap to Explore Map
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full h-full">
      <GlobeGL
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        polygonsData={globeData}
        polygonAltitude={(d) => d.properties.visitCount > 0 ? 0.002 : 0.001}
        polygonCapColor="transparent"
        polygonSideColor="transparent"
        polygonStrokeColor={(d) => d.properties.strokeColor}
        polygonLabel={(d) => `
          <div style="background: rgba(0,0,0,0.8); color: white; padding: 8px; border-radius: 4px; font-size: 12px;">
            <strong>${d.properties.name}</strong><br/>
            Visits: ${d.properties.visitCount || 0}
          </div>
        `}
        onPolygonClick={handleCountryClick}
        polygonStrokeWidth={0.2}
        animateIn={true}
        width={undefined}
        height={undefined}
      />
    </div>
  )
}