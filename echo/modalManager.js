// Modal management: Echo modal display, navigation, open/close

import { checkVideoExists } from './data.js';
import * as appState from './appState.js';

// DOM element references (will be initialized)
let echoModal, echoMedia, echoLocation, echoEvent, echoYear, echoNarration;
let echoNavPrev, echoNavNext, bringToLifeBtn, editEchoBtn, deleteEchoBtn, generatingStatus;

/**
 * Initialize modal manager with DOM element references
 */
export function initModalManager(elements) {
    echoModal = elements.echoModal;
    echoMedia = elements.echoMedia;
    echoLocation = elements.echoLocation;
    echoEvent = elements.echoEvent;
    echoYear = elements.echoYear;
    echoNarration = elements.echoNarration;
    echoNavPrev = elements.echoNavPrev;
    echoNavNext = elements.echoNavNext;
    bringToLifeBtn = elements.bringToLifeBtn;
    editEchoBtn = elements.editEchoBtn;
    deleteEchoBtn = elements.deleteEchoBtn;
    generatingStatus = elements.generatingStatus;
}

/**
 * Open echo modal
 */
export async function openEchoModal(echo, onBringToLife, onEdit) {
    // Find all Echos from the SAME event (same event name and year) at the same location
    // Arrows only navigate between multiple photos of the same event, not between different events
    const echos = appState.getEchos();
    const currentEchoGroup = echos.filter(e => 
        Math.abs(e.lat - echo.lat) < 0.0001 && 
        Math.abs(e.lng - echo.lng) < 0.0001 &&
        e.event === echo.event &&
        e.year === echo.year
    );
    let currentEchoIndex = currentEchoGroup.findIndex(e => e.id === echo.id);
    if (currentEchoIndex === -1) currentEchoIndex = 0;
    
    const currentEcho = currentEchoGroup[currentEchoIndex];
    appState.setCurrentEcho(currentEcho);
    appState.setCurrentEchoGroup(currentEchoGroup);
    appState.setCurrentEchoIndex(currentEchoIndex);
    echoModal.hidden = false;
    
    // Update navigation arrows visibility (only show if multiple photos from same event)
    updateEchoModalNavigation();
    
    // Display current echo
    await displayEchoInModal(currentEcho, onBringToLife, onEdit);
}

/**
 * Update echo modal navigation arrows
 */
export function updateEchoModalNavigation() {
    // Show arrows only if there are multiple photos from the SAME event
    // Different events at the same location must be selected from the popup
    // If only one photo, completely hide arrows (no greyed out arrows)
    const currentEchoGroup = appState.getCurrentEchoGroup();
    const currentEchoIndex = appState.getCurrentEchoIndex();
    const hasMultiplePhotos = currentEchoGroup.length > 1;
    
    if (echoNavPrev) {
        if (hasMultiplePhotos) {
            echoNavPrev.removeAttribute('hidden');
            echoNavPrev.disabled = currentEchoIndex === 0;
        } else {
            echoNavPrev.setAttribute('hidden', '');
        }
    }
    if (echoNavNext) {
        if (hasMultiplePhotos) {
            echoNavNext.removeAttribute('hidden');
            echoNavNext.disabled = currentEchoIndex === currentEchoGroup.length - 1;
        } else {
            echoNavNext.setAttribute('hidden', '');
        }
    }
}

/**
 * Navigate echo modal (previous/next)
 */
export async function navigateEchoModal(direction, onBringToLife, onEdit) {
    const currentEchoGroup = appState.getCurrentEchoGroup();
    const currentEchoIndex = appState.getCurrentEchoIndex();
    const newIndex = currentEchoIndex + direction;
    if (newIndex < 0 || newIndex >= currentEchoGroup.length) return;
    
    appState.setCurrentEchoIndex(newIndex);
    const currentEcho = currentEchoGroup[newIndex];
    appState.setCurrentEcho(currentEcho);
    updateEchoModalNavigation();
    await displayEchoInModal(currentEcho, onBringToLife, onEdit);
}

/**
 * Display echo in modal
 */
export async function displayEchoInModal(echo, onBringToLife, onEdit) {
    // Clear existing media
    echoMedia.innerHTML = '';
    
    // Stop any playing video first
    const existingVideo = echoMedia.querySelector('video');
    if (existingVideo) {
        existingVideo.pause();
        existingVideo.src = '';
    }
    
    // Show photo by default, video only if it exists and is valid
    // Check if video URL is actually valid (not empty/null/placeholder)
    let hasValidVideo = echo.videoUrl && 
                         echo.status === 'completed' && 
                         echo.videoUrl !== echo.photoUrl && // Video URL shouldn't be the same as photo URL
                         !echo.videoUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) && // Video URL shouldn't be an image
                         echo.videoUrl.includes('echo-videos'); // Video should be in videos bucket
    
    // If video URL exists, verify the file actually exists
    if (hasValidVideo) {
        console.log('[modalManager] Checking if video file exists:', echo.videoUrl);
        const videoExists = await checkVideoExists(echo.videoUrl);
        if (!videoExists) {
            console.warn('[modalManager] Video URL exists in database but file not found - treating as no video');
            hasValidVideo = false;
        } else {
            console.log('[modalManager] Video file exists and is accessible');
        }
    }
    
    // Create appropriate element - always prefer photo unless we have a valid video
    let mediaElement;
    let videoLoadFailed = false;
    
    if (hasValidVideo) {
        mediaElement = document.createElement('video');
        mediaElement.className = 'echo-modal__media-element';
        mediaElement.controls = true;
        mediaElement.autoplay = true;
        mediaElement.src = echo.videoUrl;
        
        // Fallback to photo if video fails to load
        mediaElement.addEventListener('error', () => {
            console.warn('[modalManager] Video failed to load, showing photo instead');
            videoLoadFailed = true;
            
            // Replace with photo
            const img = document.createElement('img');
            img.className = 'echo-modal__media-element';
            img.src = echo.photoUrl;
            img.alt = 'Echo photo';
            echoMedia.innerHTML = '';
            echoMedia.appendChild(img);
            
            // Update button visibility since video failed
            if (bringToLifeBtn) bringToLifeBtn.hidden = false;
            if (generatingStatus) generatingStatus.hidden = true;
        });
        
        // Check if video loads successfully
        mediaElement.addEventListener('loadeddata', () => {
            console.log('[modalManager] Video loaded successfully');
            videoLoadFailed = false;
        });
    } else {
        // Always show photo if no valid video
        mediaElement = document.createElement('img');
        mediaElement.className = 'echo-modal__media-element';
        mediaElement.src = echo.photoUrl;
        mediaElement.alt = 'Echo photo';
    }
    
    echoMedia.appendChild(mediaElement);
    
    // Update header info (event, year, location)
    if (echoEvent) {
        echoEvent.textContent = echo.event || 'No event specified';
    }
    if (echoYear) {
        echoYear.textContent = echo.year || '?';
    }
    if (echoLocation) {
        echoLocation.textContent = echo.locationName || 'Unknown Location';
    }
    if (echoNarration) {
        echoNarration.textContent = echo.narration || '';
    }
    
    // Show/hide Bring to Life button
    // Show button if: no valid video exists OR video failed to load (regardless of status)
    // Hide button if: valid video exists AND loads successfully OR currently generating
    
    // If video URL exists but points to a broken file, treat it as no video
    const actuallyHasVideo = hasValidVideo; // Will be updated if video fails to load
    
    if (hasValidVideo && echo.status === 'generating') {
        // Currently generating - show status, hide button
        if (bringToLifeBtn) bringToLifeBtn.hidden = true;
        if (generatingStatus) generatingStatus.hidden = true; // Don't show generating status in modal, it's shown in bell tooltip
    } else if (hasValidVideo) {
        // Has a video URL - but wait to see if it actually loads
        // Start with button hidden, will show if video fails
        if (bringToLifeBtn) bringToLifeBtn.hidden = true;
        if (generatingStatus) generatingStatus.hidden = true;
    } else {
        // No valid video URL - show button
        if (bringToLifeBtn) bringToLifeBtn.hidden = false;
        if (generatingStatus) generatingStatus.hidden = true;
    }
    
    // Always show edit and delete buttons
    if (editEchoBtn) {
        editEchoBtn.removeAttribute('hidden');
        editEchoBtn.style.display = '';
    }
    if (deleteEchoBtn) {
        deleteEchoBtn.removeAttribute('hidden');
        deleteEchoBtn.style.display = ''; // Ensure it's not hidden by inline styles
    } else {
        console.error('[modalManager] Delete button element not found!');
    }
    
    // Note: Button handlers are wired up in app.js wireEventListeners
    // We don't need to wire them here since they're already set up
}

/**
 * Close echo modal
 */
export function closeEchoModal() {
    echoModal.hidden = true;
    appState.setCurrentEcho(null);
    appState.setCurrentEchoGroup([]);
    appState.setCurrentEchoIndex(0);
    // Stop any playing video
    const video = echoMedia.querySelector('video');
    if (video) {
        video.pause();
        video.src = '';
    }
}

/**
 * Get current echo from modal
 */
export function getCurrentEcho() {
    return appState.getCurrentEcho();
}
