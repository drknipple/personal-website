// Simple centralized state store with pub/sub.

const state = {
    locations: [],
    selectedLocationId: null,
    viewMode: 'map', // 'map' | 'list'
    isLoading: false,
    error: null,
    detailOverlayMode: null // null | 'mobile-sheet' | 'desktop-overlay'
};

const subscribers = {
    locations: [],
    selectedLocationId: [],
    viewMode: [],
    isLoading: [],
    error: [],
    detailOverlayMode: []
};

function notify(key) {
    const value = state[key];
    subscribers[key].forEach(fn => {
        try {
            fn(value, state);
        } catch (err) {
            console.error('[state] subscriber error for', key, err);
        }
    });
}

export function subscribe(key, fn) {
    if (!subscribers[key]) {
        throw new Error(`Cannot subscribe to unknown state key: ${key}`);
    }
    subscribers[key].push(fn);
    // Immediately send current value for convenience
    fn(state[key], state);
    return () => {
        const idx = subscribers[key].indexOf(fn);
        if (idx >= 0) subscribers[key].splice(idx, 1);
    };
}

export function getState() {
    return { ...state };
}

export function setLocations(locations) {
    state.locations = Array.isArray(locations) ? locations.slice() : [];
    notify('locations');
}

export function setViewMode(mode) {
    if (mode !== 'map' && mode !== 'list') return;
    if (state.viewMode === mode) return;
    state.viewMode = mode;
    notify('viewMode');
}

export function selectLocation(id, options) {
    if (state.selectedLocationId === id && !options) return;
    state.selectedLocationId = id;
    
    // Set overlay mode based on options or device
    if (options && options.desktopOverlay) {
        // Desktop marker/popup click: bottom-right overlay
        state.detailOverlayMode = 'desktop-overlay';
    } else if (options && options.openSheet) {
        // Mobile: explicitly open sheet (from "More details" button)
        state.detailOverlayMode = 'mobile-sheet';
    } else {
        // Default: mobile-sheet (works for both mobile and desktop list view clicks)
        const isMobile = window.innerWidth <= 768;
        state.detailOverlayMode = isMobile ? 'mobile-sheet' : 'mobile-sheet';
    }
    
    notify('selectedLocationId');
    notify('detailOverlayMode');
}

export function setLoading(isLoading) {
    state.isLoading = !!isLoading;
    notify('isLoading');
}

export function setError(error) {
    state.error = error || null;
    notify('error');
}

