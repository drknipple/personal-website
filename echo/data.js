// Data access: Supabase-backed Echos storage and retrieval

import { formatAddressFromNominatim, cleanAddressString } from './addressFormatter.js';
import { handleError, getUserFriendlyMessage, retryOperation, ErrorType } from './errorHandler.js';

const SUPABASE_URL = 'https://opgrhowuothwaxwmlbpu.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_XWJ202zZjG8R0lOyObyOJw_x-t7TFBm';

let supabaseClient = null;

if (typeof window !== 'undefined' && window.supabase && SUPABASE_URL && SUPABASE_ANON_KEY) {
    try {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('[data] Supabase client initialized:', SUPABASE_URL);
    } catch (err) {
        console.error('[data] Failed to initialize Supabase client:', err);
    }
} else {
    console.error('[data] Supabase not available:', {
        hasWindow: typeof window !== 'undefined',
        hasSupabase: typeof window !== 'undefined' && !!window.supabase,
        hasUrl: !!SUPABASE_URL,
        hasKey: !!SUPABASE_ANON_KEY
    });
}

const STORAGE_BUCKET_PHOTOS = 'echo-photos';
const STORAGE_BUCKET_VIDEOS = 'echo-videos';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_PHOTO_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

/**
 * Validate that geocoded address matches input address
 * @param {string} inputAddress - Original address input by user
 * @param {string} geocodedAddress - Formatted address from geocoding service
 * @param {Object} nominatimResult - Raw Nominatim result object
 * @returns {{isValid: boolean, message?: string, reason?: string}} Validation result
 */
function validateAddressMatch(inputAddress, geocodedAddress, nominatimResult) {
    const input = inputAddress.toLowerCase().trim();
    const geocoded = geocodedAddress.toLowerCase().trim();
    
    // Extract house number from input
    const inputHouseNumberMatch = input.match(/^(\d+)/);
    const inputHouseNumber = inputHouseNumberMatch ? inputHouseNumberMatch[1] : null;
    
    // Extract house number from geocoded result
    const geocodedHouseNumberMatch = geocoded.match(/^(\d+)/);
    const geocodedHouseNumber = geocodedHouseNumberMatch ? geocodedHouseNumberMatch[1] : null;
    
    // Check if input had a house number but result doesn't
    if (inputHouseNumber && !geocodedHouseNumber) {
        return {
            isValid: false,
            message: `The house number "${inputHouseNumber}" was not found. The address was geocoded to "${geocodedAddress}" (without the house number). Please verify the address or use the map picker to select the exact location.`,
            reason: 'house_number_missing'
        };
    }
    
    // Check if house numbers don't match (and they're significantly different)
    if (inputHouseNumber && geocodedHouseNumber) {
        const inputNum = parseInt(inputHouseNumber);
        const geocodedNum = parseInt(geocodedHouseNumber);
        // Allow small differences (e.g., 123 vs 125) but flag large differences
        if (Math.abs(inputNum - geocodedNum) > 100) {
            return {
                isValid: false,
                message: `The house number "${inputHouseNumber}" was not found. The geocoding service returned "${geocodedAddress}" with a different house number. Please verify the address or use the map picker.`,
                reason: 'house_number_mismatch'
            };
        }
    }
    
    // Extract street name from input (everything after house number, before comma)
    const inputStreetMatch = input.match(/^\d+\s+(.+?)(?:,|$)/);
    const inputStreet = inputStreetMatch ? inputStreetMatch[1].trim() : input.split(',')[0].trim();
    
    // Extract street name from geocoded result
    const geocodedStreetMatch = geocoded.match(/^\d+\s+(.+?)(?:,|$)/);
    const geocodedStreet = geocodedStreetMatch ? geocodedStreetMatch[1].trim() : geocoded.split(',')[0].trim();
    
    // Normalize street names (remove common suffixes variations)
    const normalizeStreet = (street) => {
        return street
            .replace(/\b(street|st|avenue|ave|road|rd|boulevard|blvd|drive|dr|lane|ln|way|wy|court|ct|place|pl)\b/gi, '')
            .trim()
            .toLowerCase();
    };
    
    const normalizedInputStreet = normalizeStreet(inputStreet);
    const normalizedGeocodedStreet = normalizeStreet(geocodedStreet);
    
    // Check if street names are significantly different
    if (normalizedInputStreet && normalizedGeocodedStreet) {
        // Check if they're similar (fuzzy match)
        const similarity = calculateSimilarity(normalizedInputStreet, normalizedGeocodedStreet);
        if (similarity < 0.5) {
            return {
                isValid: false,
                message: `The street name doesn't match. You entered "${inputAddress}" but the result is "${geocodedAddress}". Please verify the address or use the map picker.`,
                reason: 'street_name_mismatch'
            };
        }
    }
    
    // Check if result is just a road/highway (not a specific address)
    const addr = nominatimResult.address || {};
    const resultType = nominatimResult.type || '';
    const resultClass = nominatimResult.class || '';
    
    // If result is a highway/road but input had a house number, that's suspicious
    if (inputHouseNumber && (resultClass === 'highway' || resultType === 'road')) {
        if (!addr.house_number) {
            return {
                isValid: false,
                message: `The address "${inputAddress}" could not be found. The geocoding service returned a location on "${geocodedAddress}" but without a specific house number. Please verify the address or use the map picker.`,
                reason: 'road_only_no_house_number'
            };
        }
    }
    
    return {
        isValid: true,
        message: 'Address matches'
    };
}

/**
 * Calculate similarity between two strings (simple Levenshtein-based)
 */
function calculateSimilarity(str1, str2) {
    if (!str1 || !str2) return 0;
    if (str1 === str2) return 1;
    
    // Simple word-based similarity
    const words1 = str1.split(/\s+/);
    const words2 = str2.split(/\s+/);
    
    let matches = 0;
    for (const word1 of words1) {
        for (const word2 of words2) {
            if (word1 === word2 || word1.includes(word2) || word2.includes(word1)) {
                matches++;
                break;
            }
        }
    }
    
    return matches / Math.max(words1.length, words2.length);
}

export function hasSupabase() {
    return !!supabaseClient;
}

// Diagnostic function to check buckets
export async function checkBuckets() {
    if (!supabaseClient) {
        console.error('[data] Supabase client not initialized');
        return;
    }

    try {
        const { data: buckets, error } = await supabaseClient.storage.listBuckets();
        if (error) {
            console.error('[data] Error listing buckets:', error);
            console.warn('[data] Note: Anon key may not have permission to list buckets, but uploads might still work');
            return;
        }
        console.log('[data] Available buckets:', buckets?.map(b => b.name) || []);
        console.log('[data] Looking for:', STORAGE_BUCKET_PHOTOS, 'and', STORAGE_BUCKET_VIDEOS);
        
        if (!buckets || buckets.length === 0) {
            console.error('[data] No buckets found! Please create them in Supabase Storage:');
            console.error(`[data] 1. Create bucket: ${STORAGE_BUCKET_PHOTOS} (Public)`);
            console.error(`[data] 2. Create bucket: ${STORAGE_BUCKET_VIDEOS} (Public)`);
            return;
        }
        
        const photoBucket = buckets?.find(b => b.name === STORAGE_BUCKET_PHOTOS);
        const videoBucket = buckets?.find(b => b.name === STORAGE_BUCKET_VIDEOS);
        
        if (!photoBucket) {
            console.error(`[data] Bucket '${STORAGE_BUCKET_PHOTOS}' not found in available buckets!`);
            console.error(`[data] Available bucket names:`, buckets.map(b => b.name));
        } else {
            console.log(`[data] ✓ Found bucket '${STORAGE_BUCKET_PHOTOS}':`, photoBucket);
        }
        
        if (!videoBucket) {
            console.error(`[data] Bucket '${STORAGE_BUCKET_VIDEOS}' not found in available buckets!`);
            console.error(`[data] Available bucket names:`, buckets.map(b => b.name));
        } else {
            console.log(`[data] ✓ Found bucket '${STORAGE_BUCKET_VIDEOS}':`, videoBucket);
        }
    } catch (err) {
        console.error('[data] Error checking buckets:', err);
    }
}

/**
 * Generate a unique filename for uploaded files
 * @param {string} originalName - Original filename
 * @returns {string} Unique filename with UUID
 */
function generateUniqueFilename(originalName) {
    const ext = originalName.split('.').pop();
    const uuid = crypto.randomUUID ? crypto.randomUUID() : 
        `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    return `${uuid}.${ext}`;
}

/**
 * Resize and optimize an image file
 * @param {File} file - Image file to resize
 * @param {number} maxWidth - Maximum width (default: 1920)
 * @param {number} maxHeight - Maximum height (default: 1920)
 * @param {number} quality - JPEG quality 0-1 (default: 0.85)
 * @returns {Promise<File>} Resized image file
 */
async function resizeImage(file, maxWidth = 1920, maxHeight = 1920, quality = 0.85) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                let width = img.width;
                let height = img.height;

                if (width > maxWidth || height > maxHeight) {
                    const ratio = Math.min(maxWidth / width, maxHeight / height);
                    width = width * ratio;
                    height = height * ratio;
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            resolve(new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() }));
                        } else {
                            reject(new Error('Failed to resize image'));
                        }
                    },
                    'image/jpeg',
                    quality
                );
            };
            img.onerror = reject;
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

/**
 * Upload a photo to Supabase Storage
 * @param {File} file - Image file to upload
 * @returns {Promise<string>} Public URL of uploaded photo
 * @throws {Error} If upload fails or file is invalid
 */
export async function uploadPhoto(file) {
    if (!supabaseClient) {
        throw new Error('Supabase not configured. Cannot upload photo. Check console for initialization errors.');
    }

    // Validate file type
    if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
        throw new Error('Invalid file type. Please upload a JPEG, PNG, or WebP image.');
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
        throw new Error(`File is too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB.`);
    }

    try {
        console.log('[data] Starting photo upload to bucket:', STORAGE_BUCKET_PHOTOS);
        
        // Resize/optimize image before upload
        const optimizedFile = await resizeImage(file);
        console.log('[data] Image optimized, size:', optimizedFile.size, 'bytes');

        // Generate unique filename
        const filename = generateUniqueFilename(file.name);
        const filePath = `${filename}`;
        console.log('[data] Uploading file:', filePath);

        // Upload to Supabase Storage
        const { data, error } = await supabaseClient.storage
            .from(STORAGE_BUCKET_PHOTOS)
            .upload(filePath, optimizedFile, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) {
            // Use errorHandler for consistent error messages
            const handled = handleError(error, 'upload-photo');
            
            // Provide more helpful error message based on error type
            if (handled.type === ErrorType.NOT_FOUND) {
                throw new Error(`Bucket '${STORAGE_BUCKET_PHOTOS}' not found or not accessible. Please verify it exists and is public in Supabase Storage.`);
            }
            if (handled.type === ErrorType.PERMISSION) {
                throw new Error(`Permission denied. Please check that the storage bucket policies allow public uploads.`);
            }
            if (handled.type === ErrorType.NETWORK) {
                throw new Error(`Network error: Failed to connect to Supabase. Check your internet connection and Supabase URL.`);
            }
            throw new Error(handled.userMessage || 'Failed to upload photo. Check console for details.');
        }

        console.log('[data] Upload successful:', data);

        // Get public URL
        const { data: urlData } = supabaseClient.storage
            .from(STORAGE_BUCKET_PHOTOS)
            .getPublicUrl(filePath);

        console.log('[data] Public URL:', urlData.publicUrl);
        return urlData.publicUrl;
    } catch (err) {
        // Re-throw validation errors as-is (they're already user-friendly)
        if (err.message && (err.message.includes('Invalid file type') || err.message.includes('too large'))) {
            throw err;
        }
        
        // Use errorHandler for other errors
        const handled = handleError(err, 'upload-photo');
        throw new Error(handled.userMessage || 'Failed to upload photo.');
    }
}

/**
 * Upload a video to Supabase Storage
 * @param {Blob|File} file - Video file to upload
 * @param {string} filename - Optional filename (defaults to generated name)
 * @returns {Promise<string>} Public URL of uploaded video
 * @throws {Error} If upload fails or file is invalid
 */
export async function uploadVideo(file, filename) {
    if (!supabaseClient) {
        throw new Error('Supabase not configured. Cannot upload video.');
    }

    // CRITICAL SAFETY CHECK: Verify this is actually a video file
    // This prevents accidentally uploading images as videos (costly mistake)
    const validVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/ogg'];
    const validExtensions = ['.mp4', '.webm', '.mov', '.avi', '.ogv'];
    
    // Check MIME type
    if (file.type) {
        if (!validVideoTypes.includes(file.type)) {
            console.error('[data] CRITICAL: Invalid file type for video upload:', file.type);
            throw new Error(`SECURITY: Invalid file type (${file.type}). Only video files can be uploaded to videos bucket.`);
        }
    } else {
        console.warn('[data] Warning: File has no MIME type, checking extension only');
    }
    
    // Check filename extension
    const filenameLower = (filename || file.name || '').toLowerCase();
    const hasValidExtension = validExtensions.some(ext => filenameLower.endsWith(ext));
    if (!hasValidExtension) {
        console.error('[data] CRITICAL: Invalid file extension for video upload:', filename);
        throw new Error(`SECURITY: Invalid file extension. Only video files (.mp4, .webm, etc.) can be uploaded to videos bucket.`);
    }
    
    // Additional safety: Videos should typically be larger than small images
    // But be lenient - small videos are possible
    if (file.size < 500) {
        console.error('[data] CRITICAL: File is suspiciously small for a video:', file.size, 'bytes');
        throw new Error(`SECURITY: File too small to be a valid video (${file.size} bytes).`);
    }

    try {
        const filePath = filename || generateUniqueFilename('video.mp4');

        console.log('[data] Uploading verified video file:', filePath, 'Type:', file.type, 'Size:', file.size, 'bytes');

        // Upload to Supabase Storage
        // Use upsert: true to overwrite if file already exists (e.g., from a previous failed attempt)
        const { data, error } = await supabaseClient.storage
            .from(STORAGE_BUCKET_VIDEOS)
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: true
            });

        if (error) {
            const handled = handleError(error, 'upload-video');
            throw new Error(handled.userMessage || 'Failed to upload video.');
        }

        // Get public URL
        const { data: urlData } = supabaseClient.storage
            .from(STORAGE_BUCKET_VIDEOS)
            .getPublicUrl(filePath);

        console.log('[data] Video uploaded successfully to videos bucket:', urlData.publicUrl);
        return urlData.publicUrl;
    } catch (err) {
        // Re-throw security/validation errors as-is
        if (err.message && err.message.includes('SECURITY:')) {
            throw err;
        }
        
        const handled = handleError(err, 'upload-video');
        throw new Error(handled.userMessage || 'Failed to upload video.');
    }
}


/**
 * Geocode an address to coordinates using Nominatim
 * @param {string} address - Address string to geocode
 * @returns {Promise<{lat: number, lng: number, displayName: string}>} Coordinates and formatted address
 * @throws {Error} If geocoding fails or address is invalid
 */
export async function geocodeAddress(address) {
    if (!address || !address.trim()) {
        throw new Error('Address is empty.');
    }

    const query = encodeURIComponent(address.trim());
    
    // Try using a CORS proxy for Nominatim
    // Using a public CORS proxy (for prototype only - in production, use a backend service)
    const proxyUrl = 'https://api.allorigins.win/raw?url=';
    // Add addressdetails=1 for structured address data, and prefer addresses over POIs
    // The 'q' parameter is for free-form search, but we can also try structured parameters
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=5&addressdetails=1&extratags=1&namedetails=0`;
    const url = `${proxyUrl}${encodeURIComponent(nominatimUrl)}`;

    try {
        const response = await fetch(url, {
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            const handled = handleError(new Error(`Geocoding failed with status ${response.status}`), 'geocode-address');
            throw new Error(handled.userMessage);
        }

        const results = await response.json();
        if (!Array.isArray(results) || results.length === 0) {
            throw new Error('No results found for that address.');
        }

        // Try to find the best match: prefer addresses over POIs
        // POIs have 'type' like 'restaurant', 'attraction', etc.
        // Addresses have 'type' like 'house', 'building', 'road', etc.
        let bestMatch = results[0];
        for (const result of results) {
            const type = result.type || '';
            const category = result.category || '';
            const classType = result.class || '';
            
            // Prefer results that are actual addresses, not POIs
            // POIs typically have class like 'amenity', 'tourism', 'leisure', 'shop'
            // Addresses have class like 'highway', 'place', 'building'
            const isPOI = ['amenity', 'tourism', 'leisure', 'shop', 'sport'].includes(classType);
            const isAddress = ['highway', 'place', 'building', 'boundary'].includes(classType);
            
            if (isAddress && !isPOI) {
                bestMatch = result;
                break; // Found a good address match
            }
        }

        const first = bestMatch;
        // Format address: "HouseNumber Street, City, ST ZIPCODE"
        const formattedAddress = formatAddressFromNominatim(first);
        const lat = parseFloat(first.lat);
        const lng = parseFloat(first.lon);
        
        // Validate that the returned address matches the input address
        const validationResult = validateAddressMatch(address, formattedAddress, first);
        if (!validationResult.isValid) {
            console.warn('[data] Address validation failed:', validationResult);
            throw new Error(validationResult.message || `The address "${address}" could not be found. The geocoding service returned "${formattedAddress}" which doesn't match. Please verify the address or use the map picker to select the exact location.`);
        }
        
        console.log('[data] Geocoding result:', {
            input: address,
            formatted: formattedAddress,
            lat: lat,
            lng: lng,
            nominatim_display: first.display_name,
            nominatim_address: first.address, // Log the structured address data
            nominatim_type: first.type,
            nominatim_class: first.class,
            all_results_count: results.length,
            selected_result: bestMatch === first ? 'best match (address preferred)' : 'first result (may be POI)',
            validation: validationResult
        });
        
        return {
            lat: lat,
            lng: lng,
            displayName: formattedAddress
        };
    } catch (err) {
        // Re-throw validation errors as-is (they're already user-friendly)
        if (err.message && (err.message.includes('Address is empty') || err.message.includes('No results found') || err.message.includes('house number') || err.message.includes('street name'))) {
            throw err;
        }
        
        const handled = handleError(err, 'geocode-address');
        throw new Error(handled.userMessage || `Could not find location for "${address}". Please try a different address or use the map picker.`);
    }
}

/**
 * Save a new Echo to the database
 * @param {Object} echoData - Echo data object
 * @returns {Promise<Object>} Saved echo with database ID
 * @throws {Error} If save fails
 */
export async function saveEcho(echoData) {
    if (!supabaseClient) {
        throw new Error('Supabase not configured. Cannot save Echo.');
    }

    const echoRecord = {
        user_id: echoData.userId || 'eric', // For now, hardcoded
        photo_url: echoData.photoUrl,
        video_url: echoData.videoUrl || null,
        event: echoData.event || null,
        narration: echoData.narration,
        location_name: echoData.locationName,
        lat: echoData.lat,
        lng: echoData.lng,
        year: echoData.year,
        status: echoData.status || 'pending' // 'pending', 'generating', 'completed', 'failed'
    };

    try {
        const { data, error } = await supabaseClient
            .from('echos')
            .insert([echoRecord])
            .select()
            .single();

        if (error) {
            const handled = handleError(error, 'save-echo');
            throw new Error(handled.userMessage || 'Failed to save Echo.');
        }

        return {
            id: data.id,
            ...echoData
        };
    } catch (err) {
        // Re-throw if already handled
        if (err.message && err.message !== err.toString()) {
            throw err;
        }
        const handled = handleError(err, 'save-echo');
        throw new Error(handled.userMessage || 'Failed to save Echo.');
    }
}

/**
 * Update an existing Echo in the database
 * @param {string} echoId - Echo ID to update
 * @param {Object} updates - Fields to update (frontend format)
 * @returns {Promise<Object>} Updated echo (frontend format)
 * @throws {Error} If update fails
 */
export async function updateEcho(echoId, updates) {
    if (!supabaseClient) {
        throw new Error('Supabase not configured. Cannot update Echo.');
    }

    // Map frontend field names to database column names
    const dbUpdates = {
        photo_url: updates.photoUrl,
        video_url: updates.videoUrl || null,
        event: updates.event || null,
        narration: updates.narration,
        location_name: updates.locationName,
        lat: updates.lat,
        lng: updates.lng,
        year: updates.year,
        status: updates.status || 'pending'
    };

    // Remove undefined fields
    Object.keys(dbUpdates).forEach(key => {
        if (dbUpdates[key] === undefined) {
            delete dbUpdates[key];
        }
    });

    try {
        const { data, error } = await supabaseClient
            .from('echos')
            .update(dbUpdates)
            .eq('id', echoId)
            .select()
            .single();

        if (error) {
            const handled = handleError(error, 'update-echo');
            throw new Error(handled.userMessage || 'Failed to update Echo.');
        }

        // Map database fields back to frontend format
        return {
            id: data.id,
            userId: data.user_id,
            photoUrl: data.photo_url,
            videoUrl: data.video_url,
            event: data.event,
            narration: data.narration,
            locationName: data.location_name,
            lat: parseFloat(data.lat),
            lng: parseFloat(data.lng),
            year: data.year,
            status: data.status || 'pending',
            createdAt: data.created_at
        };
    } catch (err) {
        // Re-throw if already handled
        if (err.message && err.message !== err.toString()) {
            throw err;
        }
        const handled = handleError(err, 'update-echo');
        throw new Error(handled.userMessage || 'Failed to update Echo.');
    }
}

// Address formatting functions moved to addressFormatter.js module
// Using imported formatAddressFromNominatim and cleanAddressString

/**
 * Load all Echos from the database
 * @returns {Promise<Array>} Array of Echo objects (frontend format)
 */
export async function loadEchos() {
    if (!supabaseClient) {
        console.warn('[data] Supabase not configured or unavailable.');
        return [];
    }

    try {
        const { data, error } = await supabaseClient
            .from('echos')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            handleError(error, 'load-echos');
            return [];
        }

        if (!data || !data.length) {
            return [];
        }

        const echos = data.map(item => ({
            id: item.id,
            userId: item.user_id,
            photoUrl: item.photo_url,
            videoUrl: item.video_url,
            event: item.event || null,
            narration: item.narration,
            locationName: cleanAddressString(item.location_name || ''),
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lng),
            year: item.year,
            status: item.status || 'pending', // Default to 'pending' if not set
            createdAt: item.created_at
        }));
        
        // Log video URLs for debugging
        echos.forEach(echo => {
            if (echo.videoUrl) {
                console.log(`[data] Echo ${echo.id} has videoUrl:`, echo.videoUrl, 'status:', echo.status);
            }
        });
        
        return echos;
    } catch (err) {
        handleError(err, 'load-echos');
        return [];
    }
}

// Helper function to check if a video file exists
export async function checkVideoExists(videoUrl) {
    if (!videoUrl) return false;
    
    try {
        const response = await fetch(videoUrl, { method: 'HEAD' });
        return response.ok;
    } catch (err) {
        console.warn('[data] Error checking video:', err);
        return false;
    }
}

export async function deleteEcho(echoId) {
    if (!supabaseClient) {
        throw new Error('Supabase not configured. Cannot delete Echo.');
    }

    try {
        const { error } = await supabaseClient
            .from('echos')
            .delete()
            .eq('id', echoId);

        if (error) {
            throw error;
        }

        return true;
    } catch (err) {
        console.error('[data] Error deleting Echo:', err);
        throw err;
    }
}
