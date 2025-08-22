'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Crown, Cat } from 'lucide-react'

export default function AddVisitForm({ onSuccess }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFusion, setIsFusion] = useState(false)
  
  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm()

  // Query for countries list
  const { data: countries = [] } = useQuery({
    queryKey: ['countries'],
    queryFn: async () => {
      const response = await fetch('/api/countries')
      if (!response.ok) throw new Error('Failed to fetch countries')
      return response.json()
    }
  })

  const handleFormSubmit = async (data) => {
    setIsSubmitting(true)
    
    try {
      const payload = {
        country_id: data.country_id,
        restaurant_name: data.restaurant_name,
        location: data.location,
        items_devoured: data.items_devoured,
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

      {/* Country Selection */}
      <div className="space-y-2">
        <Label htmlFor="country_id">Country *</Label>
        <Select onValueChange={(value) => setValue('country_id', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select country" />
          </SelectTrigger>
          <SelectContent>
            {countries.map((country) => (
              <SelectItem key={country.id} value={country.id}>
                {country.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
          Fusion cuisine? (Add to second country too)
        </Label>
      </div>

      {/* Fusion Country Selection */}
      {isFusion && (
        <div className="space-y-2">
          <Label htmlFor="fusion_country_id">Fusion Country</Label>
          <Select onValueChange={(value) => setValue('fusion_country_id', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select fusion country" />
            </SelectTrigger>
            <SelectContent>
              {countries.map((country) => (
                <SelectItem key={country.id} value={country.id}>
                  {country.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

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

      {/* Items Devoured */}
      <div className="space-y-2">
        <Label htmlFor="items_devoured">Items Devoured *</Label>
        <Textarea
          id="items_devoured"
          {...register('items_devoured', { required: 'Please list what you ate' })}
          placeholder="Describe the delicious dishes you tried..."
          rows={3}
        />
        {errors.items_devoured && (
          <p className="text-sm text-red-600">{errors.items_devoured.message}</p>
        )}
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
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Adding Visit...' : 'Add Visit'}
      </Button>
    </form>
  )
}