// Week 4 Complete Example: Forms & User Input
// This shows what your form component should look like at the end of Week 4

import { useState } from 'react';
import './AddLocationForm.css';

function AddLocationForm({ onAddLocation }) {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    type: 'restaurant'
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }
    
    if (!formData.address.trim()) {
      setError('Address is required');
      return;
    }

    // Clear error and add location
    setError('');
    onAddLocation(formData);
    
    // Reset form
    setFormData({
      name: '',
      address: '',
      city: '',
      type: 'restaurant'
    });
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
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="type">Type</label>
        <select
          id="type"
          name="type"
          value={formData.type}
          onChange={handleChange}
        >
          <option value="restaurant">Restaurant</option>
          <option value="park">Park</option>
          <option value="library">Library</option>
          <option value="other">Other</option>
        </select>
      </div>
      
      <div className="form-actions">
        <button type="submit" className="submit-button">
          Add Location
        </button>
      </div>
    </form>
  );
}

export default AddLocationForm;

