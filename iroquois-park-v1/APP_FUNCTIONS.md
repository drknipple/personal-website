## Iroquois Park Neighborhood Explorer – App Overview

This document summarizes what the Iroquois Park app does from a product and UX point of view.

### High-level purpose

- **Neighborhood discovery tool** for the Iroquois Park area of Louisville.
- Combines **interactive maps, neighborhood overlays, and rich location cards** so you can explore parks, landmarks, and points of interest.
- Stores locations in **Supabase** so markers and cards are persistent and editable from the UI.

### Core user experiences

- **Map-first exploration**
  - Users land on an interactive Leaflet map centered on Iroquois Park.
  - Markers represent locations (e.g., Iroquois Park, Disc Golf Course, Overlook, Little Loomhouse, etc.).
  - Hovering a marker on desktop opens a popup showing a photo, name, description, and key details.
  - Clicking a marker (or its popup) opens a **detail card overlay** / bottom sheet with the full location content and gallery.

- **List-first exploration**
  - A full-page **List view** shows all locations as cards (grid layout on desktop/tablet, vertical list on mobile).
  - Each card shows a hero image (or placeholder), name, description, and any extra details.
  - Clicking a card scrolls/pans the map to that location and opens the corresponding detail view when returning to Map mode.

- **Responsive behavior**
  - **Desktop/Tablet**
    - Map view: full map area, markers, legend, and controls; detail appears as an overlay/bottom card.
    - List view: full-screen grid of cards; the map is hidden, similar to a vacation-rental “list” mode.
  - **Mobile**
    - Map view: map fills most of the screen; when a marker is selected, a **bottom sheet** with the location card slides up while keeping the marker visible above the sheet.
    - List view: scrollable vertical list of cards; user can switch back to Map view via the bottom nav.

### Navigation and layout

- **Fixed header**
  - A `footer-header` style bar along the top (“A Neighborhood Love Letter By Eric”) links back to the main site.
  - All app content (map and list) is positioned and sized to sit directly below this header.

- **Bottom Map/List navigation**
  - A fixed, full-width bottom bar with **Map** and **List** buttons.
  - Only one mode is visible at a time:
    - **Map**: map wrapper is shown; list overlay is hidden.
    - **List**: list overlay covers the map area (map is effectively not visible).

### Map behavior and controls

- **Base map**
  - Uses Leaflet with a CartoDB “Positron” style tile layer by default.
  - Zoom wheel behavior is tuned to feel closer to Google Maps: smoothed, responsive but not too sensitive.

- **Satellite toggle**
  - A round **👁** button in the lower-right corner toggles between the default map style and a satellite-style layer.

- **Zoom controls**
  - Plus and minus buttons are shown in the **bottom-left** corner of the map.
  - On some configurations, zooming by mouse wheel is enabled and tuned for smoother stepping.

### Neighborhood overlays

- **Polygon overlays**
  - The app draws tinted polygon overlays for multiple neighborhoods around Iroquois Park (Beechmont, Southside, Southland Park, Kenwood Hills, Iroquois, Hazelwood, Iroquois Park, Cloverleaf, Jacobs, Wyandotte, etc.).
  - Each neighborhood has its own fill color and border color to visually segment the area.
  - Polygons are **non-clickable**: they are purely visual context, not interactive objects.

- **Legend**
  - A **collapsible legend** appears in the upper-right on map view.
  - By default it is collapsed (showing just the title and chevron).
  - When expanded, it shows colored swatches and labels for each neighborhood.

### Locations, cards, and galleries

- **Location data model (conceptual)**
  - Each location includes:
    - `name`, `description`
    - `lat`, `lng`
    - Optional `address`, `yearAcquired`, `hours`
    - One or more image URLs (for card and popup galleries)

- **Markers and popups**
  - For each location, the app creates a Leaflet marker and binds a custom popup.
  - Popups display:
    - First image (with photo count badge if there are multiple)
    - Name and short description
    - Optional address, year acquired, and hours
  - On desktop:
    - **Hover** opens the popup.
    - **Click** on the marker or popup opens the full detail overlay.
  - On mobile:
    - Marker interaction skips the popup content and directly opens the bottom-sheet card.

- **Location cards (list view)**
  - Cards always show a fixed-height image area:
    - If the location has images, the first one is displayed.
    - If not, a gradient placeholder is shown.
  - Below the image, the card shows the name, description, and any detail fields.
  - Cards are laid out:
    - As a **responsive grid** on desktop/tablet.
    - As a vertical list on mobile.

- **Detail view and gallery**
  - The detail view (overlay/bottom sheet) provides:
    - Full location title and description.
    - Structured fields (e.g., address, year acquired, hours) if available.
    - An image gallery:
      - Users can cycle through images on the card with arrow controls.
      - Clicking an image opens a **modal gallery** for that location.

### Adding and editing locations

- **Add Location (UI trigger)**
  - On map view, a round **+** button near the satellite toggle switches to **List** mode and opens the **Add Location** form.
  - In list view, an “Add Location” button appears in the Locations header and also opens the form.

- **Add / Edit form**
  - Fields:
    - **Name** (required)
    - **Description** (optional)
    - **Street address** (optional)
    - **Latitude** and **Longitude** (optional)
  - Validation and behavior:
    - User must provide either a street address or a pair of coordinates.
    - If an address is provided, the app uses **Nominatim** (OpenStreetMap) for geocoding, then fills in `lat`/`lng` before saving.
    - If `lat`/`lng` are supplied directly, they are used as-is.
  - A hidden `id` field differentiates **editing** an existing location vs. **creating** a new one.

- **Persistence (Supabase)**
  - All locations are stored in a Supabase PostgreSQL table.
  - On load:
    - The app clears any previous in-memory locations and fetches all rows from Supabase.
    - For each row, it creates a marker, popup, and list card.
  - On save (add or edit):
    - The app sends an insert/update to Supabase, then refreshes in-memory locations and redraws markers/cards.
  - There is no longer any hardcoded location data in the app; **Supabase is the single source of truth**.

### Technology stack

- **Frontend**
  - Vanilla **HTML**, **CSS**, and **JavaScript (ES6+)**.
  - Leaflet for mapping and overlays.
  - Responsive layout via CSS Grid, Flexbox, and media queries.

- **Backend / Data**
  - **Supabase** (hosted Postgres + auth + JS client) used as a free, reliable data store for locations.
  - **Nominatim** geocoding (via `fetch`) to convert street addresses into `lat`/`lng` before saving.

This file is intended as a living overview; as you add features (e.g., filters, ratings, additional neighborhoods), you can extend the relevant sections to keep the documentation in sync with the app.

