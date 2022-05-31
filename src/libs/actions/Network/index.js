import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../../ONYXKEYS';

/*
 * The purpose of this variable is to eliminate a circular dependency.
 * OfflineStatus.js needs to get information directly from the Pusher and NetInfo libraries.
 * Those libraries also need to be able to inform it when their states changed, so that we can refresh the OfflineStatus accordingly.
 * This bridges the communication gap and acts as a relay to eliminate the circular dependency.
 */
let triggerRefreshOfflineStatus;

/**
 * Register a handler for the "refreshOfflineStatus" event
 *
 * @param {Function} callback
 */
function onRefreshOfflineStatus(callback) {
    triggerRefreshOfflineStatus = callback;
}

/**
 * Trigger the "refreshOfflineStatus" event
 */
function refreshOfflineStatus() {
    triggerRefreshOfflineStatus();
}

/**
 * Test tool that will fail all network requests when enabled
 * @param {Boolean} shouldFailAllRequests
 */
function setShouldFailAllRequests(shouldFailAllRequests) {
    Onyx.merge(ONYXKEYS.NETWORK, {shouldFailAllRequests});
}

export {
    onRefreshOfflineStatus,
    refreshOfflineStatus,
    setShouldFailAllRequests,
};
