'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Map, List, Utensils } from 'lucide-react'

export default function LandingPage({ onSwitchToMap, onSwitchToList }) {
  return (
    <div className="flex items-center justify-center h-full p-4 md:p-8">
      <Card className="max-w-2xl text-center">
        <CardHeader className="pb-4">
          {/* Beautiful King Julien & Mort Image */}
          <div className="mx-auto mb-6">
            <img 
              src="https://customer-assets.emergentagent.com/job_74a423f5-a363-49c8-932a-8852309584b5/artifacts/8sfdsf0i_kj%26mort.png"
              alt="King Julien and Mort's World Cuisine Adventure"
              className="w-full max-w-md mx-auto rounded-lg shadow-lg"
            />
          </div>
          
          <CardTitle className="text-2xl md:text-3xl font-bold text-purple-700 mb-2">
            King Julien and Mort's World Cuisine Tour
          </CardTitle>
          
          <CardDescription className="text-base md:text-lg text-gray-600">
            Embark on a royal culinary adventure around the world! Track your restaurant visits, 
            discover amazing cuisines, and explore flavors from every corner of the globe with 
            King Julien and his loyal companion Mort.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              onClick={onSwitchToMap}
              className="w-full bg-purple-600 hover:bg-purple-700 py-6"
              size="lg"
            >
              <Map className="w-5 h-5 mr-2" />
              Explore World Map
            </Button>
            
            <Button 
              onClick={onSwitchToList}
              variant="outline"
              className="w-full border-purple-600 text-purple-600 hover:bg-purple-50 py-6"
              size="lg"
            >
              <List className="w-5 h-5 mr-2" />
              View Countries List
            </Button>
          </div>
          
          <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Utensils className="w-5 h-5 text-purple-600" />
              <span className="font-semibold text-purple-700">Start Your Adventure</span>
            </div>
            <p className="text-sm text-gray-600">
              Click on countries to discover their cuisines, add restaurant visits, 
              and watch the world map come alive with your culinary journey!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}