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

// Cuisine keywords checked against the restaurant name and search query
const CUISINE_KEYWORDS = {
  chinese: 'chinese',
  italian: 'italian',
  mexican: 'mexican',
  indian: 'indian',
  thai: 'thai',
  japanese: 'japanese',
  korean: 'korean',
  vietnamese: 'vietnamese',
  greek: 'greek',
  turkish: 'turkish',
  lebanese: 'lebanese',
  moroccan: 'moroccan',
  ethiopian: 'ethiopian',
  brazilian: 'brazilian',
  peruvian: 'peruvian',
  french: 'french',
  spanish: 'spanish',
  german: 'german',
  british: 'british',
  irish: 'irish',
  mediterranean: 'mediterranean',
  // Food-specific keywords
  pizza: 'italian',
  sushi: 'japanese',
  taco: 'mexican',
  curry: 'indian',
  pho: 'vietnamese',
  kebab: 'turkish',
  falafel: 'lebanese',
  'pad thai': 'thai',
  bibimbap: 'korean'
}

// Places API (New) type ids look like "chinese_restaurant", "thai_restaurant"…
function cuisineFromTypes(types) {
  for (const type of types || []) {
    const base = type.replace(/_restaurant$/, '')
    if (CUISINE_KEYWORDS[base] && CUISINE_KEYWORDS[base] === base) {
      return base
    }
  }
  return null
}

function detectCuisine(name, types, query) {
  const haystacks = [name.toLowerCase(), query.toLowerCase()]
  for (const text of haystacks) {
    for (const [keyword, cuisine] of Object.entries(CUISINE_KEYWORDS)) {
      if (text.includes(keyword)) return cuisine
    }
  }
  return cuisineFromTypes(types) || 'restaurant'
}

// New API returns an enum; the frontend expects the legacy 0–4 number
const PRICE_LEVELS = {
  PRICE_LEVEL_FREE: 0,
  PRICE_LEVEL_INEXPENSIVE: 1,
  PRICE_LEVEL_MODERATE: 2,
  PRICE_LEVEL_EXPENSIVE: 3,
  PRICE_LEVEL_VERY_EXPENSIVE: 4
}

// Country names Google uses that differ from the countries table
const COUNTRY_NAME_MAPPING = {
  'United States of America': 'United States',
  USA: 'United States',
  "People's Republic of China": 'China',
  UK: 'United Kingdom',
  'Great Britain': 'United Kingdom',
  England: 'United Kingdom',
  Scotland: 'United Kingdom',
  Wales: 'United Kingdom',
  'Northern Ireland': 'United Kingdom'
}

// GET /api/places/search?query=restaurant_name&location=city
// Uses Places API (New) Text Search — one request returns everything,
// including address components (the legacy API needed a details call per
// result, and can no longer be enabled on new Google Cloud projects).
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

    const apiKey = process.env.GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      console.error('❌ Missing GOOGLE_MAPS_API_KEY environment variable')
      return handleCORS(NextResponse.json(
        { error: "Google Maps API not configured" },
        { status: 500 }
      ))
    }

    const searchQuery = location ? `${query} in ${location}` : query

    const fieldMask = [
      'places.id',
      'places.displayName',
      'places.formattedAddress',
      'places.location',
      'places.types',
      'places.rating',
      'places.userRatingCount',
      'places.priceLevel',
      'places.businessStatus',
      'places.websiteUri',
      'places.nationalPhoneNumber',
      'places.addressComponents',
      'places.currentOpeningHours.openNow'
    ].join(',')

    const placesResponse = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': fieldMask
      },
      body: JSON.stringify({
        textQuery: searchQuery,
        includedType: 'restaurant',
        pageSize: 5
      })
    })

    const placesData = await placesResponse.json().catch(() => null)

    if (!placesResponse.ok) {
      const apiError = placesData?.error
      console.error('❌ Places API (New) error:', placesResponse.status, apiError)

      if (apiError?.status === 'PERMISSION_DENIED' || placesResponse.status === 403) {
        return handleCORS(NextResponse.json(
          { error: "Google Places API access denied. Make sure 'Places API (New)' is enabled for the project, billing is linked, and the key allows it." },
          { status: 403 }
        ))
      }
      if (apiError?.status === 'RESOURCE_EXHAUSTED' || placesResponse.status === 429) {
        return handleCORS(NextResponse.json(
          { error: "Google Places API quota exceeded. Please try again later." },
          { status: 429 }
        ))
      }
      if (apiError?.status === 'INVALID_ARGUMENT') {
        return handleCORS(NextResponse.json(
          { error: "Invalid search request. Please try different keywords." },
          { status: 400 }
        ))
      }
      return handleCORS(NextResponse.json(
        { error: `Google Places API error: ${apiError?.message || placesResponse.statusText}` },
        { status: 502 }
      ))
    }

    const places = placesData?.places || []
    console.log(`🔍 Places API (New): ${places.length} result(s) for "${searchQuery}"`)

    const results = places.map((place) => {
      const name = place.displayName?.text || ''

      // Country from address components
      let country = null
      let countryCode = null
      const countryComponent = (place.addressComponents || []).find(
        component => component.types?.includes('country')
      )
      if (countryComponent) {
        country = COUNTRY_NAME_MAPPING[countryComponent.longText] || countryComponent.longText
        countryCode = countryComponent.shortText || null
      }

      return {
        place_id: place.id,
        name,
        formatted_address: place.formattedAddress || '',
        location: place.location
          ? { lat: place.location.latitude, lng: place.location.longitude }
          : null,
        cuisine_type: detectCuisine(name, place.types, query),
        country,
        country_code: countryCode,
        rating: place.rating ?? null,
        user_ratings_total: place.userRatingCount ?? null,
        price_level: PRICE_LEVELS[place.priceLevel] ?? null,
        business_status: place.businessStatus ?? null,
        opening_hours: place.currentOpeningHours
          ? { open_now: place.currentOpeningHours.openNow }
          : null,
        website: place.websiteUri ?? null,
        phone: place.nationalPhoneNumber ?? null,
        types: place.types || [],
        photos: []
      }
    })

    return handleCORS(NextResponse.json(results))

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
