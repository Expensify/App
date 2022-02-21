import _ from 'underscore';
import NetInfo from '@react-native-community/netinfo';
import AppStateMonitor from './AppStateMonitor';
import promiseAllSettled from './promiseAllSettled';
import Log from './Log';
import * as NetworkActions from './actions/Network';
import * as NetowrkLib from './Network';
import CONFIG from '../CONFIG';

// NetInfo.addEventListener() returns a function used to unsubscribe the
// listener so we must create a reference to it and call it in stopListeningForReconnect()
let unsubscribeFromNetInfo;
let unsubscribeFromAppState;
let isOffline = false;

// Holds all of the callbacks that need to be triggered when the network reconnects
const reconnectionCallbacks = [];

/**
 * Loop over all reconnection callbacks and fire each one
 */
const triggerReconnectionCallbacks = _.throttle((reason) => {
    Log.info(`[NetworkConnection] Firing reconnection callbacks because ${reason}`);
    NetworkActions.setIsLoadingAfterReconnect(true);
    promiseAllSettled(_.map(reconnectionCallbacks, callback => callback()))
        .then(() => NetworkActions.setIsLoadingAfterReconnect(false));
}, 5000, {trailing: false});

/**
 * Called when the offline status of the app changes and if the network is "reconnecting" (going from offline to online)
 * then all of the reconnection callbacks are triggered
 *
 * @param {Boolean} isCurrentlyOffline
 */
function setOfflineStatus(isCurrentlyOffline) {
    NetworkActions.setIsOffline(isCurrentlyOffline);

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
function subscribeToNetInfo() {
    // Calling NetInfo.configure (re)checks current state. We use it to force a recheck whenever whe (re)subscribe
    NetInfo.configure({
        // By default, for web (including Electron) NetInfo uses `/` for `reachabilityUrl`
        // When App is served locally or from Electron this would respond with OK even with no internet
        // Using API url ensures reachability is tested over internet
        reachabilityUrl: CONFIG.EXPENSIFY.URL_API_ROOT,
        reachabilityTest: response => Promise.resolve(response.status === 200),
    });

    // Subscribe to the state change event via NetInfo so we can update
    // whether a user has internet connectivity or not.
    unsubscribeFromNetInfo = NetInfo.addEventListener((state) => {
        Log.info('[NetworkConnection] NetInfo state', false, state);
        setOfflineStatus(!state.isInternetReachable);
    });
}

function listenForReconnect() {
    Log.info('[NetworkConnection] listenForReconnect called');

    unsubscribeFromAppState = AppStateMonitor.addBecameActiveListener(() => {
        triggerReconnectionCallbacks('app became active');
    });

    subscribeToNetInfo();
}

/**
 * Tear down the event listeners when we are finished with them.
 */
function stopListeningForReconnect() {
    Log.info('[NetworkConnection] stopListeningForReconnect called');
    if (unsubscribeFromNetInfo) {
        unsubscribeFromNetInfo();
        unsubscribeFromNetInfo = undefined;
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

NetowrkLib.registerConnectionCheckCallback(_.throttle(() => {
    if (!unsubscribeFromNetInfo) {
        return;
    }

    Log.info('[NetworkConnection] re-check NetInfo');
    unsubscribeFromNetInfo();
    subscribeToNetInfo();
}), 10 * 1000, {trailing: false});

export default {
    setOfflineStatus,
    listenForReconnect,
    stopListeningForReconnect,
    onReconnect,
    triggerReconnectionCallbacks,
};
