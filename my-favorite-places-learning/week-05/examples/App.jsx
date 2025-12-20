// Week 5 Complete Example: App with Map Integration
// This shows what your App.jsx should look like at the end of Week 5

import { useState } from 'react';
import LocationMap from './LocationMap';
import LocationList from './LocationList';
import AddLocationForm from './AddLocationForm';
import './App.css';

function App() {
  const [locations, setLocations] = useState([
    {
      id: 1,
      name: "Central Park",
      address: "New York, NY",
      city: "New York",
      type: "park",
      latitude: 40.7829,
      longitude: -73.9654
    },
    {
      id: 2,
      name: "Local Library",
      address: "Main Street",
      city: "New York",
      type: "library",
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
      latitude: 40.7128, // Temporary - will be replaced with geocoding
      longitude: -74.0060 // Temporary
    };
    setLocations([...locations, newLocation]);
  };

  return (
    <div className="app">
      <h1>My Favorite Places</h1>
      <AddLocationForm onAddLocation={handleAddLocation} />
      <LocationMap locations={locations} />
      <LocationList locations={locations} />
    </div>
  );
}

export default App;

