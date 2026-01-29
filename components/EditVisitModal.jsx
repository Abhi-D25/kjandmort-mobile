'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Save, X, Loader2, Star } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import StarRating from '@/components/ui/star-rating'

export default function EditVisitModal({ 
  isOpen, 
  onClose, 
  visit, 
  countries = [], 
  onVisitUpdated 
}) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    country_id: '',
    restaurant_name: '',
    location: '',
    items_devoured: '',
    king_julien_favorite: '',
    mort_favorite: '',
    rating: 0,
    is_fusion: false,
    fusion_country_id: '',
    visit_date: ''
  })

  // Update form data when visit changes
  useEffect(() => {
    if (visit) {
      setFormData({
        country_id: visit.country_id || '',
        restaurant_name: visit.restaurant_name || '',
        location: visit.location || '',
        items_devoured: visit.items_devoured || '',
        king_julien_favorite: visit.king_julien_favorite || '',
        mort_favorite: visit.mort_favorite || '',
        rating: visit.rating || 0,
        is_fusion: visit.is_fusion || false,
        fusion_country_id: visit.fusion_country_id || '',
        visit_date: visit.visit_date || ''
      })
    }
  }, [visit])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.restaurant_name.trim() || !formData.location.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in restaurant name and location",
        variant: "destructive"
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`/api/visit/${visit.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error('Failed to update visit')
      }

      const result = await response.json()

      toast({
        title: "Visit Updated! 🎉",
        description: `Successfully updated your visit to ${formData.restaurant_name}`,
        variant: "default"
      })

      // Notify parent component
      if (onVisitUpdated) {
        onVisitUpdated()
      }

      onClose()

    } catch (error) {
      console.error('Error updating visit:', error)
      toast({
        title: "Update Failed",
        description: "Could not update the visit. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen || !visit) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Save className="h-5 w-5 text-purple-600" />
            Edit Restaurant Visit
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Country Selection */}
          <div className="space-y-2">
            <Label htmlFor="country">Country *</Label>
            <Select 
              value={formData.country_id} 
              onValueChange={(value) => handleInputChange('country_id', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a country" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country.id} value={country.id}>
                    {country.name} ({country.cuisine_style})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Restaurant Name */}
          <div className="space-y-2">
            <Label htmlFor="restaurant_name">Restaurant Name *</Label>
            <Input
              id="restaurant_name"
              value={formData.restaurant_name}
              onChange={(e) => handleInputChange('restaurant_name', e.target.value)}
              placeholder="Enter restaurant name"
              required
            />
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Location *</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="City, neighborhood, or address"
              required
            />
          </div>

          {/* Visit Date */}
          <div className="space-y-2">
            <Label htmlFor="visit_date">Visit Date</Label>
            <Input
              id="visit_date"
              type="date"
              value={formData.visit_date}
              onChange={(e) => handleInputChange('visit_date', e.target.value)}
            />
          </div>

          {/* Rating */}
          <div className="space-y-2">
            <Label htmlFor="rating" className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-500" />
              Rating
            </Label>
            <div className="p-4 border rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
              <StarRating
                value={formData.rating}
                onChange={(value) => handleInputChange('rating', value)}
                size="lg"
                showValue={true}
                className="justify-center"
              />
              <p className="text-sm text-gray-600 text-center mt-2">
                Rate your overall experience
              </p>
            </div>
          </div>

          {/* Items Devoured */}
          <div className="space-y-2">
            <Label htmlFor="items_devoured">Items Devoured</Label>
            <Textarea
              id="items_devoured"
              value={formData.items_devoured}
              onChange={(e) => handleInputChange('items_devoured', e.target.value)}
              placeholder="What delicious items did you try?"
              rows={3}
            />
          </div>

          {/* Favorites */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="king_julien_favorite">👑 King Julien's Favorite</Label>
              <Input
                id="king_julien_favorite"
                value={formData.king_julien_favorite}
                onChange={(e) => handleInputChange('king_julien_favorite', e.target.value)}
                placeholder="King Julien's top pick"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mort_favorite">🦦 Mort's Favorite</Label>
              <Input
                id="mort_favorite"
                value={formData.mort_favorite}
                onChange={(e) => handleInputChange('mort_favorite', e.target.value)}
                placeholder="Mort's favorite dish"
              />
            </div>
          </div>

          {/* Fusion Cuisine */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_fusion"
                checked={formData.is_fusion}
                onCheckedChange={(checked) => handleInputChange('is_fusion', checked)}
              />
              <Label htmlFor="is_fusion">This is fusion cuisine</Label>
            </div>

            {formData.is_fusion && (
              <div className="space-y-2">
                <Label htmlFor="fusion_country">Fusion Country</Label>
                <Select 
                  value={formData.fusion_country_id} 
                  onValueChange={(value) => handleInputChange('fusion_country_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select fusion country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country.id} value={country.id}>
                        {country.name} ({country.cuisine_style})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            
            <Button
              type="submit"
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {loading ? 'Updating...' : 'Update Visit'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}