import { useState } from 'react';
import LocationList from './components/LocationList';
import LocationMap from './components/LocationMap';

function App() {
  const [activeView, setActiveView] = useState('map');
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
    <div style={{ 
      padding: 0, 
      margin: 0, 
      maxWidth: '100%',
      minHeight: '100vh',
      position: 'relative'
    }}>
      <h1 style={{
        textAlign: 'center',
        color: '#333',
        padding: '20px',
        margin: 0,
        background: 'white',
        borderBottom: '1px solid #e5e7eb'
      }}>Needs Based Services Finder</h1>
      {activeView === 'map' ? (
      <LocationMap 
          locations={locations} 
      />
      ) : (
      <LocationList locations={locations} />
      )}
      {}
      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'white',
        borderTop: '1px solid #e5e7eb',
        display: 'flex',
        justifyContent: 'space-around',
        padding: '10px 0',
        paddingBottom: 'calc(10px + env(safe-area-inset-bottom))',
        zIndex: 1000,
        boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.05)'
      }}>
        
           <button 
           onClick={() => setActiveView('map')}
           style={{
            flex: 1,
            background: activeView === 'map' ? '#f3f4f6' : 'transparent',
            border: 'none',
            padding: '10px',
            cursor: 'pointer',
            color: activeView === 'map' ? '#667eea' : '#6b7280',
            fontWeight: activeView === 'map' ? 'bold' : 'normal',
            fontSize: '16px',
            transition: 'all 0.2s'
           }}
           >Map</button>
           <button 
           onClick={() => setActiveView('list')}
           style={{
            flex: 1,
            background: activeView === 'list' ? '#f3f4f6' : 'transparent',
            border: 'none',
            padding: '10px',
            cursor: 'pointer',
            color: activeView === 'list' ? '#667eea' : '#6b7280',
            fontWeight: activeView === 'list' ? 'bold' : 'normal',
            fontSize: '16px',
            transition: 'all 0.2s'
           }}
           >List</button>
      </nav>
    </div>
  );
}

export default App;