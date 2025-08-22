'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MapPin, Calendar, Users, X, Utensils, Edit, Trash2, AlertCircle, RefreshCw } from 'lucide-react'
import EditVisitModal from './EditVisitModal'
import DeleteConfirmModal from './DeleteConfirmModal'
import { toast } from '@/hooks/use-toast'

export default function CountryPopup({ 
  isOpen, 
  onClose, 
  countryName, 
  countryData, 
  restaurants: initialRestaurants = [],
  onDataRefresh // New prop to trigger parent refresh
}) {
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedVisit, setSelectedVisit] = useState(null)
  const [countries, setCountries] = useState([])
  const [restaurants, setRestaurants] = useState(initialRestaurants)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Load restaurants when popup opens or country changes
  useEffect(() => {
    const loadRestaurants = async () => {
      if (!isOpen || !countryData?.id) return

      setLoading(true)
      setError(null)

      try {
        console.log(`🔍 Loading restaurants for country: ${countryName} (ID: ${countryData.id})`)
        
        const response = await fetch(`/api/restaurants?country_id=${countryData.id}`)
        
        if (!response.ok) {
          const errorText = await response.text()
          console.error(`❌ Restaurant API Error (${response.status}):`, errorText)
          throw new Error(`Failed to load restaurants: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()
        console.log(`✅ Loaded ${data.length} restaurants:`, data)
        
        setRestaurants(data || [])
        
      } catch (error) {
        console.error('❌ Error loading restaurants:', error)
        setError(error.message)
        setRestaurants([])
      } finally {
        setLoading(false)
      }
    }

    loadRestaurants()
  }, [isOpen, countryData?.id, countryName])

  // Load countries for edit form
  useEffect(() => {
    const loadCountries = async () => {
      if (!isOpen) return

      try {
        console.log('🔍 Loading countries for edit form...')
        const response = await fetch('/api/countries')
        
        if (response.ok) {
          const data = await response.json()
          console.log(`✅ Loaded ${data.length} countries for dropdown`)
          setCountries(data)
        } else {
          console.error('❌ Failed to load countries for dropdown')
        }
      } catch (error) {
        console.error('❌ Error loading countries:', error)
      }
    }

    loadCountries()
  }, [isOpen])

  const handleEdit = (visit) => {
    console.log('✏️ Opening edit modal for visit:', visit)
    setSelectedVisit(visit)
    setEditModalOpen(true)
  }

  const handleDelete = (visit) => {
    console.log('🗑️ Opening delete confirmation for visit:', visit)
    setSelectedVisit(visit)
    setDeleteModalOpen(true)
  }

  const handleVisitUpdated = () => {
    console.log('✅ Visit updated, refreshing data...')
    setEditModalOpen(false)
    setSelectedVisit(null)
    
    // Reload restaurants for this country
    if (countryData?.id) {
      const loadRestaurants = async () => {
        try {
          const response = await fetch(`/api/restaurants?country_id=${countryData.id}`)
          if (response.ok) {
            const data = await response.json()
            setRestaurants(data || [])
          }
        } catch (error) {
          console.error('Error reloading restaurants:', error)
        }
      }
      loadRestaurants()
    }
    
    // Trigger parent component to refresh data (map colors, stats)
    if (onDataRefresh) {
      onDataRefresh()
    }
  }

  const handleVisitDeleted = () => {
    console.log('✅ Visit deleted, refreshing data...')
    setDeleteModalOpen(false)
    setSelectedVisit(null)
    
    // Reload restaurants for this country
    if (countryData?.id) {
      const loadRestaurants = async () => {
        try {
          const response = await fetch(`/api/restaurants?country_id=${countryData.id}`)
          if (response.ok) {
            const data = await response.json()
            setRestaurants(data || [])
          }
        } catch (error) {
          console.error('Error reloading restaurants:', error)
        }
      }
      loadRestaurants()
    }
    
    // Trigger parent component to refresh data (map colors, stats)
    if (onDataRefresh) {
      onDataRefresh()
    }
  }

  const retryLoading = () => {
    if (countryData?.id) {
      const loadRestaurants = async () => {
        setLoading(true)
        setError(null)
        try {
          const response = await fetch(`/api/restaurants?country_id=${countryData.id}`)
          if (response.ok) {
            const data = await response.json()
            setRestaurants(data || [])
          } else {
            throw new Error(`Failed to load: ${response.status}`)
          }
        } catch (error) {
          setError(error.message)
        } finally {
          setLoading(false)
        }
      }
      loadRestaurants()
    }
  }

  if (!isOpen || !countryName) return null

  const hasVisits = restaurants.length > 0
  const cuisineDescription = countryData?.cuisine_description || 
    `${countryData?.cuisine_style || 'Local'} cuisine features unique flavors and traditional cooking methods that reflect the country's culture and history.`

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] md:max-h-[80vh] overflow-y-auto w-[95vw] md:w-auto">
          <DialogHeader>
            <DialogTitle className="flex flex-col sm:flex-row sm:items-center gap-2 text-xl md:text-2xl">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 md:h-6 md:w-6 text-purple-600" />
                <span className="break-words">{countryName}</span>
              </div>
              {hasVisits && (
                <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                  {restaurants.length} visit{restaurants.length !== 1 ? 's' : ''}
                </Badge>
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 md:space-y-6">
            {/* Cuisine Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Utensils className="h-5 w-5 text-orange-600" />
                <h3 className="text-lg font-semibold">
                  {countryData?.cuisine_style || 'Local'} Cuisine
                </h3>
              </div>
              
              <div className="bg-orange-50 p-3 md:p-4 rounded-lg border-l-4 border-orange-400">
                <p className="text-gray-700 leading-relaxed text-sm md:text-base">
                  {cuisineDescription}
                </p>
              </div>
            </div>

            {/* Debug Info */}
            {process.env.NODE_ENV === 'development' && (
              <div className="bg-gray-100 p-3 rounded text-xs">
                <p><strong>Debug:</strong> Country ID: {countryData?.id}</p>
                <p>Restaurants loaded: {restaurants.length}</p>
                <p>Loading: {loading ? 'Yes' : 'No'}</p>
                <p>Error: {error || 'None'}</p>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin text-purple-600 mr-3" />
                <span className="text-gray-600">Loading restaurant visits...</span>
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <div className="flex items-center gap-2 text-red-700 mb-2">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-medium">Failed to load restaurant visits</span>
                </div>
                <p className="text-red-600 text-sm mb-3">{error}</p>
                <Button 
                  onClick={retryLoading}
                  size="sm"
                  variant="outline"
                  className="border-red-200 text-red-700 hover:bg-red-50"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </div>
            )}

            {/* Visited Restaurants Section */}
            {hasVisits && !loading && !error && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-green-600" />
                  <h3 className="text-lg font-semibold">Restaurant Visits</h3>
                </div>
                
                <div className="grid gap-3">
                  {restaurants.map((restaurant, index) => (
                    <div 
                      key={restaurant.id || index} 
                      className="bg-white border border-gray-200 rounded-lg p-3 md:p-4 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                        <h4 className="font-semibold text-base md:text-lg text-gray-900 break-words">
                          {restaurant.restaurant_name}
                        </h4>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <div className="flex items-center gap-1 text-xs md:text-sm text-gray-500">
                            <Calendar className="h-3 w-3 md:h-4 md:w-4" />
                            {restaurant.visit_date ? new Date(restaurant.visit_date).toLocaleDateString() : 'Date unknown'}
                          </div>
                          
                          {/* Edit/Delete Buttons */}
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEdit(restaurant)}
                              className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              title="Edit visit"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(restaurant)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                              title="Delete visit"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-gray-600 text-sm md:text-base">
                          <span className="font-medium">Location:</span> {restaurant.location || 'Not specified'}
                        </p>
                        
                        {restaurant.items_devoured && (
                          <p className="text-gray-600 text-sm md:text-base">
                            <span className="font-medium">Items Devoured:</span> {restaurant.items_devoured}
                          </p>
                        )}
                        
                        <div className="flex flex-col sm:flex-row gap-2 md:gap-4">
                          {restaurant.king_julien_favorite && (
                            <div className="flex items-center gap-1">
                              <span className="text-yellow-600 font-medium text-sm">👑 King Julien:</span>
                              <span className="text-xs md:text-sm">{restaurant.king_julien_favorite}</span>
                            </div>
                          )}
                          
                          {restaurant.mort_favorite && (
                            <div className="flex items-center gap-1">
                              <span className="text-gray-600 font-medium text-sm">🐭 Mort:</span>
                              <span className="text-xs md:text-sm">{restaurant.mort_favorite}</span>
                            </div>
                          )}
                        </div>
                        
                        {restaurant.is_fusion && (
                          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 w-fit text-xs">
                            Fusion Cuisine
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No visits message */}
            {!hasVisits && !loading && !error && (
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <p className="text-gray-600 text-sm md:text-base">
                  No restaurants visited yet in {countryName}. 
                  <br />
                  <span className="text-xs md:text-sm">Click "Add New Visit" to start your culinary journey!</span>
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button onClick={onClose} variant="outline" className="w-full sm:w-auto">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Visit Modal */}
      <EditVisitModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false)
          setSelectedVisit(null)
        }}
        visit={selectedVisit}
        countries={countries}
        onVisitUpdated={handleVisitUpdated}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false)
          setSelectedVisit(null)
        }}
        visit={selectedVisit}
        onVisitDeleted={handleVisitDeleted}
      />
    </>
  )
}