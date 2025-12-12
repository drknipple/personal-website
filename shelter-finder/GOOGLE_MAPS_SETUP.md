# Google Maps Setup

To use Google Maps tiles instead of OpenStreetMap:

1. **Get a Google Maps API Key:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable the following APIs:
     - Maps JavaScript API
     - Maps Static API (optional, for static map images)
   - Go to "Credentials" → "Create Credentials" → "API Key"
   - Copy your API key

2. **Create a `.env` file** in the `shelter-finder` directory:
   ```
   VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
   ```

3. **Restart the development server:**
   ```bash
   npm run dev
   ```

4. **Important Notes:**
   - Google Maps API has usage limits and billing (though there's a free tier)
   - Make sure to restrict your API key in Google Cloud Console to prevent unauthorized use
   - The app will automatically use Google Maps tiles if the API key is present
   - Without the API key, it will fall back to OpenStreetMap tiles

## API Key Restrictions (Recommended)

In Google Cloud Console, restrict your API key:
- **Application restrictions**: HTTP referrers (for web apps)
- **API restrictions**: Restrict to "Maps JavaScript API" and "Maps Static API"

This helps prevent unauthorized usage of your API key.

