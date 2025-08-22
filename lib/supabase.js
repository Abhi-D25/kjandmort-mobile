import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Get countries with their visit counts and colors
export const getCountriesAggregate = async () => {
  try {
    const { data, error } = await supabase
      .from('countries')
      .select('country_code, name, visit_count, color_intensity')
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching countries aggregate:', error)
    throw error
  }
}

// Get country details with restaurants
export const getCountryDetails = async (countryCode) => {
  try {
    // First get the country
    const { data: country, error: countryError } = await supabase
      .from('countries')
      .select('*')
      .eq('country_code', countryCode)
      .single()
    
    if (countryError) throw countryError
    
    // Get restaurants for this country (both direct and fusion)
    const { data: restaurants, error: restaurantsError } = await supabase
      .from('restaurants')
      .select(`
        *,
        countries!restaurants_country_id_fkey(name, country_code),
        fusion_countries:countries!restaurants_fusion_country_id_fkey(name, country_code)
      `)
      .or(`country_id.eq.${country.id},fusion_country_id.eq.${country.id}`)
      .order('visit_date', { ascending: false })
    
    if (restaurantsError) throw restaurantsError
    
    return {
      country,
      cuisine_summary: country.main_cuisine,
      visits: restaurants || []
    }
  } catch (error) {
    console.error('Error fetching country details:', error)
    throw error
  }
}

// Get all countries for dropdowns
export const getAllCountries = async () => {
  try {
    const { data, error } = await supabase
      .from('countries')
      .select('id, name, country_code')
      .order('name')
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching all countries:', error)
    throw error
  }
}

// Add a new restaurant visit
export const addRestaurantVisit = async (visitData) => {
  try {
    const { data, error } = await supabase
      .from('restaurants')
      .insert([visitData])
      .select(`
        *,
        countries!restaurants_country_id_fkey(name, country_code),
        fusion_countries:countries!restaurants_fusion_country_id_fkey(name, country_code)
      `)
      .single()
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Error adding restaurant visit:', error)
    throw error
  }
}