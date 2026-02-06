// Notifications: bell notifications, tooltips, dropdowns

import * as appState from './appState.js';

// DOM element references (will be initialized)
let notification, notificationText;
let notificationBell, bellBadge, bellTooltip, bellTooltipText, bellTooltipClose;
let bellDropdown, bellDropdownList, bellDropdownClose;

/**
 * Initialize notifications with DOM element references
 */
export function initNotifications(elements) {
    notification = elements.notification;
    notificationText = elements.notificationText;
    notificationBell = elements.notificationBell;
    bellBadge = elements.bellBadge;
    bellTooltip = elements.bellTooltip;
    bellTooltipText = elements.bellTooltipText;
    bellTooltipClose = elements.bellTooltipClose;
    bellDropdown = elements.bellDropdown;
    bellDropdownList = elements.bellDropdownList;
    bellDropdownClose = elements.bellDropdownClose;
}

/**
 * Show notification message
 */
export function showNotification(message, duration = 5000) {
    notificationText.textContent = message;
    notification.hidden = false;
    
    // Auto-hide after specified duration (default 5 seconds)
    setTimeout(() => {
        notification.hidden = true;
    }, duration);
}

/**
 * Show bell tooltip
 */
export function showBellTooltip(message) {
    bellTooltipText.textContent = message;
    bellTooltip.hidden = false;
    
    // Auto-hide after 10 seconds (user can also close manually)
    setTimeout(() => {
        hideBellTooltip();
    }, 10000);
}

/**
 * Hide bell tooltip
 */
export function hideBellTooltip() {
    bellTooltip.hidden = true;
}

/**
 * Update bell for ready video
 */
export function updateBellForReadyVideo(echo) {
    // Show badge on bell
    bellBadge.hidden = false;
    
    // Update bell icon to show it's active
    notificationBell.textContent = '🔔';
    
    // Hide tooltip if it's showing
    hideBellTooltip();
    
    // Show brief notification
    showNotification(`✨ Your Echo from ${echo.locationName} is ready!`, 5000);
}

/**
 * Handle bell click
 */
export function handleBellClick(onEchoSelected) {
    // Get unacknowledged ready videos
    const echos = appState.getEchos();
    const readyEchos = echos.filter(e => 
        e.status === 'completed' && 
        e.videoUrl && 
        !e.videoUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) &&
        !appState.isVideoAcknowledged(e.id)
    );
    
    if (readyEchos.length > 0) {
        // Show dropdown with ready videos
        showBellDropdown(readyEchos, onEchoSelected);
    } else {
        // No ready videos, just close dropdown if open
        closeBellDropdown();
    }
    
    // Hide tooltip if showing
    hideBellTooltip();
}

/**
 * Show bell dropdown with ready videos
 */
export function showBellDropdown(readyEchos, onEchoSelected) {
    // Clear existing list
    bellDropdownList.innerHTML = '';
    
    // Mark all as acknowledged
    readyEchos.forEach(echo => {
        appState.acknowledgeVideo(echo.id);
    });
    
    // Add each ready echo as a clickable link
    readyEchos.forEach(echo => {
        const item = document.createElement('div');
        item.className = 'notification-bell__dropdown-item';
        item.innerHTML = `
            <a href="#" class="notification-bell__dropdown-link" data-echo-id="${echo.id}">
                <span class="notification-bell__dropdown-location">${echo.locationName || 'Unknown Location'}</span>
                <span class="notification-bell__dropdown-year">${echo.year || '?'}</span>
            </a>
        `;
        
        // Add click handler
        item.querySelector('a').addEventListener('click', (e) => {
            e.preventDefault();
            const echoToOpen = appState.findEchoById(echo.id);
            if (echoToOpen && onEchoSelected) {
                onEchoSelected(echoToOpen);
            }
            closeBellDropdown();
        });
        
        bellDropdownList.appendChild(item);
    });
    
    bellDropdown.hidden = false;
}

/**
 * Close bell dropdown
 */
export function closeBellDropdown() {
    bellDropdown.hidden = true;
}

/**
 * Update bell badge
 */
export function updateBellBadge() {
    // Only show badge if there are ready videos that haven't been acknowledged
    const echos = appState.getEchos();
    const unacknowledgedReady = echos.filter(e => 
        e.status === 'completed' && 
        e.videoUrl && 
        !e.videoUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) &&
        !appState.isVideoAcknowledged(e.id)
    );
    
    bellBadge.hidden = unacknowledgedReady.length === 0;
}

/**
 * Update bell state on load
 */
export function updateBellState() {
    const echos = appState.getEchos();
    const generatingEchos = echos.filter(e => e.status === 'generating');
    
    // On page load, mark all existing ready videos as acknowledged
    // (so badge only shows for NEW videos completed during this session)
    const readyEchos = echos.filter(e => 
        e.status === 'completed' && 
        e.videoUrl && 
        !e.videoUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i)
    );
    
    // Mark existing ready videos as acknowledged (they were ready before page load)
    readyEchos.forEach(echo => {
        appState.acknowledgeVideo(echo.id);
    });
    
    // Update badge (will be hidden since we just acknowledged all existing ones)
    updateBellBadge();
}
