// Address formatting utilities
// Formats addresses to: "HouseNumber Street, City, ST ZIPCODE"
// Example: "1283 Main St, Louisville, KY 40204"

/**
 * Formats an address from Nominatim API response
 * @param {Object} nominatimResult - Result from Nominatim geocoding API
 * @returns {string} Formatted address: "HouseNumber Street, City, ST ZIPCODE"
 */
export function formatAddressFromNominatim(nominatimResult) {
    const addr = nominatimResult.address || {};
    const parts = [];
    
    // Check if we have structured address data
    const hasStructuredData = addr.house_number || addr.road || addr.city || addr.town || addr.village;
    
    // If structured data is missing or incomplete, parse display_name instead
    if (!hasStructuredData || !addr.road) {
        // Parse display_name to extract address components
        // Example: "Paddock Grill, 700, Central Avenue, Louisville, Jefferson County, Kentucky, 40292, United States"
        // We want: "700 Central Ave, Louisville, KY" (skip business name, county, country)
        return parseDisplayName(nominatimResult.display_name || '');
    }
    
    // Use structured data when available
    // House number and street (no comma between them)
    if (addr.house_number && addr.road) {
        parts.push(`${addr.house_number} ${addr.road}`);
    } else if (addr.road) {
        parts.push(addr.road);
    } else if (addr.house_number) {
        parts.push(addr.house_number);
    }
    
    // City (or town, or village) - exclude neighborhood and county
    if (addr.city) {
        parts.push(addr.city);
    } else if (addr.town) {
        parts.push(addr.town);
    } else if (addr.village) {
        parts.push(addr.village);
    }
    
    // State abbreviation and ZIP code together
    const stateZip = [];
    if (addr.state) {
        // Nominatim sometimes returns full state name, convert to abbreviation if needed
        const state = normalizeState(addr.state);
        if (state) {
            stateZip.push(state);
        }
    }
    if (addr.postcode) {
        stateZip.push(addr.postcode);
    }
    if (stateZip.length > 0) {
        parts.push(stateZip.join(' '));
    }
    
    // Join with commas: "1283 Main St, City, ST ZIPCODE"
    const formatted = parts.join(', ');
    if (formatted) {
        return formatted;
    }
    
    // Final fallback: parse display_name
    return parseDisplayName(nominatimResult.display_name || '');
}

/**
 * Cleans an existing address string to format: "HouseNumber Street, City, ST ZIPCODE"
 * Removes neighborhoods, counties, country, etc.
 * @param {string} address - Raw address string
 * @returns {string} Formatted address
 */
export function cleanAddressString(address) {
    if (!address) return '';
    
    // Step 1: Remove comma between house number and street: "123, Main St" -> "123 Main St"
    let cleaned = address.replace(/(\d+),\s*([A-Za-z])/g, '$1 $2');
    
    // Step 2: Split by comma and filter out unwanted parts
    let parts = cleaned.split(',')
        .map(p => p.trim())
        .filter(p => {
            if (!p || p.trim().length === 0) return false;
            const lower = p.toLowerCase().trim();
            // Remove: neighborhood, county, country, united states, usa, us
            return !lower.includes('neighborhood') && 
                   !lower.includes('neighbourhood') &&
                   !lower.includes('county') && 
                   !lower.includes('country') &&
                   !lower.includes('united states') &&
                   lower !== 'usa' && 
                   lower !== 'us';
        });
    
    if (parts.length === 0) return address.trim();
    
    // Step 3: Extract exactly 3 parts: Street, City, State+ZIP
    const street = parts[0] || '';
    let city = '';
    let stateZip = '';
    
    // Find city - take the LONGEST part between street and state/zip
    // Cities are usually longer than neighborhoods
    let candidates = [];
    for (let i = 1; i < parts.length; i++) {
        const part = parts[i];
        const lower = part.toLowerCase();
        // Skip if it's state+zip
        if (/\b[A-Z]{2}\s+\d{5}/.test(part) || /^\d{5}/.test(part)) continue;
        // Skip if it's just a 2-letter state code
        if (/^[A-Z]{2}$/.test(part) && i + 1 < parts.length && /^\d{5}/.test(parts[i + 1])) continue;
        // Skip if it contains neighborhood
        if (lower.includes('neighborhood') || lower.includes('neighbourhood')) continue;
        // Collect all potential city parts
        if (part.length >= 3) {
            candidates.push({ part, length: part.length });
        }
    }
    
    // City is the LONGEST candidate (cities like "Louisville" are longer than neighborhoods)
    if (candidates.length > 0) {
        candidates.sort((a, b) => b.length - a.length);
        city = candidates[0].part;
    }
    
    // Find state and zip (look for "ST ZIPCODE" pattern, or just "ST" if no zip)
    const allText = parts.join(' ');
    const stateZipMatch = allText.match(/\b([A-Z]{2})\s+(\d{5}(?:-\d{4})?)\b/);
    if (stateZipMatch) {
        stateZip = `${stateZipMatch[1]} ${stateZipMatch[2]}`;
    } else {
        // Try last 2 parts for "ST ZIPCODE"
        if (parts.length >= 2) {
            const p1 = parts[parts.length - 2];
            const p2 = parts[parts.length - 1];
            if (/^[A-Z]{2}$/.test(p1) && /^\d{5}/.test(p2)) {
                stateZip = `${p1} ${p2}`;
            } else if (/^[A-Z]{2}$/.test(p2) && !/^\d/.test(p2)) {
                // Last part is a state abbreviation (not followed by zip)
                stateZip = p2;
            }
        } else if (parts.length === 1) {
            // Only one part - check if it's a state
            const p1 = parts[0];
            if (/^[A-Z]{2}$/.test(p1)) {
                stateZip = p1;
            }
        }
        // Also check if any part is a standalone state abbreviation
        if (!stateZip) {
            for (let i = parts.length - 1; i >= 0; i--) {
                const part = parts[i];
                if (/^[A-Z]{2}$/.test(part) && part !== 'US' && part !== 'USA') {
                    // Found a state abbreviation
                    stateZip = part;
                    break;
                }
            }
        }
    }
    
    // Build result: "Street, City, ST ZIPCODE"
    const result = [street];
    if (city) result.push(city);
    if (stateZip) result.push(stateZip);
    
    return result.join(', ');
}

/**
 * Normalizes state names to abbreviations
 * @param {string} state - State name (full or abbreviation)
 * @returns {string} State abbreviation (e.g., "KY")
 */
function normalizeState(state) {
    if (!state) return '';
    
    // If already a 2-letter abbreviation, return as-is
    if (/^[A-Z]{2}$/.test(state.trim())) {
        return state.trim();
    }
    
    // Map common full state names to abbreviations
    const stateMap = {
        'kentucky': 'KY',
        'california': 'CA',
        'texas': 'TX',
        'florida': 'FL',
        'new york': 'NY',
        'illinois': 'IL',
        'pennsylvania': 'PA',
        'ohio': 'OH',
        'georgia': 'GA',
        'north carolina': 'NC',
        'michigan': 'MI',
        'new jersey': 'NJ',
        'virginia': 'VA',
        'washington': 'WA',
        'arizona': 'AZ',
        'massachusetts': 'MA',
        'tennessee': 'TN',
        'indiana': 'IN',
        'missouri': 'MO',
        'maryland': 'MD',
        'wisconsin': 'WI',
        'colorado': 'CO',
        'minnesota': 'MN',
        'south carolina': 'SC',
        'alabama': 'AL',
        'louisiana': 'LA',
        'kentucky': 'KY',
        'oregon': 'OR',
        'oklahoma': 'OK',
        'connecticut': 'CT',
        'utah': 'UT',
        'iowa': 'IA',
        'nevada': 'NV',
        'arkansas': 'AR',
        'mississippi': 'MS',
        'kansas': 'KS',
        'new mexico': 'NM',
        'nebraska': 'NE',
        'west virginia': 'WV',
        'idaho': 'ID',
        'hawaii': 'HI',
        'new hampshire': 'NH',
        'maine': 'ME',
        'montana': 'MT',
        'rhode island': 'RI',
        'delaware': 'DE',
        'south dakota': 'SD',
        'north dakota': 'ND',
        'alaska': 'AK',
        'vermont': 'VT',
        'wyoming': 'WY',
        'district of columbia': 'DC'
    };
    
    const normalized = state.toLowerCase().trim();
    return stateMap[normalized] || state; // Return original if not found
}

/**
 * Parses Nominatim display_name to extract address: "HouseNumber Street, City, ST ZIPCODE"
 * Filters out business names, counties, countries, etc.
 * @param {string} displayName - Full display name from Nominatim
 * @returns {string} Formatted address
 */
function parseDisplayName(displayName) {
    if (!displayName) return '';
    
    // Split by comma and clean
    let parts = displayName.split(',')
        .map(p => p.trim())
        .filter(p => p && p.length > 0);
    
    if (parts.length === 0) return displayName.trim();
    
    // Filter out unwanted parts
    parts = parts.filter(part => {
        const lower = part.toLowerCase();
        // Remove: county, country, united states, usa, us
        if (lower.includes('county') && 
            !lower.includes('city') && 
            !lower.includes('town')) {
            return false; // Remove "Jefferson County" but keep "City of X"
        }
        if (lower.includes('united states') || 
            lower === 'usa' || 
            lower === 'us') {
            return false;
        }
        // Remove business/POI names that appear at the start (usually first part if it doesn't look like an address)
        // We'll handle this separately by checking if first part is a number
        return true;
    });
    
    if (parts.length === 0) return displayName.trim();
    
    // Find the street address (starts with a number)
    let streetIndex = -1;
    let street = '';
    for (let i = 0; i < parts.length; i++) {
        // Check if this part starts with a number (house number)
        if (/^\d+/.test(parts[i])) {
            streetIndex = i;
            street = parts[i];
            // If next part is also part of the street (e.g., "700, Central Avenue")
            if (i + 1 < parts.length && !/^\d{5}/.test(parts[i + 1]) && 
                !/^[A-Z]{2}$/.test(parts[i + 1]) &&
                !parts[i + 1].toLowerCase().includes('county')) {
                street = `${parts[i]} ${parts[i + 1]}`;
                // Remove the next part since we've combined it
                parts.splice(i + 1, 1);
            }
            break;
        }
    }
    
    // If no street found starting with number, use first part that's not a business name
    if (streetIndex === -1) {
        // Skip first part if it looks like a business name (no numbers, might be a name)
        for (let i = 0; i < parts.length; i++) {
            if (!/^\d/.test(parts[i]) && parts[i].length > 3) {
                // Might be business name, skip it
                continue;
            }
            street = parts[i];
            streetIndex = i;
            break;
        }
    }
    
    // Extract city (usually after street, before state)
    let city = '';
    let cityIndex = -1;
    for (let i = streetIndex + 1; i < parts.length; i++) {
        const part = parts[i];
        const lower = part.toLowerCase();
        // Skip if it's a state or zip
        if (/^[A-Z]{2}$/.test(part) || /^\d{5}/.test(part)) break;
        // Skip if it's a county
        if (lower.includes('county') && !lower.includes('city')) continue;
        // City is usually a longer word (like "Louisville")
        if (part.length >= 4 && !lower.includes('county')) {
            city = part;
            cityIndex = i;
            break;
        }
    }
    
    // Extract state and zip
    let stateZip = '';
    for (let i = Math.max(streetIndex, cityIndex) + 1; i < parts.length; i++) {
        const part = parts[i];
        // Look for state abbreviation
        if (/^[A-Z]{2}$/.test(part) && part !== 'US' && part !== 'USA') {
            const state = part;
            // Check if next part is a zip code
            if (i + 1 < parts.length && /^\d{5}/.test(parts[i + 1])) {
                stateZip = `${state} ${parts[i + 1]}`;
            } else {
                stateZip = state;
            }
            break;
        }
        // Look for full state name
        const normalizedState = normalizeState(part);
        if (normalizedState !== part && normalizedState.length === 2) {
            // We found a state name that was normalized
            stateZip = normalizedState;
            // Check if next part is a zip
            if (i + 1 < parts.length && /^\d{5}/.test(parts[i + 1])) {
                stateZip = `${normalizedState} ${parts[i + 1]}`;
            }
            break;
        }
    }
    
    // Build result
    const result = [];
    if (street) result.push(street);
    if (city) result.push(city);
    if (stateZip) result.push(stateZip);
    
    return result.length > 0 ? result.join(', ') : cleanAddressString(displayName);
}
