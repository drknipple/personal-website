// Week 6 Complete Example: LocalStorage Utilities
// This shows what your locationStorage.js should look like at the end of Week 6

const STORAGE_KEY = 'myFavoritePlaces';

export function getLocations() {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : [];
}

export function saveLocation(location) {
  const locations = getLocations();
  const newLocation = {
    ...location,
    id: location.id || Date.now()
  };
  const updated = [...locations, newLocation];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function deleteLocation(id) {
  const locations = getLocations();
  const updated = locations.filter(loc => loc.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function updateLocation(id, updatedData) {
  const locations = getLocations();
  const updated = locations.map(loc =>
    loc.id === id ? { ...loc, ...updatedData } : loc
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

