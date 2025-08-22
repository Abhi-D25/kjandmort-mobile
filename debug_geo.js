const https = require('https');

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

https.get(geoUrl, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const geoData = JSON.parse(data);
      
      // Check what properties are available
      const sampleCountry = geoData.objects.countries.geometries[0].properties;
      console.log('Sample country properties:', Object.keys(sampleCountry));
      
      // Look for France, India, Italy, Japan, Thailand
      const targetCountries = ['France', 'India', 'Italy', 'Japan', 'Thailand'];
      
      geoData.objects.countries.geometries.forEach(country => {
        const props = country.properties;
        if (targetCountries.some(target => props.NAME === target || props.NAME_EN === target)) {
          console.log(`${props.NAME}: ISO_A2=${props.ISO_A2}, ISO_A3=${props.ISO_A3}, ADM0_A3=${props.ADM0_A3}`);
        }
      });
      
    } catch (error) {
      console.error('Error parsing JSON:', error);
    }
  });
  
}).on('error', (error) => {
  console.error('Error fetching data:', error);
});