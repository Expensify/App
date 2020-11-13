import Onyx from 'react-native-onyx';
import _ from 'underscore';
import * as Network from './Network';
import API from './API';
import ONYXKEYS from '../ONYXKEYS';
import redirectToSignIn from './actions/SignInRedirect';
import CONFIG from '../CONFIG';
import HttpUtils from './HttpUtils';

let expensifyAPI;

let credentials;
Onyx.connect({
    key: ONYXKEYS.CREDENTIALS,
    callback: val => credentials = val,
});

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
        if (_.isUndefined(val) || val === null) {
            return;
        }

        if (val.isAuthenticating === true && !isAuthenticating) {
            Network.pauseRequestQueue();
        }

        if (val.isAuthenticating === false && isAuthenticating === true) {
            Network.unpauseRequestQueue();
        }

        isAuthenticating = val && val.isAuthenticating;
    },
});

/**
 * Callback function used to handle API auth failures
 *
 * @param {Object} originalResponse
 * @param {string} originalCommand
 * @param {object} [originalParameters]
 * @param {string} [originalType]
 * @param {expensifyAPI} thisExpensifyAPI
 */
function handleAuthFailures(originalResponse, originalCommand, originalParameters, originalType) {
    if (originalParameters.doNotRetry) {
        return;
    }

    Onyx.merge(ONYXKEYS.API, {isAuthenticating: true});

    expensifyAPI.authenticate({
        useExpensifyLogin: false,
        partnerName: CONFIG.EXPENSIFY.PARTNER_NAME,
        partnerPassword: CONFIG.EXPENSIFY.PARTNER_PASSWORD,
        partnerUserID: credentials.login,
        partnerUserSecret: credentials.password,
    })
        .then((response) => {
            Onyx.merge(ONYXKEYS.API, {isAuthenticating: false});

            // If authentication fails throw so that we hit
            // the catch below and redirect to sign in
            if (response.jsonCode !== 200) {
                throw new Error(response.message);
            }

            // Update authToken in Onyx store otherwise subsequent API calls will use the expired one
            Onyx.merge(ONYXKEYS.SESSION, _.pick(response, 'authToken'));
        })

        // Use HttpUtils here so that retry logic is avoided. Since this code is already doing a re-try, that
        // would create an infinite loop
        .then(() => HttpUtils.xhr(originalCommand, originalParameters, originalType))

        .catch((error) => {
            Onyx.merge(ONYXKEYS.API, {isAuthenticating: false});
            redirectToSignIn(error.message);

            // If the request failed, we need to put the request object back into the queue as long as there is no
            // doNotRetry option set in the parametersWithAuthToken
            if (originalParameters.doNotRetry !== true) {
                Network.post(originalCommand, originalParameters, originalType);
            }

            // If we already have an error, throw that so we do not swallow it
            if (error instanceof Error) {
                throw error;
            }

            // Throw a generic error so we can pass the error up the chain
            throw new Error(`API Command ${originalCommand} failed`);
        });
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
        // If we end up here with no authToken it means we are trying to make
        // an API request before we are signed in. In this case, we should just
        // cancel this and all other requests and set isAuthenticating to false.
        if (!authToken) {
            console.error('A request was made without an authToken', {command, parameters});
            Onyx.merge(ONYXKEYS.API, {isAuthenticating: false});
            redirectToSignIn();
            return;
        }

        finalParameters.authToken = authToken;
    }

    finalParameters.api_setCookie = false;
    return finalParameters;
}

expensifyAPI = API(Network, {
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
