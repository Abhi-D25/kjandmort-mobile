'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MapPin, Calendar, Crown, Cat, Utensils, Plus, X, Edit, Trash2, Users } from 'lucide-react'
import AddVisitForm from './AddVisitForm'
import EditVisitModal from './EditVisitModal'
import DeleteConfirmModal from './DeleteConfirmModal'

export default function CountryDrawer({ countryCode, visitCount, isOpen, onClose, onAddVisit, onDeleteVisit, onEditVisit }) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedVisit, setSelectedVisit] = useState(null)
  const queryClient = useQueryClient()

  const { data: countryData, isLoading, refetch: refetchCountryData } = useQuery({
    queryKey: ['country', countryCode],
    queryFn: async () => {
      if (!countryCode) return null
      console.log('🔄 Fetching fresh country data for:', countryCode)
      const response = await fetch(`/api/country?code=${countryCode}`)
      if (!response.ok) throw new Error('Failed to fetch country data')
      const data = await response.json()
      console.log('🔄 Fetched country data:', data)
      return data
    },
    enabled: !!countryCode && isOpen,
    staleTime: 0, // Always consider data stale
    cacheTime: 0 // Don't cache at all
  })

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const handleAddVisitSuccess = (result) => {
    console.log('✅ Add visit success, clearing all caches...')
    setShowAddForm(false)
    
    // Clear all caches completely
    queryClient.clear()
    
    // Refetch the current country data to update the drawer
    if (countryCode) {
      refetchCountryData()
    }
    
    onAddVisit?.(result)
    onClose()
  }

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
    console.log('✅ Visit updated, clearing all caches...')
    setEditModalOpen(false)
    setSelectedVisit(null)
    
    // Clear all caches completely
    queryClient.clear()
    
    // Refetch the current country data to update the drawer
    if (countryCode) {
      refetchCountryData()
    }
    
    // Trigger parent component to refresh data (map colors, stats)
    if (onEditVisit) {
      onEditVisit()
    }
  }

  const handleVisitDeleted = () => {
    console.log('✅ Visit deleted, clearing all caches...')
    setDeleteModalOpen(false)
    setSelectedVisit(null)
    
    // Clear all caches completely
    queryClient.clear()
    
    // Force a delay and then refetch to ensure the database has updated
    setTimeout(() => {
      console.log('🔄 Refetching country data after delete...')
      if (countryCode) {
        refetchCountryData()
      }
    }, 100)
    
    // Trigger parent component to refresh data (map colors, stats)
    if (onDeleteVisit) {
      onDeleteVisit()
    }
  }

  if (!isOpen) return null

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] md:max-h-[80vh] w-[95vw] md:w-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg md:text-xl">
              <MapPin className="w-4 h-4 md:w-5 md:h-5" />
              <span className="break-words">{countryData?.name || 'Loading...'}</span>
            </DialogTitle>
            <DialogDescription className="text-sm">
              {visitCount > 0 ? 
                `${countryData?.restaurants?.length || 0} restaurant visits` : 
                'Discover this country\'s cuisine'
              }
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[70vh] md:max-h-[60vh]">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            ) : countryData ? (
              <div className="space-y-4">
                {/* For countries with no visits - show cuisine summary */}
                {visitCount === 0 && (
                  <Card className="border-purple-200 bg-purple-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base md:text-lg flex items-center gap-2">
                        <Utensils className="w-4 h-4 md:w-5 md:h-5" />
                        Discover {countryData.name} Cuisine
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 mb-4 text-sm md:text-base">
                        {countryData.cuisine_description || 
                         `Experience the rich and diverse flavors of ${countryData.name}! This country offers a unique culinary tradition waiting to be explored. From traditional dishes passed down through generations to modern interpretations, ${countryData.name} has something special for every food lover.`}
                      </p>
                      
                      <Button 
                        onClick={() => setShowAddForm(true)}
                        className="w-full bg-purple-600 hover:bg-purple-700"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add First Visit
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* For countries with visits - show restaurant list */}
                {visitCount > 0 && countryData.restaurants && countryData.restaurants.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-green-600" />
                        <h3 className="font-semibold text-base md:text-lg">Restaurant Visits</h3>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setShowAddForm(true)}
                        className="w-full sm:w-auto"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Visit
                      </Button>
                    </div>

                    {countryData.restaurants.map((visit, index) => (
                      <Card key={visit.id} className="border-l-4 border-l-purple-500">
                        <CardHeader className="pb-3">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                            <div className="flex-1">
                              <CardTitle className="text-sm md:text-base break-words">{visit.restaurant_name}</CardTitle>
                              <CardDescription className="flex items-center gap-1 mt-1 text-xs md:text-sm">
                                <MapPin className="w-3 h-3" />
                                <span className="break-words">{visit.location}</span>
                              </CardDescription>
                            </div>
                            <div className="flex flex-col items-start sm:items-end gap-1">
                              <Badge variant="outline" className="text-xs">
                                <Calendar className="w-3 h-3 mr-1" />
                                {formatDate(visit.visit_date)}
                              </Badge>
                              {visit.is_fusion && (
                                <Badge variant="secondary" className="text-xs">
                                  Fusion
                                </Badge>
                              )}
                              
                              {/* Edit/Delete Buttons */}
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleEdit(visit)}
                                  className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                  title="Edit visit"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDelete(visit)}
                                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                  title="Delete visit"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="space-y-3">
                          {/* Items Devoured - Only show if not empty */}
                          {visit.items_devoured && (
                            <div>
                              <h4 className="font-medium text-sm mb-1">Items Devoured</h4>
                              <p className="text-sm text-gray-600 break-words">{visit.items_devoured}</p>
                            </div>
                          )}

                          {/* Favorites */}
                          {(visit.king_julien_favorite || visit.mort_favorite) && (
                            <>
                              <Separator />
                              <div className="flex flex-col sm:flex-row gap-2 md:gap-4">
                                {visit.king_julien_favorite && (
                                  <div className="flex items-center gap-1">
                                    <span className="text-yellow-600 font-medium text-sm">👑 King Julien:</span>
                                    <span className="text-xs md:text-sm">{visit.king_julien_favorite}</span>
                                  </div>
                                )}
                                
                                {visit.mort_favorite && (
                                  <div className="flex items-center gap-1">
                                    <span className="text-gray-600 font-medium text-sm">🦦 Mort:</span>
                                    <span className="text-xs md:text-sm">{visit.mort_favorite}</span>
                                  </div>
                                )}
                              </div>
                            </>
                          )}

                          {/* Fusion Country Info */}
                          {visit.is_fusion && visit.fusion_countries && (
                            <>
                              <Separator />
                              <div className="text-sm">
                                <span className="font-medium">Also counted for: </span>
                                <span className="break-words">{visit.fusion_countries.name}</span>
                              </div>
                            </>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Add Visit Form */}
                {showAddForm && (
                  <Card className="border-green-200 bg-green-50">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-base">Add New Visit</CardTitle>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setShowAddForm(false)}
                          className="h-8 w-8 p-0"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <AddVisitForm 
                        onSuccess={handleAddVisitSuccess}
                        onCancel={() => setShowAddForm(false)}
                        prefilledCountryId={countryData?.id}
                        prefilledCuisine={countryData?.cuisine_style}
                      />
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm md:text-base">No data available for this country.</p>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Edit Visit Modal */}
      <EditVisitModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        visit={selectedVisit}
        onSuccess={handleVisitUpdated}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        visit={selectedVisit}
        onConfirm={handleVisitDeleted}
      />
    </>
  )
}