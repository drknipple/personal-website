import LocationCard from './components/LocationCard';

function App() {
  const places = [
    { name: "Franciscan Kitchen", type: "feeding program", address: "748 S Preston St"},
    { name: "Arthr Street Hotel", type: "shelter", address: "1620 Arthur St"},
    { name: "Goodwill Recource Center", type: "services", address: "909 E Broadwat"},
    { name: "House of Ruth", type: "other temporary/permanent housing", address: "607 E St Catherine St"}
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
        />
      ))}
    </div>
  );
}

export default App;