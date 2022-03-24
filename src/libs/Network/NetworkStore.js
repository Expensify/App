import lodashGet from 'lodash/get';
import Onyx from 'react-native-onyx';
import _ from 'underscore';
import ONYXKEYS from '../../ONYXKEYS';

let credentials;
let authToken;
let currentUserEmail;
let networkReady = false;

/**
 * @param {Boolean} ready
 */
function setIsReady(ready) {
    networkReady = ready;
}

/**
 * This is a hack to workaround the fact that Onyx may not yet have read these values from storage by the time Network starts processing requests.
 * If the values are undefined we haven't read them yet. If they are null or have a value then we have and the network is "ready".
 */
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

export {
    getAuthToken,
    setAuthToken,
    getCredentials,
    getCurrentUserEmail,
    isReady,
    setIsReady,
};
