'use client'

import { useState, useRef, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Search, X, MapPin } from 'lucide-react'
import { normalizeCountryName } from '@/lib/country-codes'

// Search box overlaid on the map. Selecting a country zooms the map to it
// and highlights it until dismissed.
export default function MapSearch({ countriesData, selectedCountry, onSelect, onClear }) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)

  // Close the dropdown when tapping outside
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('pointerdown', handler)
    return () => document.removeEventListener('pointerdown', handler)
  }, [])

  const term = normalizeCountryName(query)
  const matches = term
    ? countriesData
        .filter(c => normalizeCountryName(c.name).includes(term))
        .slice(0, 8)
    : []

  const handleSelect = (country) => {
    setQuery('')
    setOpen(false)
    onSelect(country)
  }

  const handleClear = () => {
    setQuery('')
    setOpen(false)
    onClear()
  }

  return (
    <div ref={containerRef} className="absolute top-3 left-3 z-10 w-56 sm:w-64">
      {selectedCountry ? (
        <div className="flex items-center gap-2 bg-white/95 backdrop-blur-sm border border-amber-300 rounded-lg shadow-md px-3 py-2">
          <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
          <span className="text-sm font-medium truncate flex-1">{selectedCountry.name}</span>
          <button
            onClick={handleClear}
            className="text-gray-400 hover:text-gray-600 transition-colors shrink-0"
            aria-label="Clear country highlight"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Find a country..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setOpen(true)
              }}
              onFocus={() => setOpen(true)}
              className="pl-9 pr-8 h-9 bg-white/95 backdrop-blur-sm shadow-md"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          {open && matches.length > 0 && (
            <div className="mt-1 bg-white rounded-lg border shadow-lg overflow-hidden">
              {matches.map((country) => (
                <button
                  key={country.country_code}
                  onClick={() => handleSelect(country)}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-purple-50 transition-colors flex justify-between items-center gap-2"
                >
                  <span className="truncate">{country.name}</span>
                  {country.visit_count > 0 && (
                    <span className="text-xs text-purple-600 shrink-0">
                      {country.visit_count} visit{country.visit_count !== 1 ? 's' : ''}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
          {open && term && matches.length === 0 && (
            <div className="mt-1 bg-white rounded-lg border shadow-lg px-3 py-2 text-sm text-gray-500">
              No country found
            </div>
          )}
        </>
      )}
    </div>
  )
}
