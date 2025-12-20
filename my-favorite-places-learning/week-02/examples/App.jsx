// Week 2 Complete Example: Modern JavaScript & React Setup
// This shows what your App.jsx should look like at the end of Week 2

function App() {
  // Using modern JavaScript: arrow functions, template literals, array methods
  const places = [
    { name: "Central Park", type: "Park", address: "New York, NY" },
    { name: "Local Library", type: "Library", address: "Main Street" },
    { name: "Favorite Cafe", type: "Restaurant", address: "Oak Avenue" }
  ];

  // Using array.map() instead of for loops
  const placeNames = places.map(place => place.name);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>My Favorite Places</h1>
      <p>Total places: {places.length}</p>
      
      <ul>
        {places.map((place, index) => (
          <li key={index}>
            <strong>{place.name}</strong> - {place.type} ({place.address})
          </li>
        ))}
      </ul>

      <div style={{ marginTop: '20px' }}>
        <h2>Place Names Only:</h2>
        <p>{placeNames.join(', ')}</p>
      </div>
    </div>
  );
}

export default App;

