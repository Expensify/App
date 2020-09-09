import _ from 'underscore';
import NetInfo from '@react-native-community/netinfo';
import * as path from 'path';
import Ion from './Ion';
import CONFIG from '../CONFIG';
import IONKEYS from '../IONKEYS';

/**
 * Called when the offline status of the app changes and if the network is "reconnecting" (going from offline to online)
 * then all of the reconnection callbacks are triggered
 *
 * @param {boolean} isCurrentlyOffline
 */
function setOfflineStatus(isCurrentlyOffline) {
    Ion.merge(IONKEYS.NETWORK, {isOffline: isCurrentlyOffline});
}

// Subscribe to the state change event via NetInfo so we can update
// whether a user has internet connectivity or not. This is more reliable
// than the Pusher `disconnected` event which takes about 10-15 seconds to emit
NetInfo.addEventListener((state) => {
    setOfflineStatus(!state.isConnected);
});

/**
 * Makes XHR request
 * @param {String} command the name of the API command
 * @param {Object} data parameters for the API command
 * @param {String} type HTTP request type (get/post)
 * @returns {Promise}
 */
function xhr(command, data, type = 'post') {
    const formData = new FormData();
    _.each(data, (val, key) => formData.append(key, val));

    return fetch(`${CONFIG.EXPENSIFY.API_ROOT}command=${command}`, {
        method: type,
        body: formData,
    })
        .then(response => response.json())

        // This will catch any HTTP network errors (like 404s and such), not to be confused with jsonCode which this
        // does NOT catch
        .catch(() => {
            setOfflineStatus(true);

            // Throw a new error to prevent any other `then()` in the promise chain from being triggered (until another
            // catch() happens
            throw new Error('API is offline');
        });
}

/**
 * Just download a file from the web server.
 *
 * @param {String} relativePath
 * @returns {Promise<Response>}
 */
function download(relativePath) {
    return fetch(path.join('chat.expensify.com', relativePath));
}

/**
 * Create login
 * @param {string} login
 * @param {string} password
 * @returns {Promise}
 */
function createLogin(login, password) {
    // We call createLogin after getting a successful response to the Authenticate request
    // so it's very unlikely that this will fail with 407 authToken expired which means we
    // won't need to replay this request and thus we can use xhr instead of request
    return xhr('CreateLogin', {
        partnerName: CONFIG.EXPENSIFY.PARTNER_NAME,
        partnerPassword: CONFIG.EXPENSIFY.PARTNER_PASSWORD,
        partnerUserID: login,
        partnerUserSecret: password,
    })
        .then(() => Ion.set(IONKEYS.CREDENTIALS, {login, password}))
        .catch(err => Ion.merge(IONKEYS.SESSION, {error: err}));
}

/**
 * Makes an API request.
 *
 * For most API commands if we get a 407 jsonCode in the response, which means the authToken
 * expired, this function automatically makes an API call to Authenticate and get a fresh authToken, and retries the
 * original API command
 *
 * @param {string} command
 * @param {mixed} data
 * @param {string} [type]
 * @returns {Promise}
 */
function request(command, data, type = 'post') {
    // If we're in the process of re-authenticating, queue this request for after we're done re-authenticating
    if (reauthenticating) {
        return queueRequest(command, data);
    }

    // We treat Authenticate in a special way because unlike other commands, this one can't fail
    // with 407 authToken expired. When other api commands fail with this error we call Authenticate
    // to get a new authToken and then fire the original api command again
    if (command === 'Authenticate') {
        return xhr(command, data, type)
            .then((response) => {
                // If we didn't get a 200 response from authenticate we either failed to authenticate with
                // an expensify login or the login credentials we created after the initial authentication.
                // In both cases, we need the user to sign in again with their expensify credentials
                if (response.jsonCode !== 200) {
                    return Ion.multiSet({
                        [IONKEYS.CREDENTIALS]: {},
                        [IONKEYS.SESSION]: {error: response.message},
                    })
                        .then(redirectToSignIn);
                }

                return setSuccessfulSignInData(response, data.exitTo);
            })
            .then((response) => {
                // If Expensify login, it's the users first time signing in and we need to
                // create a login for the user
                if (data.useExpensifyLogin) {
                    console.debug('[SIGNIN] Creating a login');
                    return createLogin(Str.generateDeviceLoginID(), Guid());
                }
                return response;
            });
    }

    // Make the http request, and if we get 407 jsonCode in the response,
    // re-authenticate to get a fresh authToken and make the original http request again
    return xhr(command, data, type)
        .then((responseData) => {
            if (!reauthenticating && responseData.jsonCode === 407 && data.doNotRetry !== true) {
                reauthenticating = true;
                return xhr('Authenticate', {
                    useExpensifyLogin: false,
                    partnerName: CONFIG.EXPENSIFY.PARTNER_NAME,
                    partnerPassword: CONFIG.EXPENSIFY.PARTNER_PASSWORD,
                    partnerUserID: credentials.login,
                    partnerUserSecret: credentials.password,
                    twoFactorAuthCode: ''
                })
                    .then((response) => {
                        reauthenticating = false;

                        // If authentication fails throw so that we hit
                        // the catch below and redirect to sign in
                        if (response.jsonCode !== 200) {
                            throw new Error(response.message);
                        }

                        return setSuccessfulSignInData(response, currentUrl);
                    })
                    .then(() => xhr(command, data, type))
                    .catch((error) => {
                        reauthenticating = false;
                        return Ion.multiSet({
                            [IONKEYS.CREDENTIALS]: {},
                            [IONKEYS.SESSION]: {error: error.message},
                        })
                            .then(redirectToSignIn)
                            .then(() => Promise.reject());
                    });
            }

            // We can end up here if we have queued up many
            // requests and have an expired authToken. In these cases,
            // we just need to requeue the request
            if (reauthenticating) {
                return queueRequest(command, data);
            }

            // Always update the authToken to be the authToken returned from any request
            if (responseData.authToken) {
                authToken = responseData.authToken;
            }

            return responseData;
        });
}

/**
 * Process the networkRequestQueue by looping through the queue and attempting to make the requests
 */
function processNetworkRequestQueue() {
    if (isOffline) {
        // Two things will bring the app online again...
        // 1. Pusher reconnecting (see registerSocketEventCallback at the top of this file)
        // 2. Getting a 200 response back from the API (happens right below)

        // Make a simple request every second to see if the API is online again
        xhr('Get', {doNotRetry: true})
            .then(() => setNewOfflineStatus(false));
        return;
    }

    // Don't make any requests until we're done re-authenticating since we'll use the new authToken
    // from that response for the subsequent network requests
    if (reauthenticating || networkRequestQueue.length === 0) {
        return;
    }

    _.each(networkRequestQueue, (queuedRequest) => {
        request(queuedRequest.command, queuedRequest.data)
            .then(queuedRequest.callback);
    });

    networkRequestQueue = [];
}

// Process our write queue very often
setInterval(processNetworkRequestQueue, 1000);

/**
 * Register a callback function to be called when the network reconnects
 *
 * @public
 * @param {function} cb
 */
function onReconnect(cb) {
    reconnectionCallbacks.push(cb);
}

/**
 * Determine if there is currently a network connection.
 */

/**
 * Determine if there is a network connection currently.
 *
 * @returns {boolean}
 */
function isOnline() {
    return !isOffline;
}

/**
 * Get the authToken that the network uses
 * @returns {string}
 */
function getAuthToken() {
    return authToken;
}

export {
    download,
    isOnline,
    xhr,
    setOfflineStatus,
};
