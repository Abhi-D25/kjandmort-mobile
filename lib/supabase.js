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

// Get all countries for dropdowns with optional cuisine filter
export const getAllCountries = async (cuisine = null) => {
  try {
    let query = supabase
      .from('countries')
      .select('id, name, country_code, cuisine_style')
      .order('name')
    
    if (cuisine) {
      query = query.eq('cuisine_style', cuisine)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching all countries:', error)
    throw error
  }
}

// Get distinct cuisines for form dropdown
export const getCuisines = async () => {
  try {
    const { data, error } = await supabase
      .from('countries')
      .select('cuisine_style')
      .not('cuisine_style', 'eq', '')
      .order('cuisine_style')
    
    if (error) throw error
    
    // Get unique cuisine styles
    const uniqueCuisines = [...new Set(data.map(item => item.cuisine_style))]
    return uniqueCuisines.map(cuisine => ({ value: cuisine, label: cuisine }))
  } catch (error) {
    console.error('Error fetching cuisines:', error)
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