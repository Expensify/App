"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var netinfo_1 = require("@react-native-community/netinfo");
var differenceInHours_1 = require("date-fns/differenceInHours");
var isBoolean_1 = require("lodash/isBoolean");
var throttle_1 = require("lodash/throttle");
var react_native_onyx_1 = require("react-native-onyx");
var CONFIG_1 = require("@src/CONFIG");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var NetworkActions = require("./actions/Network");
var AppStateMonitor_1 = require("./AppStateMonitor");
var Log_1 = require("./Log");
var isOffline = false;
// Holds all of the callbacks that need to be triggered when the network reconnects
var callbackID = 0;
var reconnectionCallbacks = {};
var isServerUp = true;
var wasServerDown = false;
/**
 * Loop over all reconnection callbacks and fire each one
 */
var triggerReconnectionCallbacks = (0, throttle_1.default)(function (reason) {
    var delay = 0;
    if (wasServerDown && isServerUp) {
        delay = Math.floor(Math.random() * 61000);
        wasServerDown = false;
    }
    setTimeout(function () {
        Log_1.default.info("[NetworkConnection] Firing reconnection callbacks because ".concat(reason));
        Object.values(reconnectionCallbacks).forEach(function (callback) {
            callback();
        });
    }, delay);
}, 5000, { trailing: false });
/**
 * Called when the offline status of the app changes and if the network is "reconnecting" (going from offline to online)
 * then all of the reconnection callbacks are triggered
 */
function setOfflineStatus(isCurrentlyOffline, reason) {
    if (reason === void 0) { reason = ''; }
    trackConnectionChanges();
    NetworkActions.setIsOffline(isCurrentlyOffline, reason);
    // When reconnecting, ie, going from offline to online, all the reconnection callbacks
    // are triggered (this is usually Actions that need to re-download data from the server)
    if (isOffline && !isCurrentlyOffline) {
        triggerReconnectionCallbacks('offline status changed');
    }
    isOffline = isCurrentlyOffline;
}
// Update the offline status in response to changes in shouldForceOffline
var shouldForceOffline = false;
var isPoorConnectionSimulated;
var connectionChanges;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.NETWORK,
    callback: function (network) {
        if (!network) {
            return;
        }
        simulatePoorConnection(network);
        isPoorConnectionSimulated = !!network.shouldSimulatePoorConnection;
        connectionChanges = network.connectionChanges;
        var currentShouldForceOffline = !!network.shouldForceOffline;
        if (currentShouldForceOffline === shouldForceOffline) {
            return;
        }
        shouldForceOffline = currentShouldForceOffline;
        if (shouldForceOffline) {
            setOfflineStatus(true, 'shouldForceOffline was detected in the Onyx data');
            Log_1.default.info("[NetworkStatus] Setting \"offlineStatus\" to \"true\" because user is under force offline");
        }
        else {
            // If we are no longer forcing offline fetch the NetInfo to set isOffline appropriately
            netinfo_1.default.fetch().then(function (state) {
                var _a;
                var isInternetUnreachable = ((_a = state.isInternetReachable) !== null && _a !== void 0 ? _a : false) === false;
                setOfflineStatus(isInternetUnreachable || !isServerUp, 'NetInfo checked if the internet is reachable');
                Log_1.default.info("[NetworkStatus] The force-offline mode was turned off. Getting the device network status from NetInfo. Network state: ".concat(JSON.stringify(state), ". Setting the offline status to: ").concat(isInternetUnreachable, "."));
            });
        }
    },
});
var accountID = 0;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.SESSION,
    callback: function (session) {
        if (!(session === null || session === void 0 ? void 0 : session.accountID)) {
            return;
        }
        accountID = session.accountID;
    },
});
function simulatePoorConnection(network) {
    // Starts random network status change when shouldSimulatePoorConnection is turned into true
    // or after app restart if shouldSimulatePoorConnection is true already
    if (!isPoorConnectionSimulated && !!network.shouldSimulatePoorConnection) {
        clearTimeout(network.poorConnectionTimeoutID);
        setRandomNetworkStatus(true);
    }
    // Fetch the NetInfo state to set the correct offline status when shouldSimulatePoorConnection is turned into false
    if (isPoorConnectionSimulated && !network.shouldSimulatePoorConnection) {
        netinfo_1.default.fetch().then(function (state) {
            var isInternetUnreachable = !state.isInternetReachable;
            var stringifiedState = JSON.stringify(state);
            setOfflineStatus(isInternetUnreachable || !isServerUp, 'NetInfo checked if the internet is reachable');
            Log_1.default.info("[NetworkStatus] The poor connection simulation mode was turned off. Getting the device network status from NetInfo. Network state: ".concat(stringifiedState, ". Setting the offline status to: ").concat(isInternetUnreachable, "."));
        });
    }
}
/** Sets online/offline connection randomly every 2-5 seconds */
function setRandomNetworkStatus(initialCall) {
    if (initialCall === void 0) { initialCall = false; }
    // The check to ensure no new timeouts are scheduled after poor connection simulation is stopped
    if (!isPoorConnectionSimulated && !initialCall) {
        return;
    }
    var statuses = [CONST_1.default.NETWORK.NETWORK_STATUS.OFFLINE, CONST_1.default.NETWORK.NETWORK_STATUS.ONLINE];
    var randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    var randomInterval = Math.random() * (5000 - 2000) + 2000; // random interval between 2-5 seconds
    Log_1.default.info("[NetworkConnection] Set connection status \"".concat(randomStatus, "\" for ").concat(randomInterval, " sec"));
    setOfflineStatus(randomStatus === CONST_1.default.NETWORK.NETWORK_STATUS.OFFLINE);
    var timeoutID = setTimeout(setRandomNetworkStatus, randomInterval);
    NetworkActions.setPoorConnectionTimeoutID(timeoutID);
}
/** Tracks how many times the connection has changed within the time period */
function trackConnectionChanges() {
    var _a;
    if (!(connectionChanges === null || connectionChanges === void 0 ? void 0 : connectionChanges.startTime)) {
        NetworkActions.setConnectionChanges({ startTime: new Date().getTime(), amount: 1 });
        return;
    }
    var diffInHours = (0, differenceInHours_1.differenceInHours)(new Date(), connectionChanges.startTime);
    var newAmount = ((_a = connectionChanges.amount) !== null && _a !== void 0 ? _a : 0) + 1;
    if (diffInHours < 1) {
        NetworkActions.setConnectionChanges({ amount: newAmount });
        return;
    }
    Log_1.default.info("[NetworkConnection] Connection has changed ".concat(newAmount, " time(s) for the last ").concat(diffInHours, " hour(s). Poor connection simulation is turned ").concat(isPoorConnectionSimulated ? 'on' : 'off'));
    NetworkActions.setConnectionChanges({ startTime: new Date().getTime(), amount: 0 });
}
/**
 * Set up the event listener for NetInfo to tell whether the user has
 * internet connectivity or not. This is more reliable than the Pusher
 * `disconnected` event which takes about 10-15 seconds to emit.
 * @returns unsubscribe method
 */
function subscribeToNetInfo() {
    // Note: We are disabling the configuration for NetInfo when using the local web API since requests can get stuck in a 'Pending' state and are not reliable indicators for "offline".
    // If you need to test the "recheck" feature then switch to the production API proxy server.
    if (!CONFIG_1.default.IS_USING_LOCAL_WEB) {
        // Calling NetInfo.configure (re)checks current state. We use it to force a recheck whenever we (re)subscribe
        netinfo_1.default.configure({
            // By default, NetInfo uses `/` for `reachabilityUrl`
            // When App is served locally (or from Electron) this address is always reachable - even offline
            // Using the API url ensures reachability is tested over internet
            reachabilityUrl: "".concat(CONFIG_1.default.EXPENSIFY.DEFAULT_API_ROOT, "api/Ping?accountID=").concat(accountID || 'unknown'),
            reachabilityMethod: 'GET',
            reachabilityTest: function (response) {
                if (!response.ok) {
                    return Promise.resolve(false);
                }
                return response
                    .json()
                    .then(function (json) {
                    if (json.jsonCode !== 200 && isServerUp) {
                        Log_1.default.info('[NetworkConnection] Received non-200 response from reachability test. Setting isServerUp status to false.');
                        isServerUp = false;
                        wasServerDown = true;
                    }
                    else if (json.jsonCode === 200 && !isServerUp) {
                        Log_1.default.info('[NetworkConnection] Received 200 response from reachability test. Setting isServerUp status to true.');
                        isServerUp = true;
                    }
                    return Promise.resolve(json.jsonCode === 200);
                })
                    .catch(function () {
                    isServerUp = false;
                    wasServerDown = true;
                    return Promise.resolve(false);
                });
            },
            // If a check is taking longer than this time we're considered offline
            reachabilityRequestTimeout: CONST_1.default.NETWORK.MAX_PENDING_TIME_MS,
        });
    }
    // Subscribe to the state change event via NetInfo so we can update
    // whether a user has internet connectivity or not.
    var unsubscribeNetInfo = netinfo_1.default.addEventListener(function (state) {
        Log_1.default.info('[NetworkConnection] NetInfo state change', false, __assign({}, state));
        if (shouldForceOffline) {
            Log_1.default.info('[NetworkConnection] Not setting offline status because shouldForceOffline = true');
            return;
        }
        setOfflineStatus(state.isInternetReachable === false || !isServerUp, 'NetInfo received a state change event');
        Log_1.default.info("[NetworkStatus] NetInfo.addEventListener event coming, setting \"offlineStatus\" to ".concat(!!state.isInternetReachable, " with network state: ").concat(JSON.stringify(state)));
        var networkStatus;
        if (!(0, isBoolean_1.default)(state.isInternetReachable)) {
            networkStatus = CONST_1.default.NETWORK.NETWORK_STATUS.UNKNOWN;
        }
        else {
            networkStatus = state.isInternetReachable ? CONST_1.default.NETWORK.NETWORK_STATUS.ONLINE : CONST_1.default.NETWORK.NETWORK_STATUS.OFFLINE;
        }
        NetworkActions.setNetWorkStatus(networkStatus);
    });
    // Periodically recheck the network connection
    // More info: https://github.com/Expensify/App/issues/42988
    var recheckIntervalID = setInterval(function () {
        if (!isOffline) {
            return;
        }
        recheckNetworkConnection();
        Log_1.default.info("[NetworkStatus] Rechecking the network connection with \"isOffline\" set to \"true\" to double-check internet reachability.");
    }, CONST_1.default.NETWORK.RECHECK_INTERVAL_MS);
    return function () {
        clearInterval(recheckIntervalID);
        unsubscribeNetInfo();
    };
}
function listenForReconnect() {
    Log_1.default.info('[NetworkConnection] listenForReconnect called');
    AppStateMonitor_1.default.addBecameActiveListener(function () {
        triggerReconnectionCallbacks('app became active');
    });
}
/**
 * Register callback to fire when we reconnect
 * @returns unsubscribe method
 */
function onReconnect(callback) {
    var currentID = callbackID;
    callbackID++;
    reconnectionCallbacks[currentID] = callback;
    return function () { return delete reconnectionCallbacks[currentID]; };
}
/**
 * Delete all queued reconnection callbacks
 */
function clearReconnectionCallbacks() {
    Object.keys(reconnectionCallbacks).forEach(function (key) { return delete reconnectionCallbacks[key]; });
}
/**
 * Refresh NetInfo state.
 */
function recheckNetworkConnection() {
    Log_1.default.info('[NetworkConnection] recheck NetInfo');
    netinfo_1.default.refresh();
}
exports.default = {
    clearReconnectionCallbacks: clearReconnectionCallbacks,
    setOfflineStatus: setOfflineStatus,
    listenForReconnect: listenForReconnect,
    onReconnect: onReconnect,
    triggerReconnectionCallbacks: triggerReconnectionCallbacks,
    recheckNetworkConnection: recheckNetworkConnection,
    subscribeToNetInfo: subscribeToNetInfo,
};
