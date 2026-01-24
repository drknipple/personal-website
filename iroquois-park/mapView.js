// Map view: Leaflet map, neighborhoods, markers, popups, style toggle

let map = null;
let standardLayer = null;
let satelliteLayer = null;
let currentLayer = null;

const markerById = new Map();
const neighborhoodPolygons = [];
let onLocationSelectedCallback = null;
let hasFittedInitialBounds = false;

const NEIGHBORHOODS = [
    {
        id: 'beechmont',
        name: 'Beechmont',
        color: '#9b59b6',
        fill: 'rgba(155, 89, 182, 0.3)',
        boundary: [
            [38.189340, -85.783518],
            [38.18941839129363, -85.77529635968354],
            [38.1899734887035, -85.76668884444875],
            [38.190205477435164, -85.75726036444406],
            [38.18575552295832, -85.75598187848695],
            [38.18537326683057, -85.75812889385323],
            [38.18076379697552, -85.75904045911692],
            [38.18106422616485, -85.7629914411765],
            [38.17907780211078, -85.76322959278359],
            [38.17915276674228, -85.76470739287163],
            [38.17874086557926, -85.76675845036272],
            [38.17150436616104, -85.76809277273885],
            [38.171879258516405, -85.77238480142255],
            [38.170948358259594, -85.77540748382643],
            [38.172061607517264, -85.77596022079548],
            [38.172985486760055, -85.77698533233928],
            [38.169777041309295, -85.78121456450461],
            [38.174345946094604, -85.78245943027603],
            [38.184171358322274, -85.78397468847373],
            [38.18530031210882, -85.78407624344989],
            [38.189355823978424, -85.78345130651735],
            [38.189340, -85.783518]
        ]
    },
    {
        id: 'southside',
        name: 'Southside',
        color: '#e91e63',
        fill: 'rgba(233, 30, 99, 0.3)',
        boundary: [
            [38.185453677391564, -85.75814727874423],
            [38.18572196641385, -85.75612658215651],
            [38.171466829696705, -85.7522623629916],
            [38.16947334119872, -85.76113757869997],
            [38.16754834096189, -85.76104995678854],
            [38.1666921333978, -85.76475228235122],
            [38.15608262427058, -85.76473185173202],
            [38.15667341961496, -85.76638577608027],
            [38.16134021966552, -85.77229721530763],
            [38.16327859816934, -85.76956201962615],
            [38.178777773396895, -85.76674898683555],
            [38.179217133822014, -85.76484733911252],
            [38.17909488017478, -85.76329236475367],
            [38.18120071075639, -85.76292144900175],
            [38.18076769424131, -85.75896925783834],
            [38.18545494240935, -85.7581631536336],
            [38.185453677391564, -85.75814727874423]
        ]
    },
    {
        id: 'southland',
        name: 'Southland Park',
        color: '#f39c12',
        fill: 'rgba(243, 156, 18, 0.3)',
        boundary: [
            [38.171389024229576, -85.75235066452016],
            [38.161561982370195, -85.74947963866931],
            [38.16052174671701, -85.74948220485557],
            [38.159475024806106, -85.74976519151099],
            [38.158192168125346, -85.75059113948359],
            [38.157145675385415, -85.75180813237058],
            [38.15241612513205, -85.75831029870577],
            [38.15813649370774, -85.76469722123288],
            [38.16668016606569, -85.76477264984904],
            [38.16766555093142, -85.76052175909818],
            [38.16955794939179, -85.7611391212728],
            [38.171389024229576, -85.75235066452016]
        ]
    },
    {
        id: 'kenwood',
        name: 'Kenwood Hills',
        color: '#1abc9c',
        fill: 'rgba(26, 188, 156, 0.3)',
        boundary: [
            [38.156224405154425, -85.7646838336868],
            [38.15583910910894, -85.76470268120566],
            [38.15300982525435, -85.76543600530847],
            [38.15256957202863, -85.76563815579425],
            [38.15111721286428, -85.76667215337594],
            [38.15090934938325, -85.76711421273878],
            [38.14843984247252, -85.7644963401743],
            [38.1472976867963, -85.76693649385409],
            [38.1479517855219, -85.77066413107455],
            [38.14876475250805, -85.7717944742376],
            [38.15075177150845, -85.77638436005934],
            [38.16163396940093, -85.7791948221875],
            [38.1613687227619, -85.77303016975716],
            [38.161315114816155, -85.77228193068036],
            [38.1567275174009, -85.76635508000216],
            [38.15620605686875, -85.76469059153608],
            [38.156224405154425, -85.7646838336868]
        ]
    },
    {
        id: 'iroquois',
        name: 'Iroquois',
        color: '#3498db',
        fill: 'rgba(52, 152, 219, 0.3)',
        boundary: [
            // Combined West + East boundaries
            [
                [38.16983566581554, -85.78125727239807],
                [38.17301191027642, -85.7769858620973],
                [38.1720484644563, -85.77591047879048],
                [38.1716620392507, -85.77568910495997],
                [38.171091578779574, -85.77546344441049],
                [38.17180948942067, -85.77233539889622],
                [38.17184655776027, -85.77139133923447],
                [38.17147098111246, -85.7680368310032],
                [38.16351745069645, -85.7694109774818],
                [38.16319287978414, -85.7696830591545],
                [38.161351077618264, -85.77237653473436],
                [38.1649961337328, -85.78005483769671],
                [38.16983566581554, -85.78125727239807]
            ],
            [
                [38.16979339780463, -85.78116446160288],
                [38.16978748178522, -85.78331927798065],
                [38.170746862850635, -85.78337058364889],
                [38.17178653280308, -85.78466509316398],
                [38.17248946273842, -85.79019308800797],
                [38.17248135473351, -85.79255127281681],
                [38.173903771980534, -85.7927840900507],
                [38.17394952930335, -85.79335598415997],
                [38.17551538927277, -85.79249437998456],
                [38.17941996500833, -85.78824245328092],
                [38.17961181111003, -85.78332029922095],
                [38.178554520143074, -85.78307515083429],
                [38.177995355556995, -85.78286969907596],
                [38.17507116537445, -85.78259162385247],
                [38.16977307693797, -85.78124272072114],
                [38.16979339780463, -85.78116446160288]
            ]
        ]
    },
    {
        id: 'iroquois-park',
        name: 'Iroquois Park',
        color: '#006400',
        fill: 'rgba(0, 100, 0, 0.3)',
        boundary: [
            [38.17023052889908, -85.79727074587727],
            [38.173951792031744, -85.79336074435606],
            [38.17389313645276, -85.79274107170637],
            [38.17246531474071, -85.79253511474359],
            [38.1724511747955, -85.79045826051932],
            [38.17247617361112, -85.79024297073535],
            [38.17178015438724, -85.78466159307868],
            [38.17071308295566, -85.7833526515011],
            [38.169782351261205, -85.78332470905076],
            [38.169831394451, -85.781292695524],
            [38.150792148075986, -85.77641489782913],
            [38.15108295954801, -85.78008608695976],
            [38.1514512427603, -85.78128742399873],
            [38.151528730091954, -85.78200923967579],
            [38.15281072467483, -85.79106273155011],
            [38.15369493416874, -85.79254183831907],
            [38.15382917880141, -85.79338224341828],
            [38.153827318152246, -85.79494660169114],
            [38.1540635332193, -85.79564134007016],
            [38.154114520369006, -85.79752792600902],
            [38.155380626472024, -85.8019692998872],
            [38.159238636086876, -85.79811733990772],
            [38.17041143643707, -85.79713480954976],
            [38.17393059631472, -85.79338837387729],
            [38.17392063052422, -85.79276079472596],
            [38.17023052889908, -85.79727074587727]
        ]
    },
    {
        id: 'cloverleaf',
        name: 'Cloverleaf',
        color: '#00bcd4',
        fill: 'rgba(0, 188, 212, 0.3)',
        boundary: [
            [38.17344124126947, -85.81782390726927],
            [38.18541621919145, -85.80883788827126],
            [38.18611594776981, -85.80113446668622],
            [38.183566548329765, -85.80024365241522],
            [38.18134956360313, -85.79924880274045],
            [38.17891753253562, -85.7988627245789],
            [38.17576379587185, -85.79781329654062],
            [38.17458644445219, -85.79784825616083],
            [38.173299691974734, -85.79813497924529],
            [38.17194328912722, -85.79782941850145],
            [38.17031859209134, -85.79753248132825],
            [38.17041452073144, -85.79801564657552],
            [38.172489653921005, -85.80277948814208],
            [38.17340007058829, -85.81771688679449],
            [38.17344124126947, -85.81782390726927]
        ]
    },
    {
        id: 'hazelwood',
        name: 'Hazelwood',
        color: '#2ecc71',
        fill: 'rgba(46, 204, 113, 0.3)',
        boundary: [
            [38.17957452679555, -85.78326027310024],
            [38.179459143802625, -85.7882661128282],
            [38.17546870363706, -85.79255046330488],
            [38.173983725987654, -85.79335273915729],
            [38.17060470348804, -85.79676034186507],
            [38.170389563570076, -85.79753592744285],
            [38.17098749038911, -85.797795911833],
            [38.17198497346654, -85.79779097518048],
            [38.17330972069582, -85.79812049205536],
            [38.17458698178604, -85.79780875768448],
            [38.175834572028315, -85.79786601149095],
            [38.17893316968446, -85.79886628974909],
            [38.1813739329013, -85.79925175483014],
            [38.18356570681577, -85.80025961493658],
            [38.18613054524891, -85.80109833323043],
            [38.18712487003633, -85.78783288988122],
            [38.187885567212675, -85.78544524414335],
            [38.18938813187942, -85.78346142383626],
            [38.184862972454724, -85.78410241694935],
            [38.17957313906338, -85.78329191043758],
            [38.17957452679555, -85.78326027310024]
        ]
    },
    {
        id: 'jacobs',
        name: 'Jacobs',
        color: '#ff5722',
        fill: 'rgba(255, 87, 34, 0.3)',
        boundary: [
            [38.18629865110858, -85.80116083560449],
            [38.18824929732231, -85.80145747534804],
            [38.189985048184354, -85.80106169037771],
            [38.1942915786784, -85.80071736044063],
            [38.19478988533046, -85.80026345953608],
            [38.195459119783386, -85.79917291964473],
            [38.19674550854358, -85.79908847710874],
            [38.196289040376826, -85.78299110467418],
            [38.188963610051964, -85.78348728993161],
            [38.187267520981266, -85.78810486728611],
            [38.1863096189678, -85.80112832175512],
            [38.18629865110858, -85.80116083560449]
        ]
    },
    {
        id: 'wyandotte',
        name: 'Wyandotte',
        color: '#3f51b5',
        fill: 'rgba(63, 81, 181, 0.3)',
        boundary: [
            [38.18898635261771, -85.78343779917047],
            [38.19860022297854, -85.78277254077673],
            [38.19862750541295, -85.76853666679797],
            [38.19934698074228, -85.76772678479914],
            [38.19902874357431, -85.76681127118724],
            [38.19002599490321, -85.76676449660218],
            [38.18944683029117, -85.77522228348934],
            [38.189735838342955, -85.78011862682128],
            [38.18900253385006, -85.78343376057994],
            [38.18898635261771, -85.78343779917047]
        ]
    }
];

export function initMap(options) {
    const {
        onLocationSelected
    } = options || {};
    
    // Store callback for use in syncMarkers
    onLocationSelectedCallback = onLocationSelected;

    const mapEl = document.getElementById('map');
    if (!mapEl) {
        console.error('[mapView] #map element not found');
        return;
    }

    map = L.map('map', {
        scrollWheelZoom: true,
        // Make wheel zoom feel snappier:
        // - lower wheelPxPerZoomLevel = fewer pixels per zoom step
        // - higher zoomDelta = larger zoom change per wheel step
        wheelPxPerZoomLevel: 70,
        zoomSnap: 0.5,
        zoomDelta: 0.25,
        wheelDebounceTime: 25
    }).setView([38.16125210200293, -85.78630408253188], 14);

    standardLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap contributors © CARTO',
        subdomains: 'abcd',
        maxZoom: 19
    });

    satelliteLayer = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
            attribution: '© Esri',
            maxZoom: 19
        }
    );

    currentLayer = standardLayer;
    currentLayer.addTo(map);

    // Neighborhood polygons
    NEIGHBORHOODS.forEach(n => {
        const boundary = Array.isArray(n.boundary[0][0])
            ? n.boundary
            : [n.boundary];
        const polygon = L.polygon(boundary, {
            color: n.color,
            fillColor: n.fill,
            fillOpacity: 0.3,
            weight: 3,
            opacity: 0.8,
            interactive: false
        }).addTo(map);
        neighborhoodPolygons.push(polygon);
    });

    buildLegend();
    wireLegendToggle();
    wireStyleToggle();
    wireResizeOnWindow();

    // Detect touch device
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    // Expose marker click behavior
    function attachMarkerEvents(marker, locationId) {
        marker.on('click', (e) => {
            const isDesktop = !isTouchDevice && window.innerWidth > 768;
            
            if (isDesktop) {
                // Desktop: open overlay directly
                if (typeof onLocationSelected === 'function') {
                    onLocationSelected(locationId, { desktopOverlay: true });
                }
            } else {
                // Mobile: show popup first
                e.originalEvent?.stopPropagation();
                // Ensure popup opens - use Leaflet's openPopup method
                if (marker.getPopup()) {
                    marker.openPopup();
                } else {
                    // If popup not bound yet, wait a bit
                    setTimeout(() => {
                        if (marker.getPopup()) {
                            marker.openPopup();
                        }
                    }, 50);
                }
            }
        });

        // Desktop hover: open Leaflet popup
        marker.on('mouseover', () => {
            if (!isTouchDevice && window.innerWidth > 768) {
                marker.openPopup();
            }
        });
    }

    // Store helper on module for syncMarkers
    map._iroquoisAttachMarkerEvents = attachMarkerEvents;
}

function buildLegend() {
    const legendEl = document.getElementById('neighborhood-legend');
    const itemsEl = legendEl ? legendEl.querySelector('.neighborhood-legend__items') : null;
    if (!legendEl || !itemsEl) return;

    itemsEl.innerHTML = '';
    NEIGHBORHOODS.forEach(n => {
        const item = document.createElement('div');
        item.className = 'neighborhood-legend__item';
        const swatch = document.createElement('div');
        swatch.className = 'neighborhood-legend__swatch';
        swatch.style.backgroundColor = n.fill;
        swatch.style.borderColor = n.color;
        const label = document.createElement('span');
        label.textContent = n.name;
        item.appendChild(swatch);
        item.appendChild(label);
        itemsEl.appendChild(item);
    });
}

function wireLegendToggle() {
    const legendEl = document.getElementById('neighborhood-legend');
    if (!legendEl) return;

    const toggleBtn = legendEl.querySelector('.neighborhood-legend__toggle');
    const chevron = legendEl.querySelector('.neighborhood-legend__chevron');
    const itemsEl = legendEl.querySelector('.neighborhood-legend__items');

    if (!toggleBtn || !chevron || !itemsEl) return;

    const update = () => {
        const collapsed = legendEl.classList.contains('neighborhood-legend--collapsed');
        itemsEl.style.display = collapsed ? 'none' : 'block';
        chevron.textContent = collapsed ? '▸' : '▾';
    };

    toggleBtn.addEventListener('click', () => {
        legendEl.classList.toggle('neighborhood-legend--collapsed');
        update();
    });

    update();
}

function wireStyleToggle() {
    const toggleBtn = document.getElementById('map-style-toggle');
    if (!toggleBtn) return;

    toggleBtn.addEventListener('click', () => {
        if (!map || !standardLayer || !satelliteLayer) return;
        if (currentLayer) {
            map.removeLayer(currentLayer);
        }
        currentLayer = currentLayer === standardLayer ? satelliteLayer : standardLayer;
        currentLayer.addTo(map);
    });
}

function wireResizeOnWindow() {
    if (!map) return;
    const handleResize = () => {
        map.invalidateSize();
    };
    window.addEventListener('resize', handleResize);
}

export function syncMarkers(locations) {
    if (!map) return;

    const seenIds = new Set();

    locations.forEach(location => {
        const id = location.id;
        if (!id || typeof location.lat !== 'number' || typeof location.lng !== 'number') return;

        seenIds.add(id);

        let marker = markerById.get(id);
        if (!marker) {
            marker = L.marker([location.lat, location.lng]).addTo(map);
            markerById.set(id, marker);
        } else {
            marker.setLatLng([location.lat, location.lng]);
        }

        const images = location.images || [];
        const firstImage = images[0] || null;
        const name = location.name || '';
        const description = location.description || '';
        const addressHtml = location.address ? location.address.replace(/\n/g, '<br>') : null;

        const container = document.createElement('div');
        container.className = 'popup-location';

        if (firstImage) {
            const imgWrapper = document.createElement('div');
            imgWrapper.className = 'popup-location__image-wrapper';
            const img = document.createElement('img');
            img.className = 'popup-location__image';
            img.src = firstImage;
            img.alt = name;
            imgWrapper.appendChild(img);

            if (images.length > 1) {
                const badge = document.createElement('div');
                badge.className = 'popup-location__photo-count';
                badge.textContent = `${images.length} photos`;
                imgWrapper.appendChild(badge);
            }

            container.appendChild(imgWrapper);
        }

        const titleEl = document.createElement('strong');
        titleEl.textContent = name;
        container.appendChild(titleEl);

        // Add "More details" button (both desktop and mobile)
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        const isDesktop = !isTouchDevice && window.innerWidth > 768;
        
        const moreBtn = document.createElement('button');
        moreBtn.className = 'popup-location__more-btn';
        moreBtn.textContent = 'More details';
        moreBtn.type = 'button';
        moreBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            marker.closePopup();
            if (typeof onLocationSelectedCallback === 'function') {
                // Desktop: overlay mode, Mobile: sheet mode
                onLocationSelectedCallback(id, { 
                    desktopOverlay: isDesktop,
                    openSheet: !isDesktop // Mobile: explicitly open sheet
                });
            }
        });
        container.appendChild(moreBtn);

        // Bind popup to marker
        marker.bindPopup(container, {
            closeButton: true,
            autoPan: true,
            autoPanPadding: [50, 50]
        });

        // Attach marker events AFTER popup is bound
        if (typeof map._iroquoisAttachMarkerEvents === 'function') {
            map._iroquoisAttachMarkerEvents(marker, id);
        }
    });

    // Remove markers that are no longer present
    Array.from(markerById.entries()).forEach(([id, marker]) => {
        if (!seenIds.has(id)) {
            map.removeLayer(marker);
            markerById.delete(id);
        }
    });

    // Fit map to show all markers and neighborhoods after syncing
    fitMapToContent();
}

function fitMapToContent() {
    if (!map || hasFittedInitialBounds) return;

    const bounds = L.latLngBounds([]);

    // Add all marker positions
    markerById.forEach(marker => {
        bounds.extend(marker.getLatLng());
    });

    // Add all neighborhood polygon bounds
    neighborhoodPolygons.forEach(polygon => {
        bounds.extend(polygon.getBounds());
    });

    // Only fit if we have at least one marker or polygon
    if (!bounds.isValid()) return;

    // Fit bounds with 15px padding (top/bottom, left/right)
    map.fitBounds(bounds, {
        padding: [15, 15],
        maxZoom: 16 // Prevent zooming in too close
    });

    hasFittedInitialBounds = true;
}

export function focusOnLocation(location, options) {
    if (!map || !location) return;
    const { forSheet } = options || {};

    const marker = markerById.get(location.id);
    const latLng = marker ? marker.getLatLng() : L.latLng(location.lat, location.lng);

    if (!forSheet) {
        map.setView(latLng, map.getZoom(), { animate: true, duration: 0.5 });
        return;
    }

    // For bottom sheet: center marker in the visible map area above the sheet
    // Calculate the center of the visible map area (viewport minus sheet height)
    const isMobile = window.innerWidth <= 768;
    const bottomNavHeight = isMobile ? 56 : 64;
    const headerHeight = 50; // Approximate header height
    const sheetMaxHeight = isMobile ? window.innerHeight - bottomNavHeight - headerHeight : 400;
    const sheetActualHeight = Math.min(sheetMaxHeight, 500); // Reasonable max sheet height
    const viewportHeight = map.getContainer().clientHeight;
    const visibleMapHeight = viewportHeight - sheetActualHeight;
    const centerY = visibleMapHeight / 2; // Center of visible map area above sheet
    
    const targetPoint = map.latLngToContainerPoint(latLng);
    const offsetY = targetPoint.y - centerY; // How much to pan to center marker in visible area
    const adjustedPoint = L.point(targetPoint.x, targetPoint.y - offsetY);
    const adjustedLatLng = map.containerPointToLatLng(adjustedPoint);

    map.setView(adjustedLatLng, map.getZoom(), { animate: true, duration: 0.5 });
}

export function resizeMap() {
    if (!map) return;
    map.invalidateSize();
}

export function openMarkerPopup(locationId) {
    const marker = markerById.get(locationId);
    if (marker) {
        marker.openPopup();
    }
}

