// Main application logic for Echos

import { uploadPhoto, uploadVideo, geocodeAddress, saveEcho, updateEcho, loadEchos, deleteEcho, checkBuckets, checkVideoExists } from './data.js';
import { initMap, addEchoMarker, clearAllMarkers, fitBounds, getMap, setAllEchos } from './mapView.js';
import { cleanAddressString } from './addressFormatter.js';
import * as appState from './appState.js';
import * as formHandler from './formHandler.js';
import * as modalManager from './modalManager.js';
import * as aiGeneration from './aiGeneration.js';
import * as notifications from './notifications.js';
import { handleError, getUserFriendlyMessage } from './errorHandler.js';
import { guard } from './operationGuard.js';

// DOM elements
const newEchoBtn = document.getElementById('new-echo-btn');
const uploadFormOverlay = document.getElementById('upload-form-overlay');
const closeFormBtn = document.getElementById('close-form-btn');
const cancelFormBtn = document.getElementById('cancel-form-btn');
const echoForm = document.getElementById('echo-form');
const photoInput = document.getElementById('photo-input');
const photoPreview = document.getElementById('photo-preview');
const photoUploadArea = document.getElementById('photo-upload-area');
const photoCountHelp = document.getElementById('photo-count-help');
const eventInput = document.getElementById('event-input');
const narrationInput = document.getElementById('narration-input');
const locationInput = document.getElementById('location-input');
const yearInput = document.getElementById('year-input');
const pickLocationBtn = document.getElementById('pick-location-btn');
const captionModeRadios = document.querySelectorAll('input[name="caption-mode"]');
const sharedNarrationGroup = document.getElementById('shared-narration-group');
const individualCaptionsGroup = document.getElementById('individual-captions-group');
const individualCaptionsContainer = document.getElementById('individual-captions-container');
const formTitle = document.querySelector('.upload-form-overlay__header h2');
const submitFormBtn = document.getElementById('submit-form-btn');
const formLoading = document.getElementById('form-loading');
const formError = document.getElementById('form-error');
const echoModal = document.getElementById('echo-modal');
const closeEchoBtn = document.getElementById('close-echo-btn');
const echoMedia = document.getElementById('echo-media');
const echoLocation = document.getElementById('echo-location');
const echoEvent = document.getElementById('echo-event');
const echoYear = document.getElementById('echo-year');
const echoNarration = document.getElementById('echo-narration');
const echoNavPrev = document.getElementById('echo-nav-prev');
const echoNavNext = document.getElementById('echo-nav-next');
const bringToLifeBtn = document.getElementById('bring-to-life-btn');
const editEchoBtn = document.getElementById('edit-echo-btn');
const deleteEchoBtn = document.getElementById('delete-echo-btn');
const generatingStatus = document.getElementById('generating-status');
const notification = document.getElementById('notification');
const notificationText = document.getElementById('notification-text');
const deleteConfirmModal = document.getElementById('delete-confirm-modal');
const deleteCancelBtn = document.getElementById('delete-cancel-btn');
const deleteConfirmBtn = document.getElementById('delete-confirm-btn');
const notificationBell = document.getElementById('notification-bell');
const bellBadge = document.getElementById('bell-badge');
const bellTooltip = document.getElementById('bell-tooltip');
const bellTooltipText = document.getElementById('bell-tooltip-text');
const bellTooltipClose = document.getElementById('bell-tooltip-close');
const bellDropdown = document.getElementById('bell-dropdown');
const bellDropdownList = document.getElementById('bell-dropdown-list');
const bellDropdownClose = document.getElementById('bell-dropdown-close');

// Initialize app
async function init() {
    // Check buckets (for debugging)
    await checkBuckets();
    
    // Initialize form handler with DOM elements
    formHandler.initFormHandler({
        uploadFormOverlay,
        echoForm,
        photoInput,
        photoPreview,
        photoCountHelp,
        eventInput,
        narrationInput,
        locationInput,
        yearInput,
        pickLocationBtn,
        captionModeRadios,
        sharedNarrationGroup,
        individualCaptionsGroup,
        individualCaptionsContainer,
        formTitle,
        submitFormBtn,
        formLoading,
        formError
    });
    
    // Initialize modal manager with DOM elements
    modalManager.initModalManager({
        echoModal,
        echoMedia,
        echoLocation,
        echoEvent,
        echoYear,
        echoNarration,
        echoNavPrev,
        echoNavNext,
        bringToLifeBtn,
        editEchoBtn,
        deleteEchoBtn,
        generatingStatus
    });
    
    // Initialize notifications with DOM elements
    notifications.initNotifications({
        notification,
        notificationText,
        notificationBell,
        bellBadge,
        bellTooltip,
        bellTooltipText,
        bellTooltipClose,
        bellDropdown,
        bellDropdownList,
        bellDropdownClose
    });
    
    // Initialize AI generation with callbacks
    aiGeneration.initAIGeneration({
        onVideoReady: (echo) => {
            notifications.updateBellForReadyVideo(echo);
            notifications.updateBellBadge();
            // Refresh modal if open
            const currentEcho = modalManager.getCurrentEcho();
            if (currentEcho && currentEcho.id === echo.id) {
                const updatedEcho = appState.findEchoById(echo.id);
                if (updatedEcho) {
                    modalManager.displayEchoInModal(updatedEcho, handleBringToLife, () => {
                        const echoToEdit = modalManager.getCurrentEcho();
                        if (!echoToEdit) return;
                        modalManager.closeEchoModal();
                        formHandler.openUploadForm(echoToEdit, showError, showNotification);
                    });
                }
            }
        },
        onVideoFailed: (echoId, error) => {
            const currentEcho = modalManager.getCurrentEcho();
            if (currentEcho && currentEcho.id === echoId) {
                modalManager.displayEchoInModal(appState.findEchoById(echoId), handleBringToLife, () => {
                    const echoToEdit = modalManager.getCurrentEcho();
                    if (!echoToEdit) return;
                    modalManager.closeEchoModal();
                    formHandler.openUploadForm(echoToEdit, showError, showNotification);
                });
            }
            notifications.showNotification('Video generation failed. Your photo is safe in the photos bucket.');
        },
        onPollingUpdate: (seconds) => {
            // Could update UI here if needed
        },
        loadAllEchos: loadAllEchos
    });
    
    // Initialize map
    initMap({
        onEchoSelected: (echo) => {
            modalManager.openEchoModal(echo, handleBringToLife, () => {
                const currentEcho = modalManager.getCurrentEcho();
                if (!currentEcho) return;
                const echoToEdit = currentEcho;
                modalManager.closeEchoModal();
                formHandler.openUploadForm(echoToEdit, showError, showNotification);
            });
        }
    });

    // Load existing Echos
    await loadAllEchos();
    
    // Update bell state based on loaded Echos
    notifications.updateBellState();

    // Wire up event listeners
    wireEventListeners();
}

function wireEventListeners() {
    // New Echo button
    newEchoBtn.addEventListener('click', () => {
        formHandler.openUploadForm(null, showError, showNotification);
    });

    // Close form buttons
    closeFormBtn.addEventListener('click', formHandler.closeUploadForm);
    cancelFormBtn.addEventListener('click', formHandler.closeUploadForm);

    // Form submission
    echoForm.addEventListener('submit', handleFormSubmit);

    // Photo preview
    photoInput.addEventListener('change', (e) => {
        formHandler.handlePhotoPreview(e, showError);
    });
    
    // Add a click handler to re-enable file input when clicking empty space in preview
    photoPreview.addEventListener('click', (e) => {
        // If clicking on empty space (not a preview item), allow file input to work
        if (!e.target.closest('.photo-preview-item') && photoPreview.classList.contains('has-photos')) {
            // Temporarily enable file input
            photoInput.style.pointerEvents = 'auto';
            photoInput.style.zIndex = '2';
            photoInput.click();
            // Disable again after a moment
            setTimeout(() => {
                if (photoPreview.classList.contains('has-photos')) {
                    photoInput.style.pointerEvents = 'none';
                    photoInput.style.zIndex = '0';
                }
            }, 100);
        }
    });

    // Drag and drop for photos
    photoUploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        photoUploadArea.classList.add('dragover');
    });

    photoUploadArea.addEventListener('dragleave', () => {
        photoUploadArea.classList.remove('dragover');
    });

    photoUploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        photoUploadArea.classList.remove('dragover');
        const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
        if (files.length > 0) {
            const dataTransfer = new DataTransfer();
            files.forEach(f => dataTransfer.items.add(f));
            photoInput.files = dataTransfer.files;
            handlePhotoPreview({ target: { files: dataTransfer.files } });
        }
    });

    // Caption mode change
    captionModeRadios.forEach(radio => {
        radio.addEventListener('change', formHandler.handleCaptionModeChange);
    });

    // Map location picker
    if (pickLocationBtn) {
        pickLocationBtn.addEventListener('click', () => {
            formHandler.handlePickLocationOnMap(showNotification, showError);
        });
    }

    // Echo modal close
    closeEchoBtn.addEventListener('click', modalManager.closeEchoModal);
    echoModal.querySelector('.echo-modal__backdrop').addEventListener('click', modalManager.closeEchoModal);
    
    // Navigation arrows
    if (echoNavPrev) {
        echoNavPrev.addEventListener('click', () => {
            modalManager.navigateEchoModal(-1, handleBringToLife, () => {
                const currentEcho = modalManager.getCurrentEcho();
                if (!currentEcho) return;
                const echoToEdit = currentEcho;
                modalManager.closeEchoModal();
                formHandler.openUploadForm(echoToEdit, showError, showNotification);
            });
        });
    }
    if (echoNavNext) {
        echoNavNext.addEventListener('click', () => {
            modalManager.navigateEchoModal(1, handleBringToLife, () => {
                const currentEcho = modalManager.getCurrentEcho();
                if (!currentEcho) return;
                const echoToEdit = currentEcho;
                modalManager.closeEchoModal();
                formHandler.openUploadForm(echoToEdit, showError, showNotification);
            });
        });
    }
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        const currentEchoGroup = appState.getCurrentEchoGroup();
        if (!echoModal.hidden && currentEchoGroup.length > 1) {
            if (e.key === 'ArrowLeft') {
                modalManager.navigateEchoModal(-1, handleBringToLife, () => {
                    const currentEcho = modalManager.getCurrentEcho();
                    if (!currentEcho) return;
                    const echoToEdit = currentEcho;
                    modalManager.closeEchoModal();
                    formHandler.openUploadForm(echoToEdit, showError, showNotification);
                });
            } else if (e.key === 'ArrowRight') {
                modalManager.navigateEchoModal(1, handleBringToLife, () => {
                    const currentEcho = modalManager.getCurrentEcho();
                    if (!currentEcho) return;
                    const echoToEdit = currentEcho;
                    modalManager.closeEchoModal();
                    formHandler.openUploadForm(echoToEdit, showError, showNotification);
                });
            }
        }
    });
    
    // Edit Echo button
    editEchoBtn.addEventListener('click', () => {
        const currentEcho = modalManager.getCurrentEcho();
        if (!currentEcho) return;
        const echoToEdit = currentEcho;
        modalManager.closeEchoModal();
        formHandler.openUploadForm(echoToEdit, showError, showNotification);
    });
    
    // Delete Echo button
    deleteEchoBtn.addEventListener('click', () => {
        const currentEcho = modalManager.getCurrentEcho();
        if (currentEcho) {
            openDeleteConfirm();
        }
    });
    
    // Delete confirmation buttons
    deleteCancelBtn.addEventListener('click', closeDeleteConfirm);
    deleteConfirmBtn.addEventListener('click', handleDeleteEcho);
    deleteConfirmModal.querySelector('.delete-confirm-modal__backdrop').addEventListener('click', closeDeleteConfirm);
    
    // Notification bell
    notificationBell.addEventListener('click', () => {
        notifications.handleBellClick((echo) => {
            modalManager.openEchoModal(echo, handleBringToLife, () => {
                const echoToEdit = modalManager.getCurrentEcho();
                if (!echoToEdit) return;
                modalManager.closeEchoModal();
                formHandler.openUploadForm(echoToEdit, showError, showNotification);
            });
        });
    });
    bellTooltipClose.addEventListener('click', notifications.hideBellTooltip);
    bellDropdownClose.addEventListener('click', notifications.closeBellDropdown);
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!notificationBell.contains(e.target) && !bellDropdown.contains(e.target)) {
            notifications.closeBellDropdown();
        }
    });
}

// Form functions moved to formHandler.js

async function reverseGeocode(lat, lng) {
    try {
        const proxyUrl = 'https://api.allorigins.win/raw?url=';
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
        const response = await fetch(proxyUrl + encodeURIComponent(url));
        const data = await response.json();
        
        // Format address using addressFormatter module
        // Try to format from structured data first
        const addr = data.address || {};
        const parts = [];
        
        // House number and street (no comma between them)
        if (addr.house_number && addr.road) {
            parts.push(`${addr.house_number} ${addr.road}`);
        } else if (addr.road) {
            parts.push(addr.road);
        } else if (addr.house_number) {
            parts.push(addr.house_number);
        }
        
        // City (or town, or village)
        if (addr.city) {
            parts.push(addr.city);
        } else if (addr.town) {
            parts.push(addr.town);
        } else if (addr.village) {
            parts.push(addr.village);
        }
        
        // State and ZIP code together
        const stateZip = [];
        if (addr.state) {
            stateZip.push(addr.state);
        }
        if (addr.postcode) {
            stateZip.push(addr.postcode);
        }
        if (stateZip.length > 0) {
            parts.push(stateZip.join(' '));
        }
        
        // Return formatted address or fallback
        if (parts.length > 0) {
            return parts.join(', ');
        }
        
        // Fallback: use addressFormatter to clean display_name
        const displayName = data.display_name || '';
        if (displayName) {
            return cleanAddressString(displayName) || `${lat}, ${lng}`;
        }
        return `${lat}, ${lng}`;
    } catch (error) {
        console.error('[app] Reverse geocoding failed:', error);
        return `${lat}, ${lng}`;
    }
}

async function handleFormSubmit(e) {
    e.preventDefault();
    
    // Guard against concurrent submissions
    if (appState.getIsGenerating()) {
        notifications.showNotification('Please wait for the current operation to complete.');
        return;
    }
    
    // Use operation guard to prevent race conditions
    return guard('form-submit', async () => {
        // Validate form
        const validation = formHandler.validateForm();
        if (!validation.valid) {
            formHandler.showFormError(validation.error);
            return;
        }

        const formData = formHandler.getFormData();
        const event = formData.event;
        const location = formData.location;
        const year = formData.year;
        const captionMode = formData.captionMode;

        // Show loading state
        appState.setIsGenerating(true);
        formHandler.hideFormError();
        formHandler.setFormLoading(true, 'Creating your Echo...');

        try {
        // Step 1: Geocode location (once for all photos)
        // In edit mode, check if location changed before geocoding
        let locationName, lat, lng;
        let originalEcho = null;
        const editingEchoId = appState.getEditingEchoId();
        
        if (editingEchoId) {
            originalEcho = appState.findEchoById(editingEchoId);
            if (!originalEcho) {
                throw new Error('Echo not found for editing');
            }
            
            // Check if location actually changed
            const locationChanged = location.trim() !== (originalEcho.locationName || '').trim();
            
            if (locationChanged) {
                // Location changed - geocode the new address
                console.log('[app] Location changed, geocoding new address:', location);
                try {
                    const geoResult = await geocodeAddress(location);
                    locationName = geoResult.displayName || location;
                    lat = geoResult.lat;
                    lng = geoResult.lng;
                    console.log('[app] Geocoding successful:', { locationName, lat, lng });
                } catch (error) {
                    console.error('[app] Geocoding failed:', error);
                    // If geocoding fails, show error to user
                    formHandler.showFormError(`Could not find location for "${location}". Please use the map picker to select the location.`);
                    throw error;
                }
            } else {
                // Location didn't change - use existing coordinates and formatted address
                console.log('[app] Location unchanged, using existing coordinates');
                locationName = originalEcho.locationName || location;
                lat = originalEcho.lat;
                lng = originalEcho.lng;
            }
        } else {
            // Creating new echo - check if coordinates were picked from map
            const pickedLat = locationInput?.dataset.pickedLat;
            const pickedLng = locationInput?.dataset.pickedLng;
            
            if (pickedLat && pickedLng) {
                // Use coordinates from map picker (no need to geocode)
                console.log('[app] Using coordinates from map picker:', pickedLat, pickedLng);
                lat = parseFloat(pickedLat);
                lng = parseFloat(pickedLng);
                locationName = location; // Use the address that was reverse-geocoded
                // Clear the data attributes for next time
                delete locationInput.dataset.pickedLat;
                delete locationInput.dataset.pickedLng;
            } else {
                // No map picker used - geocode the address
                console.log('[app] Creating new echo, geocoding location:', location);
                const geoResult = await geocodeAddress(location);
                locationName = geoResult.displayName || location;
                lat = geoResult.lat;
                lng = geoResult.lng;
            }
        }
        
        console.log('[app] Using coordinates:', { lat, lng, locationName });

        // Step 2: Get captions based on mode
        let captions = [];
        const selectedPhotos = appState.getSelectedPhotos();
        if (captionMode === 'shared') {
            const sharedCaption = formData.sharedNarration;
            captions = selectedPhotos.map(() => sharedCaption);
        } else {
            captions = formData.individualCaptions;
        }

        // Step 3: Handle photos - in edit mode, manage all photos from the same event
        if (editingEchoId) {
            // originalEcho was already found above, reuse it
            const echos = appState.getEchos();
            const sameEventEchos = echos.filter(e => 
                Math.abs(e.lat - originalEcho.lat) < 0.0001 && 
                Math.abs(e.lng - originalEcho.lng) < 0.0001 &&
                e.event === originalEcho.event &&
                e.year === originalEcho.year
            );
            
            // Get IDs of photos that are still selected (existing photos kept)
            const keptPhotoIds = selectedPhotos
                .filter(p => p.id?.startsWith('existing-'))
                .map(p => p.id.replace('existing-', ''));
            
            // Delete echos that were removed
            const echosToDelete = sameEventEchos.filter(e => !keptPhotoIds.includes(e.id));
            for (const echoToDelete of echosToDelete) {
                await deleteEcho(echoToDelete.id);
            }
            
            // Process selected photos: update existing or create new
            const createdEchos = [];
            
            for (let i = 0; i < selectedPhotos.length; i++) {
                const photo = selectedPhotos[i];
                const caption = captions[i] || captions[0] || '';
                
                formHandler.setFormLoading(true, `Saving changes... (${i + 1}/${selectedPhotos.length})`);
                
                let photoUrl;
                let echoIdToUpdate = null;
                
                if (photo.id?.startsWith('existing-')) {
                    // Existing photo - update it
                    echoIdToUpdate = photo.id.replace('existing-', '');
                    const existingEcho = echos.find(e => e.id === echoIdToUpdate);
                    if (existingEcho) {
                        photoUrl = existingEcho.photoUrl;
                    } else {
                        throw new Error('Existing echo not found');
                    }
                } else if (photo.file) {
                    // New photo - upload it
                    console.log(`[app] Uploading new photo ${i + 1}/${selectedPhotos.length}...`);
                    photoUrl = await uploadPhoto(photo.file);
                } else {
                    throw new Error('No photo file provided');
                }
                
                // Update existing echo or create new one
                if (echoIdToUpdate) {
                    const existingEcho = echos.find(e => e.id === echoIdToUpdate);
                    const echoData = {
                        userId: existingEcho.userId,
                        photoUrl,
                        event,
                        narration: caption,
                        locationName,
                        lat,
                        lng,
                        year,
                        videoUrl: existingEcho.videoUrl,
                        status: existingEcho.status
                    };
                    const updatedEcho = await updateEcho(echoIdToUpdate, echoData);
                    appState.updateEcho(echoIdToUpdate, updatedEcho);
                    createdEchos.push(updatedEcho);
                } else {
                    // Create new echo for new photo
                    const echoData = {
                        userId: originalEcho.userId,
                        photoUrl,
                        event,
                        narration: caption,
                        locationName,
                        lat,
                        lng,
                        year
                    };
                    const newEcho = await saveEcho(echoData);
                    appState.addEcho(newEcho);
                    createdEchos.push(newEcho);
                }
            }
            
            // Reload all echos to refresh the map
            await loadAllEchos();
            
            // Close form first
            formHandler.closeUploadForm();
            
            // Reopen echo modal with the first updated echo
            if (createdEchos.length > 0) {
                const updatedEcho = createdEchos[0];
                modalManager.openEchoModal(updatedEcho, handleBringToLife, () => {
                    const echoToEdit = modalManager.getCurrentEcho();
                    if (!echoToEdit) return;
                    modalManager.closeEchoModal();
                    formHandler.openUploadForm(echoToEdit, showError, showNotification);
                });
            }
            
            // Show success message
            notifications.showNotification(`Echo updated successfully!`, 3000);
            
            return;
        }
        
        // Create new echos (non-edit mode)
        const createdEchos = [];
        
        for (let i = 0; i < selectedPhotos.length; i++) {
            const photo = selectedPhotos[i];
            const caption = captions[i] || captions[0] || '';
            
            // Update loading message
            formHandler.setFormLoading(true, `Creating Echo ${i + 1} of ${selectedPhotos.length}...`);

            let photoUrl;
            if (photo.file) {
                // Upload new photo
                console.log(`[app] Uploading photo ${i + 1}/${selectedPhotos.length}...`);
                photoUrl = await uploadPhoto(photo.file);
            } else {
                throw new Error('No photo file provided');
            }

            // Create Echo record
            {
                // Create new echo
                console.log(`[app] Saving Echo record ${i + 1}...`);
                const echoData = {
                    userId: 'eric',
                    photoUrl,
                    event,
                    narration: caption,
                    locationName,
                    lat,
                    lng,
                    year,
                    status: 'pending'
                };
                const savedEcho = await saveEcho(echoData);
                appState.addEcho(savedEcho);
                addEchoMarker(savedEcho);
                createdEchos.push(savedEcho);
            }
        }

        // Success!
        formHandler.closeUploadForm();
        const count = createdEchos.length;
        if (editingEchoId) {
            notifications.showNotification('Echo updated successfully!');
        } else {
            notifications.showNotification(count === 1 
                ? 'Echo created! Click the pin on the map to view it.'
                : `${count} Echos created! They are grouped at the same location on the map.`
            );
        }
        
        // Reload Echos to show the new ones
        await loadAllEchos();

    } catch (error) {
        const handled = handleError(error, 'form-submit', (msg) => {
            formHandler.showFormError(msg);
        });
        console.error('[app] Error creating Echo(s):', handled);
        } finally {
            appState.setIsGenerating(false);
            formHandler.setFormLoading(false);
        }
    });
}

// AI generation functions moved to aiGeneration.js

// Wrapper for backward compatibility
async function generateAIVideo(photoUrl, narration) {
    return aiGeneration.generateAIVideo(photoUrl, narration);
}

async function loadAllEchos() {
    return guard('load-echos', async () => {
        try {
            const loadedEchos = await loadEchos();
            appState.setEchos(loadedEchos);
            
            // Validate state after loading
            appState.validateState();
            
            clearAllMarkers();
            // Update mapView with all Echos for popup calculations
            setAllEchos(loadedEchos);
            loadedEchos.forEach(echo => {
                if (echo.lat && echo.lng) {
                    addEchoMarker(echo);
                }
            });
            if (loadedEchos.length > 0) {
                fitBounds(loadedEchos);
            }
            
            // Update bell state
            notifications.updateBellState();
            
            // Check if we should start polling for video status
            const hasGenerating = loadedEchos.some(e => e.status === 'generating');
            if (hasGenerating && !aiGeneration.isPolling()) {
                aiGeneration.startVideoStatusPolling(
                    (echo) => {
                        notifications.updateBellForReadyVideo(echo);
                        notifications.updateBellBadge();
                        const currentEcho = modalManager.getCurrentEcho();
                        if (currentEcho && currentEcho.id === echo.id) {
                            const updatedEcho = appState.findEchoById(echo.id);
                            if (updatedEcho) {
                                modalManager.displayEchoInModal(updatedEcho, handleBringToLife, () => {
                                    const echoToEdit = modalManager.getCurrentEcho();
                                    if (!echoToEdit) return;
                                    modalManager.closeEchoModal();
                                    formHandler.openUploadForm(echoToEdit, showError, showNotification);
                                });
                            }
                        }
                    },
                    (echoId, error) => {
                        const handled = handleError(error, 'video-polling', (msg) => {
                            notifications.showNotification(msg);
                        });
                    },
                    loadEchos
                );
            }
        } catch (error) {
            const handled = handleError(error, 'load-echos', (msg) => {
                notifications.showNotification(`Failed to load Echos: ${msg}`);
            });
        }
    });
}

// Modal functions moved to modalManager.js

async function handleBringToLife() {
    const currentEcho = modalManager.getCurrentEcho();
    if (!currentEcho) return;
    
    // Guard against concurrent video generation for the same echo
    const operationId = `bring-to-life-${currentEcho.id}`;
    return guard(operationId, async () => {
        // Disable button and show generating status
        bringToLifeBtn.hidden = true;
        generatingStatus.hidden = false;
        
        try {
        // Step 1: Attempt to connect to Runway and create job
        console.log('[app] Attempting to connect to Runway...');
        const videoUrl = await generateAIVideo(currentEcho.photoUrl, currentEcho.narration);
        
        // If we get here, Runway connection succeeded and job was created
        // (generateAIVideo either returns a video URL or throws an error)
        
        // Check if it's a placeholder (shouldn't happen if Runway connected, but safety check)
        const isPlaceholder = videoUrl === currentEcho.photoUrl || 
                             videoUrl.includes('echo-photos') ||
                             videoUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i);
        
        if (isPlaceholder) {
            throw new Error('Placeholder returned - Runway connection may have failed');
        }
        
        // Runway connected successfully! Update status and start polling
        console.log('[app] Runway connected successfully, job created. Starting polling...');
        await updateEcho(currentEcho.id, { status: 'generating' });
        appState.updateEcho(currentEcho.id, { status: 'generating' });
        
        // Show tooltip pointing to bell
        notifications.showBellTooltip('We\'re working our magic. When we\'re finished it will show here');
        
        // Start polling for video completion
        aiGeneration.startVideoStatusPolling(
                (echo) => {
                    notifications.updateBellForReadyVideo(echo);
                    notifications.updateBellBadge();
                const currentEcho = modalManager.getCurrentEcho();
                if (currentEcho && currentEcho.id === echo.id) {
                    const updatedEcho = appState.findEchoById(echo.id);
                    if (updatedEcho) {
                        modalManager.displayEchoInModal(updatedEcho, handleBringToLife, () => {
                            const echoToEdit = modalManager.getCurrentEcho();
                            if (!echoToEdit) return;
                            modalManager.closeEchoModal();
                            formHandler.openUploadForm(echoToEdit, showError, showNotification);
                        });
                    }
                }
            },
            (echoId, error) => {
                notifications.showNotification('Video generation failed. Your photo is safe in the photos bucket.');
            },
            loadEchos
        );
        
        // Upload the video that was already generated
        aiGeneration.generateAIVideoAsync(currentEcho.id, videoUrl, {
            onVideoReady:                 (echo) => {
                    notifications.updateBellForReadyVideo(echo);
                    notifications.updateBellBadge();
                const currentEcho = modalManager.getCurrentEcho();
                if (currentEcho && currentEcho.id === echo.id) {
                    const updatedEcho = appState.findEchoById(echo.id);
                    if (updatedEcho) {
                        modalManager.displayEchoInModal(updatedEcho, handleBringToLife, () => {
                            const echoToEdit = modalManager.getCurrentEcho();
                            if (!echoToEdit) return;
                            modalManager.closeEchoModal();
                            formHandler.openUploadForm(echoToEdit, showError, showNotification);
                        });
                    }
                }
            },
            onVideoFailed: (echoId, error) => {
                const currentEcho = modalManager.getCurrentEcho();
                if (currentEcho && currentEcho.id === echoId) {
                    modalManager.displayEchoInModal(appState.findEchoById(echoId), handleBringToLife, () => {
                        const echoToEdit = modalManager.getCurrentEcho();
                        if (!echoToEdit) return;
                        modalManager.closeEchoModal();
                        formHandler.openUploadForm(echoToEdit, showError, showNotification);
                    });
                }
                notifications.showNotification('Video generation failed. Your photo is safe in the photos bucket.');
            }
        })
            .catch(err => {
                console.error('[app] Video generation failed after job creation:', err);
                
                // Stop polling
                aiGeneration.stopVideoStatusPolling();
                
                // Reset status
                updateEcho(currentEcho.id, { status: 'pending' });
                appState.updateEcho(currentEcho.id, { status: 'pending' });
                bringToLifeBtn.hidden = false;
                generatingStatus.hidden = true;
                
                // Show error
                notifications.showNotification('Video generation failed. Please try again later.');
            });
            
    } catch (error) {
        // ANY failure in connecting to Runway - show error, don't start polling
        console.error('[app] Failed to connect to Runway:', error);
        
        // Reset UI
        bringToLifeBtn.hidden = false;
        generatingStatus.hidden = true;
        
        // Don't update status in database - keep it as 'pending'
        // Don't start polling
        // Don't add anything to videos bucket
        
        // Show clear error message
        let errorMessage = 'Failed to connect to Runway. Please check your proxy server and API key.';
        if (error.message && error.message.includes('Proxy error')) {
            errorMessage = 'Could not reach Runway API. Check that your proxy server is running.';
        } else if (error.message && error.message.includes('API key')) {
            errorMessage = 'Runway API key not configured. Check your .env file.';
        }
        
        notifications.showNotification(errorMessage);
    } finally {
        // Re-enable button if operation failed
        bringToLifeBtn.hidden = false;
        generatingStatus.hidden = true;
    }
    });
}

// generateAIVideoAsync moved to aiGeneration.js

function openDeleteConfirm() {
    deleteConfirmModal.hidden = false;
}

function closeDeleteConfirm() {
    deleteConfirmModal.hidden = true;
}

async function handleDeleteEcho() {
    const currentEcho = modalManager.getCurrentEcho();
    if (!currentEcho) return;
    
    const echoId = currentEcho.id;
    const locationName = currentEcho.locationName;
    
    // Close confirmation modal
    closeDeleteConfirm();
    
    // Show loading state
    deleteConfirmBtn.disabled = true;
    deleteConfirmBtn.textContent = 'Deleting...';
    
    try {
        await deleteEcho(echoId);
        
        // Remove from current group
        let currentEchoGroup = appState.getCurrentEchoGroup().filter(e => e.id !== echoId);
        appState.setCurrentEchoGroup(currentEchoGroup);
        
        // If there are more Echos in the group, navigate to the next one
        if (currentEchoGroup.length > 0) {
            // Adjust index if needed
            let currentEchoIndex = appState.getCurrentEchoIndex();
            if (currentEchoIndex >= currentEchoGroup.length) {
                currentEchoIndex = currentEchoGroup.length - 1;
            }
            appState.setCurrentEchoIndex(currentEchoIndex);
            const currentEcho = currentEchoGroup[currentEchoIndex];
            appState.setCurrentEcho(currentEcho);
            modalManager.updateEchoModalNavigation();
            await modalManager.displayEchoInModal(currentEcho, handleBringToLife, () => {
                const echoToEdit = modalManager.getCurrentEcho();
                if (!echoToEdit) return;
                modalManager.closeEchoModal();
                formHandler.openUploadForm(echoToEdit, showError, showNotification);
            });
            notifications.showNotification(`Echo deleted. Showing ${currentEchoIndex + 1} of ${currentEchoGroup.length}.`);
        } else {
            // No more Echos at this location, close modal
            modalManager.closeEchoModal();
            notifications.showNotification(`Echo from ${locationName} deleted.`);
        }
        
        // Reload all Echos to refresh the map (this will remove the marker)
        await loadAllEchos();
    } catch (error) {
        console.error('[app] Error deleting Echo:', error);
        notifications.showNotification('Failed to delete Echo. Please try again.');
    } finally {
        // Reset button state
        deleteConfirmBtn.disabled = false;
        deleteConfirmBtn.textContent = 'Delete';
    }
}

// Notification functions moved to notifications.js

// Wrapper function for backward compatibility
function showNotification(message, duration = 5000) {
    notifications.showNotification(message, duration);
}

function showError(message) {
    formError.textContent = message;
    formError.hidden = false;
}

function updateEchoMarker(echo) {
    // Remove and re-add marker to update it
    appState.updateEcho(echo.id, echo);
    // Re-render marker - we already have these imported at the top
    // Note: removeEchoMarker doesn't exist, we'll need to clear and re-add
    clearAllMarkers();
    const echos = appState.getEchos();
    echos.forEach(e => addEchoMarker(e));
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
