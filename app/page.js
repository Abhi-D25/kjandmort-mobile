'use client'

import { useState, useEffect } from 'react'
import { useQuery, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Globe, Map, List, Plus, MapPin, Crown, Cat } from 'lucide-react'
import GlobeView from '@/components/GlobeView'
import MapView from '@/components/MapView'
import AddVisitForm from '@/components/AddVisitForm'
import CountryDrawer from '@/components/CountryDrawer'
import Legend from '@/components/Legend'

const queryClient = new QueryClient()

function CuisineApp() {
  const [currentView, setCurrentView] = useState('globe')
  const [selectedCountry, setSelectedCountry] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)

  // Query for countries data
  const { 
    data: countriesData = [], 
    isLoading: countriesLoading, 
    refetch: refetchCountries 
  } = useQuery({
    queryKey: ['countries-aggregate'],
    queryFn: async () => {
      const response = await fetch('/api/aggregate')
      if (!response.ok) throw new Error('Failed to fetch countries')
      return response.json()
    }
  })

  // Get max visit count for color scaling
  const maxVisitCount = Math.max(...countriesData.map(c => c.visit_count || 0), 1)

  const handleCountryClick = (countryCode) => {
    setSelectedCountry(countryCode)
  }

  const handleAddVisitSuccess = () => {
    setShowAddForm(false)
    refetchCountries()
  }

  const totalVisits = countriesData.reduce((sum, country) => sum + (country.visit_count || 0), 0)
  const visitedCountries = countriesData.filter(c => (c.visit_count || 0) > 0).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-2xl font-bold text-purple-700">
                <Crown className="w-8 h-8 text-yellow-500" />
                <span>King Julien & Mort's</span>
                <Cat className="w-6 h-6 text-gray-600" />
              </div>
              <div className="text-sm text-gray-600 md:text-base">
                World Cuisine Tour
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="px-3 py-1">
                <MapPin className="w-4 h-4 mr-1" />
                {visitedCountries} countries
              </Badge>
              <Badge variant="secondary" className="px-3 py-1">
                {totalVisits} visits
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Panel - Controls */}
          <div className="lg:w-80 space-y-6">
            {/* View Toggle */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">View Mode</CardTitle>
                <CardDescription>Choose how to explore the world</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={currentView} onValueChange={setCurrentView} className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="globe" className="flex items-center gap-1">
                      <Globe className="w-4 h-4" />
                      Globe
                    </TabsTrigger>
                    <TabsTrigger value="map" className="flex items-center gap-1">
                      <Map className="w-4 h-4" />
                      Map
                    </TabsTrigger>
                    <TabsTrigger value="list" className="flex items-center gap-1">
                      <List className="w-4 h-4" />
                      List
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardContent>
            </Card>

            {/* Add Visit Button */}
            <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
              <DialogTrigger asChild>
                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Visit
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add Restaurant Visit</DialogTitle>
                  <DialogDescription>
                    Record your latest culinary adventure!
                  </DialogDescription>
                </DialogHeader>
                <AddVisitForm onSuccess={handleAddVisitSuccess} />
              </DialogContent>
            </Dialog>

            {/* Legend */}
            <Legend maxCount={maxVisitCount} />

            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tour Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Countries Visited:</span>
                  <span className="font-semibold">{visitedCountries}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Restaurant Visits:</span>
                  <span className="font-semibold">{totalVisits}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Countries Remaining:</span>
                  <span className="font-semibold">{countriesData.length - visitedCountries}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Main View */}
          <div className="flex-1">
            <Card className="h-[600px] overflow-hidden">
              <CardContent className="p-0 h-full">
                {currentView === 'globe' && (
                  <GlobeView 
                    countriesData={countriesData}
                    maxVisitCount={maxVisitCount}
                    onCountryClick={handleCountryClick}
                    isLoading={countriesLoading}
                  />
                )}
                {currentView === 'map' && (
                  <MapView 
                    countriesData={countriesData}
                    maxVisitCount={maxVisitCount}
                    onCountryClick={handleCountryClick}
                    isLoading={countriesLoading}
                  />
                )}
                {currentView === 'list' && (
                  <div className="p-6 h-full overflow-y-auto">
                    <h3 className="text-lg font-semibold mb-4">All Countries</h3>
                    <div className="grid gap-2">
                      {countriesData
                        .sort((a, b) => (b.visit_count || 0) - (a.visit_count || 0))
                        .map((country) => (
                          <Card 
                            key={country.country_code} 
                            className="p-3 cursor-pointer hover:bg-purple-50 transition-colors"
                            onClick={() => handleCountryClick(country.country_code)}
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-medium">{country.name}</span>
                              <Badge variant={country.visit_count > 0 ? "default" : "secondary"}>
                                {country.visit_count || 0} visits
                              </Badge>
                            </div>
                          </Card>
                        ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Country Details Drawer */}
      <CountryDrawer 
        countryCode={selectedCountry}
        isOpen={!!selectedCountry}
        onClose={() => setSelectedCountry(null)}
      />
    </div>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CuisineApp />
    </QueryClientProvider>
  )
}