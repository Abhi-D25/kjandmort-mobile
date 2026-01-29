// Debug script to test API endpoints on Vercel
// Run this in browser console to debug API issues

async function debugAPIs() {
  const baseUrl = window.location.origin;
  
  console.log('🔍 Starting API Debug Tests...');
  console.log('Base URL:', baseUrl);
  
  // Test 1: Aggregate endpoint
  try {
    console.log('\n📊 Testing /api/aggregate...');
    const aggregateResponse = await fetch(`${baseUrl}/api/aggregate`);
    console.log('Status:', aggregateResponse.status);
    if (aggregateResponse.ok) {
      const aggregateData = await aggregateResponse.json();
      console.log('✅ Aggregate data:', aggregateData.slice(0, 3)); // Show first 3 items
      console.log(`Found ${aggregateData.length} countries`);
    } else {
      const errorText = await aggregateResponse.text();
      console.error('❌ Aggregate error:', errorText);
    }
  } catch (error) {
    console.error('💥 Aggregate fetch error:', error);
  }

  // Test 2: Countries endpoint
  try {
    console.log('\n🌍 Testing /api/countries...');
    const countriesResponse = await fetch(`${baseUrl}/api/countries`);
    console.log('Status:', countriesResponse.status);
    if (countriesResponse.ok) {
      const countriesData = await countriesResponse.json();
      console.log('✅ Countries data:', countriesData.slice(0, 3));
      console.log(`Found ${countriesData.length} countries`);
      
      // Test 3: Restaurants endpoint with a country ID
      if (countriesData.length > 0) {
        const testCountryId = countriesData[0].id;
        console.log(`\n🍽️ Testing /api/restaurants with country_id: ${testCountryId}...`);
        
        const restaurantsResponse = await fetch(`${baseUrl}/api/restaurants?country_id=${testCountryId}`);
        console.log('Status:', restaurantsResponse.status);
        if (restaurantsResponse.ok) {
          const restaurantsData = await restaurantsResponse.json();
          console.log('✅ Restaurants data:', restaurantsData);
          console.log(`Found ${restaurantsData.length} restaurants`);
        } else {
          const errorText = await restaurantsResponse.text();
          console.error('❌ Restaurants error:', errorText);
        }
      }
    } else {
      const errorText = await countriesResponse.text();
      console.error('❌ Countries error:', errorText);
    }
  } catch (error) {
    console.error('💥 Countries fetch error:', error);
  }

  // Test 4: Environment check
  console.log('\n🔧 Environment Check:');
  console.log('User Agent:', navigator.userAgent);
  console.log('URL:', window.location.href);
  
  console.log('\n✅ Debug tests completed. Check results above.');
}

// Auto-run the debug
debugAPIs();