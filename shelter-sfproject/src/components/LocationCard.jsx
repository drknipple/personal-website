function LocationCard({ name, type, address}) {
    return (
        <div style={{
            background: 'white',
            color: '#333',
            padding: '20px',
            margin: '10px 0',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
            <h2>{name}</h2>
            <span>{type}</span>
            <p>{address}</p>
        </div>
    );
}

export default LocationCard;