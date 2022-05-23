import lodashGet from 'lodash/get';
import Onyx from 'react-native-onyx';
import _ from 'underscore';
import ONYXKEYS from '../../ONYXKEYS';

let credentials;
let authToken;
let currentUserEmail;
let offline = false;
let authenticating = false;

// Allow code that is outside of the network listen for when a reconnection happens so that it can execute any side-effects (like flushing the sequential network queue)
let reconnectCallback;
function triggerReconnectCallback() {
    if (!_.isFunction(reconnectCallback)) {
        return;
    }
    return reconnectCallback();
}

/**
 * @param {Function} callbackFunction
 */
function onReconnection(callbackFunction) {
    reconnectCallback = callbackFunction;
}

let resolveIsReadyPromise;
let isReadyPromise = new Promise((resolve) => {
    resolveIsReadyPromise = resolve;
});

/**
 * This is a hack to workaround the fact that Onyx may not yet have read these values from storage by the time Network starts processing requests.
 * If the values are undefined we haven't read them yet. If they are null or have a value then we have and the network is "ready".
 */
function checkRequiredData() {
    if (_.isUndefined(authToken) || _.isUndefined(credentials)) {
        return;
    }

    resolveIsReadyPromise();
}

function resetHasReadRequiredDataFromStorage() {
    // Create a new promise and a new resolve function
    isReadyPromise = new Promise((resolve) => {
        resolveIsReadyPromise = resolve;
    });
}

Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: (val) => {
        authToken = lodashGet(val, 'authToken', null);
        currentUserEmail = lodashGet(val, 'email', null);
        checkRequiredData();
    },
});

Onyx.connect({
    key: ONYXKEYS.CREDENTIALS,
    callback: (val) => {
        credentials = val || null;
        checkRequiredData();
    },
});

// We subscribe to the online/offline status of the network to determine when we should fire off API calls
// vs queueing them for later.
Onyx.connect({
    key: ONYXKEYS.NETWORK,
    callback: (network) => {
        if (!network) {
            return;
        }

        // Client becomes online emit connectivity resumed event
        if (offline && !network.isOffline) {
            triggerReconnectCallback();
        }

        offline = network.isOffline;
    },
});

/**
 * @returns {Object}
 */
function getCredentials() {
    return credentials;
}

/**
 * @returns {Boolean}
 */
function isOffline() {
    return offline;
}

/**
 * @returns {String}
 */
function getAuthToken() {
    return authToken;
}

/**
 * @param {String} newAuthToken
 */
function setAuthToken(newAuthToken) {
    authToken = newAuthToken;
}

/**
 * @returns {String}
 */
function getCurrentUserEmail() {
    return currentUserEmail;
}

/**
 * @returns {Promise}
 */
function hasReadRequiredDataFromStorage() {
    return isReadyPromise;
}

/**
 * @returns {Boolean}
 */
function isAuthenticating() {
    return authenticating;
}

/**
 * @param {Boolean} val
 */
function setIsAuthenticating(val) {
    authenticating = val;
}

export {
    getAuthToken,
    setAuthToken,
    getCurrentUserEmail,
    hasReadRequiredDataFromStorage,
    resetHasReadRequiredDataFromStorage,
    isOffline,
    onReconnection,
    isAuthenticating,
    setIsAuthenticating,
    getCredentials,
};
