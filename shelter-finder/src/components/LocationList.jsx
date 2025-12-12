import { useState } from 'react';
import { FaHome, FaHandsHelping, FaUtensils, FaBuilding, FaMapMarkerAlt, FaPhone, FaClock, FaRuler } from 'react-icons/fa';
import { calculateDistance } from '../utils/locationStorage';

// Helper function to get type display info
const getTypeInfo = (type) => {
  const types = {
    'shelter': { label: 'Shelter', icon: FaHome },
    'service': { label: 'Service', icon: FaHandsHelping },
    'feeding-program': { label: 'Feeding Program', icon: FaUtensils },
    'housing': { label: 'Temporary/Permanent Housing', icon: FaBuilding },
  };
  return types[type] || types['shelter'];
};

export default function LocationList({ 
  locations, 
  onLocationSelect, 
  onDelete, 
  userLocation,
  filterType,
  onFilterChange 
}) {
  const [sortBy, setSortBy] = useState('name');

  // Filter locations by type
  const filteredLocations = filterType 
    ? locations.filter(loc => loc.type === filterType)
    : locations;

  // Sort locations
  const sortedLocations = [...filteredLocations].sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    } else if (sortBy === 'distance' && userLocation) {
      const distA = calculateDistance(
        userLocation[0], userLocation[1],
        a.latitude, a.longitude
      );
      const distB = calculateDistance(
        userLocation[0], userLocation[1],
        b.latitude, b.longitude
      );
      return distA - distB;
    }
    return 0;
  });

  const getDistance = (location) => {
    if (!userLocation) return null;
    const distance = calculateDistance(
      userLocation[0], userLocation[1],
      location.latitude, location.longitude
    );
    return distance.toFixed(1);
  };

  return (
    <div className="location-list">
      <div className="list-header">
        <h2>Locations ({filteredLocations.length})</h2>
        <div className="list-controls">
          <select 
            value={filterType || 'all'} 
            onChange={(e) => onFilterChange(e.target.value === 'all' ? null : e.target.value)}
            className="filter-select"
          >
            <option value="all">All Types</option>
            <option value="shelter">Shelters</option>
            <option value="service">Services</option>
            <option value="feeding-program">Feeding Programs</option>
            <option value="housing">Housing</option>
          </select>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="name">Sort by Name</option>
            {userLocation && <option value="distance">Sort by Distance</option>}
          </select>
        </div>
      </div>

      <div className="locations-container">
        {sortedLocations.length === 0 ? (
          <div className="empty-state">
            <p>No locations found. Add one to get started!</p>
          </div>
        ) : (
          sortedLocations.map((location) => (
            <div 
              key={location.id} 
              className="location-card"
              onClick={() => onLocationSelect(location)}
            >
              <div className="location-card-header">
                <h3>{location.name}</h3>
                <span className={`location-type ${location.type}`}>
                  {(() => {
                    const typeInfo = getTypeInfo(location.type);
                    const Icon = typeInfo.icon;
                    return <><Icon /> {typeInfo.label}</>;
                  })()}
                </span>
              </div>
              
              {location.address && (
                <p className="location-address">
                  <FaMapMarkerAlt /> {location.address}
                  {location.city && `, ${location.city}`}
                  {location.state && `, ${location.state}`}
                </p>
              )}
              
              {location.phone && (
                <p className="location-phone">
                  <FaPhone /> <a href={`tel:${location.phone}`}>{location.phone}</a>
                </p>
              )}
              
              {location.hours && (
                <p className="location-hours">
                  <FaClock /> {location.hours}
                </p>
              )}

              {userLocation && (
                <p className="location-distance">
                  <FaRuler /> {getDistance(location)} km away
                </p>
              )}

              {location.notes && (
                <p className="location-notes">{location.notes}</p>
              )}

              <div className="location-card-actions">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onLocationSelect(location);
                  }}
                  className="btn-small btn-primary"
                >
                  View on Map
                </button>
                {onDelete && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm('Are you sure you want to delete this location?')) {
                        onDelete(location.id);
                      }
                    }}
                    className="btn-small btn-danger"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}


