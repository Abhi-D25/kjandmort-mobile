import { NextResponse } from 'next/server'
import { supabase, getCountriesAggregate, getCountryDetails, getAllCountries, getCuisines, addRestaurantVisit, getRestaurantsIndex } from '../../../lib/supabase.js'
import { sanitizeItems } from '../../../lib/items.js'

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

// Route handler function
async function handleRoute(request, { params }) {
  const { path = [] } = params
  const route = `/${path.join('/')}`
  const method = request.method

  try {
    // Root endpoint
    if (route === '/' && method === 'GET') {
      return handleCORS(NextResponse.json({ message: "King Julien's World Cuisine Tour API" }))
    }

    // GET /api/aggregate - Get all countries with visit counts for map coloring
    if (route === '/aggregate' && method === 'GET') {
      const data = await getCountriesAggregate()
      return handleCORS(NextResponse.json(data))
    }

    // GET /api/country?code=XX - Get country details with restaurants
    if (route === '/country' && method === 'GET') {
      const url = new URL(request.url)
      const countryCode = url.searchParams.get('code')
      
      if (!countryCode) {
        return handleCORS(NextResponse.json(
          { error: "Country code is required" }, 
          { status: 400 }
        ))
      }

      const data = await getCountryDetails(countryCode)
      return handleCORS(NextResponse.json(data))
    }

    // GET /api/countries?cuisine=XX - Get all countries for dropdowns with optional cuisine filter
    if (route === '/countries' && method === 'GET') {
      const url = new URL(request.url)
      const cuisine = url.searchParams.get('cuisine')
      
      const data = await getAllCountries(cuisine)
      return handleCORS(NextResponse.json(data))
    }

    // GET /api/cuisines - Get distinct cuisines for form dropdown
    if (route === '/cuisines' && method === 'GET') {
      const data = await getCuisines()
      return handleCORS(NextResponse.json(data))
    }

    // GET /api/restaurants-index - All restaurants with country, for search
    if (route === '/restaurants-index' && method === 'GET') {
      const data = await getRestaurantsIndex()
      return handleCORS(NextResponse.json(data))
    }

    // GET /api/restaurants?country_id=XX - Get restaurants for a specific country
    if (route === '/restaurants' && method === 'GET') {
      const url = new URL(request.url)
      const countryId = url.searchParams.get('country_id')
      
      if (!countryId) {
        return handleCORS(NextResponse.json(
          { error: "Country ID is required" }, 
          { status: 400 }
        ))
      }

      try {
        const { data, error } = await supabase
          .from('restaurants')
          .select('*')
          .eq('country_id', countryId)
          .order('visit_date', { ascending: false })
        
        if (error) throw error
        
        return handleCORS(NextResponse.json(data || []))
      } catch (error) {
        return handleCORS(NextResponse.json(
          { error: error.message }, 
          { status: 500 }
        ))
      }
    }

    // POST /api/visit - Add a new restaurant visit
    if (route === '/visit' && method === 'POST') {
      const body = await request.json()
      
      // Validate required fields
      const {
        country_id,
        restaurant_name,
        location,
        items,
        items_devoured,
        king_julien_favorite,
        mort_favorite,
        rating,
        is_fusion,
        fusion_country_id
      } = body

      if (!country_id || !restaurant_name || !location) {
        return handleCORS(NextResponse.json(
          { error: "Missing required fields: country_id, restaurant_name, location" },
          { status: 400 }
        ))
      }

      let cleanedItems
      try {
        cleanedItems = sanitizeItems(items)
      } catch (error) {
        return handleCORS(NextResponse.json({ error: error.message }, { status: 400 }))
      }

      // Prepare visit data - items are optional. Only include the column when
      // set, so inserts still work if the jsonb migration hasn't run yet.
      const visitData = {
        country_id,
        restaurant_name,
        location,
        ...(cleanedItems !== null && { items: cleanedItems }),
        items_devoured: items_devoured || '', // Legacy free-text field
        king_julien_favorite: king_julien_favorite || null,
        mort_favorite: mort_favorite || null,
        rating: rating || null,
        is_fusion: is_fusion || false,
        fusion_country_id: fusion_country_id || null,
        visit_date: new Date().toISOString().split('T')[0] // Today's date
      }

      const result = await addRestaurantVisit(visitData)
      return handleCORS(NextResponse.json(result))
    }

    // PUT/DELETE /api/visit/:id are handled by app/api/visit/[id]/route.js
    // (the more specific route wins over this catch-all).

    // Route not found
    return handleCORS(NextResponse.json(
      { error: `Route ${route} not found` }, 
      { status: 404 }
    ))

  } catch (error) {
    console.error('API Error:', error)
    return handleCORS(NextResponse.json(
      { error: error.message || "Internal server error" }, 
      { status: 500 }
    ))
  }
}

// Export handlers for all HTTP methods
export const GET = handleRoute
export const POST = handleRoute
export const PUT = handleRoute
export const DELETE = handleRoute