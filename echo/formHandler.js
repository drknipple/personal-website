// Form handling: upload form UI, photo preview, caption modes, location picking

import { geocodeAddress } from './data.js';
import { getMap } from './mapView.js';
import { cleanAddressString } from './addressFormatter.js';
import * as appState from './appState.js';

// DOM element references (will be initialized)
let uploadFormOverlay, echoForm, photoInput, photoPreview, photoCountHelp;
let eventInput, narrationInput, locationInput, yearInput, pickLocationBtn;
let captionModeRadios, sharedNarrationGroup, individualCaptionsGroup, individualCaptionsContainer;
let formTitle, submitFormBtn, formLoading, formError;

/**
 * Initialize form handler with DOM element references
 */
export function initFormHandler(elements) {
    uploadFormOverlay = elements.uploadFormOverlay;
    echoForm = elements.echoForm;
    photoInput = elements.photoInput;
    photoPreview = elements.photoPreview;
    photoCountHelp = elements.photoCountHelp;
    eventInput = elements.eventInput;
    narrationInput = elements.narrationInput;
    locationInput = elements.locationInput;
    yearInput = elements.yearInput;
    pickLocationBtn = elements.pickLocationBtn;
    captionModeRadios = elements.captionModeRadios;
    sharedNarrationGroup = elements.sharedNarrationGroup;
    individualCaptionsGroup = elements.individualCaptionsGroup;
    individualCaptionsContainer = elements.individualCaptionsContainer;
    formTitle = elements.formTitle;
    submitFormBtn = elements.submitFormBtn;
    formLoading = elements.formLoading;
    formError = elements.formError;
}

/**
 * Open upload form (new or edit mode)
 */
export function openUploadForm(echoToEdit = null, onError, onNotification) {
    uploadFormOverlay.hidden = false;
    appState.setEditingEchoId(echoToEdit ? echoToEdit.id : null);
    
    // Update form title and submit button
    if (formTitle) {
        formTitle.textContent = echoToEdit ? 'Edit Echo' : 'Create New Echo';
    }
    if (submitFormBtn) {
        submitFormBtn.textContent = echoToEdit ? 'Save Changes' : 'Create Echo';
    }
    
    if (echoToEdit) {
        // Pre-fill form with echo data (edit mode)
        const echos = appState.getEchos();
        const sameEventEchos = echos.filter(e => 
            Math.abs(e.lat - echoToEdit.lat) < 0.0001 && 
            Math.abs(e.lng - echoToEdit.lng) < 0.0001 &&
            e.event === echoToEdit.event &&
            e.year === echoToEdit.year
        );
        
        // Load all photos from the same event into selectedPhotos
        const photos = sameEventEchos.map((echo) => ({
            file: null,
            preview: echo.photoUrl,
            id: 'existing-' + echo.id,
            echoId: echo.id,
            narration: echo.narration || ''
        }));
        appState.setSelectedPhotos(photos);
        
        // Set form values
        if (eventInput) eventInput.value = echoToEdit.event || '';
        if (narrationInput) narrationInput.value = sameEventEchos[0]?.narration || '';
        if (locationInput) locationInput.value = echoToEdit.locationName || '';
        if (yearInput) yearInput.value = echoToEdit.year || '';
        
        updatePhotoPreview();
        photoInput.required = false;
        
        // Edit mode uses shared caption mode by default
        if (sharedNarrationGroup) sharedNarrationGroup.hidden = false;
        if (individualCaptionsGroup) individualCaptionsGroup.hidden = true;
        const sharedRadio = document.querySelector('input[name="caption-mode"][value="shared"]');
        if (sharedRadio) sharedRadio.checked = true;
    } else {
        // Reset form for new echo
        appState.clearSelectedPhotos();
        echoForm.reset();
        photoPreview.innerHTML = '<span class="photo-upload-area__placeholder">Click or drag photos here (up to 10)</span>';
        photoPreview.classList.remove('has-photos');
        if (photoCountHelp) photoCountHelp.textContent = 'Select 1-10 photos';
        photoInput.required = true;
        
        // Ensure photo input is clickable when opening form
        if (photoInput) {
            photoInput.style.pointerEvents = 'auto';
            photoInput.style.zIndex = '2';
        }
        
        if (sharedNarrationGroup) sharedNarrationGroup.hidden = false;
        if (individualCaptionsGroup) individualCaptionsGroup.hidden = true;
        const sharedRadio = document.querySelector('input[name="caption-mode"][value="shared"]');
        if (sharedRadio) sharedRadio.checked = true;
    }
    
    formError.hidden = true;
}

/**
 * Close upload form
 */
export function closeUploadForm() {
    uploadFormOverlay.hidden = true;
    echoForm.reset();
    appState.clearSelectedPhotos();
    photoPreview.innerHTML = '<span class="photo-upload-area__placeholder">Click or drag photos here (up to 10)</span>';
    photoPreview.classList.remove('has-photos');
    if (photoCountHelp) photoCountHelp.textContent = 'Select 1-10 photos';
    formError.hidden = true;
    appState.clearEditingState();
    photoInput.required = true;
    
    // Reset photo input styles to ensure it's clickable
    if (photoInput) {
        photoInput.style.pointerEvents = 'auto';
        photoInput.style.zIndex = '2';
    }
    
    if (sharedNarrationGroup) sharedNarrationGroup.hidden = false;
    if (individualCaptionsGroup) individualCaptionsGroup.hidden = true;
    if (narrationInput) narrationInput.required = true;
    const sharedRadio = document.querySelector('input[name="caption-mode"][value="shared"]');
    if (sharedRadio) sharedRadio.checked = true;
    if (submitFormBtn) {
        submitFormBtn.textContent = 'Create Echo';
    }
    
    // Reset generating state if form is closed during upload
    if (appState.getIsGenerating()) {
        appState.setIsGenerating(false);
        formLoading.hidden = true;
        echoForm.querySelectorAll('button, input, textarea').forEach(el => {
            el.disabled = false;
        });
    }
}

/**
 * Handle photo preview selection
 */
export function handlePhotoPreview(e, onError) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const imageFiles = files.filter(f => f.type.startsWith('image/'));
    if (imageFiles.length === 0) {
        onError('Please select image files.');
        return;
    }

    if (imageFiles.length > 10) {
        onError('Maximum 10 photos allowed. Please select fewer photos.');
        return;
    }

    const selectedPhotos = appState.getSelectedPhotos();
    const existingCount = selectedPhotos.length;
    const remainingSlots = 10 - existingCount;
    const newFiles = imageFiles.slice(0, remainingSlots);
    
    if (newFiles.length < imageFiles.length) {
        onError(`You can only add ${remainingSlots} more photo(s) (max 10 total).`);
    }

    newFiles.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const photos = appState.getSelectedPhotos();
            photos.push({
                file: file,
                preview: event.target.result,
                id: Date.now() + index
            });
            appState.setSelectedPhotos(photos);
            updatePhotoPreview();
        };
        reader.readAsDataURL(file);
    });
}

/**
 * Update photo preview display
 */
export function updatePhotoPreview() {
    const selectedPhotos = appState.getSelectedPhotos();
    
    if (selectedPhotos.length === 0) {
        photoPreview.innerHTML = '<span class="photo-upload-area__placeholder">Click or drag photos here (up to 10)</span>';
        photoPreview.classList.remove('has-photos');
        photoCountHelp.textContent = 'Select 1-10 photos';
        // Re-enable file input when no photos
        if (photoInput) {
            photoInput.style.pointerEvents = 'auto';
            photoInput.style.zIndex = '2';
        }
        return;
    }

    photoPreview.classList.add('has-photos');
    photoCountHelp.textContent = `${selectedPhotos.length} photo(s) selected`;

    const captionMode = document.querySelector('input[name="caption-mode"]:checked')?.value;
    const isIndividualMode = captionMode === 'individual';

    photoPreview.innerHTML = selectedPhotos.map((photo, index) => `
        <div class="photo-preview-item" data-photo-id="${photo.id}">
            <img src="${photo.preview}" alt="Preview ${index + 1}">
            <button type="button" class="photo-preview-item__remove" data-photo-id="${photo.id}" style="z-index: 100; position: relative;">×</button>
            ${isIndividualMode ? `
                <textarea 
                    class="photo-preview-item__caption" 
                    placeholder="Caption for this photo..."
                    data-photo-id="${photo.id}"></textarea>
            ` : ''}
        </div>
    `).join('');
    
    // Attach handlers directly to each button (more reliable than delegation)
    photoPreview.querySelectorAll('.photo-preview-item__remove').forEach(btn => {
        btn.addEventListener('click', function(e) {
            console.log('[formHandler] Direct button click handler fired!', this);
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            // Photo IDs can be numbers (new photos) or strings (existing photos like 'existing-123')
            const photoIdAttr = this.getAttribute('data-photo-id');
            const photoId = photoIdAttr && !isNaN(photoIdAttr) ? parseInt(photoIdAttr) : photoIdAttr;
            console.log('[formHandler] Removing photo ID:', photoId);
            if (photoId !== null && photoId !== undefined) {
                const photos = appState.getSelectedPhotos().filter(p => {
                    // Compare as strings to handle both numeric and string IDs
                    return String(p.id) !== String(photoId);
                });
                console.log('[formHandler] Photos before:', appState.getSelectedPhotos().length, 'after:', photos.length);
                appState.setSelectedPhotos(photos);
                updatePhotoPreview();
                updateIndividualCaptions();
            }
            return false;
        }, true); // Capture phase
    });

    // Disable file input pointer events when photos are present (so remove buttons work)
    if (photoInput) {
        photoInput.style.pointerEvents = 'none';
        photoInput.style.zIndex = '0';
    }
    
    // Remove any existing handlers to avoid duplicates
    if (photoPreview._removeHandler) {
        photoPreview.removeEventListener('mousedown', photoPreview._removeHandler, true);
        photoPreview.removeEventListener('click', photoPreview._removeHandler, true);
    }
    
    // Use mousedown event in capture phase - fires before click and before file input can intercept
    photoPreview._removeHandler = function handleRemoveClick(e) {
        console.log('[formHandler] Click detected on preview:', e.target, e.target.closest('.photo-preview-item__remove'));
        const removeBtn = e.target.closest('.photo-preview-item__remove');
        if (removeBtn) {
            console.log('[formHandler] Remove button clicked!', removeBtn.getAttribute('data-photo-id'));
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            // Photo IDs can be numbers (new photos) or strings (existing photos like 'existing-123')
            const photoIdAttr = removeBtn.getAttribute('data-photo-id');
            const photoId = photoIdAttr && !isNaN(photoIdAttr) ? parseInt(photoIdAttr) : photoIdAttr;
            console.log('[formHandler] Photo ID to remove:', photoId);
            if (photoId !== null && photoId !== undefined) {
                const photos = appState.getSelectedPhotos().filter(p => {
                    // Compare as strings to handle both numeric and string IDs
                    return String(p.id) !== String(photoId);
                });
                console.log('[formHandler] Remaining photos:', photos.length);
                appState.setSelectedPhotos(photos);
                updatePhotoPreview();
                updateIndividualCaptions();
            }
            return false;
        }
    };
    // Use both mousedown (to prevent) and click (as backup)
    photoPreview.addEventListener('mousedown', photoPreview._removeHandler, true);
    photoPreview.addEventListener('click', photoPreview._removeHandler, true);
    console.log('[formHandler] Remove handlers attached to preview');
}

/**
 * Handle caption mode change
 */
export function handleCaptionModeChange() {
    const captionMode = document.querySelector('input[name="caption-mode"]:checked')?.value;
    const isIndividualMode = captionMode === 'individual';
    
    if (isIndividualMode) {
        sharedNarrationGroup.hidden = true;
        narrationInput.required = false;
        individualCaptionsGroup.hidden = false;
        updateIndividualCaptions();
    } else {
        sharedNarrationGroup.hidden = false;
        narrationInput.required = true;
        individualCaptionsGroup.hidden = true;
    }
    
    updatePhotoPreview();
}

/**
 * Update individual captions display
 */
export function updateIndividualCaptions() {
    if (!individualCaptionsContainer) return;
    
    const captionMode = document.querySelector('input[name="caption-mode"]:checked');
    if (!captionMode || captionMode.value !== 'individual') return;

    const selectedPhotos = appState.getSelectedPhotos();
    individualCaptionsContainer.innerHTML = selectedPhotos.map((photo, index) => {
        const existingCaption = photo.narration || '';
        return `
        <div class="individual-caption-item">
            <img src="${photo.preview}" alt="Photo ${index + 1}" class="individual-caption-item__photo">
            <label class="individual-caption-item__label">Caption for photo ${index + 1}:</label>
            <textarea 
                class="individual-caption-item__textarea" 
                placeholder="Tell the story behind this photo..."
                data-photo-id="${photo.id}">${existingCaption}</textarea>
        </div>
    `;
    }).join('');
}

/**
 * Handle map location picker
 */
export function handlePickLocationOnMap(onNotification, onError) {
    uploadFormOverlay.hidden = true;
    onNotification('Click on the map to select a location. Press Escape to cancel.', 10000);
    
    const map = getMap();
    if (!map) {
        onError('Map not available. Please use the address field instead.');
        uploadFormOverlay.hidden = false;
        return;
    }

    let tempMarker = null;
    const mapClickHandler = (e) => {
        const { lat, lng } = e.latlng;
        
        if (tempMarker) {
            map.removeLayer(tempMarker);
        }
        
        tempMarker = L.marker([lat, lng], {
            icon: L.divIcon({
                className: 'temp-location-marker',
                html: '<div style="background: #2563eb; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>',
                iconSize: [20, 20],
                iconAnchor: [10, 10]
            })
        }).addTo(map);
        
        reverseGeocode(lat, lng).then(address => {
            locationInput.value = address;
            // Store coordinates in data attributes so we can use them without re-geocoding
            locationInput.dataset.pickedLat = lat.toString();
            locationInput.dataset.pickedLng = lng.toString();
            onNotification('Location selected!');
        }).catch(() => {
            locationInput.value = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
            // Store coordinates even if reverse geocoding fails
            locationInput.dataset.pickedLat = lat.toString();
            locationInput.dataset.pickedLng = lng.toString();
            onNotification('Location selected!');
        });
        
        map.off('click', mapClickHandler);
        map.off('keydown', escapeHandler);
        setTimeout(() => {
            if (tempMarker) {
                map.removeLayer(tempMarker);
            }
        }, 2000);
        
        uploadFormOverlay.hidden = false;
    };
    
    const escapeHandler = (e) => {
        if (e.key === 'Escape') {
            map.off('click', mapClickHandler);
            map.off('keydown', escapeHandler);
            if (tempMarker) {
                map.removeLayer(tempMarker);
            }
            uploadFormOverlay.hidden = false;
            onNotification('Location selection cancelled.');
        }
    };
    
    map.on('click', mapClickHandler);
    document.addEventListener('keydown', escapeHandler);
}

/**
 * Reverse geocode coordinates to address
 */
async function reverseGeocode(lat, lng) {
    try {
        const proxyUrl = 'https://api.allorigins.win/raw?url=';
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
        const response = await fetch(proxyUrl + encodeURIComponent(url));
        const data = await response.json();
        
        const addr = data.address || {};
        const parts = [];
        
        if (addr.house_number && addr.road) {
            parts.push(`${addr.house_number} ${addr.road}`);
        } else if (addr.road) {
            parts.push(addr.road);
        } else if (addr.house_number) {
            parts.push(addr.house_number);
        }
        
        if (addr.city) {
            parts.push(addr.city);
        } else if (addr.town) {
            parts.push(addr.town);
        } else if (addr.village) {
            parts.push(addr.village);
        }
        
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
        
        if (parts.length > 0) {
            return parts.join(', ');
        }
        
        const displayName = data.display_name || '';
        if (displayName) {
            return cleanAddressString(displayName) || `${lat}, ${lng}`;
        }
        return `${lat}, ${lng}`;
    } catch (error) {
        console.error('[formHandler] Reverse geocoding failed:', error);
        return `${lat}, ${lng}`;
    }
}

/**
 * Show form error
 */
export function showFormError(message) {
    formError.textContent = message;
    formError.hidden = false;
}

/**
 * Hide form error
 */
export function hideFormError() {
    formError.hidden = true;
}

/**
 * Get form data
 */
export function getFormData() {
    const formData = new FormData(echoForm);
    return {
        event: formData.get('event')?.trim(),
        location: formData.get('location')?.trim(),
        year: parseInt(formData.get('year')),
        captionMode: document.querySelector('input[name="caption-mode"]:checked')?.value,
        sharedNarration: narrationInput.value.trim(),
        individualCaptions: getIndividualCaptions()
    };
}

/**
 * Get individual captions from form
 */
function getIndividualCaptions() {
    if (!individualCaptionsContainer) return [];
    const captionInputs = individualCaptionsContainer.querySelectorAll('.individual-caption-item__textarea');
    return Array.from(captionInputs).map(input => input.value.trim());
}

/**
 * Validate form
 */
export function validateForm() {
    const formData = getFormData();
    const selectedPhotos = appState.getSelectedPhotos();
    const editingEchoId = appState.getEditingEchoId();
    
    if (!formData.event) {
        return { valid: false, error: 'Please enter an event/occasion.' };
    }
    
    if (!formData.location) {
        return { valid: false, error: 'Please enter a location.' };
    }
    
    if (!formData.year || formData.year < 1800 || formData.year > 2026) {
        return { valid: false, error: 'Please enter a valid year.' };
    }
    
    if (editingEchoId) {
        if (selectedPhotos.length === 0) {
            return { valid: false, error: 'Please select at least one photo or keep the existing photo.' };
        }
    } else {
        if (selectedPhotos.length === 0) {
            return { valid: false, error: 'Please select at least one photo.' };
        }
        if (selectedPhotos.length > 10) {
            return { valid: false, error: 'Maximum 10 photos allowed.' };
        }
    }
    
    if (formData.captionMode === 'shared') {
        if (!formData.sharedNarration) {
            return { valid: false, error: 'Please add a story/narration.' };
        }
    } else {
        const captions = formData.individualCaptions;
        const emptyCaptions = captions.filter(c => !c.trim());
        if (emptyCaptions.length > 0) {
            return { valid: false, error: 'Please add captions for all photos.' };
        }
    }
    
    return { valid: true };
}

/**
 * Set form loading state
 */
export function setFormLoading(isLoading, message = 'Creating your Echo...') {
    const loadingMessage = formLoading.querySelector('.form-loading__message');
    if (loadingMessage) {
        loadingMessage.textContent = message;
    }
    formLoading.hidden = !isLoading;
    echoForm.querySelectorAll('button, input, textarea').forEach(el => {
        el.disabled = isLoading;
    });
}
