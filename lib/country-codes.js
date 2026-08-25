// Single source of truth for matching Natural Earth map features to the
// countries table. Matching is by name: normalize both sides, apply the
// alias table for names the two datasets spell differently.
// (Replaces two divergent hardcoded name→code tables that mostly no-oped.)

// Natural Earth (world-atlas countries-50m) name → DB name
export const GEO_NAME_ALIASES = {
  'United States of America': 'United States',
  'Bosnia and Herz.': 'Bosnia and Herzegovina',
  'Cabo Verde': 'Cape Verde',
  'Central African Rep.': 'Central African Republic',
  'Congo': 'Congo (Republic)',
  'Dem. Rep. Congo': 'Congo (Democratic Republic)',
  'Czechia': 'Czech Republic',
  'Dominican Rep.': 'Dominican Republic',
  'Eq. Guinea': 'Equatorial Guinea',
  'Macedonia': 'North Macedonia',
  'Marshall Is.': 'Marshall Islands',
  'S. Sudan': 'South Sudan',
  'Solomon Is.': 'Solomon Islands',
  'St. Kitts and Nevis': 'Saint Kitts and Nevis',
  'St. Vin. and Gren.': 'Saint Vincent and the Grenadines',
  'Vatican': 'Vatican City'
}

// Lowercase, strip diacritics and punctuation → stable comparison key
export function normalizeCountryName(name) {
  return (name || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

// Build a lookup of normalized DB name → country record
export function buildCountryNameIndex(countriesData) {
  const index = new Map()
  for (const country of countriesData || []) {
    index.set(normalizeCountryName(country.name), country)
  }
  return index
}

// Match a map feature's name to a DB country record (or null).
// Exact normalized match only — no fuzzy `includes` (Niger vs Nigeria).
export function matchGeoToCountry(geoName, countryNameIndex) {
  if (!geoName) return null
  const aliased = GEO_NAME_ALIASES[geoName] || geoName
  return countryNameIndex.get(normalizeCountryName(aliased)) || null
}
