# Google Maps Integration Setup

This application now includes Google Maps Places API integration for restaurant search and auto-filling form fields.

## Setup Instructions

### 1. Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - **Places API** - For restaurant search
   - **Geocoding API** - For address processing
   - **Maps JavaScript API** - For future map features

### 2. Create API Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy your API key

### 3. Configure Environment Variables

Create a `.env.local` file in your project root and add:

```bash
GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

### 4. Restrict API Key (Recommended)

1. In Google Cloud Console, go to your API key
2. Click "Edit" (pencil icon)
3. Under "Application restrictions", select "HTTP referrers (web sites)"
4. Add your domain(s):
   - `http://localhost:3000/*` (for development)
   - `https://yourdomain.com/*` (for production)
5. Under "API restrictions", select "Restrict key"
6. Select only the APIs you enabled above

## Features

### Restaurant Search
- Search restaurants by name or keywords
- Optional location filtering
- Real-time search results from Google Places API

### Auto-fill Form Fields
- Restaurant name
- Location/address
- Cuisine type (mapped to your database cuisine types)
- Additional details like rating, price level, website

### Cuisine Mapping
The system automatically maps Google Places cuisine types to your database cuisine types:
- `pizza` → `Italian`
- `sushi` → `Japanese`
- `chinese` → `Chinese`
- And many more...

## Usage

1. Click "Search Restaurant on Google Maps" button in the Add Visit form
2. Enter restaurant name or keywords
3. Optionally add a location
4. Select a restaurant from the search results
5. Form fields will be automatically filled
6. Continue with your visit entry

## Cost Considerations

- Google Places API has usage-based pricing
- Text Search: $0.017 per request
- Place Details: $0.017 per request
- Typical usage: 1-2 API calls per restaurant search
- Monitor usage in Google Cloud Console

## Troubleshooting

### "Google Maps API not configured" Error
- Check that `GOOGLE_MAPS_API_KEY` is set in `.env.local`
- Restart your development server after adding the environment variable

### "API key not valid" Error
- Verify your API key is correct
- Check that the required APIs are enabled
- Ensure API key restrictions allow your domain

### No Search Results
- Check that Places API is enabled
- Verify your search query is specific enough
- Try adding a location to narrow results

## Security Notes

- Never commit your API key to version control
- Use environment variables for sensitive configuration
- Restrict your API key to specific domains and APIs
- Monitor API usage for unexpected charges
