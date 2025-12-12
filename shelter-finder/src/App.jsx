import { useState, useEffect } from 'react';
import { FaMapMarkerAlt, FaHome, FaHandsHelping, FaUtensils, FaBuilding, FaMap, FaList, FaShare, FaEdit, FaPhone, FaClock, FaRuler } from 'react-icons/fa';
import { FaLocationArrow } from 'react-icons/fa6';

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
import LocationMap from './components/LocationMap';
import LocationForm from './components/LocationForm';
import LocationList from './components/LocationList';
import ShareLink from './components/ShareLink';
import { getLocations, saveLocation, deleteLocation, calculateDistance, updateLocation } from './utils/locationStorage';
import './App.css';

function App() {
  const [locations, setLocations] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [filterType, setFilterType] = useState(null);
  const [showShareLink, setShowShareLink] = useState(false);
  const [viewMode, setViewMode] = useState('map'); // 'map' or 'list'
  const [showListSheet, setShowListSheet] = useState(false);

  // Load locations and get user location on mount
  useEffect(() => {
    setLocations(getLocations());
    
    // Auto-get user location on mobile (with better error handling)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          // Don't show error on initial load - user can manually request location
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    }
    
    // Check for shared location in URL params
    const params = new URLSearchParams(window.location.search);
    if (params.has('id') || params.has('lat')) {
      const sharedId = params.get('id');
      const sharedLat = params.get('lat');
      const sharedLng = params.get('lng');
      
      // Try to find location by ID first (if recipient has it saved)
      if (sharedId) {
        const location = getLocations().find(loc => loc.id === sharedId);
        if (location) {
          setSelectedLocation(location);
        } else if (sharedLat && sharedLng) {
          // Fallback: location not found locally, create from shared coordinates
          setSelectedLocation({
            id: 'shared',
            name: params.get('name') || 'Shared Location',
            type: params.get('type') || 'shelter',
            latitude: parseFloat(sharedLat),
            longitude: parseFloat(sharedLng),
            address: params.get('address') || '',
            phone: params.get('phone') || '',
            hours: params.get('hours') || '',
          });
        }
      } else if (sharedLat && sharedLng) {
        // Only coordinates provided (no ID)
        setSelectedLocation({
          id: 'shared',
          name: params.get('name') || 'Shared Location',
          type: params.get('type') || 'shelter',
          latitude: parseFloat(sharedLat),
          longitude: parseFloat(sharedLng),
          address: params.get('address') || '',
          phone: params.get('phone') || '',
          hours: params.get('hours') || '',
        });
      }
    }
  }, []);

  // Get user's current location
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser. Please use a modern browser.');
      return;
    }

    // Check if we're on HTTPS (required for iOS Safari)
    const isHTTPS = window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    
    if (!isHTTPS && isIOS) {
      alert('Geolocation requires HTTPS on iPhone Safari.\n\nPlease access this site using https:// instead of http://\n\nCurrent URL: ' + window.location.href);
      return;
    }

    // Show loading state
    const button = document.querySelector('.fab-location');
    if (button) {
      button.style.opacity = '0.6';
      button.disabled = true;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation([position.coords.latitude, position.coords.longitude]);
        if (button) {
          button.style.opacity = '1';
          button.disabled = false;
        }
      },
      (error) => {
        if (button) {
          button.style.opacity = '1';
          button.disabled = false;
        }
        
        let errorMessage = 'Unable to get your location.\n\n';
        switch(error.code) {
          case error.PERMISSION_DENIED:
            if (isIOS) {
              errorMessage += 'Location access was denied.\n\n';
              errorMessage += 'To fix this on iPhone:\n';
              errorMessage += '1. Go to Settings → Safari → Location Services\n';
              errorMessage += '2. Make sure Location Services is ON\n';
              errorMessage += '3. Make sure "Ask" or "Allow" is selected\n';
              errorMessage += '4. Return to Safari and try again\n\n';
              if (!isHTTPS) {
                errorMessage += '⚠️ IMPORTANT: This site must be accessed over HTTPS for geolocation to work on iPhone.\n';
                errorMessage += 'Current URL: ' + window.location.href + '\n';
                errorMessage += 'Try: ' + window.location.href.replace('http://', 'https://');
              }
            } else {
              errorMessage += 'Location access was denied. Please allow location access in your browser settings.';
            }
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += 'Location information is unavailable. Your device may not be able to determine your location.';
            break;
          case error.TIMEOUT:
            errorMessage += 'Location request timed out. Please try again.';
            break;
          default:
            errorMessage += 'An unknown error occurred: ' + error.message;
            break;
        }
        
        alert(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0
      }
    );
  };

  const handleSaveLocation = (locationData) => {
    if (editingLocation) {
      // Use updateLocation to fetch fresh data from localStorage and update
      const updated = updateLocation(editingLocation.id, locationData);
      setLocations(updated);
    } else {
      // Use saveLocation which reads fresh from localStorage, then sync state with fresh data
      saveLocation(locationData);
      const freshLocations = getLocations();
      setLocations(freshLocations);
    }
    setShowForm(false);
    setEditingLocation(null);
  };

  const handleDeleteLocation = (id) => {
    const updated = deleteLocation(id);
    setLocations(updated);
    if (selectedLocation?.id === id) {
      setSelectedLocation(null);
    }
  };

  const handleEditLocation = (location) => {
    setEditingLocation(location);
    setShowForm(true);
    setSelectedLocation(null);
  };

  const handleNewLocation = () => {
    setEditingLocation(null);
    setShowForm(true);
    setSelectedLocation(null);
  };

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    setShowShareLink(false);
    setShowListSheet(false);
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    if (mode === 'list') {
      setShowListSheet(true);
    } else {
      setShowListSheet(false);
    }
  };

  return (
    <div className="app mobile-first">
      {/* Main content area - Map is primary */}
      <div className="main-content">
        {/* Map is always visible behind sheets */}
        <div className="map-container-full">
          <LocationMap
            locations={locations}
            selectedLocation={selectedLocation}
            onLocationSelect={handleLocationSelect}
            userLocation={userLocation}
          />
          
          {/* Location details bottom sheet */}
          {selectedLocation && (
            <div className="location-details-sheet">
              <div className="sheet-handle"></div>
              <button
                onClick={() => setSelectedLocation(null)}
                className="close-button"
                aria-label="Close"
              >
                ×
              </button>
              <h3>{selectedLocation.name}</h3>
              <p className="location-type-badge">
                {(() => {
                  const typeInfo = getTypeInfo(selectedLocation.type);
                  const Icon = typeInfo.icon;
                  return <><Icon /> {typeInfo.label}</>;
                })()}
              </p>
              {selectedLocation.address && (
                <p className="location-info">
                  <FaMapMarkerAlt /> {selectedLocation.address}
                </p>
              )}
              {selectedLocation.phone && (
                <p className="location-info">
                  <FaPhone /> <a href={`tel:${selectedLocation.phone}`}>{selectedLocation.phone}</a>
                </p>
              )}
              {selectedLocation.hours && (
                <p className="location-info">
                  <FaClock /> {selectedLocation.hours}
                </p>
              )}
              {selectedLocation.notes && (
                <p className="location-info">{selectedLocation.notes}</p>
              )}
              {userLocation && (
                <p className="location-distance">
                  <FaRuler /> {calculateDistance(
                    userLocation[0], userLocation[1],
                    selectedLocation.latitude, selectedLocation.longitude
                  ).toFixed(1)} km away
                </p>
              )}
              <div className="location-actions">
                <button
                  onClick={() => setShowShareLink(true)}
                  className="btn-primary"
                >
                  <FaShare /> Share
                </button>
                {selectedLocation.id && selectedLocation.id !== 'shared' && (
                  <button
                    onClick={() => handleEditLocation(selectedLocation)}
                    className="btn-secondary"
                  >
                    <FaEdit /> Edit
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* List view as bottom sheet */}
        {showListSheet && (
          <div className="list-sheet">
            <div className="sheet-handle"></div>
            <div className="list-sheet-header">
              <h2>Locations ({locations.length})</h2>
              <button
                onClick={() => {
                  setShowListSheet(false);
                  setViewMode('map');
                }}
                className="close-button"
                aria-label="Close list"
              >
                ×
              </button>
            </div>
            <LocationList
              locations={locations}
              onLocationSelect={handleLocationSelect}
              onDelete={handleDeleteLocation}
              userLocation={userLocation}
              filterType={filterType}
              onFilterChange={setFilterType}
            />
          </div>
        )}
      </div>

      {/* Floating Geolocation Button */}
      <button 
        onClick={handleGetLocation} 
        className="fab-location"
        aria-label="Find my location"
        title={userLocation ? "Location found" : "Tap to find your location"}
      >
        <FaLocationArrow />
        {userLocation && <span className="location-indicator"></span>}
      </button>

      {/* Floating Action Button for Add Location */}
      <button 
        onClick={handleNewLocation}
        className="fab"
        aria-label="Add location"
      >
        +
      </button>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <button
          onClick={() => handleViewModeChange('map')}
          className={`nav-button ${viewMode === 'map' ? 'active' : ''}`}
        >
          <span className="nav-icon"><FaMap /></span>
          <span className="nav-label">Map</span>
        </button>
        <button
          onClick={() => handleViewModeChange('list')}
          className={`nav-button ${viewMode === 'list' ? 'active' : ''}`}
        >
          <span className="nav-icon"><FaList /></span>
          <span className="nav-label">List</span>
        </button>
      </nav>

      {/* Modals */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <LocationForm
              onSave={handleSaveLocation}
              onCancel={() => {
                setShowForm(false);
                setEditingLocation(null);
              }}
              initialData={editingLocation}
            />
          </div>
        </div>
      )}

      {showShareLink && selectedLocation && (
        <div className="modal-overlay" onClick={() => setShowShareLink(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <ShareLink location={selectedLocation} />
            <button 
              onClick={() => setShowShareLink(false)}
              className="btn-secondary"
              style={{ marginTop: '1rem', width: '100%' }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
