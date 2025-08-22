'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Crown, Cat, ChefHat, MapPin, Plus } from 'lucide-react'

export default function AddVisitForm({ onSuccess, prefilledCountryId = null }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFusion, setIsFusion] = useState(false)
  const [selectedCuisine, setSelectedCuisine] = useState('')
  const [selectedFusionCuisine, setSelectedFusionCuisine] = useState('')
  
  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm()

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

  // Handle fusion cuisine change
  const handleFusionCuisineChange = (cuisine) => {
    setSelectedFusionCuisine(cuisine)
    setValue('fusion_country_id', '') // Reset fusion country selection
  }

  // Set prefilled country if provided
  useEffect(() => {
    if (prefilledCountryId && countries.length > 0) {
      const country = countries.find(c => c.id === prefilledCountryId)
      if (country) {
        setValue('country_id', prefilledCountryId)
        setSelectedCuisine(country.cuisine_style)
      }
    }
  }, [prefilledCountryId, countries, setValue])

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
      
      // Reset form and call success callback
      reset()
      setIsFusion(false)
      setSelectedCuisine('')
      setSelectedFusionCuisine('')
      onSuccess?.(result)
    } catch (error) {
      console.error('Error adding visit:', error)
      alert('Failed to add visit: ' + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {/* Primary Cuisine Selection - First Field */}
      <div className="space-y-2">
        <Label htmlFor="cuisine" className="flex items-center gap-2">
          <ChefHat className="w-4 h-4" />
          Cuisine Type *
        </Label>
        <Select value={selectedCuisine} onValueChange={handleCuisineChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select cuisine type" />
          </SelectTrigger>
          <SelectContent>
            {cuisines.map((cuisine) => (
              <SelectItem key={cuisine.value} value={cuisine.value}>
                {cuisine.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {!selectedCuisine && (
          <p className="text-sm text-red-600">Please select a cuisine type</p>
        )}
      </div>

      {/* Country Selection - Filtered by Cuisine */}
      <div className="space-y-2">
        <Label htmlFor="country_id" className="flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          Country *
        </Label>
        <Select 
          onValueChange={(value) => setValue('country_id', value)}
          disabled={!selectedCuisine}
        >
          <SelectTrigger>
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
          <p className="text-sm text-yellow-600">No countries found for {selectedCuisine} cuisine</p>
        )}
        {errors.country_id && (
          <p className="text-sm text-red-600">Country is required</p>
        )}
      </div>

      {/* Fusion Checkbox */}
      <div className="flex items-center space-x-2">
        <Checkbox 
          id="fusion" 
          checked={isFusion}
          onCheckedChange={setIsFusion}
        />
        <Label htmlFor="fusion" className="text-sm font-medium">
          Fusion cuisine? (Add to second cuisine/country too)
        </Label>
      </div>

      {/* Fusion Cuisine and Country Selection */}
      {isFusion && (
        <Card className="border-orange-200 bg-orange-50 p-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Fusion Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Fusion Cuisine Selection */}
            <div className="space-y-2">
              <Label htmlFor="fusion_cuisine">Fusion Cuisine Type *</Label>
              <Select value={selectedFusionCuisine} onValueChange={handleFusionCuisineChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select fusion cuisine type" />
                </SelectTrigger>
                <SelectContent>
                  {cuisines.map((cuisine) => (
                    <SelectItem key={cuisine.value} value={cuisine.value}>
                      {cuisine.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Fusion Country Selection */}
            <div className="space-y-2">
              <Label htmlFor="fusion_country_id">Fusion Country *</Label>
              <Select 
                onValueChange={(value) => setValue('fusion_country_id', value)}
                disabled={!selectedFusionCuisine}
              >
                <SelectTrigger>
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
      <div className="space-y-2">
        <Label htmlFor="restaurant_name">Restaurant Name *</Label>
        <Input
          id="restaurant_name"
          {...register('restaurant_name', { required: 'Restaurant name is required' })}
          placeholder="Enter restaurant name"
        />
        {errors.restaurant_name && (
          <p className="text-sm text-red-600">{errors.restaurant_name.message}</p>
        )}
      </div>

      {/* Location */}
      <div className="space-y-2">
        <Label htmlFor="location">Location *</Label>
        <Input
          id="location"
          {...register('location', { required: 'Location is required' })}
          placeholder="City, Address, etc."
        />
        {errors.location && (
          <p className="text-sm text-red-600">{errors.location.message}</p>
        )}
      </div>

      {/* Items Devoured - Optional */}
      <div className="space-y-2">
        <Label htmlFor="items_devoured">Items Devoured</Label>
        <Textarea
          id="items_devoured"
          {...register('items_devoured')}
          placeholder="Describe the delicious dishes you tried..."
          rows={3}
        />
        <p className="text-xs text-gray-500">Optional</p>
      </div>

      {/* King Julien's Favorite */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Crown className="w-4 h-4 text-yellow-600" />
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
          />
        </CardContent>
      </Card>

      {/* Mort's Favorite */}
      <Card className="border-gray-200 bg-gray-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Cat className="w-4 h-4 text-gray-600" />
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
          />
        </CardContent>
      </Card>

      {/* Submit Button */}
      <Button 
        type="submit" 
        className="w-full bg-purple-600 hover:bg-purple-700"
        disabled={isSubmitting || !selectedCuisine || (isFusion && !selectedFusionCuisine)}
      >
        {isSubmitting ? 'Adding Visit...' : 'Add Visit'}
      </Button>
    </form>
  )
}