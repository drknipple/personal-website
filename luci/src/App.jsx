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
    phone: "(502) 589-01-0140",
    details: "serves hot meals to anyone who asks for one, no questions asked`",
    latitude: 38.243315,
    longitude: -85.748258
  },
  { 
    id: 2,
    name: "Arthur Street Hotel", 
    type: "shelter", 
    address: "1620 Arthur St", 
    phone: "(502) 636-3781",
    details: "idk",
    latitude: 38.2229832,
    longitude: -85.7523873
  },
  { 
    id: 3,
    name: "Goodwill Recource Center",
    type: "services", 
    address: "909 E Broadway", 
    phone: "(502) 316-7100",
    details: "idk",
    latitude: 38.245014,
    longitude: -85.736735
    },
  { 
    id: 4,
    name: "House of Ruth",
    type: "other temporary/permanent housing", 
    address: "607 E St Catherine St",
    phone: "(502) 587-5080",
    details: "idk",
    latitude: 38.235151,
    longitude: -85.745176
    },

    { 
    id: 5,
    name: "Hotel Louisville",
    type: "other temporary/permanent housing", 
    address: "120 W Broadway",
    phone: "+1 502-582-2241",
    details: "idk",
    latitude: 38.245117,
    longitude: -85.754379
    },

     { 
    id: 6,
    name: "Family Scholar House",
    type: "other temporary/permanent housing", 
    address: "403 Reg Smith Ciry",
    phone: "+1 502-584-8090",
    details: "idk",
    latitude: 38.223335,
    longitude: -85.763856
    },

  { 
    id: 7,
    name: "Coordinated Shelter Access",
    type: "Shelters", 
    address: "1300 S 4th St.#250",
    phone: "+1 502-636-9550",
    details: "idk",
    latitude: 38.232498,
    longitude: -85.761017
    },

    { 
    id: 8,
    name: "Salvation Army Center of Hope",
    type: "Shelters", 
    address: "911 S Brook St",
    phone: "+1 502-671-4900",
    details: "idk",
    latitude: 38.240417,
    longitude: -85.752054
    },

    { 
    id: 9,
    name: "Legal Aid Society",
    type: "Services", 
    address: "416 W Muhammad Ali Blvd,#300",
    phone: "+1 502-584-1254",
    details: "idk",
    latitude: 38.250977,
    longitude: -85.758598
    },

    
    { 
    id: 10,
    name: "YouthBuild Louisville",
    type: "Services", 
    address: "800 S Preston St",
    phone: "+1 502-290-6121",
    details: "idk",
    latitude: 38.242383,
    longitude: -85.5748259
    },

    { 
    id: 11,
    name: "Loaves and Fishes Inc",
    type: "Feeding Program", 
    address: "500 E Caldwell St",
    phone: "+1 502-718-5264",
    details: "idk",
    latitude: 38.238819,
    longitude: -85.746437
    },

     { 
    id: 12,
    name: "Wayside Christian Mission Kitchen",
    type: "Feeding Program", 
    address: "432 E Jefferson St",
    phone: "+1 502-584-3711",
    details: "idk",
    latitude: 38.252002,
    longitude: -85.745073
    },

]);

  return (
    <div style={{padding: '20px', maxWidth: "800px", margin: '0 auto'}}>
      <h2>Parachute</h2>
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

export default App
