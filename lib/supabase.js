import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

// Get all countries with visit counts for map display.
// Two queries total: countries + all restaurant FKs, counted in JS
// (the previous version issued ~2 queries per country).
export async function getCountriesAggregate() {
  try {
    const [countriesResult, restaurantsResult] = await Promise.all([
      supabase.from('countries').select('id, name, country_code').order('name'),
      supabase.from('restaurants').select('country_id, fusion_country_id')
    ])

    if (countriesResult.error) throw countriesResult.error
    if (restaurantsResult.error) throw restaurantsResult.error

    const visitCounts = new Map()
    for (const r of restaurantsResult.data || []) {
      if (r.country_id) {
        visitCounts.set(r.country_id, (visitCounts.get(r.country_id) || 0) + 1)
      }
      if (r.fusion_country_id) {
        visitCounts.set(r.fusion_country_id, (visitCounts.get(r.fusion_country_id) || 0) + 1)
      }
    }

    return (countriesResult.data || []).map(country => {
      const totalVisits = visitCounts.get(country.id) || 0
      return {
        country_code: country.country_code,
        name: country.name,
        visit_count: totalVisits,
        color_intensity: Math.min(totalVisits / 5, 1)
      }
    })
  } catch (error) {
    console.error('Error in getCountriesAggregate:', error)
    throw error
  }
}

// Get country details with restaurants
export async function getCountryDetails(countryCode) {
  try {
    console.log(`🔍 Getting country details for code: ${countryCode}`)
    
    // First get the country
    const { data: countryData, error: countryError } = await supabase
      .from('countries')
      .select('*')
      .eq('country_code', countryCode)
      .single()
    
    if (countryError) {
      console.error('❌ Error fetching country:', countryError)
      throw countryError
    }
    
    console.log(`✅ Found country: ${countryData.name} (ID: ${countryData.id})`)
    
    // Get primary restaurants for this country (where country_id matches)
    const { data: primaryRestaurants, error: primaryError } = await supabase
      .from('restaurants')
      .select('*')
      .eq('country_id', countryData.id)
      .order('visit_date', { ascending: false })
    
    if (primaryError) {
      console.error('❌ Error fetching primary restaurants:', primaryError)
      throw primaryError
    }
    
    // Get fusion restaurants for this country (where fusion_country_id matches)
    const { data: fusionRestaurants, error: fusionError } = await supabase
      .from('restaurants')
      .select('*')
      .eq('fusion_country_id', countryData.id)
      .order('visit_date', { ascending: false })
    
    if (fusionError) {
      console.error('❌ Error fetching fusion restaurants:', fusionError)
      // Continue with primary restaurants only
    }
    
    // Combine both types of restaurants
    const allRestaurants = [
      ...(primaryRestaurants || []),
      ...(fusionRestaurants || [])
    ]
    
    console.log(`✅ Found ${primaryRestaurants?.length || 0} primary + ${fusionRestaurants?.length || 0} fusion = ${allRestaurants.length} total restaurants for ${countryData.name}`)
    
    // Return combined data
    return {
      ...countryData,
      restaurants: allRestaurants
    }
  } catch (error) {
    console.error('Error in getCountryDetails:', error)
    throw error
  }
}

// Get all countries for dropdowns
export async function getAllCountries(cuisineFilter = null) {
  try {
    let query = supabase
      .from('countries')
      .select('id, name, country_code, cuisine_style')
      .order('name')
    
    if (cuisineFilter) {
      query = query.eq('cuisine_style', cuisineFilter)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error in getAllCountries:', error)
    throw error
  }
}

// Get distinct cuisines for form dropdown
export async function getCuisines() {
  try {
    const { data, error } = await supabase
      .from('countries')
      .select('cuisine_style')
      .order('cuisine_style')
    
    if (error) throw error
    
    // Create unique cuisine list for dropdowns
    const uniqueCuisines = [...new Set(data.map(item => item.cuisine_style))]
      .filter(Boolean)
      .map(cuisine => ({
        value: cuisine,
        label: cuisine
      }))
    
    return uniqueCuisines
  } catch (error) {
    console.error('Error in getCuisines:', error)
    throw error
  }
}

// Add a new restaurant visit
export async function addRestaurantVisit(visitData) {
  try {
    console.log('➕ Adding new restaurant visit:', visitData)
    
    const { data, error } = await supabase
      .from('restaurants')
      .insert([visitData])
      .select()
    
    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error('Error in addRestaurantVisit:', error)
    throw error
  }
}

// Update an existing restaurant visit
export async function updateRestaurantVisit(visitId, visitData) {
  try {
    const { data, error } = await supabase
      .from('restaurants')
      .update(visitData)
      .eq('id', visitId)
      .select()

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error('Error in updateRestaurantVisit:', error)
    throw error
  }
}

// Delete a restaurant visit
export async function deleteRestaurantVisit(visitId) {
  try {
    const { error } = await supabase
      .from('restaurants')
      .delete()
      .eq('id', visitId)

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error('Error in deleteRestaurantVisit:', error)
    throw error
  }
}