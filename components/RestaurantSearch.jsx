'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, MapPin, ChefHat, Star, Clock, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useQuery } from '@tanstack/react-query'
import { mapCuisineType, getCuisineDisplayName } from '@/lib/cuisine-mapping'

export default function RestaurantSearch({ onRestaurantSelect, onCancel }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [location, setLocation] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const searchTimeoutRef = useRef(null)

  // Debounced search query with proper debouncing
  const [debouncedQuery, setDebouncedQuery] = useState('')
  
  // Debounce the search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery)
    }, 800) // Wait 800ms after user stops typing
    
    return () => clearTimeout(timer)
  }, [searchQuery])
  
  const debouncedSearchQuery = useQuery({
    queryKey: ['places', debouncedQuery, location],
    queryFn: async () => {
      if (!debouncedQuery.trim()) return []
      
      const params = new URLSearchParams({ query: debouncedQuery })
      if (location.trim()) {
        params.append('location', location)
      }
      
      const response = await fetch(`/api/places/search?${params}`)
      if (!response.ok) throw new Error('Failed to search places')
      return response.json()
    },
    enabled: !!debouncedQuery.trim() && debouncedQuery.length >= 3, // Only search if 3+ characters
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Handle search input changes
  const handleSearchChange = (value) => {
    setSearchQuery(value)
    setIsSearching(!!value.trim())
  }

  // Handle restaurant selection
  const handleRestaurantSelect = (restaurant) => {
    // Map Google Places data to form fields
    const formData = {
      restaurant_name: restaurant.name,
      location: restaurant.formatted_address,
      cuisine_type: mapCuisineType(restaurant.cuisine_type),
      country: restaurant.country,
      country_code: restaurant.country_code,
      // Additional data that might be useful
      place_id: restaurant.place_id,
      rating: restaurant.rating,
      price_level: restaurant.price_level,
      website: restaurant.website,
      phone: restaurant.phone
    }
    
    onRestaurantSelect(formData)
  }

  // Get cuisine display name using the utility function
  const getCuisineDisplayNameLocal = (cuisineType) => {
    return getCuisineDisplayName(cuisineType)
  }

  // Get price level display
  const getPriceLevelDisplay = (priceLevel) => {
    if (!priceLevel) return 'N/A'
    return '$'.repeat(priceLevel)
  }

  // Get rating display
  const getRatingDisplay = (rating) => {
    if (!rating) return 'N/A'
    return `${rating}/5`
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <Search className="w-4 h-4 sm:w-5 sm:h-5" />
            Search Restaurants
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Search for restaurants using Google Maps to auto-fill form fields
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
          {/* Search Input */}
          <div className="space-y-1.5 sm:space-y-2">
            <label htmlFor="restaurant-search" className="text-xs sm:text-sm font-medium">
              Restaurant Name or Keywords
            </label>
            <Input
              id="restaurant-search"
              placeholder="e.g., Italian restaurant, Sushi bar, etc."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="h-9 sm:h-10 text-sm"
            />
          </div>

          {/* Location Input */}
          <div className="space-y-1.5 sm:space-y-2">
            <label htmlFor="location-search" className="text-xs sm:text-sm font-medium">
              Location (Optional)
            </label>
            <Input
              id="location-search"
              placeholder="e.g., New York, NY or specific address"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="h-9 sm:h-10 text-sm"
            />
          </div>

          {/* Cancel Button */}
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="w-full h-9 sm:h-10 text-sm"
          >
            Cancel
          </Button>
        </CardContent>
      </Card>

                          {/* Search Results */}
          {isSearching && searchQuery.trim() && (
            <div className="space-y-2 sm:space-y-3">
              <h3 className="text-xs sm:text-sm font-medium text-gray-700">
                Search Results
              </h3>
              
              {/* Show minimum character requirement */}
              {searchQuery.length < 3 && (
                <div className="text-center py-2">
                  <div className="text-xs sm:text-sm text-gray-500">
                    Type at least 3 characters to search...
                  </div>
                </div>
              )}
              
              {/* Show debouncing indicator */}
              {searchQuery.length >= 3 && searchQuery !== debouncedQuery && (
                <div className="text-center py-2">
                  <div className="animate-pulse text-xs sm:text-sm text-gray-500">
                    Waiting for you to finish typing...
                  </div>
                </div>
              )}
              
              {debouncedSearchQuery.isLoading && (
                <div className="text-center py-3 sm:py-4">
                  <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-purple-600 mx-auto"></div>
                  <p className="text-xs sm:text-sm text-gray-500 mt-2">Searching restaurants...</p>
                </div>
              )}

              {debouncedSearchQuery.error && (
                <Card className="border-red-200 bg-red-50">
                  <CardContent className="p-3 sm:p-4">
                    <p className="text-xs sm:text-sm text-red-600">
                      Error searching restaurants: {debouncedSearchQuery.error.message}
                    </p>
                    {debouncedSearchQuery.error.message.includes('Google Maps API not configured') && (
                      <p className="text-xs text-red-500 mt-2">
                        Please configure your Google Maps API key in the environment variables.
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}

              {debouncedSearchQuery.data && debouncedSearchQuery.data.length > 0 && (
                <div className="space-y-2 sm:space-y-3">
                  {debouncedSearchQuery.data.map((restaurant) => (
                    <Card 
                      key={restaurant.place_id} 
                      className="cursor-pointer hover:shadow-md transition-shadow border-gray-200 active:scale-95 touch-manipulation"
                      onClick={() => handleRestaurantSelect(restaurant)}
                    >
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                          <div className="flex-1 space-y-2">
                            <h4 className="font-medium text-gray-900 text-sm sm:text-base">
                              {restaurant.name}
                            </h4>
                            
                            <div className="flex items-start gap-2 text-xs sm:text-sm text-gray-600">
                              <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mt-0.5 flex-shrink-0" />
                              <span className="line-clamp-2">{restaurant.formatted_address}</span>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <ChefHat className="w-3 h-3" />
                                <span>{getCuisineDisplayNameLocal(restaurant.cuisine_type)}</span>
                              </div>
                              
                              {restaurant.country && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-blue-500" />
                                  <span>{restaurant.country}</span>
                                </div>
                              )}
                              
                              {restaurant.rating && (
                                <div className="flex items-center gap-1">
                                  <Star className="w-3 h-3 text-yellow-500" />
                                  <span>{getRatingDisplay(restaurant.rating)}</span>
                                </div>
                              )}
                              
                              {restaurant.price_level && (
                                <div className="flex items-center gap-1">
                                  <span className="text-green-600 font-medium">
                                    {getPriceLevelDisplay(restaurant.price_level)}
                                  </span>
                                </div>
                              )}
                            </div>

                            {restaurant.opening_hours && (
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Clock className="w-3 h-3" />
                                <span>
                                  {restaurant.opening_hours.open_now ? 'Open now' : 'Closed'}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2">
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleRestaurantSelect(restaurant)
                              }}
                              className="bg-purple-600 hover:bg-purple-700 h-8 px-3 text-xs min-h-[32px] touch-manipulation"
                            >
                              Select
                            </Button>
                            
                            {restaurant.website && (
                              <a
                                href={restaurant.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-purple-600 hover:text-purple-700 text-xs flex items-center gap-1"
                              >
                                <Globe className="w-3 h-3" />
                                Website
                              </a>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {debouncedSearchQuery.data && debouncedSearchQuery.data.length === 0 && searchQuery.trim() && (
                <Card className="border-gray-200 bg-gray-50">
                  <CardContent className="p-3 sm:p-4">
                    <p className="text-xs sm:text-sm text-gray-500 text-center">
                      No restaurants found for "{searchQuery}"
                      {location && ` in ${location}`}
                    </p>
                    <p className="text-xs text-gray-400 text-center mt-1">
                      Try different keywords or location
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
    </div>
  )
}
