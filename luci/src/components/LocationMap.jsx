import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow
});

L.Marker.prototype.options.icon = DefaultIcon;
//add a marker for the start place thingie//
//color code location markers to certain types//

  const centerIcon = L.divIcon({
  className: 'custom-center-marker',
  html: '<div style="background-color:red; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0,3);"></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

function LocationMap({ locations = [],
  center = [38.226071, -85.697950] }) {  
  return (
    <MapContainer 
      center={center} 
      zoom={12} 
      scrollWheelZoom={true}
      style={{width: '100vw', height: '400px'}}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      /> 

      <Marker position={center} icon={centerIcon}>
        <Popup>
          <p>Saint Francis of Assisi</p>
        </Popup>
      </Marker>

      {locations.map(location => (
        <Marker
          key={location.id}
          position={[location.latitude, location.longitude]}
        >
        <Popup>
          <strong>{location.name}</strong>
          <br />
          {location.address}
          <br />
          {location.phone}
        </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
 
export default LocationMap;