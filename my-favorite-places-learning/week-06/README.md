# Week 6: Data Persistence & Geocoding

**Time**: 2-3 hours/day, 5 days

## Learning Goals

- Save data in the browser (localStorage)
- Load data on page refresh
- Convert addresses to coordinates (geocoding)
- Handle async operations and errors

## Day 1-2: LocalStorage

### What You'll Learn
- What localStorage is
- Saving data to localStorage
- Loading data from localStorage
- JSON.stringify and JSON.parse

### What is localStorage?

localStorage is browser storage that persists data even after you close the browser. It's perfect for saving user data without a backend server.

### Saving Data

```jsx
// Save a single value
localStorage.setItem('username', 'John');

// Save an object (must convert to string first)
const locations = [
  { id: 1, name: "Park" },
  { id: 2, name: "Cafe" }
];
localStorage.setItem('locations', JSON.stringify(locations));
```

### Loading Data

```jsx
// Get a single value
const username = localStorage.getItem('username');

// Get an object (must parse from string)
const savedLocations = localStorage.getItem('locations');
const locations = savedLocations ? JSON.parse(savedLocations) : [];
```

### Using localStorage in React

```jsx
import { useState, useEffect } from 'react';

function App() {
  // Load from localStorage on mount
  const [locations, setLocations] = useState(() => {
    const saved = localStorage.getItem('locations');
    return saved ? JSON.parse(saved) : [];
  });

  // Save to localStorage whenever locations change
  useEffect(() => {
    localStorage.setItem('locations', JSON.stringify(locations));
  }, [locations]);

  const addLocation = (newLocation) => {
    setLocations([...locations, newLocation]);
    // This will automatically save to localStorage via useEffect
  };

  return (
    // Your app JSX
  );
}
```

### Practice: Save and Load Locations

Update your app to:
1. Save locations to localStorage when they're added
2. Load locations from localStorage when the app starts
3. Locations persist after page refresh

### Complete Example

```jsx
// utils/locationStorage.js
export function getLocations() {
  const saved = localStorage.getItem('myFavoritePlaces');
  return saved ? JSON.parse(saved) : [];
}

export function saveLocation(location) {
  const locations = getLocations();
  const newLocation = {
    ...location,
    id: location.id || Date.now()
  };
  const updated = [...locations, newLocation];
  localStorage.setItem('myFavoritePlaces', JSON.stringify(updated));
  return updated;
}

export function deleteLocation(id) {
  const locations = getLocations();
  const updated = locations.filter(loc => loc.id !== id);
  localStorage.setItem('myFavoritePlaces', JSON.stringify(updated));
  return updated;
}
```

```jsx
// App.jsx
import { useState, useEffect } from 'react';
import { getLocations, saveLocation } from './utils/locationStorage';

function App() {
  const [locations, setLocations] = useState([]);

  // Load locations on mount
  useEffect(() => {
    setLocations(getLocations());
  }, []);

  const handleAddLocation = (locationData) => {
    const updated = saveLocation(locationData);
    setLocations(updated);
  };

  return (
    // Your app
  );
}
```

### Exercises

1. Create a utility file for localStorage functions
2. Save locations when added
3. Load locations on page load
4. Test that data persists after refresh
5. Add a "Clear All" button that removes all data

### Resources
- [MDN localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
- [JSON.stringify/parse](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON)

## Day 3-5: Geocoding (Address to Coordinates)

### What You'll Learn
- What geocoding is
- Using the Nominatim API
- Fetch API basics
- Async/await
- Error handling

### What is Geocoding?

Geocoding converts addresses (like "123 Main St, New York") into coordinates (latitude, longitude) that maps can use.

### Using Nominatim API

Nominatim is a free geocoding service from OpenStreetMap:

```jsx
async function geocodeAddress(address) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.length > 0) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon)
      };
    } else {
      throw new Error('Address not found');
    }
  } catch (error) {
    throw new Error('Failed to geocode address');
  }
}
```

### Important: Rate Limiting

Nominatim has usage limits. Always:
- Add a delay between requests (1 second minimum)
- Don't make too many requests
- Be respectful of the free service

```jsx
// Add delay between requests
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function geocodeAddress(address) {
  await delay(1000); // Wait 1 second
  // ... rest of geocoding code
}
```

### Async/Await Basics

```jsx
// async function returns a Promise
async function fetchData() {
  const response = await fetch('https://api.example.com/data');
  const data = await response.json();
  return data;
}

// Using async function
async function handleClick() {
  try {
    const data = await fetchData();
    console.log(data);
  } catch (error) {
    console.error('Error:', error);
  }
}
```

### Complete Geocoding Integration

```jsx
// utils/geocoding.js
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export async function geocodeAddress(address, city, state) {
  // Build full address
  const fullAddress = [address, city, state]
    .filter(part => part && part.trim())
    .join(', ');
  
  if (!fullAddress) {
    throw new Error('Address is required');
  }

  // Be respectful - add delay
  await delay(1000);

  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'MyFavoritePlacesApp/1.0' // Required by Nominatim
      }
    });
    
    if (!response.ok) {
      throw new Error('Geocoding service unavailable');
    }
    
    const data = await response.json();
    
    if (data.length > 0) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon)
      };
    } else {
      throw new Error('Address not found. Please check the address and try again.');
    }
  } catch (error) {
    if (error.message.includes('not found')) {
      throw error;
    }
    throw new Error('Error finding location. Please try again later.');
  }
}
```

```jsx
// components/AddLocationForm.jsx
import { useState } from 'react';
import { geocodeAddress } from '../utils/geocoding';

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
    <form onSubmit={handleSubmit}>
      {error && <p className="error">{error}</p>}
      
      <input
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Location name *"
        disabled={geocoding}
      />
      
      <input
        name="address"
        value={formData.address}
        onChange={handleChange}
        placeholder="Address *"
        disabled={geocoding}
      />
      
      <input
        name="city"
        value={formData.city}
        onChange={handleChange}
        placeholder="City"
        disabled={geocoding}
      />
      
      <select
        name="type"
        value={formData.type}
        onChange={handleChange}
        disabled={geocoding}
      >
        <option value="restaurant">Restaurant</option>
        <option value="park">Park</option>
        <option value="library">Library</option>
      </select>
      
      <button type="submit" disabled={geocoding}>
        {geocoding ? 'Finding Location...' : 'Add Location'}
      </button>
    </form>
  );
}
```

### Exercises

1. Add geocoding to your form
2. Show "Finding location..." while geocoding
3. Handle errors gracefully
4. Test with different addresses
5. Add coordinates display after geocoding

### Resources
- [MDN Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [MDN Async/Await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function)
- [Nominatim Usage Policy](https://operations.osmfoundation.org/policies/nominatim/)

### Complete Example

See `examples/` folder for complete examples:
- `locationStorage.js` - Complete localStorage utilities
- `geocoding.js` - Complete geocoding function with error handling
- `AddLocationForm.jsx` - Form with geocoding integration

## Deliverable

By the end of Week 6, you should have:
- ✅ Locations saved to localStorage
- ✅ Locations loaded on page refresh
- ✅ Automatic coordinate finding from addresses
- ✅ "Finding location..." indicator
- ✅ Error handling for geocoding failures

## Next Week

Next week, you'll add editing, deleting, geolocation, and sharing features!

