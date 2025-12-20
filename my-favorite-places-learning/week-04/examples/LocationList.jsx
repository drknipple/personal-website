// Week 4 Complete Example: Location List Component

function LocationList({ locations }) {
  if (locations.length === 0) {
    return <p>No locations yet. Add one above!</p>;
  }

  return (
    <div className="locations-list">
      <h2>My Locations ({locations.length})</h2>
      {locations.map(location => (
        <div key={location.id} className="location-card">
          <h3>{location.name}</h3>
          <p className="type">{location.type}</p>
          <p className="address">{location.address}</p>
          {location.city && <p className="city">{location.city}</p>}
        </div>
      ))}
    </div>
  );
}

export default LocationList;

