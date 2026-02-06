import LocationCard from "./LocationCard";

function LocationList({ locations = [] }) {

    return (
        <div>
            <h2>Locations</h2>
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

export default LocationList;