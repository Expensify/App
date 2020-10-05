import _ from 'underscore';
import {AppState} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import Ion from './Ion';
import IONKEYS from '../IONKEYS';

let unsubscribeFromNetInfo;
let isActive = false;
let isOffline = false;

// Holds all of the callbacks that need to be triggered when the network reconnects
const reconnectionCallbacks = [];

/**
 * Loop over all reconnection callbacks and fire each one
 */
function triggerReconnectionCallbacks() {
    _.each(reconnectionCallbacks, callback => callback());
}

/**
 * Called when the offline status of the app changes and if the network is "reconnecting" (going from offline to online)
 * then all of the reconnection callbacks are triggered
 *
 * @param {boolean} isCurrentlyOffline
 */
function setOfflineStatus(isCurrentlyOffline) {
    Ion.merge(IONKEYS.NETWORK, {isOffline: isCurrentlyOffline});

    // When reconnecting, ie, going from offline to online, all the reconnection callbacks
    // are triggered (this is usually Actions that need to re-download data from the server)
    if (isOffline && !isCurrentlyOffline) {
        triggerReconnectionCallbacks();
    }

    isOffline = isCurrentlyOffline;
}

/**
 * Set up the event listener for NetInfo to tell whether the user has
 * internet connectivity or not. This is more reliable than the Pusher
 * `disconnected` event which takes about 10-15 seconds to emit. We
 * are setting this up in a way where we can tear it down again as
 * we only care about connectivity if the user is logged in.
 */
function init() {
    // Subscribe to the state change event via NetInfo so we can update
    // whether a user has internet connectivity or not.
    unsubscribeFromNetInfo = NetInfo.addEventListener((state) => {
        console.debug('[NetInfo] isConnected:', state && state.isConnected);
        setOfflineStatus(!state.isConnected);
    });

    // When the app is in the background Pusher can still receive realtime updates
    // for a few minutes, but eventually disconnects causing a delay when the app
    // returns from the background. So, if we are returning from the background
    // and we are online we should trigger our reconnection callbacks.
    AppState.addEventListener('change', (state) => {
        console.debug('[AppState] state changed:', state);
        const nextStateIsActive = state === 'active';

        // We are moving from not active to active and we are online so fire callbacks
        if (!isOffline && nextStateIsActive && !isActive) {
            triggerReconnectionCallbacks();
        }

        isActive = nextStateIsActive;
    });
}

/**
 * Tear down the event listeners when we are finished with them.
 */
function destroy() {
    if (unsubscribeFromNetInfo) {
        unsubscribeFromNetInfo();
    }
    AppState.removeEventListener('change', () => {});
}

/**
 * Register callback to fire when we reconnect
 *
 * @param {Function} callback
 */
function onReconnect(callback) {
    reconnectionCallbacks.push(callback);
}

export default {
    setOfflineStatus,
    init,
    destroy,
    onReconnect,
};
