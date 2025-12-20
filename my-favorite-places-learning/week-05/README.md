# Week 5: Maps Integration

**Time**: 2-3 hours/day, 5 days

## Learning Goals

- Understand how maps work
- Install and use Leaflet
- Display a map in React
- Add markers to the map
- Make markers interactive

## Day 1-2: Leaflet & React-Leaflet

### What You'll Learn
- What maps are and how they work
- Installing Leaflet
- Basic map setup
- Displaying a map centered on a city

### What are Maps?

Maps show geographic locations using:
- **Coordinates**: Latitude and longitude (e.g., 40.7128, -74.0060 for NYC)
- **Tiles**: Image tiles that make up the map
- **Markers**: Icons that show specific locations

### Installing Leaflet

```bash
npm install leaflet react-leaflet
```

Also install the CSS:

```jsx
// In your main.jsx or App.jsx
import 'leaflet/dist/leaflet.css';
```

### Basic Map Setup

```jsx
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

function LocationMap() {
  return (
    <MapContainer
      center={[40.7128, -74.0060]} // New York City coordinates
      zoom={13}
      style={{ height: '400px', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
    </MapContainer>
  );
}
```

### Understanding Map Props

- `center`: [latitude, longitude] - where the map is centered
- `zoom`: number (0-18) - how zoomed in the map is
- `style`: CSS styles for the map container

### Practice: Create a LocationMap Component

Create a component that shows a map centered on your city:

```jsx
// src/components/LocationMap.jsx
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

function LocationMap() {
  // Change these to your city's coordinates!
  // You can find coordinates at: https://www.latlong.net/
  const cityCenter = [38.2527, -85.7585]; // Louisville, KY example

  return (
    <MapContainer
      center={cityCenter}
      zoom={13}
      style={{ height: '500px', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
    </MapContainer>
  );
}

export default LocationMap;
```

### Finding Coordinates

- Use [latlong.net](https://www.latlong.net/) to find coordinates
- Or search "coordinates of [city name]" on Google

### Exercises

1. Create a map component
2. Center it on your city
3. Try different zoom levels (5, 10, 15)
4. Add the map to your App component
5. Style the map container

### Resources
- [React-Leaflet Documentation](https://react-leaflet.js.org/)
- [Leaflet Documentation](https://leafletjs.com/)
- [OpenStreetMap](https://www.openstreetmap.org/)

## Day 3-5: Markers & Interactivity

### What You'll Learn
- Adding markers to the map
- Clicking markers to show popups
- Centering map on locations
- Making markers clickable

### Adding Markers

```jsx
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon (sometimes doesn't show)
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow
});

L.Marker.prototype.options.icon = DefaultIcon;

function LocationMap({ locations }) {
  return (
    <MapContainer
      center={[40.7128, -74.0060]}
      zoom={13}
      style={{ height: '500px', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      
      {locations.map(location => (
        <Marker
          key={location.id}
          position={[location.latitude, location.longitude]}
        >
          <Popup>
            <strong>{location.name}</strong>
            <br />
            {location.address}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
```

### Centering Map on First Location

```jsx
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';

// Component to handle map centering
function MapController({ center }) {
  const map = useMap();
  map.setView(center, 13);
  return null;
}

function LocationMap({ locations }) {
  // Use first location as center, or default city
  const mapCenter = locations.length > 0
    ? [locations[0].latitude, locations[0].longitude]
    : [40.7128, -74.0060];

  return (
    <MapContainer
      center={mapCenter}
      zoom={13}
      style={{ height: '500px', width: '100%' }}
    >
      <MapController center={mapCenter} />
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      
      {locations.map(location => (
        <Marker
          key={location.id}
          position={[location.latitude, location.longitude]}
        >
          <Popup>
            <strong>{location.name}</strong>
            <br />
            {location.address}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
```

### Complete Mini Project

Display locations from your list as markers on the map:

```jsx
// App.jsx
import { useState } from 'react';
import LocationMap from './components/LocationMap';
import LocationList from './components/LocationList';
import AddLocationForm from './components/AddLocationForm';

function App() {
  const [locations, setLocations] = useState([
    {
      id: 1,
      name: "Central Park",
      address: "New York, NY",
      latitude: 40.7829,
      longitude: -73.9654
    },
    {
      id: 2,
      name: "Local Library",
      address: "Main Street",
      latitude: 40.7589,
      longitude: -73.9851
    }
  ]);

  const handleAddLocation = (locationData) => {
    // For now, use hardcoded coordinates
    // Next week we'll get real coordinates from addresses!
    const newLocation = {
      ...locationData,
      id: Date.now(),
      latitude: 40.7128, // Temporary
      longitude: -74.0060 // Temporary
    };
    setLocations([...locations, newLocation]);
  };

  return (
    <div>
      <h1>My Favorite Places</h1>
      <AddLocationForm onAddLocation={handleAddLocation} />
      <LocationMap locations={locations} />
      <LocationList locations={locations} />
    </div>
  );
}
```

### Exercises

1. Add markers for all your locations
2. Make markers show location name in popup
3. Add more info to popups (address, type)
4. Center map on first location when it loads
5. Style the map and markers

### Troubleshooting

**Markers not showing?**
- Make sure you imported the CSS: `import 'leaflet/dist/leaflet.css';`
- Check that coordinates are valid (latitude: -90 to 90, longitude: -180 to 180)
- Try the icon fix shown above

**Map not rendering?**
- Make sure the container has a defined height
- Check browser console for errors
- Verify Leaflet is installed: `npm list leaflet react-leaflet`

### Resources
- [React-Leaflet Examples](https://react-leaflet.js.org/docs/start-example/)
- [Leaflet Marker Documentation](https://leafletjs.com/reference.html#marker)

### Complete Example

See `examples/` folder for complete examples:
- `LocationMap.jsx` - Complete map component with markers and popups
- `App.jsx` - App integrating map with location list

## Deliverable

By the end of Week 5, you should have:
- ✅ A map displaying in your app
- ✅ Markers showing all your locations
- ✅ Clickable markers with popups
- ✅ Map centered on your locations
- ✅ Map integrated with your location list

## Next Week

Next week, you'll learn to save data and automatically find coordinates from addresses!

