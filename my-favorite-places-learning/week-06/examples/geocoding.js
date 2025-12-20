// Week 6 Complete Example: Geocoding Utility
// This shows what your geocoding.js should look like at the end of Week 6

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export async function geocodeAddress(address, city, state) {
  // Build full address
  const addressParts = [address, city, state].filter(part => part && part.trim());
  const fullAddress = addressParts.join(', ');
  
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

