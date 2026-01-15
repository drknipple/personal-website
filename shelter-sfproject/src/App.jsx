import { useState } from 'react';
import LocationCard from './components/LocationCard';
import LocationMap from './components/LocationMap';

function App() {
  const [locations] = useState([
    { 
      id: 1,
      name: "Franciscan Kitchen", 
      type: "feeding program", 
      address: "748 S Preston St",
      phone: "(415) 555-1234",
      details: "A feeding program for the homeless",
      latitude: 38.243315,
      longitude: -85.748258
    },
    { 
      id: 2,
      name: "Arthur Street Hotel", 
      type: "shelter", 
      address: "1620 Arthur St",
      phone: "(415) 555-1234",
      details: "A shelter for the homeless",
      latitude: 38.223167,
      longitude: -85.751770
    },
    { 
      id: 3,
      name: "Goodwill Recource Center", 
      type: "services", 
      address: "909 E Broadway",
      phone: "(415) 555-1234",
      details: "A resource center for the homeless",
      latitude: 38.245014,
      longitude: -85.736735
    },
    { 
      id: 4,
      name: "House of Ruth", 
      type: "other temporary/permanent housing", 
      address: "607 E St Catherine St",
      phone: "(415) 555-1234",
      details: "A temporary/permanent housing for the homeless",
      latitude: 38.235151,
      longitude: -85.745176
    }
  ]);

  return (
    <div style={{ padding: '20px', margin: '0 auto', maxWidth: '800px' }}>
      <h2>Needs Based Services Finder</h2>
      <LocationMap locations={locations} />
      {locations.map((location) => (
        <LocationCard
          key={location.id}
          name={location.name}
          type={location.type}
          address={location.address}
          phone={location.phone}
          details={location.details}
        />
      ))}
    </div>
  );
}

export default App;