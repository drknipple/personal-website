function LocationCard({ name, type, address, phone, details}) {

    const getTypeColor = (type) => {
        if (type.toLowerCase() === 'shelter') return '#ff9800'; // Orange
        if (type.toLowerCase() === 'feeding program') return '#27ae60'; // Green
        if (type.toLowerCase() === 'other temporary/permanent housing') return '#e74c3c'; // Red
        if (type.toLowerCase() === 'services') return '#3498db'; // Blue
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
                borderRadius: '4px', 
                fontSize: '12px', 
                display: 'inline-block', 
                marginBottom: '10px' 
                }}>{type}</span>
            <p style={{ margin: '5px 0', color: '#666' }}>{address}</p>
            <p style={{ margin: '5px 0', color: '#666' }}>{phone}</p>
            <p style={{ marginTop: '10px', color: '#666' }}>{details}</p>
        </div>
    );
}

export default LocationCard;