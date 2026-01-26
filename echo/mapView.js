// Map view: Leaflet map, markers for Echos, popups, and click handlers

let map = null;
const markerById = new Map(); // Map echo ID to marker data
const markersByLocation = new Map(); // Key: "lat,lng", Value: { marker, echos: [] }
let onEchoSelectedCallback = null;
let allEchos = []; // Store all Echos for popup calculations

/**
 * Initialize the Leaflet map
 * @param {Object} options - Configuration options
 * @param {Function} options.onEchoSelected - Callback when an echo is selected
 * @returns {L.Map} Leaflet map instance
 */
export function initMap(options = {}) {
    onEchoSelectedCallback = options.onEchoSelected || null;

    // Initialize map centered on a default location (can be adjusted)
    map = L.map('map').setView([38.2527, -85.7585], 10); // Louisville, KY default

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);

    return map;
}

/**
 * Set all Echos for popup calculations
 * @param {Array} echos - Array of all Echo objects
 */
export function setAllEchos(echos) {
    allEchos = echos;
}

/**
 * Add or update an Echo marker on the map
 * @param {Object} echo - Echo object to add/update
 * @returns {L.Marker|null} The marker instance, or null if map not initialized
 */
export function addEchoMarker(echo) {
    if (!map) {
        console.error('[mapView] Map not initialized');
        return null;
    }

    if (!echo || !echo.lat || !echo.lng) {
        console.warn('[mapView] Invalid echo data for marker:', echo);
        return null;
    }

    // Remove existing marker if present
    if (markerById.has(echo.id)) {
        removeEchoMarker(echo.id);
    }

    // Group by location (lat, lng) - multiple Echos (events) at same location get grouped
    // Note: Multiple photos from the same event should be separate Echo records but same event
    // So we group by location only - each Echo is a separate event
    const locationKey = `${echo.lat},${echo.lng}`;
    
    // Get or create location group
    let locationGroup = markersByLocation.get(locationKey);
    if (!locationGroup) {
        locationGroup = { marker: null, echos: [] };
        markersByLocation.set(locationKey, locationGroup);
    }
    
    // Add echo to group (or update if already exists)
    const existingIndex = locationGroup.echos.findIndex(e => e.id === echo.id);
    if (existingIndex >= 0) {
        locationGroup.echos[existingIndex] = echo;
    } else {
        locationGroup.echos.push(echo);
    }
    
    // Update or create marker for this location
    updateLocationMarker(locationKey, locationGroup);
    
    // Store echo reference for quick lookup
    markerById.set(echo.id, { locationKey, echo });

    return locationGroup.marker;
}

/**
 * Update or create a marker for a location group
 * @param {string} locationKey - Location key "lat,lng"
 * @param {Object} locationGroup - Group object with echos array and marker
 */
function updateLocationMarker(locationKey, locationGroup) {
    const { echos } = locationGroup;
    if (echos.length === 0) return;
    
    if (!map) {
        console.error('[mapView] Map not initialized');
        return;
    }
    
    // Use first echo's coordinates (they should all be the same)
    const firstEcho = echos[0];
    const [lat, lng] = [firstEcho.lat, firstEcho.lng];
    
    if (!lat || !lng) {
        console.warn('[mapView] Invalid coordinates for marker:', { lat, lng });
        return;
    }
    
    // Remove old marker if it exists
    if (locationGroup.marker) {
        map.removeLayer(locationGroup.marker);
    }
    
    // Count unique events (group by event+year to count distinct events)
    // Multiple photos from same event+year should count as one event
    const uniqueEvents = new Set();
    echos.forEach(e => {
        const eventKey = `${e.event || 'No event'}|${e.year || '?'}`;
        uniqueEvents.add(eventKey);
    });
    const eventCount = uniqueEvents.size;
    
    // Create icon based on number of unique events
    // Only show orange marker with count if there are MULTIPLE different events
    // Single event (even with multiple photos) = blue marker with NO TEXT
    const isMultiple = eventCount > 1;
    
    const icon = L.divIcon({
        className: `echo-marker ${isMultiple ? 'echo-marker--multiple' : ''}`,
        html: isMultiple 
            ? `<div class="echo-marker__pin echo-marker__pin--multiple">
                <span class="echo-marker__count">${eventCount}</span>
              </div>`
            : `<div class="echo-marker__pin"></div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40]
    });
    
    // Create marker
    const marker = L.marker([lat, lng], { icon }).addTo(map);
    
    // Create popup content
    let popupContent = '';
    if (isMultiple) {
        // Show years on hover/click for multiple Echos
        const years = echos.map(e => e.year || '?').join(', ');
        popupContent = `
            <div class="echo-popup">
                <strong>${firstEcho.locationName || 'Unknown Location'}</strong><br>
                <span>Years: ${years}</span>
            </div>
        `;
    } else {
        const eventText = firstEcho.event ? `${firstEcho.event} • ` : '';
        popupContent = `
            <div class="echo-popup">
                <strong>${firstEcho.locationName || 'Unknown Location'}</strong><br>
                <span>${eventText}${firstEcho.year || '?'}</span>
            </div>
        `;
    }
    
    marker.bindPopup(popupContent);
    
    // Add click handler
    marker.on('click', () => {
        if (isMultiple) {
            // Multiple events at this location - show selection menu
            showEchoSelectionMenu(echos, marker);
        } else {
            // Single event (may have multiple photos) - show popup with first photo
            showSingleEchoPopup(firstEcho, marker);
        }
    });
    
    // Add hover tooltip showing event and years
    if (isMultiple) {
        // Show all unique events
        const events = Array.from(uniqueEvents).map(key => {
            const [event, year] = key.split('|');
            return `${event} (${year})`;
        }).join(', ');
        marker.bindTooltip(events, {
            permanent: false,
            direction: 'top',
            offset: [0, -40]
        });
    } else {
        // Single event - show event and year
        const event = firstEcho.event || 'No event';
        const year = firstEcho.year || '?';
        marker.bindTooltip(`${event} • ${year}`, {
            permanent: false,
            direction: 'top',
            offset: [0, -40]
        });
    }
    
    locationGroup.marker = marker;
}

/**
 * Show popup for a single Echo (may have multiple photos from same event)
 * @param {Object} echo - Echo to display
 * @param {L.Marker} marker - Leaflet marker instance
 */
function showSingleEchoPopup(echo, marker) {
    if (!echo || !marker) {
        console.warn('[mapView] Invalid parameters for showSingleEchoPopup');
        return;
    }
    
    // Find all Echos from the same event+year at this location to count photos
    const sameEventEchos = allEchos.filter(e => 
        Math.abs(e.lat - echo.lat) < 0.0001 && 
        Math.abs(e.lng - echo.lng) < 0.0001 &&
        e.event === echo.event && 
        e.year === echo.year
    );
    const photoCount = sameEventEchos.length;
    const event = echo.event || 'No event';
    const year = echo.year || '?';
    
    const popupContent = `
        <div class="echo-popup-single">
            <div class="echo-popup-single__photo">
                ${photoCount > 1 ? `<span class="echo-popup-single__photo-count">${photoCount} photos</span>` : ''}
                <img src="${echo.photoUrl}" alt="${event} ${year}">
            </div>
            <div class="echo-popup-single__info">
                <span class="echo-popup-single__event">${event}</span>
                <span class="echo-popup-single__year">${year}</span>
            </div>
        </div>
    `;
    
    // Attach popupopen handler BEFORE opening popup
    marker.off('popupopen'); // Remove any existing handler to avoid duplicates
    marker.on('popupopen', () => {
        // Use setTimeout to ensure DOM is fully ready
        setTimeout(() => {
            const popupElement = marker.getPopup().getElement();
            if (!popupElement) return;
            
            const popup = popupElement.querySelector('.echo-popup-single');
            if (!popup) return;
            
            popup.style.cursor = 'pointer';
            
            // Add click handler directly (don't clone, just add handler)
            const handlePopupClick = (e) => {
                // Don't trigger if clicking the close button
                if (e.target.closest('.leaflet-popup-close-button')) {
                    return;
                }
                if (onEchoSelectedCallback) {
                    marker.closePopup();
                    onEchoSelectedCallback(echo);
                }
            };
            
            // Remove any existing handler first
            popup.removeEventListener('click', handlePopupClick);
            popup.addEventListener('click', handlePopupClick);
        }, 10);
    });
    
    marker.bindPopup(popupContent, { 
        closeButton: true,
        className: 'echo-popup-wrapper'
    }).openPopup();
}

/**
 * Show selection menu when multiple events exist at the same location
 * @param {Array} echos - Array of Echo objects at this location
 * @param {L.Marker} marker - Leaflet marker instance
 */
function showEchoSelectionMenu(echos, marker) {
    if (!echos || echos.length === 0 || !marker) {
        console.warn('[mapView] Invalid parameters for showEchoSelectionMenu');
        return;
    }
    
    // Group Echos by event+year to show as distinct events
    const eventsMap = new Map();
    echos.forEach(echo => {
        const eventKey = `${echo.event || 'No event'}|${echo.year || '?'}`;
        if (!eventsMap.has(eventKey)) {
            eventsMap.set(eventKey, []);
        }
        eventsMap.get(eventKey).push(echo);
    });
    
    const eventList = Array.from(eventsMap.entries());
    const eventCount = eventList.length;
    
    const menuContent = `
        <div class="echo-selection-menu echo-selection-menu--multiple">
            <div class="echo-selection-header">
                <div class="echo-selection-header__title">${eventCount} Echos at this location</div>
            </div>
            <div class="echo-selection-events-list">
                ${eventList.map(([eventKey, eventEchos]) => {
                    const [eventName, year] = eventKey.split('|');
                    const firstPhoto = eventEchos[0];
                    const photoCount = eventEchos.length;
                    return `
                        <div class="echo-selection-event-item" data-event-key="${eventKey}">
                            <div class="echo-selection-event-thumbnail">
                                ${photoCount > 1 ? `<div class="echo-selection-photo-count-small">${photoCount} photos</div>` : ''}
                                <img src="${firstPhoto.photoUrl}" alt="${eventName} ${year}">
                            </div>
                            <div class="echo-selection-event-info">
                                <div class="echo-selection-event-name">${eventName}</div>
                                <div class="echo-selection-event-year">${year}</div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
    
    // Attach popupopen handler BEFORE opening popup
    marker.off('popupopen'); // Remove any existing handler to avoid duplicates
    marker.on('popupopen', () => {
        // Use setTimeout to ensure DOM is fully ready
        setTimeout(() => {
            const popupElement = marker.getPopup().getElement();
            if (!popupElement) return;
            
            const eventItems = popupElement.querySelectorAll('.echo-selection-event-item');
            eventItems.forEach(item => {
                item.style.cursor = 'pointer';
                
                // Create click handler
                const handleItemClick = () => {
                    const eventKey = item.getAttribute('data-event-key');
                    const [eventName, year] = eventKey.split('|');
                    const eventEchos = eventsMap.get(eventKey);
                    // Open the first echo from this event
                    if (eventEchos && eventEchos.length > 0 && onEchoSelectedCallback) {
                        marker.closePopup();
                        onEchoSelectedCallback(eventEchos[0]);
                    }
                };
                
                // Remove any existing handler first
                item.removeEventListener('click', handleItemClick);
                item.addEventListener('click', handleItemClick);
            });
        }, 10);
    });
    
    marker.bindPopup(menuContent, { 
        closeButton: true,
        className: 'echo-popup-wrapper-multiple'
    }).openPopup();
}

/**
 * Remove an Echo marker from the map
 * @param {string} echoId - Echo ID to remove
 */
export function removeEchoMarker(echoId) {
    if (!map) {
        console.warn('[mapView] Map not initialized');
        return;
    }
    
    const markerData = markerById.get(echoId);
    if (!markerData) {
        console.warn('[mapView] Marker not found for echo:', echoId);
        return;
    }
    
    const { locationKey } = markerData;
    const locationGroup = markersByLocation.get(locationKey);
    
    if (locationGroup) {
        // Remove echo from group
        locationGroup.echos = locationGroup.echos.filter(e => e.id !== echoId);
        
        // If no more Echos at this location, remove marker
        if (locationGroup.echos.length === 0) {
            if (locationGroup.marker) {
                map.removeLayer(locationGroup.marker);
            }
            markersByLocation.delete(locationKey);
        } else {
            // Update marker to reflect new count
            updateLocationMarker(locationKey, locationGroup);
        }
    }
    
    markerById.delete(echoId);
}

/**
 * Update an existing Echo marker
 * @param {Object} echo - Updated Echo object
 */
export function updateEchoMarker(echo) {
    removeEchoMarker(echo.id);
    addEchoMarker(echo);
}

/**
 * Clear all markers from the map
 */
export function clearAllMarkers() {
    if (!map) {
        console.warn('[mapView] Map not initialized');
        return;
    }
    
    markersByLocation.forEach((locationGroup) => {
        if (locationGroup.marker) {
            map.removeLayer(locationGroup.marker);
        }
    });
    markerById.clear();
    markersByLocation.clear();
}

/**
 * Fit map bounds to show all Echos
 * @param {Array} echos - Array of Echo objects
 */
export function fitBounds(echos) {
    if (!map || !echos || echos.length === 0) {
        return;
    }

    const bounds = echos
        .filter(echo => echo.lat && echo.lng)
        .map(echo => [echo.lat, echo.lng]);

    if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [50, 50] });
    }
}

/**
 * Get the Leaflet map instance
 * @returns {L.Map|null} Map instance or null if not initialized
 */
export function getMap() {
    return map;
}
