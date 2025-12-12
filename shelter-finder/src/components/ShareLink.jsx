import { useState } from 'react';
import { FaSms, FaEnvelope } from 'react-icons/fa';

export default function ShareLink({ location }) {
  const [copied, setCopied] = useState(false);

  const generateShareLink = () => {
    const baseUrl = window.location.origin + window.location.pathname;
    const params = new URLSearchParams({
      id: location.id,
      name: location.name,
      type: location.type,
      lat: location.latitude,
      lng: location.longitude,
    });
    
    if (location.address) params.append('address', location.address);
    if (location.phone) params.append('phone', location.phone);
    if (location.hours) params.append('hours', location.hours);
    
    return `${baseUrl}?${params.toString()}`;
  };

  const shareLink = generateShareLink();

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const generateTextMessage = () => {
    const typeLabels = {
      'shelter': 'Shelter',
      'service': 'Service',
      'feeding-program': 'Feeding Program',
      'housing': 'Temporary/Permanent Housing',
    };
    let message = `${location.name}\n`;
    message += `Type: ${typeLabels[location.type] || location.type}\n`;
    
    // Build address line properly, handling missing parts
    const addressParts = [];
    if (location.address) addressParts.push(location.address);
    if (location.city) addressParts.push(location.city);
    if (location.state) addressParts.push(location.state);
    if (location.zipCode) addressParts.push(location.zipCode);
    
    if (addressParts.length > 0) {
      message += `Address: ${addressParts.join(', ')}\n`;
    }
    
    if (location.phone) message += `Phone: ${location.phone}\n`;
    if (location.hours) message += `Hours: ${location.hours}\n`;
    message += `\nView on map: ${shareLink}`;
    return message;
  };

  return (
    <div className="share-link-container">
      <h3>Share Location</h3>
      
      <div className="share-link-input-group">
        <input
          type="text"
          value={shareLink}
          readOnly
          className="share-link-input"
          onClick={(e) => e.target.select()}
        />
        <button
          onClick={copyToClipboard}
          className={`btn-primary ${copied ? 'copied' : ''}`}
        >
          {copied ? '✓ Copied!' : 'Copy Link'}
        </button>
      </div>

      <div className="share-actions">
        <a
          href={`sms:?body=${encodeURIComponent(generateTextMessage())}`}
          className="btn-secondary"
          style={{ textDecoration: 'none', display: 'inline-block' }}
        >
          <FaSms /> Share via SMS
        </a>
        <a
          href={`mailto:?subject=${encodeURIComponent(location.name)}&body=${encodeURIComponent(generateTextMessage())}`}
          className="btn-secondary"
          style={{ textDecoration: 'none', display: 'inline-block' }}
        >
          <FaEnvelope /> Share via Email
        </a>
      </div>

      <div className="share-info">
        <p>This link can be pasted in any app. When opened, it will show this location on the map.</p>
      </div>
    </div>
  );
}


