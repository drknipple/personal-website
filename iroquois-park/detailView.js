// Detail sheet / bottom sheet + gallery modal

import { uploadImage as uploadImageToStorage, deleteImage as deleteImageFromStorage } from './data.js';

let sheetEl = null;
let sheetBackdropEl = null;
let sheetPanelEl = null;
let sheetTitleEl = null;
let sheetBodyEl = null;
let sheetCloseBtn = null;

let galleryModalEl = null;
let galleryImageEl = null;
let galleryCounterEl = null;
let galleryPrevBtn = null;
let galleryNextBtn = null;
let galleryCloseBtn = null;

let currentLocation = null;
let currentMode = 'view'; // 'view' | 'edit' | 'add'
let galleryImages = [];
let galleryIndex = 0;

let onCloseCallback = null;
let onSaveCallback = null;

// Track images in edit form
let formImages = []; // Array of { url, file?, isNew?, toDelete? }

export function initDetailView(options) {
    const { onClose, onSaveLocation } = options || {};

    sheetEl = document.getElementById('detail-sheet');
    if (!sheetEl) {
        console.error('[detailView] #detail-sheet not found');
        return;
    }
    sheetBackdropEl = sheetEl.querySelector('.detail-sheet__backdrop');
    sheetPanelEl = sheetEl.querySelector('.detail-sheet__panel');
    sheetTitleEl = document.getElementById('detail-sheet-title');
    sheetBodyEl = document.getElementById('detail-sheet-body');
    sheetCloseBtn = document.getElementById('detail-sheet-close');

    galleryModalEl = document.getElementById('gallery-modal');
    galleryImageEl = document.getElementById('gallery-modal-image');
    galleryCounterEl = document.getElementById('gallery-modal-counter');
    galleryPrevBtn = document.getElementById('gallery-prev');
    galleryNextBtn = document.getElementById('gallery-next');
    galleryCloseBtn = document.getElementById('gallery-modal-close');

    onCloseCallback = onClose || null;
    onSaveCallback = onSaveLocation || null;

    if (sheetBackdropEl) {
        sheetBackdropEl.addEventListener('click', close);
    }
    if (sheetCloseBtn) {
        sheetCloseBtn.addEventListener('click', close);
    }

    if (galleryCloseBtn && galleryModalEl) {
        galleryCloseBtn.addEventListener('click', closeGallery);
    }
    if (galleryPrevBtn) {
        galleryPrevBtn.addEventListener('click', () => navigateGallery(-1));
    }
    if (galleryNextBtn) {
        galleryNextBtn.addEventListener('click', () => navigateGallery(1));
    }

    document.addEventListener('keydown', e => {
        if (galleryModalEl && galleryModalEl.classList.contains('gallery-modal--active')) {
            if (e.key === 'Escape') {
                closeGallery();
            } else if (e.key === 'ArrowLeft') {
                navigateGallery(-1);
            } else if (e.key === 'ArrowRight') {
                navigateGallery(1);
            }
        }

        if (sheetEl && sheetEl.classList.contains('detail-sheet--active') && e.key === 'Escape') {
            close();
        }
    });
}

export function openForLocation(location, options) {
    if (!sheetEl || !sheetBodyEl || !sheetTitleEl) return;
    currentLocation = location;
    currentMode = 'view';
    
    const overlayMode = (options && options.overlayMode) || (window.innerWidth <= 768 ? 'mobile-sheet' : null);
    
    // Apply overlay mode class
    if (overlayMode === 'desktop-overlay') {
        sheetEl.classList.add('detail-sheet--overlay');
        sheetEl.classList.remove('detail-sheet--mobile');
    } else if (overlayMode === 'mobile-sheet') {
        sheetEl.classList.add('detail-sheet--mobile');
        sheetEl.classList.remove('detail-sheet--overlay');
    } else {
        sheetEl.classList.remove('detail-sheet--overlay', 'detail-sheet--mobile');
    }

    sheetTitleEl.textContent = location.name || 'Location details';
    sheetBodyEl.innerHTML = '';

    const images = location.images || [];
    galleryImages = images.slice();
    galleryIndex = 0;

    if (images.length > 0) {
        const gallery = document.createElement('div');
        gallery.className = 'detail-gallery';

        const img = document.createElement('img');
        img.className = 'detail-gallery__image';
        img.src = images[0];
        img.alt = location.name || '';
        gallery.appendChild(img);

        if (images.length > 1) {
            const controls = document.createElement('div');
            controls.className = 'detail-gallery__controls';

            const prev = document.createElement('button');
            prev.type = 'button';
            prev.className = 'detail-gallery__nav detail-gallery__nav--prev';
            prev.textContent = '‹';
            prev.addEventListener('click', e => {
                e.stopPropagation();
                cycleInlineGallery(-1, img, images);
            });

            const next = document.createElement('button');
            next.type = 'button';
            next.className = 'detail-gallery__nav detail-gallery__nav--next';
            next.textContent = '›';
            next.addEventListener('click', e => {
                e.stopPropagation();
                cycleInlineGallery(1, img, images);
            });

            controls.appendChild(prev);
            controls.appendChild(next);
            gallery.appendChild(controls);
        }

        gallery.addEventListener('click', () => {
            openGalleryModal(0, images);
        });

        sheetBodyEl.appendChild(gallery);
    }

    const textSection = document.createElement('div');
    textSection.className = 'detail-text';

    if (location.description) {
        const desc = document.createElement('p');
        desc.className = 'detail-text__description';
        desc.textContent = location.description;
        textSection.appendChild(desc);
    }

    if (location.address || location.yearAcquired || location.hours) {
        const meta = document.createElement('dl');
        meta.className = 'detail-text__meta';

        if (location.address) {
            const dt = document.createElement('dt');
            dt.textContent = 'Address';
            const dd = document.createElement('dd');
            dd.innerHTML = location.address.replace(/\n/g, '<br>');
            meta.appendChild(dt);
            meta.appendChild(dd);
        }

        if (location.yearAcquired) {
            const dt = document.createElement('dt');
            dt.textContent = 'Year Acquired';
            const dd = document.createElement('dd');
            dd.textContent = location.yearAcquired;
            meta.appendChild(dt);
            meta.appendChild(dd);
        }

        if (location.hours) {
            const dt = document.createElement('dt');
            dt.textContent = 'Hours';
            const dd = document.createElement('dd');
            dd.textContent = location.hours;
            meta.appendChild(dt);
            meta.appendChild(dd);
        }

        textSection.appendChild(meta);
    }

    const actions = document.createElement('div');
    actions.className = 'detail-text__actions';

    const editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.className = 'detail-text__edit-btn';
    editBtn.textContent = 'Edit location';
    editBtn.addEventListener('click', () => {
        openEditForm(location);
    });
    actions.appendChild(editBtn);

    textSection.appendChild(actions);

    sheetBodyEl.appendChild(textSection);

    openSheet();
}

export function openForNewLocation(initialCoords) {
    currentLocation = initialCoords
        ? { lat: initialCoords.lat, lng: initialCoords.lng }
        : {};
    openEditForm(currentLocation, true);
}

export function openForEdit(location) {
    currentLocation = location;
    openEditForm(location, false);
}

function openEditForm(location, isNew = false) {
    if (!sheetEl || !sheetBodyEl || !sheetTitleEl) return;
    currentMode = isNew ? 'add' : 'edit';

    sheetTitleEl.textContent = isNew ? 'Add location' : `Edit ${location.name || 'location'}`;
    sheetBodyEl.innerHTML = '';

    const form = document.createElement('form');
    form.className = 'location-form';

    const nameField = createInputField('Name', 'text', 'location-name', location.name || '', true);
    const descField = createTextareaField('Description', 'location-description', location.description || '');
    const addressField = createInputField(
        'Street address',
        'text',
        'location-address',
        location.address || '',
        false,
        'e.g. 5216 New Cut Rd, Louisville KY'
    );

    const latField = createInputField(
        'Latitude',
        'number',
        'location-lat',
        typeof location.lat === 'number' ? String(location.lat) : '',
        false,
        'Optional if address is provided'
    );
    latField.querySelector('input').step = 'any';

    const lngField = createInputField(
        'Longitude',
        'number',
        'location-lng',
        typeof location.lng === 'number' ? String(location.lng) : '',
        false,
        'Optional if address is provided'
    );
    lngField.querySelector('input').step = 'any';

    const yearField = createInputField(
        'Year Acquired',
        'text',
        'location-year',
        location.yearAcquired || '',
        false
    );

    const hoursField = createInputField(
        'Hours',
        'text',
        'location-hours',
        location.hours || '',
        false
    );

    // Image upload section
    const imageField = createImageUploadField(location.images || []);

    const hint = document.createElement('p');
    hint.className = 'location-form__hint';
    hint.textContent = 'Provide either a street address or latitude & longitude. Address will be geocoded automatically.';

    const errorEl = document.createElement('p');
    errorEl.className = 'location-form__error';
    errorEl.style.display = 'none';

    const buttons = document.createElement('div');
    buttons.className = 'location-form__actions';

    const saveBtn = document.createElement('button');
    saveBtn.type = 'submit';
    saveBtn.className = 'location-form__save';
    saveBtn.textContent = isNew ? 'Add location' : 'Save changes';

    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.className = 'location-form__cancel';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.addEventListener('click', e => {
        e.preventDefault();
        if (currentLocation && !isNew) {
            openForLocation(currentLocation);
        } else {
            close();
        }
    });

    buttons.appendChild(saveBtn);
    buttons.appendChild(cancelBtn);

    form.appendChild(nameField);
    form.appendChild(descField);
    form.appendChild(imageField);
    form.appendChild(addressField);
    form.appendChild(latField);
    form.appendChild(lngField);
    form.appendChild(yearField);
    form.appendChild(hoursField);
    form.appendChild(hint);
    form.appendChild(errorEl);
    form.appendChild(buttons);

    form.addEventListener('submit', async e => {
        e.preventDefault();
        if (!onSaveCallback) return;

        errorEl.style.display = 'none';
        errorEl.textContent = '';

        const name = form.querySelector('#location-name').value.trim();
        const description = form.querySelector('#location-description').value.trim();
        const address = form.querySelector('#location-address').value.trim();
        const latValue = form.querySelector('#location-lat').value.trim();
        const lngValue = form.querySelector('#location-lng').value.trim();
        const yearAcquired = form.querySelector('#location-year').value.trim();
        const hours = form.querySelector('#location-hours').value.trim();

        if (!name) {
            errorEl.textContent = 'Name is required.';
            errorEl.style.display = 'block';
            return;
        }

        if (!address && (!latValue || !lngValue)) {
            errorEl.textContent = 'Provide either an address or both latitude and longitude.';
            errorEl.style.display = 'block';
            return;
        }

        const submitOriginalText = saveBtn.textContent;
        saveBtn.disabled = true;
        saveBtn.textContent = 'Saving...';

        try {
            saveBtn.textContent = 'Uploading images...';

            // Upload new images first
            const imageUrls = [];
            for (const img of formImages) {
                if (img.toDelete) continue; // Skip images marked for deletion
                if (img.file) {
                    // New file to upload
                    const url = await uploadImageToStorage(img.file);
                    imageUrls.push(url);
                } else if (img.url) {
                    // Existing image, keep it
                    imageUrls.push(img.url);
                }
            }

            // Delete removed images
            for (const img of formImages) {
                if (img.toDelete && img.url) {
                    await deleteImageFromStorage(img.url);
                }
            }

            saveBtn.textContent = 'Saving...';

            const input = {
                id: location.id,
                name,
                description,
                address: address || null,
                yearAcquired: yearAcquired || null,
                hours: hours || null,
                images: imageUrls,
                lat: latValue ? parseFloat(latValue) : location.lat,
                lng: lngValue ? parseFloat(lngValue) : location.lng,
                addressForGeocode: address,
                needsGeocode: !!address && (!latValue || !lngValue)
            };

            const saved = await onSaveCallback(input);
            currentLocation = saved;
            openForLocation(saved);
        } catch (err) {
            console.error('[detailView] Save error:', err);
            errorEl.textContent = err.message || 'Could not save location.';
            errorEl.style.display = 'block';
        } finally {
            saveBtn.disabled = false;
            saveBtn.textContent = submitOriginalText;
        }
    });

    sheetBodyEl.appendChild(form);
    openSheet();
}

function createInputField(labelText, type, id, value, required, placeholder) {
    const field = document.createElement('div');
    field.className = 'location-form__field';

    const label = document.createElement('label');
    label.className = 'location-form__label';
    label.htmlFor = id;
    label.textContent = labelText;

    const input = document.createElement('input');
    input.className = 'location-form__input';
    input.type = type;
    input.id = id;
    input.value = value || '';
    if (placeholder) input.placeholder = placeholder;
    if (required) input.required = true;

    field.appendChild(label);
    field.appendChild(input);
    return field;
}

function createTextareaField(labelText, id, value) {
    const field = document.createElement('div');
    field.className = 'location-form__field';

    const label = document.createElement('label');
    label.className = 'location-form__label';
    label.htmlFor = id;
    label.textContent = labelText;

    const textarea = document.createElement('textarea');
    textarea.className = 'location-form__textarea';
    textarea.id = id;
    textarea.value = value || '';

    field.appendChild(label);
    field.appendChild(textarea);
    return field;
}

function createImageUploadField(existingImages) {
    const field = document.createElement('div');
    field.className = 'location-form__field';

    const label = document.createElement('label');
    label.className = 'location-form__label';
    label.textContent = 'Photos';

    const container = document.createElement('div');
    container.className = 'location-form__images';

    // Initialize formImages with existing images
    formImages = (existingImages || []).map(url => ({ url }));

    const previewContainer = document.createElement('div');
    previewContainer.className = 'location-form__image-previews';

    function renderPreviews() {
        previewContainer.innerHTML = '';
        formImages.forEach((img, index) => {
            if (img.toDelete) return;

            const preview = document.createElement('div');
            preview.className = 'location-form__image-preview';
            if (img.url) {
                const imgEl = document.createElement('img');
                imgEl.src = img.url;
                imgEl.alt = 'Preview';
                preview.appendChild(imgEl);
            } else if (img.file) {
                const imgEl = document.createElement('img');
                imgEl.src = URL.createObjectURL(img.file);
                imgEl.alt = 'Preview';
                preview.appendChild(imgEl);
            }

            const removeBtn = document.createElement('button');
            removeBtn.type = 'button';
            removeBtn.className = 'location-form__image-remove';
            removeBtn.textContent = '×';
            removeBtn.addEventListener('click', () => {
                if (img.url) {
                    // Mark existing image for deletion
                    img.toDelete = true;
                } else {
                    // Remove new file
                    formImages.splice(index, 1);
                }
                renderPreviews();
            });
            preview.appendChild(removeBtn);
            previewContainer.appendChild(preview);
        });
    }

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.id = 'location-images-input';
    fileInput.accept = 'image/jpeg,image/jpg,image/png,image/webp';
    fileInput.multiple = true;
    fileInput.className = 'location-form__file-input';
    fileInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        files.forEach(file => {
            formImages.push({ file });
        });
        renderPreviews();
        fileInput.value = ''; // Reset input
    });

    const fileLabel = document.createElement('label');
    fileLabel.className = 'location-form__file-label';
    fileLabel.htmlFor = fileInput.id;
    fileLabel.textContent = '+ Add photos';
    fileLabel.addEventListener('click', (e) => {
        e.preventDefault();
        fileInput.click();
    });

    container.appendChild(previewContainer);
    container.appendChild(fileLabel);
    container.appendChild(fileInput);

    field.appendChild(label);
    field.appendChild(container);

    renderPreviews();

    return field;
}

function openSheet() {
    if (!sheetEl) return;
    sheetEl.classList.add('detail-sheet--active');
    document.body.classList.add('detail-sheet-open');
}

export function close() {
    if (!sheetEl) return;
    sheetEl.classList.remove('detail-sheet--active');
    document.body.classList.remove('detail-sheet-open');
    currentLocation = null;
    currentMode = 'view';
    if (typeof onCloseCallback === 'function') {
        onCloseCallback();
    }
}

function cycleInlineGallery(direction, imgEl, images) {
    if (!images.length) return;
    galleryIndex = (galleryIndex + direction + images.length) % images.length;
    imgEl.src = images[galleryIndex];
}

function openGalleryModal(startIndex, imagesOverride) {
    if (!galleryModalEl || !galleryImageEl || !galleryCounterEl) return;
    const imgs = imagesOverride || galleryImages;
    if (!imgs.length) return;

    galleryImages = imgs.slice();
    galleryIndex = startIndex || 0;

    galleryImageEl.src = galleryImages[galleryIndex];
    galleryCounterEl.textContent = `${galleryIndex + 1} / ${galleryImages.length}`;

    galleryModalEl.classList.add('gallery-modal--active');
    document.body.classList.add('gallery-modal-open');
}

export function openGalleryForLocation(location, startIndex = 0) {
    const images = location.images || [];
    if (!images.length) return;
    openGalleryModal(startIndex, images);
}

function navigateGallery(direction) {
    if (!galleryImages.length || !galleryModalEl.classList.contains('gallery-modal--active')) return;
    galleryIndex = (galleryIndex + direction + galleryImages.length) % galleryImages.length;
    galleryImageEl.src = galleryImages[galleryIndex];
    galleryCounterEl.textContent = `${galleryIndex + 1} / ${galleryImages.length}`;
}

function closeGallery() {
    if (!galleryModalEl) return;
    galleryModalEl.classList.remove('gallery-modal--active');
    document.body.classList.remove('gallery-modal-open');
}

