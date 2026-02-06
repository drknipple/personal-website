// Centralized application state management with validation and synchronization

let echos = [];
let isGenerating = false;
let readyVideosAcknowledged = new Set(); // Track which ready videos user has seen
let editingEchoId = null; // Track which echo is being edited
let currentEcho = null;
let currentEchoGroup = []; // All photos from the SAME event (same event name and year)
let currentEchoIndex = 0; // Current index in the group
let selectedPhotos = []; // Photos selected in the upload form

/**
 * Validate echo object structure
 */
function validateEcho(echo) {
    if (!echo || typeof echo !== 'object') {
        throw new Error('Invalid echo: must be an object');
    }
    if (!echo.id) {
        throw new Error('Invalid echo: missing id');
    }
    if (!echo.photoUrl) {
        throw new Error('Invalid echo: missing photoUrl');
    }
    return true;
}

/**
 * Validate echo ID
 */
function validateEchoId(echoId) {
    if (!echoId || typeof echoId !== 'string') {
        throw new Error('Invalid echo ID');
    }
    return true;
}

/**
 * Get all echos
 */
export function getEchos() {
    return echos;
}

/**
 * Set all echos (used when loading from database)
 */
export function setEchos(newEchos) {
    if (!Array.isArray(newEchos)) {
        console.error('[appState] setEchos: expected array, got:', typeof newEchos);
        echos = [];
        return;
    }
    
    // Validate all echos
    const validEchos = [];
    for (const echo of newEchos) {
        try {
            validateEcho(echo);
            validEchos.push(echo);
        } catch (err) {
            console.error('[appState] Invalid echo skipped:', err.message, echo);
        }
    }
    
    echos = validEchos;
    
    // Clean up stale references
    cleanupStaleReferences();
}

/**
 * Clean up stale references (echos that no longer exist)
 */
function cleanupStaleReferences() {
    const validIds = new Set(echos.map(e => e.id));
    
    // Remove acknowledged videos for echos that no longer exist
    for (const id of readyVideosAcknowledged) {
        if (!validIds.has(id)) {
            readyVideosAcknowledged.delete(id);
        }
    }
    
    // Clear editing state if echo no longer exists
    if (editingEchoId && !validIds.has(editingEchoId)) {
        editingEchoId = null;
    }
    
    // Clear current echo if it no longer exists
    if (currentEcho && !validIds.has(currentEcho.id)) {
        currentEcho = null;
        currentEchoGroup = [];
        currentEchoIndex = 0;
    }
    
    // Filter current echo group to only include valid echos
    if (currentEchoGroup.length > 0) {
        currentEchoGroup = currentEchoGroup.filter(e => validIds.has(e.id));
        if (currentEchoIndex >= currentEchoGroup.length) {
            currentEchoIndex = Math.max(0, currentEchoGroup.length - 1);
        }
    }
}

/**
 * Add a new echo
 */
export function addEcho(echo) {
    validateEcho(echo);
    
    // Check for duplicates
    if (echos.find(e => e.id === echo.id)) {
        console.warn('[appState] Echo with ID already exists, updating instead:', echo.id);
        updateEcho(echo.id, echo);
        return;
    }
    
    echos.push(echo);
}

/**
 * Update an existing echo
 */
export function updateEcho(echoId, updates) {
    validateEchoId(echoId);
    
    if (!updates || typeof updates !== 'object') {
        throw new Error('Updates must be an object');
    }
    
    const index = echos.findIndex(e => e.id === echoId);
    if (index === -1) {
        console.warn('[appState] Echo not found for update:', echoId);
        return;
    }
    
    const updated = { ...echos[index], ...updates };
    validateEcho(updated);
    echos[index] = updated;
    
    // Update current echo if it's the one being updated
    if (currentEcho && currentEcho.id === echoId) {
        currentEcho = updated;
    }
    
    // Update in current echo group if present
    const groupIndex = currentEchoGroup.findIndex(e => e.id === echoId);
    if (groupIndex !== -1) {
        currentEchoGroup[groupIndex] = updated;
    }
}

/**
 * Remove an echo
 */
export function removeEcho(echoId) {
    validateEchoId(echoId);
    
    echos = echos.filter(e => e.id !== echoId);
    
    // Clean up references
    readyVideosAcknowledged.delete(echoId);
    
    if (editingEchoId === echoId) {
        editingEchoId = null;
    }
    
    if (currentEcho && currentEcho.id === echoId) {
        currentEcho = null;
        currentEchoGroup = [];
        currentEchoIndex = 0;
    } else {
        // Remove from current echo group
        currentEchoGroup = currentEchoGroup.filter(e => e.id !== echoId);
        if (currentEchoIndex >= currentEchoGroup.length) {
            currentEchoIndex = Math.max(0, currentEchoGroup.length - 1);
        }
    }
}

/**
 * Find echo by ID
 */
export function findEchoById(echoId) {
    return echos.find(e => e.id === echoId);
}

/**
 * Get generating state
 */
export function getIsGenerating() {
    return isGenerating;
}

/**
 * Set generating state
 */
export function setIsGenerating(value) {
    isGenerating = value;
}

/**
 * Check if video has been acknowledged
 */
export function isVideoAcknowledged(echoId) {
    return readyVideosAcknowledged.has(echoId);
}

/**
 * Mark video as acknowledged
 */
export function acknowledgeVideo(echoId) {
    readyVideosAcknowledged.add(echoId);
}

/**
 * Get editing echo ID
 */
export function getEditingEchoId() {
    return editingEchoId;
}

/**
 * Set editing echo ID
 */
export function setEditingEchoId(echoId) {
    editingEchoId = echoId;
}

/**
 * Clear editing state
 */
export function clearEditingState() {
    editingEchoId = null;
}

/**
 * Get current echo (for modal)
 */
export function getCurrentEcho() {
    return currentEcho;
}

/**
 * Set current echo (for modal)
 */
export function setCurrentEcho(echo) {
    currentEcho = echo;
}

/**
 * Get current echo group (for modal navigation)
 */
export function getCurrentEchoGroup() {
    return currentEchoGroup;
}

/**
 * Set current echo group
 */
export function setCurrentEchoGroup(group) {
    currentEchoGroup = group;
}

/**
 * Get current echo index
 */
export function getCurrentEchoIndex() {
    return currentEchoIndex;
}

/**
 * Set current echo index
 */
export function setCurrentEchoIndex(index) {
    if (typeof index !== 'number' || index < 0) {
        console.error('[appState] Invalid index:', index);
        return;
    }
    
    if (index >= currentEchoGroup.length) {
        console.warn('[appState] Index out of bounds, clamping to', currentEchoGroup.length - 1);
        currentEchoIndex = Math.max(0, currentEchoGroup.length - 1);
    } else {
        currentEchoIndex = index;
    }
    
    // Update current echo to match index
    if (currentEchoGroup.length > 0 && currentEchoIndex < currentEchoGroup.length) {
        currentEcho = currentEchoGroup[currentEchoIndex];
    }
}

/**
 * Get selected photos (for upload form)
 */
export function getSelectedPhotos() {
    return selectedPhotos;
}

/**
 * Set selected photos
 */
export function setSelectedPhotos(photos) {
    selectedPhotos = photos;
}

/**
 * Clear selected photos
 */
export function clearSelectedPhotos() {
    selectedPhotos = [];
}

/**
 * Get state summary for debugging
 */
export function getStateSummary() {
    return {
        echosCount: echos.length,
        isGenerating,
        acknowledgedVideosCount: readyVideosAcknowledged.size,
        editingEchoId,
        hasCurrentEcho: !!currentEcho,
        currentEchoGroupSize: currentEchoGroup.length,
        currentEchoIndex,
        selectedPhotosCount: selectedPhotos.length
    };
}

/**
 * Validate state consistency
 */
export function validateState() {
    const issues = [];
    
    // Check current echo is in group
    if (currentEcho && currentEchoGroup.length > 0) {
        const inGroup = currentEchoGroup.some(e => e.id === currentEcho.id);
        if (!inGroup) {
            issues.push('Current echo not in current echo group');
        }
    }
    
    // Check index is valid
    if (currentEchoIndex >= currentEchoGroup.length && currentEchoGroup.length > 0) {
        issues.push('Current echo index out of bounds');
    }
    
    // Check editing echo exists
    if (editingEchoId && !echos.find(e => e.id === editingEchoId)) {
        issues.push('Editing echo ID references non-existent echo');
    }
    
    // Check acknowledged videos exist
    for (const id of readyVideosAcknowledged) {
        if (!echos.find(e => e.id === id)) {
            issues.push(`Acknowledged video ID ${id} references non-existent echo`);
        }
    }
    
    if (issues.length > 0) {
        console.warn('[appState] State validation issues:', issues);
        return false;
    }
    
    return true;
}
