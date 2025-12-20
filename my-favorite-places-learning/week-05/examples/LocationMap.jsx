// Week 5 Complete Example: Maps Integration
// Make sure you've installed: npm install leaflet react-leaflet
// And imported CSS in main.jsx: import 'leaflet/dist/leaflet.css'

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Component to center map on first location
function MapController({ center }) {
  const map = useMap();
  map.setView(center, 13);
  return null;
}

function LocationMap({ locations }) {
  // Use first location as center, or default city
  const mapCenter = locations.length > 0
    ? [locations[0].latitude, locations[0].longitude]
    : [40.7128, -74.0060]; // Default: New York City

  return (
    <div style={{ height: '500px', width: '100%', marginBottom: '20px' }}>
      <MapContainer
        center={mapCenter}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
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
              <div>
                <strong>{location.name}</strong>
                <br />
                {location.address}
                {location.city && <><br />{location.city}</>}
                <br />
                <small>{location.type}</small>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default LocationMap;

