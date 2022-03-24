import lodashGet from 'lodash/get';
import Onyx from 'react-native-onyx';
import _ from 'underscore';
import ONYXKEYS from '../../ONYXKEYS';
import * as NetworkEvents from './NetworkEvents';

let credentials;
let authToken;
let currentUserEmail;
let networkReady = false;
let authenticating = false;
let isOffline = false;

/**
 * @param {Boolean} ready
 */
function setIsReady(ready) {
    networkReady = ready;
}

function checkRequiredDataAndSetNetworkReady() {
    if (_.isUndefined(authToken) || _.isUndefined(credentials)) {
        return;
    }

    setIsReady(true);
}

Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: (val) => {
        authToken = lodashGet(val, 'authToken', null);
        currentUserEmail = lodashGet(val, 'email', null);
        checkRequiredDataAndSetNetworkReady();
    },
});

Onyx.connect({
    key: ONYXKEYS.CREDENTIALS,
    callback: (val) => {
        credentials = val || null;
        checkRequiredDataAndSetNetworkReady();
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
function isReady() {
    return networkReady;
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
    isReady,
    setIsReady,
    setIsAuthenticating,
    isAuthenticating,
    getIsOffline,
};
