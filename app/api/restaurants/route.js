import { NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase.js'

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

// GET /api/restaurants?country_id=XX - Get restaurants for a specific country
export async function GET(request) {
  try {
    const url = new URL(request.url)
    const countryId = url.searchParams.get('country_id')
    
    console.log(`🔍 Restaurants API called with country_id: ${countryId}`)
    
    if (!countryId) {
      console.error('❌ Missing country_id parameter')
      return handleCORS(NextResponse.json(
        { error: "Country ID is required" }, 
        { status: 400 }
      ))
    }

    // Validate Supabase connection
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('❌ Missing Supabase environment variables')
      return handleCORS(NextResponse.json(
        { error: "Database configuration error" }, 
        { status: 500 }
      ))
    }

    console.log(`🔍 Querying restaurants for country_id: ${countryId}`)
    
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('country_id', countryId)
      .order('visit_date', { ascending: false })
    
    if (error) {
      console.error('❌ Supabase query error:', error)
      throw error
    }
    
    console.log(`✅ Found ${data?.length || 0} restaurants for country ${countryId}`)
    console.log('📋 Restaurant data:', data)
    
    return handleCORS(NextResponse.json(data || []))
    
  } catch (error) {
    console.error('💥 Restaurants API Error:', error)
    return handleCORS(NextResponse.json(
      { 
        error: error.message || "Failed to load restaurants",
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }, 
      { status: 500 }
    ))
  }
}