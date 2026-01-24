// List view: renders cards and wires list interactions

let listContainer = null;
let addBtn = null;

let onLocationSelected = null;
let onAddLocation = null;
let onEditLocation = null;
let onOpenGallery = null;
let onViewOnMap = null;

export function initListView(options) {
    const {
        onLocationSelected: onSelect,
        onAddLocation: onAdd,
        onEditLocation: onEdit,
        onOpenGallery: onGallery,
        onViewOnMap: onViewMap
    } = options || {};

    listContainer = document.getElementById('list-container');
    addBtn = document.getElementById('add-location-list-btn');

    onLocationSelected = onSelect || null;
    onAddLocation = onAdd || null;
    onEditLocation = onEdit || null;
    onOpenGallery = onGallery || null;
    onViewOnMap = onViewMap || null;

    if (addBtn) {
        addBtn.addEventListener('click', () => {
            if (typeof onAddLocation === 'function') {
                onAddLocation();
            }
        });
    }
}

export function renderList(locations, selectedLocationId) {
    if (!listContainer) return;

    listContainer.innerHTML = '';

    locations.forEach(location => {
        const card = document.createElement('article');
        card.className = 'location-card';
        card.dataset.locationId = location.id;

        if (location.id === selectedLocationId) {
            card.classList.add('location-card--active');
        }

        const images = location.images || [];
        const hasImages = images.length > 0;

        const imageContainer = document.createElement('div');
        imageContainer.className = 'location-card__image-container';

        if (hasImages) {
            const img = document.createElement('img');
            img.className = 'location-card__image';
            img.src = images[0];
            img.alt = location.name || '';
            imageContainer.appendChild(img);

            if (images.length > 1) {
                const indicator = document.createElement('div');
                indicator.className = 'location-card__photo-indicator';
                indicator.textContent = `${images.length} photos`;
                imageContainer.appendChild(indicator);
            }

            imageContainer.addEventListener('click', e => {
                e.stopPropagation();
                if (typeof onOpenGallery === 'function') {
                    onOpenGallery(location, 0);
                }
            });
        } else {
            const placeholder = document.createElement('div');
            placeholder.className = 'location-card__image-placeholder';
            imageContainer.appendChild(placeholder);
        }

        const body = document.createElement('div');
        body.className = 'location-card__body';

        const title = document.createElement('h3');
        title.className = 'location-card__title';
        title.textContent = location.name || 'Untitled Location';
        body.appendChild(title);

        if (location.description) {
            const desc = document.createElement('p');
            desc.className = 'location-card__description';
            desc.textContent = location.description;
            body.appendChild(desc);
        }

        if (location.address || location.yearAcquired || location.hours) {
            const meta = document.createElement('div');
            meta.className = 'location-card__meta';

            if (location.address) {
                const row = document.createElement('div');
                row.className = 'location-card__meta-row';
                const label = document.createElement('span');
                label.className = 'location-card__meta-label';
                label.textContent = 'Address:';
                const value = document.createElement('span');
                value.className = 'location-card__meta-value';
                value.innerHTML = location.address.replace(/\n/g, '<br>');
                row.appendChild(label);
                row.appendChild(value);
                meta.appendChild(row);
            }

            if (location.yearAcquired) {
                const row = document.createElement('div');
                row.className = 'location-card__meta-row';
                const label = document.createElement('span');
                label.className = 'location-card__meta-label';
                label.textContent = 'Year Acquired:';
                const value = document.createElement('span');
                value.className = 'location-card__meta-value';
                value.textContent = location.yearAcquired;
                row.appendChild(label);
                row.appendChild(value);
                meta.appendChild(row);
            }

            if (location.hours) {
                const row = document.createElement('div');
                row.className = 'location-card__meta-row';
                const label = document.createElement('span');
                label.className = 'location-card__meta-label';
                label.textContent = 'Hours:';
                const value = document.createElement('span');
                value.className = 'location-card__meta-value';
                value.textContent = location.hours;
                row.appendChild(label);
                row.appendChild(value);
                meta.appendChild(row);
            }

            body.appendChild(meta);
        }

        const actions = document.createElement('div');
        actions.className = 'location-card__actions';

        const editBtn = document.createElement('button');
        editBtn.type = 'button';
        editBtn.className = 'location-card__edit-btn';
        editBtn.textContent = 'Edit';
        editBtn.addEventListener('click', e => {
            e.stopPropagation();
            if (typeof onEditLocation === 'function') {
                onEditLocation(location);
            }
        });
        actions.appendChild(editBtn);

        // Add "View on map" button (both desktop and mobile)
        if (typeof onViewOnMap === 'function') {
            const viewMapBtn = document.createElement('button');
            viewMapBtn.type = 'button';
            viewMapBtn.className = 'location-card__view-map-btn';
            viewMapBtn.textContent = 'View on map';
            viewMapBtn.addEventListener('click', e => {
                e.stopPropagation();
                onViewOnMap(location.id);
            });
            actions.appendChild(viewMapBtn);
        }

        body.appendChild(actions);

        card.appendChild(imageContainer);
        card.appendChild(body);

        card.addEventListener('click', () => {
            if (typeof onLocationSelected === 'function') {
                onLocationSelected(location.id);
            }
        });

        listContainer.appendChild(card);
    });
}

