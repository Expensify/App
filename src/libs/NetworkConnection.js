import _ from 'underscore';
import Onyx from 'react-native-onyx';
import NetInfo from '@react-native-community/netinfo';
import AppStateMonitor from './AppStateMonitor';
import Log from './Log';
import * as NetworkActions from './actions/Network';
import CONFIG from '../CONFIG';
import CONST from '../CONST';
import ONYXKEYS from '../ONYXKEYS';

let isOffline = false;
let hasPendingNetworkCheck = false;

// Holds all of the callbacks that need to be triggered when the network reconnects
let callbackID = 0;
const reconnectionCallbacks = {};

/**
 * Loop over all reconnection callbacks and fire each one
 */
const triggerReconnectionCallbacks = _.throttle((reason) => {
    Log.info(`[NetworkConnection] Firing reconnection callbacks because ${reason}`);
    _.each(reconnectionCallbacks, callback => callback());
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

// Update the offline status in response to changes in shouldForceOffline
let shouldForceOffline = false;
Onyx.connect({
    key: ONYXKEYS.NETWORK,
    callback: (network) => {
        if (!network) {
            return;
        }
        const currentShouldForceOffline = Boolean(network.shouldForceOffline);
        if (currentShouldForceOffline === shouldForceOffline) {
            return;
        }
        shouldForceOffline = currentShouldForceOffline;
        if (shouldForceOffline) {
            setOfflineStatus(true);
        } else {
            // If we are no longer forcing offline fetch the NetInfo to set isOffline appropriately
            NetInfo.fetch()
                .then(state => setOfflineStatus(state.isInternetReachable === false));
        }
    },
});

/**
 * Set up the event listener for NetInfo to tell whether the user has
 * internet connectivity or not. This is more reliable than the Pusher
 * `disconnected` event which takes about 10-15 seconds to emit.
 */
function subscribeToNetInfo() {
    // Note: We are disabling the configuration for NetInfo when using the local web API since requests can get stuck in a 'Pending' state and are not reliable indicators for "offline".
    // If you need to test the "recheck" feature then switch to the production API proxy server.
    if (!CONFIG.IS_USING_LOCAL_WEB) {
        // Calling NetInfo.configure (re)checks current state. We use it to force a recheck whenever we (re)subscribe
        NetInfo.configure({
            // By default, NetInfo uses `/` for `reachabilityUrl`
            // When App is served locally (or from Electron) this address is always reachable - even offline
            // Using the API url ensures reachability is tested over internet
            reachabilityUrl: `${CONFIG.EXPENSIFY.URL_API_ROOT}api`,
            reachabilityTest: response => Promise.resolve(response.status === 200),

            // If a check is taking longer than this time we're considered offline
            reachabilityRequestTimeout: CONST.NETWORK.MAX_PENDING_TIME_MS,
        });
    }

    // Subscribe to the state change event via NetInfo so we can update
    // whether a user has internet connectivity or not.
    NetInfo.addEventListener((state) => {
        Log.info('[NetworkConnection] NetInfo state change', false, state);
        if (shouldForceOffline) {
            Log.info('[NetworkConnection] Not setting offline status because shouldForceOffline = true');
            return;
        }
        setOfflineStatus(state.isInternetReachable === false);
    });
}

function listenForReconnect() {
    Log.info('[NetworkConnection] listenForReconnect called');

    AppStateMonitor.addBecameActiveListener(() => {
        triggerReconnectionCallbacks('app became active');
    });
}

/**
 * Register callback to fire when we reconnect
 *
 * @param {Function} callback - must return a Promise
 * @returns {Function} unsubscribe method
 */
function onReconnect(callback) {
    const currentID = callbackID;
    callbackID++;
    reconnectionCallbacks[currentID] = callback;
    return () => delete reconnectionCallbacks[currentID];
}

/**
 * Delete all queued reconnection callbacks
 */
function clearReconnectionCallbacks() {
    _.each(_.keys(reconnectionCallbacks), key => delete reconnectionCallbacks[key]);
}

/**
 * Refresh NetInfo state.
 */
function recheckNetworkConnection() {
    if (hasPendingNetworkCheck) {
        return;
    }

    Log.info('[NetworkConnection] recheck NetInfo');
    hasPendingNetworkCheck = true;
    NetInfo.refresh()
        .finally(() => hasPendingNetworkCheck = false);
}

export default {
    clearReconnectionCallbacks,
    setOfflineStatus,
    listenForReconnect,
    onReconnect,
    triggerReconnectionCallbacks,
    recheckNetworkConnection,
    subscribeToNetInfo,
};
