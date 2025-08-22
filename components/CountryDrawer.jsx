'use client'

import { useQuery } from '@tanstack/react-query'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MapPin, Calendar, Crown, Cat, Utensils } from 'lucide-react'

export default function CountryDrawer({ countryCode, isOpen, onClose }) {
  const { data: countryData, isLoading } = useQuery({
    queryKey: ['country', countryCode],
    queryFn: async () => {
      if (!countryCode) return null
      const response = await fetch(`/api/country?code=${countryCode}`)
      if (!response.ok) throw new Error('Failed to fetch country data')
      return response.json()
    },
    enabled: !!countryCode && isOpen
  })

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            {countryData?.country?.name || 'Loading...'}
          </DialogTitle>
          <DialogDescription>
            {countryData ? 
              `${countryData.visits?.length || 0} restaurant visits` : 
              'Loading country details...'
            }
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : countryData ? (
            <div className="space-y-4">
              {/* Cuisine Summary - shown when no visits */}
              {(!countryData.visits || countryData.visits.length === 0) && (
                <Card className="border-purple-200 bg-purple-50">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Utensils className="w-5 h-5" />
                      Cuisine Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">
                      {countryData.cuisine_summary || 
                       `Discover the amazing flavors of ${countryData.country.name}! Add your first restaurant visit to start tracking your culinary journey.`}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Restaurant Visits */}
              {countryData.visits && countryData.visits.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg">Restaurant Visits</h3>
                  {countryData.visits.map((visit, index) => (
                    <Card key={visit.id} className="border-l-4 border-l-purple-500">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-base">{visit.restaurant_name}</CardTitle>
                            <CardDescription className="flex items-center gap-1 mt-1">
                              <MapPin className="w-3 h-3" />
                              {visit.location}
                            </CardDescription>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <Badge variant="outline" className="text-xs">
                              <Calendar className="w-3 h-3 mr-1" />
                              {formatDate(visit.visit_date)}
                            </Badge>
                            {visit.is_fusion && (
                              <Badge variant="secondary" className="text-xs">
                                Fusion
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-3">
                        {/* Items Devoured */}
                        <div>
                          <h4 className="font-medium text-sm mb-1">Items Devoured</h4>
                          <p className="text-sm text-gray-600">{visit.items_devoured}</p>
                        </div>

                        {/* Favorites */}
                        {(visit.king_julien_favorite || visit.mort_favorite) && (
                          <>
                            <Separator />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {visit.king_julien_favorite && (
                                <div className="flex items-start gap-2">
                                  <Crown className="w-4 h-4 text-yellow-600 mt-0.5" />
                                  <div>
                                    <p className="text-xs font-medium text-yellow-700">King Julien's Pick</p>
                                    <p className="text-sm">{visit.king_julien_favorite}</p>
                                  </div>
                                </div>
                              )}
                              
                              {visit.mort_favorite && (
                                <div className="flex items-start gap-2">
                                  <Cat className="w-4 h-4 text-gray-600 mt-0.5" />
                                  <div>
                                    <p className="text-xs font-medium text-gray-700">Mort's Pick</p>
                                    <p className="text-sm">{visit.mort_favorite}</p>
                                  </div>
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
                              <span>{visit.fusion_countries.name}</span>
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No data available for this country.</p>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}