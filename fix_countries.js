import { supabase } from './lib/supabase.js'
import { v4 as uuidv4 } from 'uuid'

// Simple function to add a few test countries and fix the map coloring
async function fixMapColoring() {
  try {
    console.log('🔧 Testing map color fix...')
    
    // Check current data
    const { data: current, error: fetchError } = await supabase
      .from('countries')
      .select('*')
      .in('country_code', ['FRA', 'IND'])
    
    if (fetchError) {
      console.error('Error fetching current data:', fetchError)
      return
    }
    
    console.log('Current data for France and India:')
    current?.forEach(country => {
      console.log(`  ${country.name} (${country.country_code}): ${country.visit_count} visits`)
    })
    
    // Add a test restaurant visit to France to increase the visit count
    const franceCountry = current?.find(c => c.country_code === 'FRA')
    if (franceCountry) {
      const { error: visitError } = await supabase
        .from('restaurants')
        .insert({
          id: uuidv4(),
          country_id: franceCountry.id,
          restaurant_name: 'Test Restaurant',
          location: 'Paris',
          items_devoured: 'Croissant, Coffee',
          king_julien_favorite: 'Croissant',
          mort_favorite: 'Coffee',
          is_fusion: false,
          visit_date: new Date().toISOString().split('T')[0]
        })
      
      if (!visitError) {
        console.log('✅ Added test visit to France')
        
        // Manually update the visit count and color intensity
        await supabase
          .from('countries')
          .update({
            visit_count: 3,
            color_intensity: 0.6
          })
          .eq('id', franceCountry.id)
        
        console.log('✅ Updated France visit count to 3')
      }
    }
    
    // Add a few key countries with 2-letter codes if they don't exist
    const keyCountries = [
      { name: 'United States', code2: 'US', code3: 'USA', cuisine: 'American' },
      { name: 'China', code2: 'CN', code3: 'CHN', cuisine: 'Chinese' },
      { name: 'Germany', code2: 'DE', code3: 'DEU', cuisine: 'German' },
      { name: 'Brazil', code2: 'BR', code3: 'BRA', cuisine: 'Brazilian' },
      { name: 'United Kingdom', code2: 'GB', code3: 'GBR', cuisine: 'British' }
    ]
    
    for (const country of keyCountries) {
      // Check if country already exists (either by 2-letter or 3-letter code)
      const { data: existing } = await supabase
        .from('countries')
        .select('*')
        .or(`country_code.eq.${country.code2},country_code.eq.${country.code3}`)
      
      if (!existing || existing.length === 0) {
        // Add country with 2-letter code
        const { error } = await supabase
          .from('countries')
          .insert({
            id: uuidv4(),
            name: country.name,
            country_code: country.code2, // Use 2-letter code
            cuisine_style: country.cuisine,
            visit_count: 0,
            color_intensity: 0
          })
        
        if (!error) {
          console.log(`✅ Added ${country.name} with code ${country.code2}`)
        }
      } else {
        console.log(`ℹ️  ${country.name} already exists`)
      }
    }
    
    console.log('🎉 Map color fix completed!')
    
  } catch (error) {
    console.error('💥 Error:', error)
  }
}

// Run the fix
fixMapColoring()