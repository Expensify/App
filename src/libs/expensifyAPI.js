import Onyx from 'react-native-onyx';
import _ from 'underscore';
import Network from './Network';
import API from './API2';
import ONYXKEYS from '../ONYXKEYS';

const network = Network();

let authToken;
Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: val => authToken = val ? val.authToken : null,
});

// Connect to the state of the API so that the network queue can be paused while the API
// is authenticating.
let isAuthenticating;
Onyx.connect({
    key: ONYXKEYS.API,
    callback: (val) => {
        if (_.isUndefined(val)) {
            return;
        }

        if (val.isAuthenticating === true && !isAuthenticating) {
            network.pauseRequestQueue();
        }

        if (val.isAuthenticating === false && isAuthenticating === true) {
            network.unpauseRequestQueue();
        }

        isAuthenticating = val && val.isAuthenticating;
    },
});

/**
 * Callback function used to handle API auth failures
 *
 * @param {Number} jsonCode
 * @param {Object} response
 */
function handleAuthFailures(jsonCode, response) {
    console.debug('Network Error', jsonCode, response);
    Onyx.merge(ONYXKEYS.API, {isAuthenticating});
}

/**
 * Does this command require an authToken?
 *
 * @param {String} command
 * @return {Boolean}
 */
function isAuthTokenRequired(command) {
    return !_.contains(['Log'], command);
}

/**
 * Adds CSRF and AuthToken to our request data
 *
 * @param {string} command
 * @param {Object} parameters
 * @returns {Object}
 */
function addAuthTokenToParameters(command, parameters) {
    const finalParameters = {...parameters};

    if (isAuthTokenRequired(command)) {
        finalParameters.authToken = authToken;
    }

    finalParameters.api_setCookie = false;
    return finalParameters;
}

const expensifyAPI = API(network, {
    enhanceParameters: addAuthTokenToParameters,
});

// Register handler for auth failures
expensifyAPI.registerDefaultHandler(expensifyAPI.JSON_CODES.AUTH_FAILURES, handleAuthFailures);

export default expensifyAPI;

/**
 * Access the current authToken
 *
 * @returns {string}
 */
function getAuthToken() {
    return authToken;
}

export {
    getAuthToken,
};
