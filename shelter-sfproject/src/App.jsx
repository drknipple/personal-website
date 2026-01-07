import LocationCard from './components/LocationCard';

function App() {
  const places = [
    { 
      name: "Franciscan Kitchen", 
      type: "feeding program", 
      address: "748 S Preston St",
      phone: "(415) 555-1234",
      details: "A feeding program for the homeless"
    },
    { 
      name: "Arthr Street Hotel", 
      type: "shelter", 
      address: "1620 Arthur St",
      phone: "(415) 555-1234",
      details: "A shelter for the homeless"
    },
    { 
      name: "Goodwill Recource Center", 
      type: "services", 
      address: "909 E Broadwat",
      phone: "(415) 555-1234",
      details: "A resource center for the homeless"
    },
    { 
      name: "House of Ruth", 
      type: "other temporary/permanent housing", 
      address: "607 E St Catherine St",
      phone: "(415) 555-1234",
      details: "A temporary/permanent housing for the homeless"
    }
  ];

  return (
    <div>
      <h1>Needs Based Services Finder</h1>
      {places.map((place, i) => (
        <LocationCard
          key={i}
          name={place.name}
          type={place.type}
          address={place.address}
          phone={place.phone}
          details={place.details}
        />
      ))}
    </div>
  );
}

export default App;