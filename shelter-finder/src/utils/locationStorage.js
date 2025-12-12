// Utility functions for managing locations in localStorage

const STORAGE_KEY = 'shelter-finder-locations';

export const getLocations = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const saveLocation = (location) => {
  const locations = getLocations();
  const newLocation = {
    ...location,
    id: location.id || Date.now().toString(),
    createdAt: location.createdAt || new Date().toISOString(),
  };
  locations.push(newLocation);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(locations));
  return newLocation;
};

export const deleteLocation = (id) => {
  const locations = getLocations();
  const filtered = locations.filter(loc => loc.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return filtered;
};

export const updateLocation = (id, updates) => {
  const locations = getLocations();
  const updated = locations.map(loc => 
    loc.id === id ? { ...loc, ...updates } : loc
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
};

// Calculate distance between two coordinates using Haversine formula
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};


