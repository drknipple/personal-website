import { useState } from "react"; 

function LocationCard({ name, type, address, phone, details}) {   
  const [copied, setCopied] = useState(false);  

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
  } catch (err) {
    console.error('failed to copy address', err());
  }
  };
  

    return (
       <div style={{
            color: '666',
            background: 'white',
            borderRadius: '8px',
            padding: '15px',
            width: '300px',
            margin: '20px 0',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
        <h2 style={{margin: '0 0 5px 0', color: '#2C3E50'}}>{name}</h2>
        <span style={{
            display: 'inline-block',
            background: '#394f82',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '12px',
            fontSize: '12px',
            }}>{type}</span> 
          <p style={{
            color: '#666'
            }}>{address}</p>
          <p style={{
            color: '#666'
            }}>{phone}</p>
            <p style={{
            color: '#666'
            }}>{details}</p>
            <button
              onClick={copyAddress}
              style={{
                marginTop: '10px',
                padding: '8px 16px',
                background: copied ? '#3e4f41' : '#394f82',
                color: 'white',
                borderRadius: '4px',
                cursor: "pointer"
              }}
              >{copied ? 'copied' : 'Copy Address'}
            </button>
        </div>
        
    );    
}

export default LocationCard;