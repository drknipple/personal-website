// Week 6 Complete Example: Form with Geocoding
// This shows what your AddLocationForm should look like at the end of Week 6

import { useState } from 'react';
import { geocodeAddress } from '../utils/geocoding';
import './AddLocationForm.css';

function AddLocationForm({ onAddLocation }) {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    type: 'restaurant'
  });
  const [geocoding, setGeocoding] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.address.trim()) {
      setError('Name and address are required');
      return;
    }

    setError('');
    setGeocoding(true);

    try {
      // Geocode the address
      const coords = await geocodeAddress(
        formData.address,
        formData.city,
        formData.state
      );

      // Add location with coordinates
      onAddLocation({
        ...formData,
        latitude: coords.latitude,
        longitude: coords.longitude
      });

      // Reset form
      setFormData({
        name: '',
        address: '',
        city: '',
        type: 'restaurant'
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setGeocoding(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="location-form">
      <h2>Add New Location</h2>
      
      {error && <p className="error">{error}</p>}
      
      <div className="form-group">
        <label htmlFor="name">Location Name *</label>
        <input
          id="name"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g., Central Park"
          disabled={geocoding}
          required
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="address">Address *</label>
        <input
          id="address"
          name="address"
          type="text"
          value={formData.address}
          onChange={handleChange}
          placeholder="e.g., 123 Main Street"
          disabled={geocoding}
          required
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="city">City</label>
        <input
          id="city"
          name="city"
          type="text"
          value={formData.city}
          onChange={handleChange}
          placeholder="e.g., New York"
          disabled={geocoding}
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="type">Type</label>
        <select
          id="type"
          name="type"
          value={formData.type}
          onChange={handleChange}
          disabled={geocoding}
        >
          <option value="restaurant">Restaurant</option>
          <option value="park">Park</option>
          <option value="library">Library</option>
          <option value="other">Other</option>
        </select>
      </div>
      
      <div className="form-actions">
        <button 
          type="submit" 
          className="submit-button"
          disabled={geocoding}
        >
          {geocoding ? 'Finding Location...' : 'Add Location'}
        </button>
      </div>
    </form>
  );
}

export default AddLocationForm;

