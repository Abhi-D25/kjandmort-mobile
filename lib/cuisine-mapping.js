// Mapping from Google Places API cuisine types to database cuisine types
export const cuisineMapping = {
  // General restaurant types
  'restaurant': 'International',
  'food': 'International',
  'meal_takeaway': 'International',
  'meal_delivery': 'International',
  
  // Cafe and bar types
  'cafe': 'International',
  'bar': 'International',
  'bakery': 'International',
  
  // Specific cuisine types
  'pizza': 'Italian',
  'sushi': 'Japanese',
  'chinese': 'Chinese',
  'italian': 'Italian',
  'mexican': 'Mexican',
  'indian': 'Indian',
  'thai': 'Thai',
  'japanese': 'Japanese',
  'korean': 'Korean',
  'vietnamese': 'Vietnamese',
  'mediterranean': 'Mediterranean',
  'greek': 'Greek',
  'turkish': 'Turkish',
  'lebanese': 'Lebanese',
  'moroccan': 'Moroccan',
  'ethiopian': 'Ethiopian',
  'brazilian': 'Brazilian',
  'peruvian': 'Peruvian',
  'french': 'French',
  'spanish': 'Spanish',
  'german': 'German',
  'british': 'British',
  'irish': 'Irish',
  'scottish': 'Scottish',
  'dutch': 'Dutch',
  'belgian': 'Belgian',
  'swiss': 'Swiss',
  'austrian': 'Austrian',
  'polish': 'Polish',
  'czech': 'Czech',
  'hungarian': 'Hungarian',
  'romanian': 'Romanian',
  'bulgarian': 'Bulgarian',
  'serbian': 'Serbian',
  'croatian': 'Croatian',
  'slovenian': 'Slovenian',
  'slovak': 'Slovak',
  'ukrainian': 'Ukrainian',
  'russian': 'Russian',
  'belarusian': 'Belarusian',
  'lithuanian': 'Lithuanian',
  'latvian': 'Latvian',
  'estonian': 'Estonian',
  'finnish': 'Finnish',
  'swedish': 'Swedish',
  'norwegian': 'Norwegian',
  'danish': 'Danish',
  'icelandic': 'Icelandic',
  
  // Additional mappings for better coverage
  'seafood': 'International',
  'steakhouse': 'International',
  'bbq': 'International',
  'burgers': 'International',
  'sandwiches': 'International',
  'salads': 'International',
  'vegetarian': 'International',
  'vegan': 'International',
  'gluten_free': 'International',
  'halal': 'International',
  'kosher': 'International',
  'caribbean': 'Caribbean',
  'african': 'African',
  'middle_eastern': 'Middle Eastern',
  'south_american': 'South American',
  'central_american': 'Central American',
  'north_american': 'North American',
  'european': 'European',
  'asian': 'Asian',
  'australian': 'Australian',
  'pacific': 'Pacific',
  'hawaiian': 'Hawaiian',
  'cajun': 'Cajun',
  'creole': 'Creole',
  'soul_food': 'Soul Food',
  'tex_mex': 'Tex-Mex',
  'fusion': 'Fusion'
}

// Function to map Google Places cuisine type to database cuisine type
export function mapCuisineType(googleCuisineType) {
  // Convert to lowercase for case-insensitive matching
  const normalizedType = googleCuisineType.toLowerCase()
  
  // First try exact match
  if (cuisineMapping[normalizedType]) {
    return cuisineMapping[normalizedType]
  }
  
  // Try partial matching for more flexible mapping
  for (const [key, value] of Object.entries(cuisineMapping)) {
    if (normalizedType.includes(key) || key.includes(normalizedType)) {
      return value
    }
  }
  
  // Default fallback
  return 'International'
}

// Function to get cuisine display name
export function getCuisineDisplayName(cuisineType) {
  const cuisineMap = {
    'International': 'International',
    'Chinese': 'Chinese',
    'Italian': 'Italian',
    'Mexican': 'Mexican',
    'Indian': 'Indian',
    'Thai': 'Thai',
    'Japanese': 'Japanese',
    'Korean': 'Korean',
    'Vietnamese': 'Vietnamese',
    'Mediterranean': 'Mediterranean',
    'Greek': 'Greek',
    'Turkish': 'Turkish',
    'Lebanese': 'Lebanese',
    'Moroccan': 'Moroccan',
    'Ethiopian': 'Ethiopian',
    'Brazilian': 'Brazilian',
    'Peruvian': 'Peruvian',
    'French': 'French',
    'Spanish': 'Spanish',
    'German': 'German',
    'British': 'British',
    'Irish': 'Irish',
    'Scottish': 'Scottish',
    'Dutch': 'Dutch',
    'Belgian': 'Belgian',
    'Swiss': 'Swiss',
    'Austrian': 'Austrian',
    'Polish': 'Polish',
    'Czech': 'Czech',
    'Hungarian': 'Hungarian',
    'Romanian': 'Romanian',
    'Bulgarian': 'Bulgarian',
    'Serbian': 'Serbian',
    'Croatian': 'Croatian',
    'Slovenian': 'Slovenian',
    'Slovak': 'Slovak',
    'Ukrainian': 'Ukrainian',
    'Russian': 'Russian',
    'Belarusian': 'Belarusian',
    'Lithuanian': 'Lithuanian',
    'Latvian': 'Latvian',
    'Estonian': 'Estonian',
    'Finnish': 'Finnish',
    'Swedish': 'Swedish',
    'Norwegian': 'Norwegian',
    'Danish': 'Danish',
    'Icelandic': 'Icelandic',
    'Caribbean': 'Caribbean',
    'African': 'African',
    'Middle Eastern': 'Middle Eastern',
    'South American': 'South American',
    'Central American': 'Central American',
    'North American': 'North American',
    'European': 'European',
    'Asian': 'Asian',
    'Australian': 'Australian',
    'Pacific': 'Pacific',
    'Hawaiian': 'Hawaiian',
    'Cajun': 'Cajun',
    'Creole': 'Creole',
    'Soul Food': 'Soul Food',
    'Tex-Mex': 'Tex-Mex',
    'Fusion': 'Fusion'
  }
  
  return cuisineMap[cuisineType] || cuisineType
}
