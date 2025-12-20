// Week 3 Complete Example: React Components & State
// This shows what your app should look like at the end of Week 3

import { useState } from 'react';
import './App.css';

// LocationCard component using props
function LocationCard({ name, address, type, showDetails, onToggleDetails }) {
  return (
    <div className="location-card">
      <h3>{name}</h3>
      <p className="type">{type}</p>
      <button onClick={onToggleDetails}>
        {showDetails ? 'Hide' : 'Show'} Details
      </button>
      {showDetails && (
        <div className="details">
          <p><strong>Address:</strong> {address}</p>
          <p>This is a great place to visit!</p>
        </div>
      )}
    </div>
  );
}

// Main App component using state
function App() {
  const [locations, setLocations] = useState([
    { 
      id: 1, 
      name: "Central Park", 
      address: "New York, NY", 
      type: "Park",
      showDetails: false 
    },
    { 
      id: 2, 
      name: "Local Library", 
      address: "Main Street", 
      type: "Library",
      showDetails: false 
    },
    { 
      id: 3, 
      name: "Favorite Cafe", 
      address: "Oak Avenue", 
      type: "Restaurant",
      showDetails: false 
    }
  ]);

  const toggleDetails = (id) => {
    setLocations(locations.map(loc => 
      loc.id === id 
        ? { ...loc, showDetails: !loc.showDetails }
        : loc
    ));
  };

  const addLocation = () => {
    const newLocation = {
      id: locations.length + 1,
      name: "New Place",
      address: "New Address",
      type: "Other",
      showDetails: false
    };
    setLocations([...locations, newLocation]);
  };

  return (
    <div className="app">
      <h1>My Favorite Places</h1>
      <button onClick={addLocation} className="add-button">
        Add New Location
      </button>
      <div className="locations-list">
        {locations.map(location => (
          <LocationCard
            key={location.id}
            name={location.name}
            address={location.address}
            type={location.type}
            showDetails={location.showDetails}
            onToggleDetails={() => toggleDetails(location.id)}
          />
        ))}
      </div>
    </div>
  );
}

export default App;

