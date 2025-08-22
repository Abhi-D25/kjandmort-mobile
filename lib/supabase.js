import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

// Get all countries with visit counts for map display
export async function getCountriesAggregate() {
  try {
    const { data, error } = await supabase
      .from('countries')
      .select(`
        *,
        restaurants!inner(id)
      `)
      .order('name')
    
    if (error) throw error
    
    // Calculate visit counts and color intensity
    const processedData = data.map(country => ({
      country_code: country.country_code,
      name: country.name,
      visit_count: country.restaurants ? country.restaurants.length : 0,
      color_intensity: country.restaurants ? Math.min(country.restaurants.length / 5, 1) : 0
    }))
    
    return processedData
  } catch (error) {
    console.error('Error in getCountriesAggregate:', error)
    throw error
  }
}

// Get country details with restaurants
export async function getCountryDetails(countryCode) {
  try {
    const { data, error } = await supabase
      .from('countries')
      .select(`
        *,
        restaurants (*)
      `)
      .eq('country_code', countryCode)
      .single()
    
    if (error) throw error
    return data
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
    const { data, error } = await supabase
      .from('restaurants')
      .insert([visitData])
      .select()
    
    if (error) throw error
    
    // Update country visit count and color intensity
    await updateCountryStats(visitData.country_id)
    
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
    
    // Update country stats for the updated visit
    if (visitData.country_id) {
      await updateCountryStats(visitData.country_id)
    }
    
    return { success: true, data }
  } catch (error) {
    console.error('Error in updateRestaurantVisit:', error)
    throw error
  }
}

// Delete a restaurant visit
export async function deleteRestaurantVisit(visitId) {
  try {
    // Get the visit data first to know which country to update
    const { data: visitData, error: fetchError } = await supabase
      .from('restaurants')
      .select('country_id')
      .eq('id', visitId)
      .single()
    
    if (fetchError) throw fetchError
    
    // Delete the visit
    const { error } = await supabase
      .from('restaurants')
      .delete()
      .eq('id', visitId)
    
    if (error) throw error
    
    // Update country stats after deletion
    if (visitData?.country_id) {
      await updateCountryStats(visitData.country_id)
    }
    
    return { success: true }
  } catch (error) {
    console.error('Error in deleteRestaurantVisit:', error)
    throw error
  }
}

// Update country visit statistics
async function updateCountryStats(countryId) {
  try {
    // Count visits for this country
    const { count, error } = await supabase
      .from('restaurants')
      .select('*', { count: 'exact', head: true })
      .eq('country_id', countryId)
    
    if (error) throw error
    
    // Calculate color intensity (max at 5 visits)
    const colorIntensity = Math.min((count || 0) / 5, 1)
    
    // Update country record
    await supabase
      .from('countries')
      .update({
        visit_count: count || 0,
        color_intensity: colorIntensity
      })
      .eq('id', countryId)
    
  } catch (error) {
    console.error('Error updating country stats:', error)
    throw error
  }
}