'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Search, X, MapPin, Utensils } from 'lucide-react'

// The list view: search across countries AND restaurants, then the
// country cards sorted by visit count. Used for both desktop and mobile.
export default function CountryList({
  countries,
  restaurants,
  searchTerm,
  onSearchChange,
  onCountrySelect,
  onRestaurantSelect
}) {
  const term = searchTerm.trim().toLowerCase()

  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(term)
  )

  const matchingRestaurants = term
    ? restaurants.filter(r =>
        r.restaurant_name.toLowerCase().includes(term) ||
        (r.location || '').toLowerCase().includes(term)
      )
    : []

  return (
    <div className="p-4 md:p-6 h-full overflow-y-auto">
      <h3 className="text-lg font-semibold mb-4">All Countries</h3>

      {/* Search Bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder="Search countries or restaurants..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-10"
        />
        {searchTerm && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Restaurant matches */}
      {matchingRestaurants.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-1">
            <Utensils className="w-3.5 h-3.5" />
            Restaurants
          </h4>
          <div className="grid gap-2">
            {matchingRestaurants.map((restaurant) => (
              <Card
                key={restaurant.id}
                className="p-3 cursor-pointer hover:bg-purple-50 transition-colors"
                onClick={() => onRestaurantSelect(restaurant)}
              >
                <div className="flex justify-between items-center gap-2">
                  <div className="min-w-0">
                    <div className="font-medium text-sm md:text-base truncate">
                      {restaurant.restaurant_name}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span className="truncate">{restaurant.location}</span>
                    </div>
                  </div>
                  {restaurant.country_name && (
                    <Badge variant="outline" className="text-xs shrink-0">
                      {restaurant.country_name}
                    </Badge>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Country matches */}
      {matchingRestaurants.length > 0 && filteredCountries.length > 0 && (
        <h4 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5" />
          Countries
        </h4>
      )}
      <div className="grid gap-2">
        {filteredCountries
          .slice()
          .sort((a, b) => (b.visit_count || 0) - (a.visit_count || 0))
          .map((country) => (
            <Card
              key={country.country_code}
              className="p-3 cursor-pointer hover:bg-purple-50 transition-colors"
              onClick={() => onCountrySelect(country.country_code)}
            >
              <div className="flex justify-between items-center">
                <span className="font-medium text-sm md:text-base">{country.name}</span>
                <Badge variant={country.visit_count > 0 ? 'default' : 'secondary'} className="text-xs">
                  {country.visit_count || 0} visits
                </Badge>
              </div>
            </Card>
          ))}
        {filteredCountries.length === 0 && matchingRestaurants.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-6">
            No countries or restaurants match "{searchTerm}"
          </p>
        )}
      </div>
    </div>
  )
}
