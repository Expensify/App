import _ from 'underscore';
import {AppState} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '../ONYXKEYS';

// NetInfo.addEventListener() returns a function used to unsubscribe the listener. We must hold a reference to it and
// other callback functions in order to unsubscribe them. Additionally, they are used to check initialization state.
let unsubscribeFromNetInfo;
let appStateChangeCallback;
let sleepTimer;
let lastTime;
let isActive = false;
let isOffline = false;

// Holds all of the callbacks that need to be triggered when the network reconnects
const reconnectionCallbacks = [];

/**
 * Loop over all reconnection callbacks and fire each one
 */
const triggerReconnectionCallbacks = _.throttle(() => {
    _.each(reconnectionCallbacks, callback => callback());
}, 5000, {trailing: false});

/**
 * Called when the offline status of the app changes and if the network is "reconnecting" (going from offline to online)
 * then all of the reconnection callbacks are triggered
 *
 * @param {boolean} isCurrentlyOffline
 */
function setOfflineStatus(isCurrentlyOffline) {
    Onyx.merge(ONYXKEYS.NETWORK, {isOffline: isCurrentlyOffline});

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
 * `disconnected` event which takes about 10-15 seconds to emit.
 */
function listenForReconnect() {
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
    appStateChangeCallback = (state) => {
        console.debug('[AppState] state changed:', state);
        const nextStateIsActive = state === 'active';

        // We are moving from not active to active and we are online so fire callbacks
        if (!isOffline && nextStateIsActive && !isActive) {
            triggerReconnectionCallbacks();
        }

        isActive = nextStateIsActive;
    };
    AppState.addEventListener('change', appStateChangeCallback);

    // When a device is put to sleep, NetInfo is not always able to detect
    // when connectivity has been lost. As a failsafe we will capture the time
    // every two seconds and if the last time recorded is greater than 20 seconds
    // we know that the computer has been asleep.
    lastTime = (new Date()).getTime();
    sleepTimer = setInterval(() => {
        const currentTime = (new Date()).getTime();
        if (currentTime > (lastTime + 20000)) {
            triggerReconnectionCallbacks();
        }
        lastTime = currentTime;
    }, 2000);
}

/**
 * Tear down the event listeners when we are finished with them.
 */
function stopListeningForReconnect() {
    clearInterval(sleepTimer);
    if (unsubscribeFromNetInfo) {
        unsubscribeFromNetInfo();
    }
    if (appStateChangeCallback) {
        AppState.removeEventListener('change', appStateChangeCallback);
        appStateChangeCallback = null;
    }
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
    listenForReconnect,
    stopListeningForReconnect,
    onReconnect,
};
