'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MapPin, Calendar, Users, X, Utensils, Edit, Trash2 } from 'lucide-react'
import EditVisitModal from './EditVisitModal'
import DeleteConfirmModal from './DeleteConfirmModal'
import { toast } from '@/hooks/use-toast'

export default function CountryPopup({ 
  isOpen, 
  onClose, 
  countryName, 
  countryData, 
  restaurants = [],
  onDataRefresh // New prop to trigger parent refresh
}) {
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedVisit, setSelectedVisit] = useState(null)
  const [countries, setCountries] = useState([])
  const [loading, setLoading] = useState(false)

  // Load countries for edit form
  useEffect(() => {
    const loadCountries = async () => {
      try {
        const response = await fetch('/api/countries')
        if (response.ok) {
          const data = await response.json()
          setCountries(data)
        }
      } catch (error) {
        console.error('Error loading countries:', error)
      }
    }

    if (isOpen) {
      loadCountries()
    }
  }, [isOpen])

  const handleEdit = (visit) => {
    setSelectedVisit(visit)
    setEditModalOpen(true)
  }

  const handleDelete = (visit) => {
    setSelectedVisit(visit)
    setDeleteModalOpen(true)
  }

  const handleVisitUpdated = () => {
    setEditModalOpen(false)
    setSelectedVisit(null)
    // Trigger parent component to refresh data
    if (onDataRefresh) {
      onDataRefresh()
    }
  }

  const handleVisitDeleted = () => {
    setDeleteModalOpen(false)
    setSelectedVisit(null)
    // Trigger parent component to refresh data
    if (onDataRefresh) {
      onDataRefresh()
    }
  }

  if (!isOpen || !countryName) return null

  const hasVisits = countryData && countryData.visit_count > 0
  const cuisineDescription = countryData?.cuisine_description || 
    `${countryData?.cuisine_style || 'Local'} cuisine features unique flavors and traditional cooking methods that reflect the country's culture and history.`

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <MapPin className="h-6 w-6 text-purple-600" />
              {countryName}
              {hasVisits && (
                <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                  {countryData.visit_count} visit{countryData.visit_count !== 1 ? 's' : ''}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Cuisine Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Utensils className="h-5 w-5 text-orange-600" />
                <h3 className="text-lg font-semibold">
                  {countryData?.cuisine_style || 'Local'} Cuisine
                </h3>
              </div>
              
              <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-400">
                <p className="text-gray-700 leading-relaxed">
                  {cuisineDescription}
                </p>
              </div>
            </div>

            {/* Visited Restaurants Section */}
            {hasVisits && restaurants.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-green-600" />
                  <h3 className="text-lg font-semibold">Restaurant Visits</h3>
                </div>
                
                <div className="grid gap-3">
                  {restaurants.map((restaurant, index) => (
                    <div 
                      key={restaurant.id || index} 
                      className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-lg text-gray-900">
                          {restaurant.restaurant_name}
                        </h4>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Calendar className="h-4 w-4" />
                            {restaurant.visit_date ? new Date(restaurant.visit_date).toLocaleDateString() : 'Date unknown'}
                          </div>
                          
                          {/* Edit/Delete Buttons */}
                          <div className="flex gap-1 ml-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEdit(restaurant)}
                              className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(restaurant)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-gray-600">
                          <span className="font-medium">Location:</span> {restaurant.location || 'Not specified'}
                        </p>
                        
                        {restaurant.items_devoured && (
                          <p className="text-gray-600">
                            <span className="font-medium">Items Devoured:</span> {restaurant.items_devoured}
                          </p>
                        )}
                        
                        <div className="flex gap-4">
                          {restaurant.king_julien_favorite && (
                            <div className="flex items-center gap-1">
                              <span className="text-yellow-600 font-medium">👑 King Julien:</span>
                              <span className="text-sm">{restaurant.king_julien_favorite}</span>
                            </div>
                          )}
                          
                          {restaurant.mort_favorite && (
                            <div className="flex items-center gap-1">
                              <span className="text-gray-600 font-medium">🐭 Mort:</span>
                              <span className="text-sm">{restaurant.mort_favorite}</span>
                            </div>
                          )}
                        </div>
                        
                        {restaurant.is_fusion && (
                          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
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
            {!hasVisits && (
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <p className="text-gray-600">
                  No restaurants visited yet in {countryName}. 
                  <br />
                  <span className="text-sm">Click "Add New Visit" to start your culinary journey!</span>
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button onClick={onClose} variant="outline">
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