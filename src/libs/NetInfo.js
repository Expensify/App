import NetInfo from '@react-native-community/netinfo';
import CONFIG from '../CONFIG';
import CONST from '../CONST';
import Log from './Log';
import * as Network from './actions/Network';

let isInternetReachable = false;
let hasPendingNetworkCheck = false;

/**
 * @returns {Boolean}
 */
function getIsInternetReachable() {
    return isInternetReachable;
}

function init() {
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
        Log.info('[NetInfo] NetInfo state change', false, state);
        isInternetReachable = state.isInternetReachable;
        Network.refreshOfflineStatus();
    });
}

function recheckInternetConnection() {
    if (hasPendingNetworkCheck) {
        return;
    }

    Log.info('[NetInfo] rechecking internet connection');
    hasPendingNetworkCheck = true;
    NetInfo.refresh()
        .then(state => isInternetReachable = state.isInternetReachable)
        .finally(() => hasPendingNetworkCheck = false);
}

export {
    getIsInternetReachable as isInternetReachable,
    init,
    recheckInternetConnection,
};
