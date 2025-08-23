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
    console.log('🔍 Getting countries aggregate data...')
    
    // First get all countries
    const { data: countries, error: countriesError } = await supabase
      .from('countries')
      .select('*')
      .order('name')
    
    if (countriesError) throw countriesError
    
    console.log(`✅ Loaded ${countries.length} countries`)
    
    // Then get visit counts for each country
    const processedData = await Promise.all(
      countries.map(async (country) => {
        // Count restaurants for this country
        const { count, error: countError } = await supabase
          .from('restaurants')
          .select('*', { count: 'exact', head: true })
          .eq('country_id', country.id)
        
        if (countError) {
          console.error(`Error counting visits for ${country.name}:`, countError)
          return {
            country_code: country.country_code,
            name: country.name,
            visit_count: 0,
            color_intensity: 0
          }
        }
        
        const visitCount = count || 0
        
        return {
          country_code: country.country_code,
          name: country.name,
          visit_count: visitCount,
          color_intensity: Math.min(visitCount / 5, 1)
        }
      })
    )
    
    console.log(`✅ Processed ${processedData.length} countries with visit counts`)
    const visitedCountries = processedData.filter(c => c.visit_count > 0)
    console.log(`📊 Countries with visits: ${visitedCountries.length}`)
    
    return processedData
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
    
    // Then get restaurants for this country
    const { data: restaurants, error: restaurantsError } = await supabase
      .from('restaurants')
      .select('*')
      .eq('country_id', countryData.id)
      .order('visit_date', { ascending: false })
    
    if (restaurantsError) {
      console.error('❌ Error fetching restaurants:', restaurantsError)
      throw restaurantsError
    }
    
    console.log(`✅ Found ${restaurants?.length || 0} restaurants for ${countryData.name}`)
    
    // Return combined data
    return {
      ...countryData,
      restaurants: restaurants || []
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
    
    console.log('✅ Restaurant visit added:', data)
    
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
    console.log(`🔄 Updating restaurant visit ${visitId}:`, visitData)
    
    const { data, error } = await supabase
      .from('restaurants')
      .update(visitData)
      .eq('id', visitId)
      .select()
    
    if (error) throw error
    
    console.log('✅ Restaurant visit updated:', data)
    
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
    console.log(`🗑️ Deleting restaurant visit ${visitId}`)
    
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
    
    console.log('✅ Restaurant visit deleted')
    
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
    console.log(`📊 Updating country stats for ${countryId}`)
    
    // Count visits for this country
    const { count, error } = await supabase
      .from('restaurants')
      .select('*', { count: 'exact', head: true })
      .eq('country_id', countryId)
    
    if (error) throw error
    
    // Calculate color intensity (max at 5 visits)
    const visitCount = count || 0
    const colorIntensity = Math.min(visitCount / 5, 1)
    
    console.log(`📊 Country ${countryId}: ${visitCount} visits, intensity: ${colorIntensity}`)
    
    // Update country record
    await supabase
      .from('countries')
      .update({
        visit_count: visitCount,
        color_intensity: colorIntensity
      })
      .eq('id', countryId)
    
    console.log('✅ Country stats updated')
    
  } catch (error) {
    console.error('Error updating country stats:', error)
    throw error
  }
}