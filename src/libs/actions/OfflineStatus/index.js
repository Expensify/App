/*
 * The purpose of this file is to eliminate a circular dependency.
 * OfflineStatus/OfflineStatus.js needs to get information directly from the Pusher and NetInfo libraries,
 * and those libraries also need to be able to inform the OfflineStatus lib that their state has changed, so that we can refresh the OfflineStatus accordingly.
 * This library bridges the communication gap and acts as a relay to eliminate the circular dependency.
 */

let refreshOfflineStatus;

/**
 * Register a handler for the "refreshOfflineStatus" event
 *
 * @param {Function} callback
 */
function onRefreshOfflineStatus(callback) {
    refreshOfflineStatus = callback;
}

/**
 * Trigger the "refreshOfflineStatus" event
 */
function triggerOfflineStatusRefresh() {
    refreshOfflineStatus();
}

export {
    onRefreshOfflineStatus,
    triggerOfflineStatusRefresh,
};
