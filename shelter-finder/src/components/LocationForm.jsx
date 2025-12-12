import { useState } from 'react';

export default function LocationForm({ onSave, onCancel, initialData }) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    type: initialData?.type || 'shelter',
    address: initialData?.address || '',
    city: initialData?.city || '',
    state: initialData?.state || '',
    zipCode: initialData?.zipCode || '',
    phone: initialData?.phone || '',
    hours: initialData?.hours || '',
    notes: initialData?.notes || '',
    latitude: initialData?.latitude || null,
    longitude: initialData?.longitude || null,
  });

  const [geocoding, setGeocoding] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Geocode address to get coordinates
  const geocodeAddress = async (address, city, state, zipCode) => {
    if (!address || !city) {
      throw new Error('Address and city are required');
    }

    const fullAddress = `${address}, ${city}${state ? `, ${state}` : ''}${zipCode ? ` ${zipCode}` : ''}`.trim();
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}&limit=1`
    );
    
    if (!response.ok) {
      throw new Error('Geocoding service unavailable');
    }
    
    const data = await response.json();

    if (data && data.length > 0) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
      };
    } else {
      throw new Error('Could not find this address. Please check the address and try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.name) {
      setError('Name is required');
      return;
    }

    // If editing and coordinates already exist, use them
    // Normalize empty strings and undefined for comparison
    const normalizeValue = (val) => val === undefined || val === null ? '' : String(val);
    const addressChanged = 
      normalizeValue(formData.address) !== normalizeValue(initialData?.address) ||
      normalizeValue(formData.city) !== normalizeValue(initialData?.city) ||
      normalizeValue(formData.state) !== normalizeValue(initialData?.state) ||
      normalizeValue(formData.zipCode) !== normalizeValue(initialData?.zipCode);
    
    if (initialData?.latitude && initialData?.longitude && !addressChanged) {
      // Address hasn't changed, use existing coordinates
      const locationData = {
        ...formData,
        latitude: initialData.latitude,
        longitude: initialData.longitude,
      };

      if (initialData.id) {
        locationData.id = initialData.id;
      }

      onSave(locationData);
      return;
    }

    // Need to geocode the address
    if (!formData.address || !formData.city) {
      setError('Address and city are required to find the location on the map');
      return;
    }

    setGeocoding(true);

    try {
      const coordinates = await geocodeAddress(
        formData.address,
        formData.city,
        formData.state,
        formData.zipCode
      );

      const locationData = {
        ...formData,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
      };

      if (initialData?.id) {
        locationData.id = initialData.id;
      }

      onSave(locationData);
    } catch (err) {
      setError(err.message || 'Error finding location. Please check the address and try again.');
    } finally {
      setGeocoding(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="location-form">
      <h2>{initialData ? 'Edit Location' : 'Add New Location'}</h2>
      
      {error && <div className="error-message">{error}</div>}

      <div className="form-group">
        <label htmlFor="name">Name *</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          placeholder="e.g., Community Shelter"
          disabled={geocoding}
        />
      </div>

      <div className="form-group">
        <label htmlFor="type">Type *</label>
        <select
          id="type"
          name="type"
          value={formData.type}
          onChange={handleChange}
          required
          disabled={geocoding}
        >
          <option value="shelter">Shelter</option>
          <option value="service">Service</option>
          <option value="feeding-program">Feeding Program</option>
          <option value="housing">Temporary/Permanent Housing</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="address">Address *</label>
        <input
          type="text"
          id="address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          required
          placeholder="Street address"
          disabled={geocoding}
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="city">City *</label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            required
            placeholder="City"
            disabled={geocoding}
          />
        </div>

        <div className="form-group">
          <label htmlFor="state">State</label>
          <input
            type="text"
            id="state"
            name="state"
            value={formData.state}
            onChange={handleChange}
            placeholder="State"
            maxLength="2"
            style={{ textTransform: 'uppercase' }}
            disabled={geocoding}
          />
        </div>

        <div className="form-group">
          <label htmlFor="zipCode">ZIP Code</label>
          <input
            type="text"
            id="zipCode"
            name="zipCode"
            value={formData.zipCode}
            onChange={handleChange}
            placeholder="ZIP"
            disabled={geocoding}
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="phone">Phone</label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="(555) 123-4567"
          disabled={geocoding}
        />
      </div>

      <div className="form-group">
        <label htmlFor="hours">Hours</label>
        <input
          type="text"
          id="hours"
          name="hours"
          value={formData.hours}
          onChange={handleChange}
          placeholder="e.g., Mon-Fri 9am-5pm"
          disabled={geocoding}
        />
      </div>

      <div className="form-group">
        <label htmlFor="notes">Additional Notes</label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows="3"
          placeholder="Any additional information..."
          disabled={geocoding}
        />
      </div>

      <div className="form-actions">
        <button type="submit" className="btn-primary" disabled={geocoding}>
          {geocoding ? 'Finding Location...' : (initialData ? 'Update Location' : 'Add Location')}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-secondary" disabled={geocoding}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
