# Resource Finder

A mobile-first web application to help identify and locate resources for people in need. Users can add new locations, view them on an interactive map, find the nearest location, and share location information via shareable links.

## Features

- 🗺️ **Interactive Map**: View all resources on an interactive map powered by Google Maps or OpenStreetMap
- ➕ **Add Locations**: Create new locations with address, phone, hours, and other details (coordinates are automatically found)
- 📍 **Find Nearest**: Use your current location to find the nearest resource
- 🔗 **Shareable Links**: Generate links that can be pasted in other apps to share location information
- 🔍 **Filter & Sort**: Filter by type (shelter, service, feeding program, housing) and sort by name or distance
- 💾 **Local Storage**: All data is stored locally in your browser
- 📱 **Mobile-First Design**: Optimized for mobile devices with touch-friendly interface

## Location Types

The app supports four types of resources, each with a distinct color:

- **Shelter** (Blue) - Emergency shelters and temporary housing
- **Service** (Yellow) - Support services and assistance programs
- **Feeding Program** (Green) - Food banks, soup kitchens, and meal programs
- **Temporary/Permanent Housing** (Red) - Housing assistance and permanent housing options

## Getting Started

### Installation

1. Navigate to the shelter-finder directory:
```bash
cd shelter-finder
```

2. Install dependencies:
```bash
npm install
```

3. (Optional) Set up Google Maps API key:
   - Create a `.env` file in the `shelter-finder` directory
   - Add: `VITE_GOOGLE_MAPS_API_KEY=your_api_key_here`
   - See [GOOGLE_MAPS_SETUP.md](./GOOGLE_MAPS_SETUP.md) for detailed instructions
   - If no API key is provided, the app will use OpenStreetMap tiles

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to the URL shown in the terminal (usually `http://localhost:5173`)

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Usage

### Adding a Location

1. Click the "+" floating action button (bottom right)
2. Fill in the location details:
   - **Name** (required): The name of the resource
   - **Type** (required): Select from Shelter, Service, Feeding Program, or Housing
   - **Address** (required): Street address
   - **City** (required): City name
   - **State**: State abbreviation (optional)
   - **ZIP Code**: ZIP code (optional)
   - **Phone**: Contact phone number (optional)
   - **Hours**: Operating hours (optional)
   - **Notes**: Any additional information (optional)
3. Click "Add Location" - the app will automatically find the coordinates from the address
4. The location will appear on the map immediately

**Note**: You never need to enter coordinates manually. The app automatically geocodes addresses when you submit the form.

### Finding Your Location

1. Click the location button (📍) in the header
2. Allow location access when prompted
3. The app will automatically center the map on your location
4. You can see distances to nearby resources

### Viewing Locations

- **Map View**: Tap the "Map" tab at the bottom to see all locations on the map
- **List View**: Tap the "List" tab to see locations in a list format
- **Filter**: Use the filter dropdown in list view to filter by type
- **Sort**: Sort locations by name or distance (when your location is available)

### Selecting a Location

- **On Map**: Tap any marker on the map to see location details
- **In List**: Tap any location card to view it on the map
- Location details will appear in a bottom sheet with:
  - Name and type
  - Address and contact information
  - Distance from your location (if available)
  - Options to share or edit

### Sharing a Location

1. Select a location (tap marker or list item)
2. Click the "Share" button in the location details
3. Copy the generated link or use the SMS/Email share buttons
4. The link can be pasted in any app and will open the location on the map

### Editing a Location

1. Select a location to view its details
2. Click the "Edit" button
3. Make your changes
4. Click "Update Location" - if the address changed, coordinates will be automatically updated

## Technical Details

### Technologies Used

- **React 18**: UI framework
- **Vite**: Build tool and dev server
- **Leaflet**: Interactive maps
- **React-Leaflet**: React bindings for Leaflet
- **React-Icons**: Icon library (Font Awesome)
- **Google Maps** or **OpenStreetMap**: Map tiles
- **Nominatim**: Geocoding service for address-to-coordinates conversion

### Data Storage

All location data is stored in the browser's `localStorage`. This means:
- Data persists between sessions
- Data is specific to each browser/device
- No backend server required
- No data is sent to external servers (except for geocoding and map tiles)

### Geocoding

The app uses OpenStreetMap's Nominatim service for geocoding addresses. This is a free service but has usage limits. For production use, consider:
- Implementing rate limiting
- Using a commercial geocoding service (like Google Geocoding API)
- Caching geocoding results

### Map Tiles

The app supports two map tile providers:
- **Google Maps**: Requires an API key (see GOOGLE_MAPS_SETUP.md)
- **OpenStreetMap**: Free, no API key required (default fallback)

### Mobile-First Design

The app is designed mobile-first with:
- Full-screen map as the primary view
- Bottom navigation for easy thumb access
- Touch-friendly buttons (minimum 44px)
- Slide-up sheets for details and lists
- Automatic location detection on load
- Responsive layout that works on all screen sizes

## Browser Support

- Modern browsers with ES6+ support
- Geolocation API support for "Find My Location" feature
- LocalStorage support for data persistence
- Works best on mobile devices (iOS Safari, Android Chrome)

## License

This project is open source and available for use.

## Contributing

Feel free to submit issues, fork the repository, and create pull requests for any improvements.
