import _ from 'underscore';
import Onyx from 'react-native-onyx';
import NetInfo from './NetInfo';
import ONYXKEYS from '../ONYXKEYS';
import SleepTimer from './SleepTimer';
import AppStateMonitor from './AppStateMonitor';
import promiseAllSettled from './promiseAllSettled';

// NetInfo.addEventListener() returns a function used to unsubscribe the
// listener so we must create a reference to it and call it in stopListeningForReconnect()
let unsubscribeFromNetInfo;
let unsubscribeFromSleepTimer;
let unsubscribeFromAppState;
let isOffline = false;
let logInfo = () => {};

// Holds all of the callbacks that need to be triggered when the network reconnects
const reconnectionCallbacks = [];

/**
 * Loop over all reconnection callbacks and fire each one
 */
const triggerReconnectionCallbacks = _.throttle((reason) => {
    logInfo(`[NetworkConnection] Firing reconnection callbacks because ${reason}`, true);
    Onyx.set(ONYXKEYS.IS_LOADING_AFTER_RECONNECT, true);
    promiseAllSettled(_.map(reconnectionCallbacks, callback => callback()))
        .then(() => Onyx.set(ONYXKEYS.IS_LOADING_AFTER_RECONNECT, false));
}, 5000, {trailing: false});

/**
 * Called when the offline status of the app changes and if the network is "reconnecting" (going from offline to online)
 * then all of the reconnection callbacks are triggered
 *
 * @param {Boolean} isCurrentlyOffline
 */
function setOfflineStatus(isCurrentlyOffline) {
    Onyx.merge(ONYXKEYS.NETWORK, {isOffline: isCurrentlyOffline});

    // When reconnecting, ie, going from offline to online, all the reconnection callbacks
    // are triggered (this is usually Actions that need to re-download data from the server)
    if (isOffline && !isCurrentlyOffline) {
        triggerReconnectionCallbacks('offline status changed');
    }

    isOffline = isCurrentlyOffline;
}

/**
 * Set up the event listener for NetInfo to tell whether the user has
 * internet connectivity or not. This is more reliable than the Pusher
 * `disconnected` event which takes about 10-15 seconds to emit.
 */
function listenForReconnect() {
    logInfo('[NetworkConnection] listenForReconnect called', true);

    unsubscribeFromAppState = AppStateMonitor.addBecameActiveListener(() => {
        triggerReconnectionCallbacks('app became active');
    });

    // Subscribe to the state change event via NetInfo so we can update
    // whether a user has internet connectivity or not.
    unsubscribeFromNetInfo = NetInfo.addEventListener((state) => {
        logInfo(`[NetworkConnection] NetInfo isConnected: ${state && state.isConnected}`);
        setOfflineStatus(!state.isConnected);
    });

    // When a device is put to sleep, NetInfo is not always able to detect
    // when connectivity has been lost. As a failsafe we will capture the time
    // every two seconds and if the last time recorded goes past a threshold
    // we know that the computer has been asleep.
    unsubscribeFromSleepTimer = SleepTimer.addClockSkewListener(() => (
        triggerReconnectionCallbacks('timer clock skewed')
    ));
}

/**
 * Tear down the event listeners when we are finished with them.
 */
function stopListeningForReconnect() {
    logInfo('[NetworkConnection] stopListeningForReconnect called', true);
    if (unsubscribeFromNetInfo) {
        unsubscribeFromNetInfo();
        unsubscribeFromNetInfo = undefined;
    }
    if (unsubscribeFromSleepTimer) {
        unsubscribeFromSleepTimer();
        unsubscribeFromSleepTimer = undefined;
    }
    if (unsubscribeFromAppState) {
        unsubscribeFromAppState();
        unsubscribeFromAppState = undefined;
    }
}

/**
 * Register callback to fire when we reconnect
 *
 * @param {Function} callback - must return a Promise
 */
function onReconnect(callback) {
    reconnectionCallbacks.push(callback);
}

/**
 * @param {Function} callback
 */
function registerLogInfoCallback(callback) {
    logInfo = callback;
}

export default {
    setOfflineStatus,
    listenForReconnect,
    stopListeningForReconnect,
    onReconnect,
    triggerReconnectionCallbacks,
    registerLogInfoCallback,
};
