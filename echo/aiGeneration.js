// AI video generation: Runway ML integration, polling, status updates

import { updateEcho, uploadVideo, loadEchos } from './data.js';
import * as appState from './appState.js';

// Polling interval
let videoCheckInterval = null;

// Callbacks (will be set by init)
let onVideoReady = null;
let onVideoFailed = null;
let onPollingUpdate = null;
let loadAllEchos = null;

/**
 * Initialize AI generation with callbacks
 */
export function initAIGeneration(callbacks) {
    onVideoReady = callbacks.onVideoReady;
    onVideoFailed = callbacks.onVideoFailed;
    onPollingUpdate = callbacks.onPollingUpdate;
    loadAllEchos = callbacks.loadAllEchos;
}

/**
 * Generate AI video from photo and narration
 * Returns video URL when complete, or throws error if anything fails
 */
export async function generateAIVideo(photoUrl, narration) {
    // Check if proxy server is available
    const PROXY_URL = window.PROXY_URL || 'http://localhost:3001';
    const API_KEY = window.RUNWAY_API_KEY || null;

    try {
        // Build prompt from narration
        const prompt = `${narration}. Transform this photo into a short video with subtle motion, like a gentle zoom or pan.`;
        
        console.log('[aiGeneration] Sending request to proxy server:', PROXY_URL);
        console.log('[aiGeneration] Photo URL:', photoUrl);
        console.log('[aiGeneration] Prompt:', prompt);
        
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (API_KEY) {
            headers['x-runway-api-key'] = API_KEY;
        }
        
        const response = await fetch(`${PROXY_URL}/api/runway/image-to-video`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                image_url: photoUrl,
                prompt: prompt,
                duration: 3, // 3 seconds
                resolution: '720p'
            })
        });
        
        console.log('[aiGeneration] Proxy response status:', response.status);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('[aiGeneration] Proxy error:', errorData);
            throw new Error(errorData.error || errorData.message || `Proxy error: ${response.status} ${response.statusText}`);
        }

        const jobData = await response.json();
        console.log('[aiGeneration] Job created:', jobData);
        const jobId = jobData.id || jobData.job_id;

        if (!jobId) {
            console.error('[aiGeneration] No job ID in response:', jobData);
            throw new Error('No job ID returned from API');
        }
        
        console.log('[aiGeneration] Runway job ID:', jobId);

        // Poll for completion
        let attempts = 0;
        const maxAttempts = 60; // 5 minutes max (5 second intervals)
        
        console.log(`[aiGeneration] Starting to poll for job ${jobId}, max attempts: ${maxAttempts}`);
        
        while (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
            
            attempts++;
            console.log(`[aiGeneration] Polling attempt ${attempts}/${maxAttempts} for job ${jobId}`);
            
            const statusHeaders = {};
            if (API_KEY) {
                statusHeaders['x-runway-api-key'] = API_KEY;
            }
            const statusResponse = await fetch(`${PROXY_URL}/api/runway/image-to-video/${jobId}`, {
                headers: statusHeaders
            });

            if (!statusResponse.ok) {
                throw new Error(`Failed to check job status: ${statusResponse.status}`);
            }

            const statusData = await statusResponse.json();
            const status = statusData.status || statusData.state;
            console.log(`[aiGeneration] Job status check ${attempts + 1}:`, status);
            
            if (status === 'SUCCEEDED' || status === 'succeeded' || status === 'completed') {
                const videoUrl = statusData.output?.[0];
                console.log('[aiGeneration] Status is SUCCEEDED, checking for video URL...');
                if (!videoUrl) {
                    console.error('[aiGeneration] Video succeeded but no URL found in output:', statusData);
                    throw new Error('Video URL not found in response');
                }
                console.log('[aiGeneration] ✅ Video ready! URL:', videoUrl);
                return videoUrl;
            } else if (status === 'FAILED' || status === 'failed' || status === 'CANCELED' || status === 'canceled') {
                console.error('[aiGeneration] Video generation failed:', statusData);
                throw new Error(statusData.error || `Video generation ${status.toLowerCase()}`);
            }
            
            // Update polling status if callback provided
            if (onPollingUpdate) {
                onPollingUpdate(attempts * 5);
            }
        }

        throw new Error('Video generation timed out after 5 minutes');

    } catch (error) {
        console.error('[aiGeneration] Runway connection/generation error:', error);
        throw error;
    }
}

/**
 * Process video after generation succeeds
 * Uploads video to Supabase and updates Echo record
 */
export async function generateAIVideoAsync(echoId, videoUrl, callbacks) {
    try {
        console.log('[aiGeneration] Processing video for Echo:', echoId);
        console.log('[aiGeneration] Video URL from Runway:', videoUrl);
        
        // Verify this is a real video (not placeholder)
        const isPlaceholder = videoUrl.includes('echo-photos') ||
                             videoUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i);
        
        if (isPlaceholder) {
            console.error('[aiGeneration] CRITICAL: Placeholder detected');
            throw new Error('Placeholder detected - invalid video URL');
        }
        
        // Fetch video from Runway
        console.log('[aiGeneration] Fetching video from Runway URL:', videoUrl);
        const response = await fetch(videoUrl);
        
        const contentType = response.headers.get('content-type') || '';
        if (!contentType.startsWith('video/')) {
            console.error('[aiGeneration] CRITICAL: Runway returned non-video content type:', contentType);
            throw new Error(`Invalid content type from Runway: ${contentType}. Expected video/*`);
        }
        
        const videoBlob = await response.blob();
        
        if (!videoBlob.type || !videoBlob.type.startsWith('video/')) {
            console.error('[aiGeneration] CRITICAL: Blob is not a video file:', videoBlob.type);
            throw new Error(`Blob is not a video file: ${videoBlob.type}`);
        }
        
        console.log('[aiGeneration] Verified video file - Type:', videoBlob.type, 'Size:', videoBlob.size, 'bytes');
        
        // Upload to Supabase
        const videoFilename = `echo-${echoId}.mp4`;
        const uploadedVideoUrl = await uploadVideo(videoBlob, videoFilename);
        console.log('[aiGeneration] Video uploaded successfully to videos bucket:', uploadedVideoUrl);
        
        // Update Echo with video URL in database
        await updateEcho(echoId, {
            video_url: uploadedVideoUrl,
            status: 'completed'
        });
        
        console.log('[aiGeneration] Echo updated with video URL in database');
        
        // Reload Echos to update the map
        if (loadAllEchos) {
            await loadAllEchos();
        }
        
        // Call video ready callback
        if (onVideoReady) {
            const echo = appState.findEchoById(echoId);
            onVideoReady(echo || { id: echoId, videoUrl: uploadedVideoUrl, status: 'completed' });
        }
        
    } catch (error) {
        console.error('[aiGeneration] Error in async video generation:', error);
        
        // Stop polling on any error
        stopVideoStatusPolling();
        
        // Reset status in database
        await updateEcho(echoId, { 
            status: 'pending',
            video_url: null
        });
        
        // Call video failed callback
        if (onVideoFailed) {
            onVideoFailed(echoId, error);
        }
        
        throw error;
    }
}

/**
 * Start polling for video status updates
 */
export function startVideoStatusPolling(onVideoReady, onVideoFailed, loadEchos) {
    // Clear any existing interval
    if (videoCheckInterval) {
        clearInterval(videoCheckInterval);
    }
    
    // Check every 30 seconds for any Echos that are generating
    videoCheckInterval = setInterval(async () => {
        const echos = appState.getEchos();
        const generatingEchos = echos.filter(e => e.status === 'generating');
        if (generatingEchos.length === 0) {
            // No generating Echos, stop polling
            clearInterval(videoCheckInterval);
            videoCheckInterval = null;
            return;
        }
        
        // Reload Echos to check for updates
        const updatedEchos = await loadEchos();
        
        // Check if any generating Echos are now completed
        for (const echo of generatingEchos) {
            const updated = updatedEchos.find(e => e.id === echo.id);
            if (updated && updated.status === 'completed' && updated.videoUrl) {
                // Video is ready!
                appState.updateEcho(echo.id, updated);
                
                // Call video ready callback
                if (onVideoReady) {
                    onVideoReady(updated);
                }
            }
        }
    }, 30000); // Check every 30 seconds
}

/**
 * Stop video status polling
 */
export function stopVideoStatusPolling() {
    if (videoCheckInterval) {
        clearInterval(videoCheckInterval);
        videoCheckInterval = null;
    }
}

/**
 * Check if polling is active
 */
export function isPolling() {
    return videoCheckInterval !== null;
}
