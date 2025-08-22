'use client'

import { useState, useEffect } from 'react'
import { useQuery, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Globe, Map, List, Plus, MapPin, Crown, Cat, Menu, X } from 'lucide-react'
import LandingPage from '@/components/LandingPage'
import MapView from '@/components/MapView'
import AddVisitForm from '@/components/AddVisitForm'
import CountryDrawer from '@/components/CountryDrawer'
import Legend from '@/components/Legend'
import { useIsMobile } from '@/hooks/use-mobile'

const queryClient = new QueryClient()

function CuisineApp() {
  const [currentView, setCurrentView] = useState('landing')
  const [selectedCountry, setSelectedCountry] = useState(null)
  const [selectedCountryVisitCount, setSelectedCountryVisitCount] = useState(0)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const isMobile = useIsMobile()

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

  const handleCountryClick = (countryCode, visitCount = 0) => {
    setSelectedCountry(countryCode)
    setSelectedCountryVisitCount(visitCount)
  }

  const handleCountryItemClick = (countryCode, visitCount = 0) => {
    // For list view - only show restaurants if visits > 0, otherwise show add form option
    setSelectedCountry(countryCode)
    setSelectedCountryVisitCount(visitCount)
  }

  const handleSwitchToMap = () => {
    setCurrentView('map')
  }

  const handleSwitchToList = () => {
    setCurrentView('list')
  }

  const handleAddVisitSuccess = () => {
    setShowAddForm(false)
    refetchCountries()
  }

  const handleCountryDrawerAddVisit = () => {
    refetchCountries()
  }

  const totalVisits = countriesData.reduce((sum, country) => sum + (country.visit_count || 0), 0)
  const visitedCountries = countriesData.filter(c => (c.visit_count || 0) > 0).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Landing Page View - Full Screen */}
      {currentView === 'landing' && (
        <div className="h-screen">
          <LandingPage onSwitchToMap={handleSwitchToMap} />
        </div>
      )}

      {/* Header and Main Content for other views */}
      {(currentView === 'map' || currentView === 'list') && (
        <>
          {/* Header */}
          <header className="bg-white/80 backdrop-blur-sm border-b shadow-sm sticky top-0 z-40">
            <div className="container mx-auto px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="flex items-center gap-1 md:gap-2 text-lg md:text-2xl font-bold text-purple-700">
                    <Crown className="w-6 h-6 md:w-8 md:h-8 text-yellow-500" />
                    <span className="hidden sm:inline">King Julien & Mort's</span>
                    <span className="sm:hidden">KJ & Mort</span>
                    <Cat className="w-5 h-5 md:w-6 md:h-6 text-gray-600" />
                  </div>
                  <div className="text-xs md:text-sm text-gray-600">
                    <span className="hidden md:inline">World Cuisine Tour</span>
                    <span className="md:hidden">Tour</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="px-2 py-1 text-xs">
                    <MapPin className="w-3 h-3 mr-1" />
                    <span className="hidden sm:inline">{visitedCountries} countries</span>
                    <span className="sm:hidden">{visitedCountries}</span>
                  </Badge>
                  <Badge variant="secondary" className="px-2 py-1 text-xs">
                    {totalVisits} visits
                  </Badge>
                  {isMobile && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowMobileMenu(!showMobileMenu)}
                      className="ml-2"
                    >
                      {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </header>

          {/* Mobile Menu Overlay */}
          {isMobile && showMobileMenu && (
            <div className="fixed inset-0 bg-black/50 z-50 lg:hidden">
              <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl p-6 overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold">Menu</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                
                {/* View Toggle */}
                <div className="space-y-4 mb-6">
                  <h3 className="font-medium">View Mode</h3>
                  <Tabs value={currentView} onValueChange={(value) => {
                    setCurrentView(value)
                    setShowMobileMenu(false)
                  }} className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="landing" className="flex items-center gap-1 text-xs">
                        <Globe className="w-3 h-3" />
                        Home
                      </TabsTrigger>
                      <TabsTrigger value="map" className="flex items-center gap-1 text-xs">
                        <Map className="w-3 h-3" />
                        Map
                      </TabsTrigger>
                      <TabsTrigger value="list" className="flex items-center gap-1 text-xs">
                        <List className="w-3 h-3" />
                        List
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                {/* Add Visit Button */}
                <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
                  <DialogTrigger asChild>
                    <Button className="w-full bg-purple-600 hover:bg-purple-700 mb-6">
                      <Plus className="w-4 h-4 mr-2" />
                      Add New Visit
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader className="relative">
                      <DialogTitle>Add Restaurant Visit</DialogTitle>
                      <DialogDescription>
                        Record your latest culinary adventure!
                      </DialogDescription>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowAddForm(false)}
                        className="absolute right-0 top-0 h-8 w-8 p-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </DialogHeader>
                    <AddVisitForm onSuccess={handleAddVisitSuccess} onCancel={() => setShowAddForm(false)} />
                  </DialogContent>
                </Dialog>

                {/* Legend */}
                <div className="mb-6">
                  <h3 className="font-medium mb-3">Legend</h3>
                  <Legend maxCount={maxVisitCount} />
                </div>

                {/* Stats */}
                <div className="space-y-2">
                  <h3 className="font-medium">Tour Statistics</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Countries Visited:</span>
                      <span className="font-semibold">{visitedCountries}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Restaurant Visits:</span>
                      <span className="font-semibold">{totalVisits}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Countries Remaining:</span>
                      <span className="font-semibold">{countriesData.length - visitedCountries}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Main Content */}
          <main className="container mx-auto px-4 py-4 md:py-6">
            {/* Desktop Layout */}
            <div className="hidden lg:flex gap-6">
              {/* Left Panel - Controls */}
              <div className="w-80 space-y-6">
                {/* View Toggle */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">View Mode</CardTitle>
                    <CardDescription>Choose how to explore the world</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs value={currentView} onValueChange={setCurrentView} className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="landing" className="flex items-center gap-1">
                          <Globe className="w-4 h-4" />
                          Home
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
                    <DialogHeader className="relative">
                      <DialogTitle>Add Restaurant Visit</DialogTitle>
                      <DialogDescription>
                        Record your latest culinary adventure!
                      </DialogDescription>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowAddForm(false)}
                        className="absolute right-0 top-0 h-8 w-8 p-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </DialogHeader>
                    <AddVisitForm onSuccess={handleAddVisitSuccess} onCancel={() => setShowAddForm(false)} />
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
                    {currentView === 'map' && (
                      <MapView 
                        countriesData={countriesData}
                        maxVisitCount={maxVisitCount}
                        onCountryClick={handleCountryClick}
                        onDataRefresh={refetchCountries}
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
                                onClick={() => handleCountryItemClick(country.country_code, country.visit_count || 0)}
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

            {/* Mobile Layout */}
            <div className="lg:hidden">
              {/* Mobile View Toggle */}
              <div className="mb-4">
                <Tabs value={currentView} onValueChange={setCurrentView} className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="landing" className="flex items-center gap-1 text-xs">
                      <Globe className="w-3 h-3" />
                      Home
                    </TabsTrigger>
                    <TabsTrigger value="map" className="flex items-center gap-1 text-xs">
                      <Map className="w-3 h-3" />
                      Map
                    </TabsTrigger>
                    <TabsTrigger value="list" className="flex items-center gap-1 text-xs">
                      <List className="w-3 h-3" />
                      List
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* Mobile Add Visit Button */}
              <div className="mb-4">
                <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
                  <DialogTrigger asChild>
                    <Button className="w-full bg-purple-600 hover:bg-purple-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Add New Visit
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader className="relative">
                      <DialogTitle>Add Restaurant Visit</DialogTitle>
                      <DialogDescription>
                        Record your latest culinary adventure!
                      </DialogDescription>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowAddForm(false)}
                        className="absolute right-0 top-0 h-8 w-8 p-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </DialogHeader>
                    <AddVisitForm onSuccess={handleAddVisitSuccess} onCancel={() => setShowAddForm(false)} />
                  </DialogContent>
                </Dialog>
              </div>

              {/* Mobile Main View */}
              <Card className="h-[70vh] overflow-hidden">
                <CardContent className="p-0 h-full">
                  {currentView === 'map' && (
                    <MapView 
                      countriesData={countriesData}
                      maxVisitCount={maxVisitCount}
                      onCountryClick={handleCountryClick}
                      onDataRefresh={refetchCountries}
                      isLoading={countriesLoading}
                    />
                  )}
                  {currentView === 'list' && (
                    <div className="p-4 h-full overflow-y-auto">
                      <h3 className="text-lg font-semibold mb-4">All Countries</h3>
                      <div className="grid gap-2">
                        {countriesData
                          .sort((a, b) => (b.visit_count || 0) - (a.visit_count || 0))
                          .map((country) => (
                            <Card 
                              key={country.country_code} 
                              className="p-3 cursor-pointer hover:bg-purple-50 transition-colors"
                              onClick={() => handleCountryItemClick(country.country_code, country.visit_count || 0)}
                            >
                              <div className="flex justify-between items-center">
                                <span className="font-medium text-sm">{country.name}</span>
                                <Badge variant={country.visit_count > 0 ? "default" : "secondary"} className="text-xs">
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
          </main>
        </>
      )}

      {/* Country Details Drawer */}
      <CountryDrawer 
        countryCode={selectedCountry}
        visitCount={selectedCountryVisitCount}
        isOpen={!!selectedCountry}
        onClose={() => setSelectedCountry(null)}
        onAddVisit={handleCountryDrawerAddVisit}
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