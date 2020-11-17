import Onyx from 'react-native-onyx';
import _ from 'underscore';
import * as Network from './Network';
import API from './API';
import ONYXKEYS from '../ONYXKEYS';
import redirectToSignIn from './actions/SignInRedirect';
import CONFIG from '../CONFIG';
import HttpUtils from './HttpUtils';

// Have a local variable for when the API is authenticating
let isAuthenticating;

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

/**
 * Access the current authToken
 *
 * @returns {string}
 */
function getAuthToken() {
    return authToken;
}

/**
 * Does this command require an authToken?
 *
 * @param {String} command
 * @return {Boolean}
 */
function isAuthTokenRequired(command) {
    return !_.contains(['Log', 'Authenticate'], command);
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

    if (isAuthTokenRequired(command) && !parameters.authToken) {
        // If we end up here with no authToken it means we are trying to make
        // an API request before we are signed in. In this case, we should just
        // cancel this and all other requests and set isAuthenticating to false.
        if (!authToken) {
            console.error('A request was made without an authToken', {command, parameters});
            Network.unpauseRequestQueue();
            redirectToSignIn();
            return;
        }

        finalParameters.authToken = authToken;
    }

    finalParameters.api_setCookie = false;
    return finalParameters;
}

const expensifyAPI = API(Network);
Network.registerParameterEnhancer(addAuthTokenToParameters);

/**
 * Callback function used to handle API auth failures
 *
 * @param {Object} originalResponse
 * @param {string} originalCommand
 * @param {object} [originalParameters]
 * @param {string} [originalType]
 */
function handleAuthFailures(originalResponse, originalCommand, originalParameters, originalType) {
    // There are some API requests that should not be retried when there is an auth failure
    // like creating and deleting logins
    if (originalParameters.doNotRetry) {
        return;
    }

    // When the authentication process is running, and more API requests will be requeued and they will
    // be performed after authentication is done.
    if (isAuthenticating) {
        Network.queueRequest(originalCommand, originalParameters, originalType);
        return;
    }

    // Prevent any more requests from being processed while authentication happens
    Network.pauseRequestQueue();
    isAuthenticating = true;

    expensifyAPI.Authenticate({
        useExpensifyLogin: false,
        partnerName: CONFIG.EXPENSIFY.PARTNER_NAME,
        partnerPassword: CONFIG.EXPENSIFY.PARTNER_PASSWORD,
        partnerUserID: credentials.login,
        partnerUserSecret: credentials.password,
    })
        .then((response) => {
            // If authentication fails throw so that we hit
            // the catch below and redirect to sign in
            if (response.jsonCode !== 200) {
                throw new Error(response.message);
            }

            // Update authToken in Onyx and in our local variables so that API requests will use the
            // new authToken
            Onyx.merge(ONYXKEYS.SESSION, {authToken: response.authToken});
            authToken = response.authToken;

            // The authentication process is finished so the network can be unpaused to continue
            // processing requests
            isAuthenticating = false;
            Network.unpauseRequestQueue();
        })

        // Now that the API is authenticated, make the original request again with the new authToken
        // Use HttpUtils here so that retry logic is avoided. Since this code is triggered from a rety attempt
        // it can create an infinite loop
        .then(() => {
            const params = addAuthTokenToParameters(originalCommand, originalParameters);
            HttpUtils.xhr(originalCommand, params, originalType);
        })

        .catch((error) => {
            // If authentication fails, then the network can be unpaused and app is redirected
            // so the sign on screen.
            Network.unpauseRequestQueue();
            isAuthenticating = false;
            redirectToSignIn(error.message);
        });
}

// Register handler for auth failures
expensifyAPI.registerDefaultHandler(expensifyAPI.JSON_CODES.AUTH_FAILURES, handleAuthFailures);

export default expensifyAPI;

export {
    getAuthToken,
};
