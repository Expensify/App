import NetInfo from '@react-native-community/netinfo';
import {isBoolean} from 'lodash';
import throttle from 'lodash/throttle';
import Onyx from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import * as NetworkActions from './actions/Network';
import AppStateMonitor from './AppStateMonitor';
import checkInternetReachability from './checkInternetReachability';
import Log from './Log';

let isOffline = false;
let hasPendingNetworkCheck = false;
type NetworkStatus = ValueOf<typeof CONST.NETWORK.NETWORK_STATUS>;

type ResponseJSON = {
    jsonCode: number;
};

// Holds all of the callbacks that need to be triggered when the network reconnects
let callbackID = 0;
const reconnectionCallbacks: Record<string, () => void> = {};

/**
 * Loop over all reconnection callbacks and fire each one
 */
const triggerReconnectionCallbacks = throttle(
    (reason) => {
        Log.info(`[NetworkConnection] Firing reconnection callbacks because ${reason}`);
        Object.values(reconnectionCallbacks).forEach((callback) => {
            callback();
        });
    },
    5000,
    {trailing: false},
);

/**
 * Called when the offline status of the app changes and if the network is "reconnecting" (going from offline to online)
 * then all of the reconnection callbacks are triggered
 */
function setOfflineStatus(isCurrentlyOffline: boolean): void {
    NetworkActions.setIsOffline(isCurrentlyOffline);

    // When reconnecting, ie, going from offline to online, all the reconnection callbacks
    // are triggered (this is usually Actions that need to re-download data from the server)
    if (isOffline && !isCurrentlyOffline) {
        NetworkActions.setIsBackendReachable(true);
        triggerReconnectionCallbacks('offline status changed');
    }

    isOffline = isCurrentlyOffline;
}

function setNetWorkStatus(isInternetReachable: boolean | null): void {
    let networkStatus;
    if (!isBoolean(isInternetReachable)) {
        networkStatus = CONST.NETWORK.NETWORK_STATUS.UNKNOWN;
    } else {
        networkStatus = isInternetReachable ? CONST.NETWORK.NETWORK_STATUS.ONLINE : CONST.NETWORK.NETWORK_STATUS.OFFLINE;
    }
    NetworkActions.setNetWorkStatus(networkStatus);
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
            Log.info(`[NetworkStatus] Setting "offlineStatus" to "true" because user is under force offline`);
        } else {
            // If we are no longer forcing offline fetch the NetInfo to set isOffline appropriately
            NetInfo.fetch().then((state) => {
                const isInternetReachable = Boolean(state.isInternetReachable);
                setOfflineStatus(isInternetReachable);
                Log.info(
                    `[NetworkStatus] The force-offline mode was turned off. Getting the device network status from NetInfo. Network state: ${JSON.stringify(
                        state,
                    )}. Setting the offline status to: ${isInternetReachable}.`,
                );
            });
        }
    },
});

/**
 * Set interval to periodically (re)check backend status.
 * Because backend unreachability might imply lost internet connection, we need to check internet reachability.
 * @returns clearInterval cleanup
 */
function subscribeToBackendAndInternetReachability(): () => void {
    const intervalID = setInterval(() => {
        // Offline status also implies backend unreachability
        if (isOffline) {
            return;
        }
        // Using the API url ensures reachability is tested over internet
        fetch(`${CONFIG.EXPENSIFY.DEFAULT_API_ROOT}api/Ping`, {
            method: 'GET',
            cache: 'no-cache',
        })
            .then((response) => {
                if (!response.ok) {
                    return Promise.resolve(false);
                }
                return response
                    .json()
                    .then((json: ResponseJSON) => Promise.resolve(json.jsonCode === 200))
                    .catch(() => Promise.resolve(false));
            })
            .then((isBackendReachable: boolean) => {
                if (isBackendReachable) {
                    NetworkActions.setIsBackendReachable(true);
                    return;
                }
                checkInternetReachability().then((isInternetReachable: boolean) => {
                    setOfflineStatus(!isInternetReachable);
                    setNetWorkStatus(isInternetReachable);
                    NetworkActions.setIsBackendReachable(false);
                });
            })
            .catch(() => {
                checkInternetReachability().then((isInternetReachable: boolean) => {
                    setOfflineStatus(!isInternetReachable);
                    setNetWorkStatus(isInternetReachable);
                    NetworkActions.setIsBackendReachable(false);
                });
            });
    }, CONST.NETWORK.BACKEND_CHECK_INTERVAL_MS);

    return () => {
        clearInterval(intervalID);
    };
}

/**
 * Monitor internet connectivity and perform periodic backend reachability checks
 * @returns unsubscribe method
 */
function subscribeToNetworkStatus(): () => void {
    // Note: We are disabling the reachability check when using the local web API since requests can get stuck in a 'Pending' state and are not reliable indicators for reachability.
    // If you need to test the "recheck" feature then switch to the production API proxy server.
    const unsubscribeFromBackendReachability = !CONFIG.IS_USING_LOCAL_WEB ? subscribeToBackendAndInternetReachability() : undefined;

    // Set up the event listener for NetInfo to tell whether the user has
    // internet connectivity or not. This is more reliable than the Pusher
    // `disconnected` event which takes about 10-15 seconds to emit.
    const unsubscribeNetInfo = NetInfo.addEventListener((state) => {
        Log.info('[NetworkConnection] NetInfo state change', false, {...state});
        if (shouldForceOffline) {
            Log.info('[NetworkConnection] Not setting offline status because shouldForceOffline = true');
            return;
        }
        setOfflineStatus(state.isInternetReachable === false);
        Log.info(`[NetworkStatus] NetInfo.addEventListener event coming, setting "offlineStatus" to ${Boolean(state.isInternetReachable)} with network state: ${JSON.stringify(state)}`);
        setNetWorkStatus(state.isInternetReachable);
    });

    return () => {
        unsubscribeFromBackendReachability?.();
        unsubscribeNetInfo();
    };
}

function listenForReconnect() {
    Log.info('[NetworkConnection] listenForReconnect called');

    AppStateMonitor.addBecameActiveListener(() => {
        triggerReconnectionCallbacks('app became active');
    });
}

/**
 * Register callback to fire when we reconnect
 * @returns unsubscribe method
 */
function onReconnect(callback: () => void): () => void {
    const currentID = callbackID;
    callbackID++;
    reconnectionCallbacks[currentID] = callback;
    return () => delete reconnectionCallbacks[currentID];
}

/**
 * Delete all queued reconnection callbacks
 */
function clearReconnectionCallbacks() {
    Object.keys(reconnectionCallbacks).forEach((key) => delete reconnectionCallbacks[key]);
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
    NetInfo.refresh().finally(() => (hasPendingNetworkCheck = false));
}

export default {
    clearReconnectionCallbacks,
    setOfflineStatus,
    listenForReconnect,
    onReconnect,
    triggerReconnectionCallbacks,
    recheckNetworkConnection,
    subscribeToNetworkStatus,
};
export type {NetworkStatus};
