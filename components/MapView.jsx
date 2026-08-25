'use client'

import { useEffect, useMemo, useState } from 'react'
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps'
import { feature as topoFeature } from 'topojson-client'
import { geoArea, geoBounds, geoCentroid } from 'd3-geo'
import { Plus, Minus, RotateCcw } from 'lucide-react'
import { colorForCount } from '@/lib/color'
import { buildCountryNameIndex, matchGeoToCountry } from '@/lib/country-codes'
import CountryPopup from './CountryPopup'
import MapSearch from './MapSearch'

// Hosted locally (committed to public/) so the map works offline and never
// depends on a CDN. 50m resolution so microstates like Singapore, Malta and
// Monaco exist as clickable shapes at all.
const GEO_URL = '/geo/countries-50m.json'

const INITIAL_POSITION = { coordinates: [15, 10], zoom: 1 }
const MIN_ZOOM = 1
const MAX_ZOOM = 24

const HIGHLIGHT_FILL = '#F59E0B' // amber-500, deliberately outside the purple heat scale
const HIGHLIGHT_STROKE = '#B45309' // amber-700

function clampZoom(zoom) {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom))
}

// Centroid + zoom that frame a country nicely. Uses the country's largest
// polygon so overseas territories (France, US) don't wreck the framing.
function framingForFeature(geoFeature) {
  let target = geoFeature
  if (geoFeature.geometry?.type === 'MultiPolygon') {
    let best = null
    let bestArea = -1
    for (const coordinates of geoFeature.geometry.coordinates) {
      const part = { type: 'Feature', geometry: { type: 'Polygon', coordinates } }
      const area = geoArea(part)
      if (area > bestArea) {
        bestArea = area
        best = part
      }
    }
    if (best) target = best
  }

  const [[minLon, minLat], [maxLon, maxLat]] = geoBounds(target)
  // Antimeridian-crossing bounds come back with minLon > maxLon
  const lonSpan = minLon > maxLon ? 360 - minLon + maxLon : maxLon - minLon
  const latSpan = maxLat - minLat
  const zoom = clampZoom(0.3 * Math.min(360 / Math.max(lonSpan, 0.05), 180 / Math.max(latSpan, 0.05)))
  return { coordinates: geoCentroid(target), zoom }
}

export default function MapView({ countriesData = [], maxVisitCount, onDataRefresh, isLoading }) {
  const [position, setPosition] = useState(INITIAL_POSITION)
  const [highlighted, setHighlighted] = useState(null) // country record from search
  const [geoFeatures, setGeoFeatures] = useState(null)
  const [popupData, setPopupData] = useState({
    isOpen: false,
    countryName: '',
    countryData: null,
    restaurants: []
  })

  // Load the topojson once and convert to GeoJSON features; also reused for
  // search zoom-to framing.
  useEffect(() => {
    let cancelled = false
    fetch(GEO_URL)
      .then(res => res.json())
      .then(topology => {
        if (cancelled) return
        setGeoFeatures(topoFeature(topology, topology.objects.countries).features)
      })
      .catch(error => console.error('Failed to load map data:', error))
    return () => { cancelled = true }
  }, [])

  const countryNameIndex = useMemo(() => buildCountryNameIndex(countriesData), [countriesData])

  const openCountryPopup = async (geoName, country) => {
    try {
      const response = await fetch(`/api/country?code=${country.country_code}`)
      if (!response.ok) throw new Error(`Failed to fetch country details: ${response.status}`)
      const fullCountryData = await response.json()
      setPopupData({
        isOpen: true,
        countryName: fullCountryData.name || geoName,
        countryData: fullCountryData,
        restaurants: fullCountryData.restaurants || []
      })
    } catch (error) {
      console.error('Error fetching country details:', error)
      setPopupData({
        isOpen: true,
        countryName: geoName,
        countryData: { name: geoName, cuisine_style: 'Local', visit_count: 0, id: null },
        restaurants: []
      })
    }
  }

  const handleGeographyClick = (geo) => {
    const geoName = geo.properties.name
    const country = matchGeoToCountry(geoName, countryNameIndex)
    if (!country) {
      console.warn(`No tracked country for map region: ${geoName}`)
      return
    }
    openCountryPopup(geoName, country)
  }

  const closePopup = () => {
    setPopupData({ isOpen: false, countryName: '', countryData: null, restaurants: [] })
  }

  const handleSearchSelect = (country) => {
    setHighlighted(country)
    const geoFeature = (geoFeatures || []).find(
      f => matchGeoToCountry(f.properties.name, countryNameIndex)?.country_code === country.country_code
    )
    if (geoFeature) {
      setPosition(framingForFeature(geoFeature))
    }
  }

  const handleSearchClear = () => setHighlighted(null)

  const zoomBy = (factor) => {
    setPosition(pos => ({ ...pos, zoom: clampZoom(pos.zoom * factor) }))
  }

  const resetView = () => {
    setPosition(INITIAL_POSITION)
    setHighlighted(null)
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

  const strokeWidth = 0.5 / Math.sqrt(position.zoom)

  return (
    <>
      <div className="w-full h-full bg-blue-50 relative">
        <MapSearch
          countriesData={countriesData}
          selectedCountry={highlighted}
          onSelect={handleSearchSelect}
          onClear={handleSearchClear}
        />

        {/* Zoom controls */}
        <div className="absolute bottom-4 right-3 z-10 flex flex-col gap-1.5">
          <button
            onClick={() => zoomBy(1.6)}
            className="w-9 h-9 rounded-lg bg-white/95 backdrop-blur-sm border shadow-md flex items-center justify-center text-gray-700 hover:bg-purple-50 active:bg-purple-100 transition-colors"
            aria-label="Zoom in"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={() => zoomBy(1 / 1.6)}
            className="w-9 h-9 rounded-lg bg-white/95 backdrop-blur-sm border shadow-md flex items-center justify-center text-gray-700 hover:bg-purple-50 active:bg-purple-100 transition-colors"
            aria-label="Zoom out"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            onClick={resetView}
            className="w-9 h-9 rounded-lg bg-white/95 backdrop-blur-sm border shadow-md flex items-center justify-center text-gray-700 hover:bg-purple-50 active:bg-purple-100 transition-colors"
            aria-label="Reset view"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ scale: 120, center: [0, 0] }}
          width={800}
          height={600}
          style={{ width: '100%', height: '100%', cursor: 'pointer', minHeight: '400px' }}
        >
          <ZoomableGroup
            center={position.coordinates}
            zoom={position.zoom}
            minZoom={MIN_ZOOM}
            maxZoom={MAX_ZOOM}
            onMoveEnd={({ coordinates, zoom }) => setPosition({ coordinates, zoom })}
          >
            {geoFeatures && (
              <Geographies geography={geoFeatures}>
                {({ geographies }) =>
                  geographies.map((geo) => {
                    const country = matchGeoToCountry(geo.properties.name, countryNameIndex)
                    const visitCount = country?.visit_count || 0
                    const isHighlighted = !!highlighted && country?.country_code === highlighted.country_code
                    const fillColor = isHighlighted
                      ? HIGHLIGHT_FILL
                      : colorForCount(visitCount, maxVisitCount)

                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill={fillColor}
                        stroke={isHighlighted ? HIGHLIGHT_STROKE : '#666'}
                        strokeWidth={isHighlighted ? strokeWidth * 2 : strokeWidth}
                        onClick={() => handleGeographyClick(geo)}
                        style={{
                          default: { outline: 'none', cursor: 'pointer' },
                          hover: {
                            fill: isHighlighted ? HIGHLIGHT_FILL : (visitCount > 0 ? '#7C3AED' : '#E9D5FF'),
                            outline: 'none',
                            cursor: 'pointer'
                          },
                          pressed: { fill: '#7C3AED', outline: 'none', cursor: 'pointer' }
                        }}
                      />
                    )
                  })
                }
              </Geographies>
            )}
          </ZoomableGroup>
        </ComposableMap>
      </div>

      <CountryPopup
        isOpen={popupData.isOpen}
        onClose={closePopup}
        countryName={popupData.countryName}
        countryData={popupData.countryData}
        restaurants={popupData.restaurants}
        onDataRefresh={onDataRefresh}
      />
    </>
  )
}
