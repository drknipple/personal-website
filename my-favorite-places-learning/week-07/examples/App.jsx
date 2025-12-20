// Week 7 Complete Example: Full-Featured App
// This shows what your App.jsx should look like at the end of Week 7
// Includes: edit, delete, geolocation, and sharing

import { useState, useEffect } from 'react';
import LocationMap from './LocationMap';
import LocationList from './LocationList';
import AddLocationForm from './AddLocationForm';
import EditLocationForm from './EditLocationForm';
import { getLocations, saveLocation, deleteLocation, updateLocation } from './utils/locationStorage';
import { getUserLocation } from './utils/geolocation';
import './App.css';

function App() {
  const [locations, setLocations] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  // Load locations on mount
  useEffect(() => {
    setLocations(getLocations());
  }, []);

  const handleAddLocation = (locationData) => {
    const updated = saveLocation(locationData);
    setLocations(updated);
    setShowForm(false);
  };

  const handleEdit = (location) => {
    setEditingLocation(location);
    setShowForm(false);
  };

  const handleUpdateLocation = (updatedData) => {
    const updated = updateLocation(editingLocation.id, updatedData);
    setLocations(updated);
    setEditingLocation(null);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this location?')) {
      const updated = deleteLocation(id);
      setLocations(updated);
    }
  };

  const handleGetLocation = async () => {
    try {
      const coords = await getUserLocation();
      setUserLocation([coords.latitude, coords.longitude]);
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="app">
      <h1>My Favorite Places</h1>
      
      <div className="actions">
        <button onClick={handleGetLocation} className="location-button">
          Find My Location
        </button>
        <button 
          onClick={() => {
            setShowForm(true);
            setEditingLocation(null);
          }}
          className="add-button"
        >
          Add Location
        </button>
      </div>

      {showForm && (
        <AddLocationForm 
          onAddLocation={handleAddLocation}
          onCancel={() => setShowForm(false)}
        />
      )}

      {editingLocation && (
        <EditLocationForm
          location={editingLocation}
          onUpdate={handleUpdateLocation}
          onCancel={() => setEditingLocation(null)}
        />
      )}

      <LocationMap 
        locations={locations} 
        userLocation={userLocation}
      />
      
      <LocationList 
        locations={locations}
        userLocation={userLocation}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}

export default App;

