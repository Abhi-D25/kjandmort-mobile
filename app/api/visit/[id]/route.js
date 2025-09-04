import { NextResponse } from 'next/server'
import { updateRestaurantVisit, deleteRestaurantVisit } from '../../../../lib/supabase.js'

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

// PUT /api/visit/[id] - Update an existing restaurant visit
export async function PUT(request, { params }) {
  try {
    const { id } = params
    
    if (!id) {
      return handleCORS(NextResponse.json(
        { error: "Visit ID is required" }, 
        { status: 400 }
      ))
    }

    const body = await request.json()
    
    // Validate required fields
    const { 
      country_id, 
      restaurant_name, 
      location, 
      items_devoured, 
      king_julien_favorite, 
      mort_favorite, 
      rating,
      is_fusion, 
      fusion_country_id,
      visit_date
    } = body

    if (!country_id || !restaurant_name || !location) {
      return handleCORS(NextResponse.json(
        { error: "Missing required fields: country_id, restaurant_name, location" }, 
        { status: 400 }
      ))
    }

    // Prepare visit data
    const visitData = {
      country_id,
      restaurant_name,
      location,
      items_devoured: items_devoured || '',
      king_julien_favorite: king_julien_favorite || null,
      mort_favorite: mort_favorite || null,
      rating: rating || null,
      is_fusion: is_fusion || false,
      fusion_country_id: fusion_country_id || null,
      visit_date: visit_date || new Date().toISOString().split('T')[0]
    }

    console.log(`🔄 Updating visit ${id} with data:`, visitData)

    const result = await updateRestaurantVisit(id, visitData)
    
    console.log('✅ Visit updated successfully:', result)
    
    return handleCORS(NextResponse.json(result))
    
  } catch (error) {
    console.error('💥 Update visit error:', error)
    return handleCORS(NextResponse.json(
      { error: error.message || "Failed to update visit" }, 
      { status: 500 }
    ))
  }
}

// DELETE /api/visit/[id] - Delete a restaurant visit
export async function DELETE(request, { params }) {
  try {
    const { id } = params
    
    if (!id) {
      return handleCORS(NextResponse.json(
        { error: "Visit ID is required" }, 
        { status: 400 }
      ))
    }

    console.log(`🗑️ Deleting visit ${id}`)

    const result = await deleteRestaurantVisit(id)
    
    console.log('✅ Visit deleted successfully:', result)
    
    return handleCORS(NextResponse.json(result))
    
  } catch (error) {
    console.error('💥 Delete visit error:', error)
    return handleCORS(NextResponse.json(
      { error: error.message || "Failed to delete visit" }, 
      { status: 500 }
    ))
  }
}