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
    
    // Then get visit counts for each country (including fusion visits)
    const processedData = await Promise.all(
      countries.map(async (country) => {
        // Count primary restaurants for this country
        const { count: primaryCount, error: primaryCountError } = await supabase
          .from('restaurants')
          .select('*', { count: 'exact', head: true })
          .eq('country_id', country.id)
        
        if (primaryCountError) {
          console.error(`Error counting primary visits for ${country.name}:`, primaryCountError)
          return {
            country_code: country.country_code,
            name: country.name,
            visit_count: 0,
            color_intensity: 0
          }
        }
        
        // Count fusion restaurants where this country is the fusion country
        const { count: fusionCount, error: fusionCountError } = await supabase
          .from('restaurants')
          .select('*', { count: 'exact', head: true })
          .eq('fusion_country_id', country.id)
        
        if (fusionCountError) {
          console.error(`Error counting fusion visits for ${country.name}:`, fusionCountError)
          // Continue with primary count only
        }
        
        const primaryVisits = primaryCount || 0
        const fusionVisits = fusionCount || 0
        const totalVisits = primaryVisits + fusionVisits
        
        return {
          country_code: country.country_code,
          name: country.name,
          visit_count: totalVisits,
          color_intensity: Math.min(totalVisits / 5, 1)
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
    
    console.log('✅ Restaurant visit added:', data)
    
    // Update primary country visit count and color intensity
    await updateCountryStats(visitData.country_id)
    
    // If this is a fusion visit, also update the fusion country stats
    if (visitData.is_fusion && visitData.fusion_country_id) {
      console.log(`🔄 Updating fusion country stats for country ID: ${visitData.fusion_country_id}`)
      await updateCountryStats(visitData.fusion_country_id)
    }
    
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
    
    // Get the old visit data to know which countries to update
    const { data: oldVisitData, error: fetchError } = await supabase
      .from('restaurants')
      .select('country_id, is_fusion, fusion_country_id')
      .eq('id', visitId)
      .single()
    
    if (fetchError) {
      console.error('Error fetching old visit data:', fetchError)
      // Continue with update anyway
    }
    
    const { data, error } = await supabase
      .from('restaurants')
      .update(visitData)
      .eq('id', visitId)
      .select()
    
    if (error) throw error
    
    console.log('✅ Restaurant visit updated:', data)
    
    // Update primary country stats for the updated visit
    if (visitData.country_id) {
      await updateCountryStats(visitData.country_id)
    }
    
    // If this is a fusion visit, also update the fusion country stats
    if (visitData.is_fusion && visitData.fusion_country_id) {
      console.log(`🔄 Updating fusion country stats for country ID: ${visitData.fusion_country_id}`)
      await updateCountryStats(visitData.fusion_country_id)
    }
    
    // If the old visit had a fusion country that's different from the new one, update the old fusion country too
    if (oldVisitData && oldVisitData.is_fusion && oldVisitData.fusion_country_id && 
        oldVisitData.fusion_country_id !== visitData.fusion_country_id) {
      console.log(`🔄 Updating old fusion country stats for country ID: ${oldVisitData.fusion_country_id}`)
      await updateCountryStats(oldVisitData.fusion_country_id)
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
    
    // Get the visit data first to know which countries to update
    const { data: visitData, error: fetchError } = await supabase
      .from('restaurants')
      .select('country_id, is_fusion, fusion_country_id')
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
    
    // Update primary country stats after deletion
    if (visitData?.country_id) {
      await updateCountryStats(visitData.country_id)
    }
    
    // If this was a fusion visit, also update the fusion country stats
    if (visitData?.is_fusion && visitData?.fusion_country_id) {
      console.log(`🔄 Updating fusion country stats after deletion for country ID: ${visitData.fusion_country_id}`)
      await updateCountryStats(visitData.fusion_country_id)
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
    
    // Count primary visits for this country
    const { count: primaryCount, error: primaryError } = await supabase
      .from('restaurants')
      .select('*', { count: 'exact', head: true })
      .eq('country_id', countryId)
    
    if (primaryError) throw primaryError
    
    // Count fusion visits where this country is the fusion country
    const { count: fusionCount, error: fusionError } = await supabase
      .from('restaurants')
      .select('*', { count: 'exact', head: true })
      .eq('fusion_country_id', countryId)
    
    if (fusionError) {
      console.error(`Error counting fusion visits for country ${countryId}:`, fusionError)
      // Continue with primary count only
    }
    
    // Calculate total visits and color intensity
    const primaryVisits = primaryCount || 0
    const fusionVisits = fusionCount || 0
    const totalVisits = primaryVisits + fusionVisits
    const colorIntensity = Math.min(totalVisits / 5, 1)
    
    console.log(`📊 Country ${countryId}: ${primaryVisits} primary + ${fusionVisits} fusion = ${totalVisits} total visits, intensity: ${colorIntensity}`)
    
    // Update country record
    await supabase
      .from('countries')
      .update({
        visit_count: totalVisits,
        color_intensity: colorIntensity
      })
      .eq('id', countryId)
    
    console.log('✅ Country stats updated')
    
  } catch (error) {
    console.error('Error updating country stats:', error)
    throw error
  }
}