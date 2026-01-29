'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Crown, Cat, ChefHat, MapPin, Plus, Search, Star } from 'lucide-react'
import RestaurantSearch from './RestaurantSearch'
import StarRating from '@/components/ui/star-rating'

export default function AddVisitForm({ onSuccess, onCancel, prefilledCountryId = null, prefilledCuisine = null }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFusion, setIsFusion] = useState(false)
  const [selectedCuisine, setSelectedCuisine] = useState(prefilledCuisine || '')
  const [selectedFusionCuisine, setSelectedFusionCuisine] = useState('')
  const [cuisineOpen, setCuisineOpen] = useState(false)
  const [fusionCuisineOpen, setFusionCuisineOpen] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [rating, setRating] = useState(0)
  
  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm()
  const queryClient = useQueryClient()

  // Query for cuisines list
  const { data: cuisines = [] } = useQuery({
    queryKey: ['cuisines'],
    queryFn: async () => {
      const response = await fetch('/api/cuisines')
      if (!response.ok) throw new Error('Failed to fetch cuisines')
      return response.json()
    }
  })

  // Query for countries list (filtered by cuisine)
  const { data: countries = [], refetch: refetchCountries } = useQuery({
    queryKey: ['countries', selectedCuisine],
    queryFn: async () => {
      const url = selectedCuisine ? `/api/countries?cuisine=${selectedCuisine}` : '/api/countries'
      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to fetch countries')
      return response.json()
    },
    enabled: !!selectedCuisine
  })

  // Query for fusion countries list (filtered by fusion cuisine)
  const { data: fusionCountries = [] } = useQuery({
    queryKey: ['countries', selectedFusionCuisine],
    queryFn: async () => {
      const url = selectedFusionCuisine ? `/api/countries?cuisine=${selectedFusionCuisine}` : '/api/countries'
      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to fetch fusion countries')
      return response.json()
    },
    enabled: !!selectedFusionCuisine && isFusion
  })

  // Handle cuisine change
  const handleCuisineChange = (cuisine) => {
    setSelectedCuisine(cuisine)
    setValue('country_id', '') // Reset country selection
  }

  // Handle restaurant search selection
  const handleRestaurantSearchSelect = (restaurantData) => {
    // Auto-fill form fields based on search results
    setValue('restaurant_name', restaurantData.restaurant_name)
    setValue('location', restaurantData.location)
    
    // Set cuisine and trigger country fetch
    setSelectedCuisine(restaurantData.cuisine_type)
    
    // Try to auto-select country if available
    if (restaurantData.country_code && countries.length > 0) {
      // Find country by country code or name
      const matchingCountry = countries.find(c => 
        c.country_code === restaurantData.country_code || 
        c.name === restaurantData.country
      )
      
      if (matchingCountry) {
        setValue('country_id', matchingCountry.id)
      }
    }
    
    // Close search view
    setShowSearch(false)
  }

  // Handle fusion cuisine change
  const handleFusionCuisineChange = (cuisine) => {
    setSelectedFusionCuisine(cuisine)
    setValue('fusion_country_id', '') // Reset fusion country selection
  }

  // Set prefilled country and cuisine if provided
  useEffect(() => {
    if (prefilledCountryId && countries.length > 0) {
      const country = countries.find(c => c.id === prefilledCountryId)
      if (country) {
        setValue('country_id', prefilledCountryId)
        setSelectedCuisine(country.cuisine_style)
      }
    }
  }, [prefilledCountryId, countries, setValue])

  // Set prefilled cuisine if provided
  useEffect(() => {
    if (prefilledCuisine) {
      setSelectedCuisine(prefilledCuisine)
      setCuisineOpen(false)
    }
  }, [prefilledCuisine])

  const handleFormSubmit = async (data) => {
    setIsSubmitting(true)
    
    try {
      const payload = {
        country_id: data.country_id,
        restaurant_name: data.restaurant_name,
        location: data.location,
        items_devoured: data.items_devoured || '', // Optional field
        king_julien_favorite: data.king_julien_favorite || null,
        mort_favorite: data.mort_favorite || null,
        rating: rating || null,
        is_fusion: isFusion,
        fusion_country_id: isFusion ? data.fusion_country_id : null
      }

      const response = await fetch('/api/visit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to add visit')
      }

      const result = await response.json()
      
      // Clear all caches completely
      queryClient.clear()
      
      // Reset form and call success callback
      reset()
      setIsFusion(false)
      setSelectedCuisine('')
      setSelectedFusionCuisine('')
      setCuisineOpen(false)
      setFusionCuisineOpen(false)
      setRating(0)
      onSuccess?.(result)
    } catch (error) {
      console.error('Error adding visit:', error)
      alert('Failed to add visit: ' + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    // Reset form state
    reset()
    setIsFusion(false)
    setSelectedCuisine('')
    setSelectedFusionCuisine('')
    setCuisineOpen(false)
    setFusionCuisineOpen(false)
    setRating(0)
    onCancel?.()
  }

  // Show search component if enabled
  if (showSearch) {
    return (
      <div className="space-y-4">
        <RestaurantSearch 
          onRestaurantSelect={handleRestaurantSearchSelect}
          onCancel={() => setShowSearch(false)}
        />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-3 max-h-[70vh] overflow-y-auto">
      {/* Restaurant Search Option */}
      <div className="space-y-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowSearch(true)}
          className="w-full bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 h-9 sm:h-10 text-sm"
        >
          <Search className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Search Restaurant on Google Maps</span>
          <span className="sm:hidden">Search Restaurants</span>
        </Button>
        <p className="text-xs text-gray-500 text-center">
          Auto-fill restaurant details, cuisine, and location
        </p>
        <p className="text-xs text-blue-600 text-center font-medium">
          ✨ New Feature: Search and auto-fill from Google Maps!
        </p>
      </div>

      {/* Primary Cuisine Selection - First Field */}
      <div className="space-y-1">
        <Label htmlFor="cuisine" className="flex items-center gap-2 text-xs">
          <ChefHat className="w-3 h-3" />
          Cuisine Type *
        </Label>
        <Popover open={cuisineOpen} onOpenChange={setCuisineOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={cuisineOpen}
              className="w-full justify-between h-8 text-xs"
            >
              {selectedCuisine
                ? cuisines.find((cuisine) => cuisine.value === selectedCuisine)?.label
                : "Select cuisine type..."}
              <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              <CommandInput placeholder="Search cuisines..." className="h-8" />
              <CommandEmpty>No cuisine found.</CommandEmpty>
              <CommandGroup className="max-h-48 overflow-auto">
                {cuisines.map((cuisine) => (
                  <CommandItem
                    key={cuisine.value}
                    value={cuisine.value}
                    onSelect={(currentValue) => {
                      handleCuisineChange(currentValue)
                      setCuisineOpen(false)
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-3 w-3",
                        selectedCuisine === cuisine.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {cuisine.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
        {!selectedCuisine && (
          <p className="text-xs text-red-600">Please select a cuisine type</p>
        )}
      </div>

      {/* Country Selection - Filtered by Cuisine */}
      <div className="space-y-1">
        <Label htmlFor="country_id" className="flex items-center gap-2 text-xs">
          <MapPin className="w-3 h-3" />
          Country *
        </Label>
        <Select 
          onValueChange={(value) => setValue('country_id', value)}
          disabled={!selectedCuisine}
        >
          <SelectTrigger className="h-8">
            <SelectValue placeholder={selectedCuisine ? "Select country" : "Select cuisine first"} />
          </SelectTrigger>
          <SelectContent>
            {countries.map((country) => (
              <SelectItem key={country.id} value={country.id}>
                {country.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {countries.length === 0 && selectedCuisine && (
          <p className="text-xs text-yellow-600">No countries found for {selectedCuisine} cuisine</p>
        )}
        {errors.country_id && (
          <p className="text-xs text-red-600">Country is required</p>
        )}
      </div>

      {/* Fusion Checkbox */}
      <div className="flex items-center space-x-2">
        <Checkbox 
          id="fusion" 
          checked={isFusion}
          onCheckedChange={setIsFusion}
        />
        <Label htmlFor="fusion" className="text-xs font-medium">
          Fusion cuisine? (Add to second cuisine/country too)
        </Label>
      </div>

      {/* Fusion Cuisine and Country Selection */}
      {isFusion && (
        <Card className="border-orange-200 bg-orange-50 p-2">
          <CardHeader className="pb-1">
            <CardTitle className="text-xs flex items-center gap-2">
              <Plus className="w-3 h-3" />
              Fusion Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            {/* Fusion Cuisine Selection */}
            <div className="space-y-1">
              <Label htmlFor="fusion_cuisine" className="text-xs">Fusion Cuisine Type *</Label>
              <Popover open={fusionCuisineOpen} onOpenChange={setFusionCuisineOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={fusionCuisineOpen}
                    className="w-full justify-between h-8 text-xs"
                  >
                    {selectedFusionCuisine
                      ? cuisines.find((cuisine) => cuisine.value === selectedFusionCuisine)?.label
                      : "Select fusion cuisine type..."}
                    <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search fusion cuisines..." className="h-8" />
                    <CommandEmpty>No cuisine found.</CommandEmpty>
                    <CommandGroup className="max-h-48 overflow-auto">
                      {cuisines.map((cuisine) => (
                        <CommandItem
                          key={cuisine.value}
                          value={cuisine.value}
                          onSelect={(currentValue) => {
                            handleFusionCuisineChange(currentValue)
                            setFusionCuisineOpen(false)
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-3 w-3",
                              selectedFusionCuisine === cuisine.value ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {cuisine.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Fusion Country Selection */}
            <div className="space-y-1">
              <Label htmlFor="fusion_country_id" className="text-xs">Fusion Country *</Label>
              <Select 
                onValueChange={(value) => setValue('fusion_country_id', value)}
                disabled={!selectedFusionCuisine}
              >
                <SelectTrigger className="h-8">
                  <SelectValue placeholder={selectedFusionCuisine ? "Select fusion country" : "Select fusion cuisine first"} />
                </SelectTrigger>
                <SelectContent>
                  {fusionCountries.map((country) => (
                    <SelectItem key={country.id} value={country.id}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Restaurant Name */}
      <div className="space-y-1">
        <Label htmlFor="restaurant_name" className="text-xs">Restaurant Name *</Label>
        <Input
          id="restaurant_name"
          {...register('restaurant_name', { required: 'Restaurant name is required' })}
          placeholder="Enter restaurant name"
          className="h-8"
        />
        {errors.restaurant_name && (
          <p className="text-xs text-red-600">{errors.restaurant_name.message}</p>
        )}
      </div>

      {/* Location */}
      <div className="space-y-1">
        <Label htmlFor="location" className="text-xs">Location *</Label>
        <Input
          id="location"
          {...register('location', { required: 'Location is required' })}
          placeholder="City, Address, etc."
          className="h-8"
        />
        {errors.location && (
          <p className="text-xs text-red-600">{errors.location.message}</p>
        )}
      </div>

      {/* Rating */}
      <div className="space-y-1">
        <Label htmlFor="rating" className="flex items-center gap-2 text-xs">
          <Star className="w-3 h-3 text-yellow-500" />
          Rating
        </Label>
        <div className="p-3 border rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
          <StarRating
            value={rating}
            onChange={setRating}
            size="lg"
            showValue={true}
            className="justify-center"
          />
          <p className="text-xs text-gray-600 text-center mt-2">
            How was your overall experience?
          </p>
        </div>
      </div>

      {/* Items Devoured - Optional */}
      <div className="space-y-1">
        <Label htmlFor="items_devoured" className="text-xs">Items Devoured</Label>
        <Textarea
          id="items_devoured"
          {...register('items_devoured')}
          placeholder="Describe the delicious dishes you tried..."
          rows={2}
          className="min-h-[60px]"
        />
        <p className="text-xs text-gray-500">Optional</p>
      </div>

      {/* King Julien's Favorite */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader className="pb-1">
          <CardTitle className="text-xs flex items-center gap-2">
            <Crown className="w-3 h-3 text-yellow-600" />
            King Julien's Favorite
          </CardTitle>
          <CardDescription className="text-xs">
            What did the royal lemur love most?
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <Input
            {...register('king_julien_favorite')}
            placeholder="Royal choice..."
            className="h-8"
          />
        </CardContent>
      </Card>

      {/* Mort's Favorite */}
      <Card className="border-gray-200 bg-gray-50">
        <CardHeader className="pb-1">
          <CardTitle className="text-xs flex items-center gap-2">
            <Cat className="w-3 h-3 text-gray-600" />
            Mort's Favorite
          </CardTitle>
          <CardDescription className="text-xs">
            What made little Mort happiest?
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <Input
            {...register('mort_favorite')}
            placeholder="Mort's delight..."
            className="h-8"
          />
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2">
        <Button 
          type="button"
          variant="outline"
          onClick={handleCancel}
          className="flex-1 h-10"
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          className="flex-1 bg-purple-600 hover:bg-purple-700 h-10"
          disabled={isSubmitting || !selectedCuisine || (isFusion && !selectedFusionCuisine)}
        >
          {isSubmitting ? 'Adding Visit...' : 'Add Visit'}
        </Button>
      </div>
    </form>
  )
}