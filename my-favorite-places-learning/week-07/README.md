# Week 7: Advanced Features

**Time**: 2-3 hours/day, 5 days

## Learning Goals

- Edit existing locations
- Delete locations
- Get user's current location
- Calculate distances
- Generate shareable links

## Day 1-2: Editing & Deleting

### What You'll Learn
- Edit button that populates the form
- Update existing locations
- Delete button with confirmation
- Managing state for editing mode

### Editing Locations

```jsx
// App.jsx
function App() {
  const [locations, setLocations] = useState([]);
  const [editingLocation, setEditingLocation] = useState(null);

  const handleEdit = (location) => {
    setEditingLocation(location);
    // Scroll to form or show form
  };

  const handleUpdateLocation = (updatedData) => {
    const updated = locations.map(loc =>
      loc.id === editingLocation.id
        ? { ...loc, ...updatedData }
        : loc
    );
    setLocations(updated);
    setEditingLocation(null);
    // Also update localStorage
    localStorage.setItem('locations', JSON.stringify(updated));
  };

  return (
    <div>
      {editingLocation ? (
        <EditLocationForm
          location={editingLocation}
          onUpdate={handleUpdateLocation}
          onCancel={() => setEditingLocation(null)}
        />
      ) : (
        <AddLocationForm onAdd={handleAddLocation} />
      )}
      <LocationList
        locations={locations}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
```

### Edit Form Component

```jsx
// components/EditLocationForm.jsx
import { useState, useEffect } from 'react';
import { geocodeAddress } from '../utils/geocoding';

function EditLocationForm({ location, onUpdate, onCancel }) {
  const [formData, setFormData] = useState({
    name: location.name,
    address: location.address,
    city: location.city || '',
    type: location.type || 'restaurant'
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
    setError('');
    setGeocoding(true);

    try {
      // Only geocode if address changed
      let coords = {
        latitude: location.latitude,
        longitude: location.longitude
      };

      const addressChanged = 
        formData.address !== location.address ||
        formData.city !== (location.city || '');

      if (addressChanged) {
        coords = await geocodeAddress(
          formData.address,
          formData.city,
          formData.state
        );
      }

      onUpdate({
        ...formData,
        ...coords
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setGeocoding(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Edit Location</h2>
      {error && <p className="error">{error}</p>}
      
      <input
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Location name *"
        required
      />
      
      <input
        name="address"
        value={formData.address}
        onChange={handleChange}
        placeholder="Address *"
        required
      />
      
      <button type="submit" disabled={geocoding}>
        {geocoding ? 'Updating...' : 'Update Location'}
      </button>
      <button type="button" onClick={onCancel}>
        Cancel
      </button>
    </form>
  );
}
```

### Deleting Locations

```jsx
// App.jsx
const handleDelete = (id) => {
  if (window.confirm('Are you sure you want to delete this location?')) {
    const updated = locations.filter(loc => loc.id !== id);
    setLocations(updated);
    localStorage.setItem('locations', JSON.stringify(updated));
  }
};
```

```jsx
// components/LocationList.jsx
function LocationList({ locations, onEdit, onDelete }) {
  return (
    <div>
      {locations.map(location => (
        <div key={location.id} className="location-card">
          <h3>{location.name}</h3>
          <p>{location.address}</p>
          <button onClick={() => onEdit(location)}>Edit</button>
          <button onClick={() => onDelete(location.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}
```

### Exercises

1. Add edit functionality
2. Add delete with confirmation
3. Update localStorage when editing/deleting
4. Show different form for edit vs add
5. Add visual feedback for edit mode

## Day 3-5: Geolocation & Sharing

### What You'll Learn
- Browser geolocation API
- "Find My Location" button
- Calculate distances
- Generate shareable links

### Getting User's Location

```jsx
// utils/geolocation.js
export function getUserLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      (error) => {
        reject(new Error('Unable to get your location'));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  });
}
```

### Using Geolocation in Component

```jsx
// App.jsx
const [userLocation, setUserLocation] = useState(null);

const handleGetLocation = async () => {
  try {
    const coords = await getUserLocation();
    setUserLocation([coords.latitude, coords.longitude]);
    // Center map on user location
  } catch (error) {
    alert(error.message);
  }
};

return (
  <div>
    <button onClick={handleGetLocation}>
      Find My Location
    </button>
    <LocationMap
      locations={locations}
      userLocation={userLocation}
    />
  </div>
);
```

### Calculating Distance

```jsx
// utils/distance.js
// Haversine formula to calculate distance between two coordinates
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in kilometers
  return distance;
}

// Convert to miles if needed
export function kmToMiles(km) {
  return (km * 0.621371).toFixed(1);
}
```

### Showing Distance in List

```jsx
// components/LocationList.jsx
import { calculateDistance, kmToMiles } from '../utils/distance';

function LocationList({ locations, userLocation }) {
  const getDistance = (location) => {
    if (!userLocation) return null;
    const km = calculateDistance(
      userLocation[0],
      userLocation[1],
      location.latitude,
      location.longitude
    );
    return kmToMiles(km);
  };

  return (
    <div>
      {locations
        .sort((a, b) => {
          if (!userLocation) return 0;
          const distA = calculateDistance(
            userLocation[0], userLocation[1],
            a.latitude, a.longitude
          );
          const distB = calculateDistance(
            userLocation[0], userLocation[1],
            b.latitude, b.longitude
          );
          return distA - distB;
        })
        .map(location => {
          const distance = getDistance(location);
          return (
            <div key={location.id} className="location-card">
              <h3>{location.name}</h3>
              <p>{location.address}</p>
              {distance && <p>{distance} miles away</p>}
            </div>
          );
        })}
    </div>
  );
}
```

### Generating Shareable Links

```jsx
// utils/sharing.js
export function generateShareLink(location) {
  const baseUrl = window.location.origin + window.location.pathname;
  const params = new URLSearchParams({
    id: location.id,
    name: location.name,
    lat: location.latitude,
    lng: location.longitude
  });
  return `${baseUrl}?${params.toString()}`;
}

export function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    alert('Link copied to clipboard!');
  });
}
```

### Reading Shared Links

```jsx
// App.jsx
import { useEffect } from 'react';

function App() {
  useEffect(() => {
    // Check for shared location in URL
    const params = new URLSearchParams(window.location.search);
    const sharedId = params.get('id');
    const sharedLat = params.get('lat');
    const sharedLng = params.get('lng');

    if (sharedId || (sharedLat && sharedLng)) {
      // Find location or create from coordinates
      if (sharedId) {
        const location = locations.find(loc => loc.id === parseInt(sharedId));
        if (location) {
          setSelectedLocation(location);
          // Center map on location
        }
      } else if (sharedLat && sharedLng) {
        // Create temporary location from coordinates
        const tempLocation = {
          id: 'shared',
          name: params.get('name') || 'Shared Location',
          latitude: parseFloat(sharedLat),
          longitude: parseFloat(sharedLng)
        };
        setSelectedLocation(tempLocation);
      }
    }
  }, []);
}
```

### Share Button Component

```jsx
// components/ShareButton.jsx
import { generateShareLink, copyToClipboard } from '../utils/sharing';

function ShareButton({ location }) {
  const handleShare = () => {
    const link = generateShareLink(location);
    copyToClipboard(link);
  };

  return (
    <button onClick={handleShare}>
      Share Location
    </button>
  );
}
```

### Exercises

1. Add "Find My Location" button
2. Show distances to locations
3. Sort locations by distance
4. Add share button to each location
5. Test sharing links with friends

### Resources
- [MDN Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API)
- [Haversine Formula](https://en.wikipedia.org/wiki/Haversine_formula)

### Complete Example

See `examples/` folder for complete examples:
- `App.jsx` - Complete app with all features (edit, delete, geolocation, sharing)
- `utils/geolocation.js` - Geolocation utility
- `utils/distance.js` - Distance calculation utilities
- `utils/sharing.js` - Share link generation

## Deliverable

By the end of Week 7, you should have:
- ✅ Edit and delete functionality
- ✅ "Find My Location" button
- ✅ Distance calculations
- ✅ Shareable links for locations
- ✅ All features working together

## Next Week

Next week, you'll polish the design and deploy your app online!

