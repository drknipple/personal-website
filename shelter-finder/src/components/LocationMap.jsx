import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { FaHome, FaHandsHelping, FaUtensils, FaBuilding } from 'react-icons/fa';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Helper function to get type display info
const getTypeInfo = (type) => {
  const types = {
    'shelter': { label: 'Shelter', icon: FaHome, color: '#2563eb' }, // Blue
    'service': { label: 'Service', icon: FaHandsHelping, color: '#eab308' }, // Yellow
    'feeding-program': { label: 'Feeding Program', icon: FaUtensils, color: '#16a34a' }, // Green
    'housing': { label: 'Temporary/Permanent Housing', icon: FaBuilding, color: '#dc2626' }, // Red
  };
  return types[type] || types['shelter'];
};

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to handle map view updates
function MapViewUpdater({ center, zoom }) {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, zoom || map.getZoom());
    }
  }, [center, zoom, map]);
  
  return null;
}

export default function LocationMap({ locations, selectedLocation, onLocationSelect, userLocation }) {
  const mapRef = useRef(null);

  // Create custom icons for different location types
  const createIcon = (type) => {
    const typeInfo = getTypeInfo(type);
    return L.divIcon({
      className: 'custom-marker',
      html: `<div style="
        background-color: ${typeInfo.color};
        width: 30px;
        height: 30px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      "></div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 30],
    });
  };

  // Default center - prioritize user location, then selected location, then default
  const defaultCenter = [40.7128, -74.0060]; // New York City
  const center = userLocation 
    ? userLocation 
    : selectedLocation 
      ? [selectedLocation.latitude, selectedLocation.longitude]
      : defaultCenter;
  
  // Zoom level - closer if user location or selected location, further if default
  const zoomLevel = userLocation 
    ? 13 
    : selectedLocation 
      ? 15 
      : 10;

  // Update map size on mount and when container resizes
  useEffect(() => {
    const updateMapSize = () => {
      if (mapRef.current) {
        setTimeout(() => {
          const map = mapRef.current;
          if (map) {
            map.invalidateSize();
          }
        }, 100);
      }
    };
    
    updateMapSize();
    window.addEventListener('resize', updateMapSize);
    return () => window.removeEventListener('resize', updateMapSize);
  }, []);

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
      <MapContainer
        center={center}
        zoom={zoomLevel}
        style={{ height: '100%', width: '100%', zIndex: 0 }}
        ref={mapRef}
        touchZoom={true}
        doubleClickZoom={true}
        scrollWheelZoom={true}
        dragging={true}
        zoomControl={true}
      >
        {/* Google Maps tiles - requires API key in .env file as VITE_GOOGLE_MAPS_API_KEY */}
        {import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? (
          <TileLayer
            attribution='&copy; <a href="https://www.google.com/maps">Google Maps</a>'
            url={`https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`}
            maxZoom={20}
            subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
          />
        ) : (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        )}
        <MapViewUpdater center={center} zoom={zoomLevel} />
        
        {/* User location marker */}
        {userLocation && (
          <Marker
            position={[userLocation[0], userLocation[1]]}
            icon={L.divIcon({
              className: 'user-marker',
              html: `<div style="
                background-color: #ef4444;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                border: 3px solid white;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
              "></div>`,
              iconSize: [20, 20],
              iconAnchor: [10, 10],
            })}
          >
            <Popup>Your Location</Popup>
          </Marker>
        )}

        {/* Location markers */}
        {locations.map((location) => (
          <Marker
            key={location.id}
            position={[location.latitude, location.longitude]}
            icon={createIcon(location.type)}
            eventHandlers={{
              click: () => onLocationSelect && onLocationSelect(location),
            }}
          >
            <Popup>
              <div style={{ minWidth: '200px' }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 'bold' }}>
                  {location.name}
                </h3>
                <p style={{ margin: '4px 0', fontSize: '14px', color: '#666', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {(() => {
                    const typeInfo = getTypeInfo(location.type);
                    const Icon = typeInfo.icon;
                    return <><Icon /> {typeInfo.label}</>;
                  })()}
                </p>
                {location.address && (
                  <p style={{ margin: '4px 0', fontSize: '12px' }}>{location.address}</p>
                )}
                {location.phone && (
                  <p style={{ margin: '4px 0', fontSize: '12px' }}>
                    <a href={`tel:${location.phone}`}>{location.phone}</a>
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

