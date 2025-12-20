// Week 4 Complete Example: Complete App with Form
// This shows what your App.jsx should look like at the end of Week 4

import { useState } from 'react';
import AddLocationForm from './AddLocationForm';
import LocationList from './LocationList';
import './App.css';

function App() {
  const [locations, setLocations] = useState([
    {
      id: 1,
      name: "Central Park",
      address: "New York, NY",
      city: "New York",
      type: "park"
    }
  ]);

  const handleAddLocation = (locationData) => {
    const newLocation = {
      ...locationData,
      id: Date.now()
    };
    setLocations([...locations, newLocation]);
  };

  return (
    <div className="app">
      <h1>My Favorite Places</h1>
      <AddLocationForm onAddLocation={handleAddLocation} />
      <LocationList locations={locations} />
    </div>
  );
}

export default App;

