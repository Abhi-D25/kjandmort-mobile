import { NextResponse } from 'next/server'

// Helper function to handle CORS
function handleCORS(response) {
  response.headers.set('Access-Control-Allow-Origin', process.env.CORS_ORIGINS || '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  return response
}

// OPTIONS handler for CORS
export async function OPTIONS() {
  return handleCORS(new NextResponse(null, { status: 200 }))
}

// GET /api/places/search?query=restaurant_name&location=city
export async function GET(request) {
  try {
    const url = new URL(request.url)
    const query = url.searchParams.get('query')
    const location = url.searchParams.get('location')
    
    if (!query) {
      return handleCORS(NextResponse.json(
        { error: "Query parameter is required" }, 
        { status: 400 }
      ))
    }

    // Check if Google Maps API key is configured
    const apiKey = process.env.GOOGLE_MAPS_API_KEY
    console.log('🔑 API Key check:', {
      hasKey: !!apiKey,
      keyLength: apiKey ? apiKey.length : 0,
      keyStart: apiKey ? apiKey.substring(0, 10) + '...' : 'none'
    })
    
    if (!apiKey) {
      console.error('❌ Missing GOOGLE_MAPS_API_KEY environment variable')
      return handleCORS(NextResponse.json(
        { error: "Google Maps API not configured" }, 
        { status: 500 }
      ))
    }

    // Build the search query
    let searchQuery = query
    if (location) {
      searchQuery += ` in ${location}`
    }

    // Build the Google Places API URL
    const placesUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}&type=restaurant&key=${apiKey}`
    console.log('🔍 Calling Google Places API:', placesUrl.replace(apiKey, 'API_KEY_HIDDEN'))
    
    // Search for places using Google Places API
    const placesResponse = await fetch(placesUrl)

    if (!placesResponse.ok) {
      console.error('❌ Google Places API HTTP error:', placesResponse.status, placesResponse.statusText)
      throw new Error(`Google Places API HTTP error: ${placesResponse.status} ${placesResponse.statusText}`)
    }

    let placesData
    try {
      placesData = await placesResponse.json()
    } catch (parseError) {
      console.error('❌ Failed to parse Google Places API response:', parseError)
      const responseText = await placesResponse.text()
      console.error('❌ Raw response:', responseText.substring(0, 500))
      return handleCORS(NextResponse.json(
        { error: "Invalid response from Google Places API. Please check your API key and try again." }, 
        { status: 500 }
      ))
    }
    
    console.log('🔍 Google Places API Response:', {
      status: placesData.status,
      error_message: placesData.error_message,
      results_count: placesData.results?.length || 0
    })

    // Handle all possible Google Places API statuses
    if (placesData.status === 'REQUEST_DENIED') {
      console.error('❌ Google Places API request denied:', placesData.error_message)
      return handleCORS(NextResponse.json(
        { error: "Google Places API access denied. Please check your API key and billing." }, 
        { status: 403 }
      ))
    }
    
    if (placesData.status === 'OVER_QUERY_LIMIT') {
      console.error('❌ Google Places API quota exceeded')
      return handleCORS(NextResponse.json(
        { error: "Google Places API quota exceeded. Please try again later." }, 
        { status: 429 }
      ))
    }
    
    if (placesData.status === 'INVALID_REQUEST') {
      console.error('❌ Google Places API invalid request:', placesData.error_message)
      return handleCORS(NextResponse.json(
        { error: "Invalid search request. Please try different keywords." }, 
        { status: 400 }
      ))
    }
    
    if (placesData.status === 'NOT_FOUND') {
      console.error('❌ Google Places API not found')
      return handleCORS(NextResponse.json(
        { error: "Google Places API service not found." }, 
        { status: 404 }
      ))
    }
    
    if (placesData.status === 'UNKNOWN_ERROR') {
      console.error('❌ Google Places API unknown error')
      return handleCORS(NextResponse.json(
        { error: "Google Places API service temporarily unavailable. Please try again." }, 
        { status: 503 }
      ))
    }

    if (placesData.status !== 'OK' && placesData.status !== 'ZERO_RESULTS') {
      console.error('❌ Google Places API unexpected status:', placesData.status, placesData.error_message)
      return handleCORS(NextResponse.json(
        { error: `Google Places API error: ${placesData.status}${placesData.error_message ? ` - ${placesData.error_message}` : ''}` }, 
        { status: 500 }
      ))
    }

    // If no results, return empty array
    if (placesData.status === 'ZERO_RESULTS' || !placesData.results) {
      return handleCORS(NextResponse.json([]))
    }
    
    // Log the raw search results for debugging
    console.log('🔍 Raw Google Places search results:', placesData.results.map(place => ({
      name: place.name,
      types: place.types,
      formatted_address: place.formatted_address
    })))

    // Process and enhance the results
    const enhancedResults = await Promise.all(
      placesData.results.slice(0, 5).map(async (place) => {
        // Get additional details for each place
        let placeDetails = null
        try {
          const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=formatted_address,types,business_status,price_level,rating,user_ratings_total,opening_hours,website,formatted_phone_number,address_components&key=${apiKey}`
          console.log('🔍 Calling Place Details API for:', place.place_id)
          
          const detailsResponse = await fetch(detailsUrl)
          
          if (detailsResponse.ok) {
            const detailsData = await detailsResponse.json()
            console.log('🔍 Place Details API response:', {
              status: detailsData.status,
              hasResult: !!detailsData.result,
              addressComponents: detailsData.result?.address_components?.length || 0
            })
            
            if (detailsData.status === 'OK') {
              placeDetails = detailsData.result
            } else {
              console.warn('⚠️ Place Details API returned status:', detailsData.status)
            }
          } else {
            console.warn('⚠️ Place Details API HTTP error:', detailsResponse.status)
          }
        } catch (error) {
          console.warn(`❌ Failed to get details for place ${place.place_id}:`, error)
        }

        // Extract cuisine type from types array and restaurant name
        const cuisineTypes = place.types || []
        let detectedCuisine = 'restaurant'
        
        // First, try to extract cuisine from the restaurant name
        const restaurantName = place.name.toLowerCase()
        console.log('🔍 Analyzing restaurant:', {
          name: place.name,
          types: place.types,
          name_lower: restaurantName
        })
        
        // Enhanced cuisine detection with more keywords and patterns
        const cuisineKeywords = {
          // Direct cuisine names
          'chinese': 'chinese',
          'italian': 'italian', 
          'mexican': 'mexican',
          'indian': 'indian',
          'thai': 'thai',
          'japanese': 'japanese',
          'korean': 'korean',
          'vietnamese': 'vietnamese',
          'greek': 'greek',
          'turkish': 'turkish',
          'lebanese': 'lebanese',
          'moroccan': 'moroccan',
          'ethiopian': 'ethiopian',
          'brazilian': 'brazilian',
          'peruvian': 'peruvian',
          'french': 'french',
          'spanish': 'spanish',
          'german': 'german',
          'british': 'british',
          'irish': 'irish',
          'mediterranean': 'mediterranean',
          
          // Food-specific keywords
          'pizza': 'italian',
          'sushi': 'japanese',
          'taco': 'mexican',
          'curry': 'indian',
          'pho': 'vietnamese',
          'kebab': 'turkish',
          'falafel': 'lebanese',
          'pad thai': 'thai',
          'bibimbap': 'korean',
          
          // Restaurant type indicators
          'chinese restaurant': 'chinese',
          'italian restaurant': 'italian',
          'mexican restaurant': 'mexican',
          'indian restaurant': 'indian',
          'thai restaurant': 'thai',
          'japanese restaurant': 'japanese',
          'korean restaurant': 'korean',
          'vietnamese restaurant': 'vietnamese',
          'greek restaurant': 'greek',
          'turkish restaurant': 'turkish',
          'lebanese restaurant': 'lebanese',
          'moroccan restaurant': 'moroccan',
          'ethiopian restaurant': 'ethiopian',
          'brazilian restaurant': 'brazilian',
          'peruvian restaurant': 'peruvian',
          'french restaurant': 'french',
          'spanish restaurant': 'spanish',
          'german restaurant': 'german',
          'british restaurant': 'british',
          'irish restaurant': 'irish',
          'mediterranean restaurant': 'mediterranean'
        }
        
        // Check restaurant name for cuisine keywords
        for (const [keyword, cuisine] of Object.entries(cuisineKeywords)) {
          if (restaurantName.includes(keyword)) {
            detectedCuisine = cuisine
            console.log('✅ Found cuisine in name:', keyword, '→', cuisine)
            break
          }
        }
        
        // If no cuisine found in name, check place types more aggressively
        if (detectedCuisine === 'restaurant') {
          console.log('🔍 No cuisine found in name, checking place types...')
          
          // Look for cuisine-specific types
          const cuisineTypes = place.types || []
          const cuisineTypeKeywords = {
            'chinese': 'chinese',
            'italian': 'italian',
            'mexican': 'mexican',
            'indian': 'indian',
            'thai': 'thai',
            'japanese': 'japanese',
            'korean': 'korean',
            'vietnamese': 'vietnamese',
            'greek': 'greek',
            'turkish': 'turkish',
            'lebanese': 'lebanese',
            'moroccan': 'moroccan',
            'ethiopian': 'ethiopian',
            'brazilian': 'brazilian',
            'peruvian': 'peruvian',
            'french': 'french',
            'spanish': 'spanish',
            'german': 'german',
            'british': 'british',
            'irish': 'irish',
            'mediterranean': 'mediterranean'
          }
          
          for (const type of cuisineTypes) {
            if (cuisineTypeKeywords[type]) {
              detectedCuisine = cuisineTypeKeywords[type]
              console.log('✅ Found cuisine in types:', type, '→', detectedCuisine)
              break
            }
          }
          
          // If still no cuisine, try to infer from the search query itself
          if (detectedCuisine === 'restaurant') {
            console.log('🔍 No cuisine found in types, checking search query...')
            const searchQueryLower = query.toLowerCase()
            for (const [keyword, cuisine] of Object.entries(cuisineKeywords)) {
              if (searchQueryLower.includes(keyword)) {
                detectedCuisine = cuisine
                console.log('✅ Found cuisine in search query:', keyword, '→', cuisine)
                break
              }
            }
          }
        }
        
        console.log('🎯 Final detected cuisine:', detectedCuisine)

        // Extract country information from address components
        let country = null
        let countryCode = null
        if (placeDetails?.address_components) {
          console.log('🔍 Address components found:', placeDetails.address_components)
          const countryComponent = placeDetails.address_components.find(
            component => component.types.includes('country')
          )
          if (countryComponent) {
            country = countryComponent.long_name
            countryCode = countryComponent.short_name
            console.log('✅ Found country component:', { country, countryCode })
            
            // Map common country names to your database format
            const countryMapping = {
              'United States': 'United States',
              'USA': 'United States',
              'United States of America': 'United States',
              'People\'s Republic of China': 'China',
              'China': 'China',
              'United Kingdom': 'United Kingdom',
              'UK': 'United Kingdom',
              'Great Britain': 'United Kingdom',
              'England': 'United Kingdom',
              'Scotland': 'United Kingdom',
              'Wales': 'United Kingdom',
              'Northern Ireland': 'United Kingdom'
            }
            
            if (countryMapping[country]) {
              country = countryMapping[country]
              console.log('🔄 Mapped country:', countryComponent.long_name, '→', country)
            }
          } else {
            console.log('❌ No country component found in address')
          }
        } else {
          console.log('❌ No address components available')
        }
        
        console.log('🎯 Final country detection:', { country, countryCode })

        return {
          place_id: place.place_id,
          name: place.name,
          formatted_address: place.formatted_address,
          location: {
            lat: place.geometry.location.lat,
            lng: place.geometry.location.lng
          },
          cuisine_type: detectedCuisine,
          country: country,
          country_code: countryCode,
          rating: place.rating,
          user_ratings_total: place.user_ratings_total,
          price_level: place.price_level,
          business_status: place.business_status,
          opening_hours: placeDetails?.opening_hours,
          website: placeDetails?.website,
          phone: placeDetails?.formatted_phone_number,
          types: place.types,
          photos: place.photos ? place.photos.slice(0, 3).map(photo => ({
            photo_reference: photo.photo_reference,
            width: photo.width,
            height: photo.height
          })) : []
        }
      })
    )

    return handleCORS(NextResponse.json(enhancedResults))
    
  } catch (error) {
    console.error('💥 Places Search API Error:', error)
    return handleCORS(NextResponse.json(
      { 
        error: error.message || "Failed to search places",
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }, 
      { status: 500 }
    ))
  }
}
