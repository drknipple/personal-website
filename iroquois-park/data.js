// Data access: Supabase-backed locations with optional local seed fallback

const SUPABASE_URL = 'https://dhjtjdcmwullhfoowydf.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_fQLeeQ22myhK7vEEXms87w_Zu0zutSq';

let supabaseClient = null;

if (typeof window !== 'undefined' && window.supabase && SUPABASE_URL && SUPABASE_ANON_KEY) {
    try {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } catch (err) {
        console.error('[data] Failed to initialize Supabase client:', err);
    }
}

// Local seed locations used only if Supabase is unavailable.
// Image paths reuse the existing iroquois-park assets via a relative path.
const SEED_LOCATIONS = [
    {
        id: 'seed-iroquois-park',
        name: 'Iroquois Park',
        description: 'A historic Olmsted-designed park with rolling hills, overlooks, and miles of trails.',
        lat: 38.16125210200293,
        lng: -85.78630408253188,
        images: [
            './images/iroquois-park/iroquoispark_postcard.jpg',
            './images/iroquois-park/KY_Louisville_IroquoisPark_byCharlesABirnbaum_2019_012_sig_004.jpg',
            './images/iroquois-park/KY_Louisville_IroquoisPark_byCharlesABirnbaum_2019_022_sig_008.jpg'
        ],
        address: '5216 New Cut Rd.\nLouisville, KY 40214',
        yearAcquired: '1888',
        hours: '6 a.m. – 11 p.m.'
    },
    {
        id: 'seed-amphitheater',
        name: 'Iroquois Amphitheater',
        description: 'Open-air amphitheater tucked into the hillside, hosting concerts and community events.',
        lat: 38.16012638646294,
        lng: -85.78026526062392,
        images: [
            './images/ampitheater/1.jpg',
            './images/ampitheater/img copy.jpg'
        ],
        address: '1080 Amphitheater Rd.\nLouisville, KY 40214',
        yearAcquired: null,
        hours: null
    },
    {
        id: 'seed-disc-golf',
        name: 'Iroquois Park Disc Golf',
        description: 'A wooded 18-hole disc golf course weaving through the park’s hills.',
        lat: 38.15867703772137,
        lng: -85.77885240650139,
        images: [
            './images/disc/eb7152f63bf8a8a8fff08aae673a1197_m_iHoLuwsPT0oWdpVjrQr3lchkRMpk copy.jpg'
        ],
        address: null,
        yearAcquired: null,
        hours: null
    },
    {
        id: 'seed-overlook',
        name: 'Iroquois Park Overlook',
        description: 'One of Louisville’s best skyline views, especially at sunset.',
        lat: 38.16738661102735,
        lng: -85.78585545442746,
        images: [
            './images/overlook/110184_orig.jpg',
            './images/overlook/124309_orig.jpg',
            './images/overlook/4731588_orig.jpg'
        ],
        address: null,
        yearAcquired: null,
        hours: null
    },
    {
        id: 'seed-little-loomhouse',
        name: 'The Little Loomhouse',
        description: 'Historic cabins celebrating Appalachian weaving traditions on Kenwood Hill.',
        lat: 38.157697,
        lng: -85.770728,
        images: [
            './images/loomhouse/250px-Little_Loomhouse_Esta_Cabin.jpeg',
            './images/loomhouse/250px-Tophouse_Cabin.jpeg',
            './images/loomhouse/330px-Wistaria_Cabin.jpeg'
        ],
        address: '328 Kenwood Hill Rd.\nLouisville, KY 40214',
        yearAcquired: null,
        hours: null
    }
];

export function hasSupabase() {
    return !!supabaseClient;
}

export async function loadLocations() {
    if (!supabaseClient) {
        console.warn('[data] Supabase not configured or unavailable. Using local seed locations.');
        return SEED_LOCATIONS.slice();
    }

    try {
        const { data, error } = await supabaseClient
            .from('locations')
            .select('*')
            .order('name', { ascending: true });

        if (error) {
            console.error('[data] Supabase load error:', error);
            return SEED_LOCATIONS.slice();
        }

        if (!data || !data.length) {
            // Table exists but is empty; still show seeds as a friendly fallback
            console.warn('[data] Supabase locations table is empty. Using seed locations.');
            return SEED_LOCATIONS.slice();
        }

        return data.map(item => ({
            id: item.id,
            name: item.name,
            description: item.description || '',
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lng),
            images: item.images || [],
            address: item.address || null,
            yearAcquired: item.year_acquired || null,
            hours: item.hours || null
        }));
    } catch (err) {
        console.error('[data] Error loading locations from Supabase:', err);
        return SEED_LOCATIONS.slice();
    }
}

export async function saveLocation(locationInput) {
    if (!supabaseClient) {
        throw new Error('Supabase not configured. Cannot save location.');
    }

    const locationData = {
        name: locationInput.name,
        description: locationInput.description || '',
        lat: locationInput.lat,
        lng: locationInput.lng,
        images: locationInput.images || [],
        address: locationInput.address || null,
        year_acquired: locationInput.yearAcquired || null,
        hours: locationInput.hours || null
    };

    const isUUID =
        typeof locationInput.id === 'string' &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(locationInput.id);

    try {
        if (isUUID) {
            const { error } = await supabaseClient
                .from('locations')
                .update(locationData)
                .eq('id', locationInput.id);

            if (error) {
                throw error;
            }

            return { ...locationInput };
        }

        const { data, error } = await supabaseClient
            .from('locations')
            .insert([locationData])
            .select()
            .single();

        if (error) {
            throw error;
        }

        return {
            ...locationInput,
            id: data.id
        };
    } catch (err) {
        console.error('[data] Error saving location to Supabase:', err);
        throw err;
    }
}

export async function geocodeAddress(address) {
    if (!address || !address.trim()) {
        throw new Error('Address is empty.');
    }

    const query = encodeURIComponent(address.trim());
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`;

    try {
        const response = await fetch(url, {
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'IroquoisParkExplorer/1.0 (ericeatherly.com)'
            }
        });

        if (!response.ok) {
            throw new Error(`Geocoding failed with status ${response.status}`);
        }

        const results = await response.json();
        if (!Array.isArray(results) || results.length === 0) {
            throw new Error('No results found for that address.');
        }

        const first = results[0];
        return {
            lat: parseFloat(first.lat),
            lng: parseFloat(first.lon)
        };
    } catch (err) {
        console.error('[data] Error geocoding address:', err);
        throw err;
    }
}

