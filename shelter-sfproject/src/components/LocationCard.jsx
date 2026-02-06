import { useState } from 'react'; //used to coppy location address to clipboard

function LocationCard({ name, type, address, phone, details}) {  //the props that are passed
    
  const [copied, setCopied] = useState(false); 
    const copyAddress = async () => {
        try {
            await navigator.clipboard.writeText(address);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy address:', err);
        }
    };
    
    const getTypeColor = (type) => {
        if (type === 'shelter') return '#ff9800'; // Orange
        if (type === 'feeding program') return '#27ae60'; // Green
        if (type === 'other temporary/permanent housing') return '#e74c3c'; // Red
        if (type === 'services') return '#3498db'; // Blue
        return '#3498db'; // Default blue
      };

    return (
        <div style={{
            background: 'white',
            color: '#333',
            padding: '15px',
            margin: '10px 0',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
            <h2 style={{ margin: '0 0 5px 0', color: '#333' }}>{name}</h2>
            <span style={{ 
                background: getTypeColor(type),
                color: 'white', 
                padding: '4px 8px', 
                borderRadius: '12px', 
                fontSize: '12px', 
                display: 'inline-block', 
                marginBottom: '10px' 
                }}>{type}</span>
            <p style={{ fontSize: '14px', margin: '2px 0', color: '#666' }}>{address}</p>
            <p style={{ fontSize: '14px', margin: '2px 0', color: '#666' }}>{phone}</p>
            <p style={{ marginTop: '15px', color: '#666' }}>{details}</p>
      <button 
        onClick={copyAddress}
        style={{
          padding: '8px 16px',
          background: copied ? '#27ae60' : '#3498db',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        {copied ? '✓ Copied!' : 'Copy Address'}
      </button>
        </div>
    );
}

export default LocationCard;