import _ from 'underscore';
import NetInfo from '@react-native-community/netinfo';
import Ion from './Ion';
import CONFIG from '../CONFIG';
import IONKEYS from '../IONKEYS';
import Str from './Str';
import Guid from './Guid';
import redirectToSignIn from './actions/SignInRedirect';

let isOffline;
Ion.connect({key: IONKEYS.NETWORK, path: 'isOffline', callback: val => isOffline = val});

let credentials;
Ion.connect({key: IONKEYS.CREDENTIALS, callback: c => credentials = c});

// Indicates if we're in the process of re-authenticating. When an API call returns jsonCode 407 indicating that the
// authToken expired, we set this to true, pause all API calls, re-authenticate, and then use the authToken fromm the
// response in the subsequent API calls
let reauthenticating = false;

// Queue for network requests so we don't lose actions done by the user while offline
let networkRequestQueue = [];

// Holds all of the callbacks that need to be triggered when the network reconnects
const reconnectionCallbacks = [];

/**
 * Called when the offline status of the app changes and if the network is "reconnecting" (going from offline to online)
 * then all of the reconnection callbacks are triggered
 *
 * @param {boolean} isCurrentlyOffline
 */
function setNewOfflineStatus(isCurrentlyOffline) {
    if (isOffline && !isCurrentlyOffline) {
        _.each(reconnectionCallbacks, callback => callback());
    }
    Ion.merge(IONKEYS.NETWORK, {isOffline: isCurrentlyOffline});
}

// Subscribe to the state change event via NetInfo so we can update
// whether a user has internet connectivity or not. This is more reliable
// than the Pusher `disconnected` event which takes about 10-15 seconds to emit
NetInfo.addEventListener((state) => {
    setNewOfflineStatus(!state.isConnected);
});

/**
 * Adds a request to networkRequestQueue
 *
 * @param {string} command
 * @param {mixed} data
 * @returns {Promise}
 */
function queueRequest(command, data) {
    return new Promise((resolve) => {
        // Add the write request to a queue of actions to perform
        networkRequestQueue.push({
            command,
            data,
            callback: resolve,
        });

        // Try to fire off the request as soon as it's queued so we don't add a delay to every queued command
        // eslint-disable-next-line no-use-before-define
        processNetworkRequestQueue();
    });
}

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
            setNewOfflineStatus(true);

            // If the request failed, we need to put the request object back into the queue as long as there is no
            // doNotRetry option set in the data
            if (data.doNotRetry !== true) {
                queueRequest(command, data);
            }

            // Throw a new error to prevent any other `then()` in the promise chain from being triggered (until another
            // catch() happens
            throw new Error('API is offline');
        });
}

/**
 * @param {string} authToken
 * @param {string} login
 * @param {string} password
 * @returns {Promise}
 */
function createLogin(authToken, login, password) {
    // We call createLogin after getting a successful response to the Authenticate request
    // so it's very unlikely that this will fail with 407 authToken expired which means we
    // won't need to replay this request and thus we can use xhr instead of request
    return xhr('CreateLogin', {
        authToken,
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

                return response;
            })
            .then((response) => {
                // If Expensify login, it's the users first time signing in and we need to
                // create a login for the user
                if (data.useExpensifyLogin) {
                    console.debug('[SIGNIN] Creating a login');
                    createLogin(response.authToken, Str.generateDeviceLoginID(), Guid());
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

                        return response;
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

export {
    request,
    queueRequest,
    setNewOfflineStatus,
    onReconnect,
};
