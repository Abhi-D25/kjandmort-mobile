import { NextResponse } from 'next/server'
import { supabase, getCountriesAggregate, getCountryDetails, getAllCountries, addRestaurantVisit } from '../../../lib/supabase.js'

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

    // GET /api/countries - Get all countries for dropdowns
    if (route === '/countries' && method === 'GET') {
      const data = await getAllCountries()
      return handleCORS(NextResponse.json(data))
    }

    // POST /api/visit - Add a new restaurant visit
    if (route === '/visit' && method === 'POST') {
      const body = await request.json()
      
      // Validate required fields
      const { 
        country_id, 
        restaurant_name, 
        location, 
        items_devoured, 
        king_julien_favorite, 
        mort_favorite, 
        is_fusion, 
        fusion_country_id 
      } = body

      if (!country_id || !restaurant_name || !location || !items_devoured) {
        return handleCORS(NextResponse.json(
          { error: "Missing required fields: country_id, restaurant_name, location, items_devoured" }, 
          { status: 400 }
        ))
      }

      // Prepare visit data
      const visitData = {
        country_id,
        restaurant_name,
        location,
        items_devoured,
        king_julien_favorite: king_julien_favorite || null,
        mort_favorite: mort_favorite || null,
        is_fusion: is_fusion || false,
        fusion_country_id: fusion_country_id || null,
        visit_date: new Date().toISOString().split('T')[0] // Today's date
      }

      const result = await addRestaurantVisit(visitData)
      return handleCORS(NextResponse.json(result))
    }

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

// Export all HTTP methods
export const GET = handleRoute
export const POST = handleRoute
export const PUT = handleRoute
export const DELETE = handleRoute
export const PATCH = handleRoute