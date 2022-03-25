import lodashGet from 'lodash/get';
import Onyx from 'react-native-onyx';
import _ from 'underscore';
import ONYXKEYS from '../../ONYXKEYS';
import * as NetworkEvents from './NetworkEvents';

let credentials;
let authToken;
let currentUserEmail;
let requiredDataAvailable = false;
let authenticating = false;
let isOffline = false;

/**
 * @param {Boolean} val
 */
function setIsRequiredDataAvailable(val) {
    requiredDataAvailable = val;
}

/**
 * This is a hack to workaround the fact that Onyx may not yet have read these values from storage by the time Network starts processing requests.
 * If the values are undefined we haven't read them yet. If they are null or have a value then we have and the network is "ready".
 */
function checkRequiredData() {
    if (_.isUndefined(authToken) || _.isUndefined(credentials)) {
        return;
    }

    setIsRequiredDataAvailable(true);
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
        if (isOffline && !network.isOffline) {
            NetworkEvents.triggerConnectivityResumed();
        }

        isOffline = network.isOffline;
    },
});

/**
 * @returns {Boolean}
 */
function getIsOffline() {
    return isOffline;
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
 * @returns {Object}
 */
function getCredentials() {
    return credentials;
}

/**
 * @returns {String}
 */
function getCurrentUserEmail() {
    return currentUserEmail;
}

/**
 * @returns {Boolean}
 */
function isRequiredDataAvailable() {
    return requiredDataAvailable;
}

/**
 * @param {Boolean} value
 */
function setIsAuthenticating(value) {
    authenticating = value;
}

/**
 * @returns {Boolean}
 */
function isAuthenticating() {
    return authenticating;
}

export {
    getAuthToken,
    setAuthToken,
    getCredentials,
    getCurrentUserEmail,
    isRequiredDataAvailable,
    setIsRequiredDataAvailable,
    setIsAuthenticating,
    isAuthenticating,
    getIsOffline,
};
