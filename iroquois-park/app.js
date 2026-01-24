import { subscribe, setLocations, setViewMode, selectLocation, getState, setLoading, setError } from './state.js';
import { loadLocations, saveLocation, geocodeAddress } from './data.js';
import { initMap, syncMarkers, focusOnLocation, resizeMap, openMarkerPopup } from './mapView.js';
import { initListView, renderList } from './listView.js';
import { initDetailView, openForLocation, openForNewLocation, openForEdit, openGalleryForLocation, close as closeDetail } from './detailView.js';

function init() {
    // Init map first so Leaflet has a container
    initMap({
        onLocationSelected: (id, options) => {
            setViewMode('map');
            // Store overlay mode in a way detailView can access it
            if (options && options.desktopOverlay) {
                selectLocation(id, { desktopOverlay: true });
            } else {
                selectLocation(id);
            }
        }
    });

    initDetailView({
        onClose: () => {
            // When detail closes, keep selection but nothing else to do for now
        },
        onSaveLocation: handleSaveLocation
    });

    initListView({
        onLocationSelected: id => {
            setViewMode('map');
            selectLocation(id);
        },
        onAddLocation: () => {
            openForNewLocation(null);
        },
        onEditLocation: location => {
            setViewMode('map');
            openForEdit(location);
        },
        onOpenGallery: (location, index) => {
            openGalleryForLocation(location, index || 0);
        },
        onViewOnMap: id => {
            setViewMode('map');
            // Find location, center map, and show popup (don't open sheet)
            const location = getState().locations.find(loc => loc.id === id);
            if (location) {
                focusOnLocation(location, { forSheet: false });
                // Wait for map view to be active, then show popup
                setTimeout(() => {
                    openMarkerPopup(id);
                }, 150);
            }
        }
    });

    wireBottomNav();
    wireMapAddButton();

    subscribe('locations', (locations, state) => {
        syncMarkers(locations);
        renderList(locations, state.selectedLocationId);
    });

    subscribe('viewMode', mode => {
        const mapView = document.getElementById('view-map');
        const listView = document.getElementById('view-list');
        const mapBtn = document.getElementById('nav-map-btn');
        const listBtn = document.getElementById('nav-list-btn');

        if (mapView && listView) {
            if (mode === 'map') {
                mapView.classList.add('is-active');
                listView.classList.remove('is-active');
                resizeMap();
            } else {
                listView.classList.add('is-active');
                mapView.classList.remove('is-active');
            }
        }

        if (mapBtn && listBtn) {
            if (mode === 'map') {
                mapBtn.classList.add('bottom-nav__btn--active');
                listBtn.classList.remove('bottom-nav__btn--active');
            } else {
                listBtn.classList.add('bottom-nav__btn--active');
                mapBtn.classList.remove('bottom-nav__btn--active');
            }
        }
    });

    subscribe('selectedLocationId', (selectedId, state) => {
        const location = state.locations.find(loc => loc.id === selectedId);
        if (!location) {
            closeDetail();
            return;
        }
        const overlayMode = state.detailOverlayMode || (window.innerWidth <= 768 ? 'mobile-sheet' : null);
        const forSheet = overlayMode === 'mobile-sheet';
        focusOnLocation(location, { forSheet });
        openForLocation(location, { overlayMode });
    });

    // Initial load
    loadAllLocations();
}

async function loadAllLocations() {
    setLoading(true);
    setError(null);
    try {
        const locations = await loadLocations();
        setLocations(locations);
    } catch (err) {
        console.error('[app] Failed to load locations:', err);
        setError(err.message || 'Failed to load locations.');
    } finally {
        setLoading(false);
    }
}

async function handleSaveLocation(input) {
    // input: { id?, name, description, address?, yearAcquired?, hours?, images[], lat?, lng?, needsGeocode, addressForGeocode }
    let lat = input.lat;
    let lng = input.lng;

    if (input.needsGeocode && input.addressForGeocode) {
        const { lat: gLat, lng: gLng } = await geocodeAddress(input.addressForGeocode);
        lat = gLat;
        lng = gLng;
    }

    if (typeof lat !== 'number' || typeof lng !== 'number' || Number.isNaN(lat) || Number.isNaN(lng)) {
        throw new Error('Could not determine latitude and longitude for this location.');
    }

    const toSave = {
        id: input.id,
        name: input.name,
        description: input.description,
        address: input.address,
        yearAcquired: input.yearAcquired,
        hours: input.hours,
        images: input.images || [],
        lat,
        lng
    };

    const saved = await saveLocation(toSave);

    // Reload all locations from Supabase to keep markers + list in sync
    await loadAllLocations();
    selectLocation(saved.id);

    return saved;
}

function wireBottomNav() {
    const mapBtn = document.getElementById('nav-map-btn');
    const listBtn = document.getElementById('nav-list-btn');

    if (mapBtn) {
        mapBtn.addEventListener('click', () => {
            setViewMode('map');
        });
    }
    if (listBtn) {
        listBtn.addEventListener('click', () => {
            setViewMode('list');
        });
    }
}

function wireMapAddButton() {
    const addMapBtn = document.getElementById('add-location-map-btn');
    if (!addMapBtn) return;

    addMapBtn.addEventListener('click', () => {
        openForNewLocation(null);
    });
}

document.addEventListener('DOMContentLoaded', init);

