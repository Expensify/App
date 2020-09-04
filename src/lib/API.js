import _ from 'underscore';
import Ion from './Ion';
import IONKEYS from '../IONKEYS';
import {xhr, setOfflineStatus} from './Network';
import CONFIG from '../CONFIG';
import * as Pusher from './Pusher/pusher';
import ROUTES from '../ROUTES';
import Str from './Str';
import Guid from './Guid';
import redirectToSignIn from './actions/SignInRedirect';

// Holds all of the callbacks that need to be triggered when the network reconnects
const reconnectionCallbacks = [];

// Queue for network requests so we don't lose actions done by the user while offline
let networkRequestQueue = [];

// Indicates if we're in the process of re-authenticating. When an API call returns jsonCode 407 indicating that the
// authToken expired, we set this to true, pause all API calls, re-authenticate, and then use the authToken fromm the
// response in the subsequent API calls
let reauthenticating = false;

let authToken;
Ion.connect({key: IONKEYS.SESSION, path: 'authToken', callback: val => authToken = val});

// We susbcribe to changes to the online/offline status of the network to determine when we should fire off API calls
// vs queueing them for later. When going reconnecting, ie, going from offline to online, we fire off all the API calls
// that we have in the queue
let isOffline;
Ion.connect({
    key: IONKEYS.NETWORK,
    path: 'isOffline',
    callback: (isCurrentlyOffline) => {
        if (isOffline && !isCurrentlyOffline) {
            _.each(reconnectionCallbacks, callback => callback());
        }
        isOffline = isCurrentlyOffline;
    }
});

// When the user authenticates for the first time we create a login and store credentials in Ion.
// When the user's authToken expires we use this login to re-authenticate and get a new authToken
// and use that new authToken in subsequent API calls
let credentials;
Ion.connect({key: IONKEYS.CREDENTIALS, callback: ionCredentials => credentials = ionCredentials});

/**
 * @param {string} login
 * @param {string} password
 * @returns {Promise}
 */
function createLogin(login, password) {
    // Using xhr instead of request becasue request has logic to re-try API commands when we get a 407 authToken expired
    // in the response, and we call CreateLogin after getting a successful resposne to Authenticate so it's unlikely
    // that we'll get a 407.
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
 * Sets API data in the store when we make a successful "Authenticate"/"CreateLogin" request
 *
 * @param {object} data
 * @param {string} exitTo
 * @returns {Promise}
 */
function setSuccessfulSignInData(data, exitTo) {
    let redirectTo;

    if (exitTo && exitTo[0] === '/') {
        redirectTo = exitTo;
    } else if (exitTo) {
        redirectTo = `/${exitTo}`;
    } else {
        redirectTo = ROUTES.HOME;
    }
    return Ion.multiSet({
        // The response from Authenticate includes requestID, jsonCode, etc
        // but we only care about setting these three values in Ion
        [IONKEYS.SESSION]: _.pick(data, 'authToken', 'accountID', 'email'),
        [IONKEYS.APP_REDIRECT_TO]: redirectTo,
    });
}

/**
 * Makes an API request.
 *
 * For most API commands if we get a 407 jsonCode in the response, which means the authToken
 * expired, this function automatically makes an API call to Authenticate and get a fresh authToken, and retries the
 * original API command
 *
 * @param {string} command
 * @param {object} parameters
 * @param {string} [type]
 * @returns {Promise}
 */
function request(command, parameters, type = 'post') {
    // If we're in the process of re-authenticating, queue this request for after we're done re-authenticating
    if (reauthenticating) {
        return queueRequest(command, parameters);
    }

    // We treat Authenticate in a special way because unlike other commands, this one can't fail
    // with 407 authToken expired. When other api commands fail with this error we call Authenticate
    // to get a new authToken and then fire the original api command again
    if (command === 'Authenticate') {
        return xhr(command, parameters, type)
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
                setSuccessfulSignInData(response, parameters.exitTo);
                return response;
            })
            .then((response) => {
                // If Expensify login, it's the users first time signing in and we need to
                // create a login for the user
                if (parameters.useExpensifyLogin) {
                    console.debug('[SIGNIN] Creating a login');
                    createLogin(Str.generateDeviceLoginID(), Guid());
                }
                return response;
            })
            .catch(() => {
                // If the request failed, we need to put the request object back into the queue as long as there is no
                // doNotRetry option set in the parameters
                if (parameters.doNotRetry !== true) {
                    queueRequest(command, parameters);
                }
            });
    }

    // Add authToken automatically to all commands
    const parametersWithAuthToken = {...parameters, ...{authToken}};

    // Make the http request, and if we get 407 jsonCode in the response,
    // re-authenticate to get a fresh authToken and make the original http request again
    return xhr(command, parametersWithAuthToken, type)
        .then((responseData) => {
            if (!reauthenticating && responseData.jsonCode === 407 && parametersWithAuthToken.doNotRetry !== true) {
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
                    .then(() => xhr(command, parametersWithAuthToken, type))
                    .catch((error) => {
                        reauthenticating = false;
                        Ion.multiSet({
                            [IONKEYS.CREDENTIALS]: {},
                            [IONKEYS.SESSION]: {error: error.message},
                        });
                        redirectToSignIn();
                        return Promise.reject();
                    });
            }

            // We can end up here if we have queued up many
            // requests and have an expired authToken. In these cases,
            // we just need to requeue the request
            if (reauthenticating) {
                return queueRequest(command, parametersWithAuthToken);
            }
            return responseData;
        })
        .catch(() => {
            // If the request failed, we need to put the request object back into the queue as long as there is no
            // doNotRetry option set in the parametersWithAuthToken
            if (parametersWithAuthToken.doNotRetry !== true) {
                queueRequest(command, parametersWithAuthToken);
            }
        });
}

/**
 * Process the networkRequestQueue by looping through the queue and attempting to make the requests
 */
function processNetworkRequestQueue() {
    if (isOffline) {
        // Two things will bring the app online again...
        // 1. Pusher reconnecting (see registerSocketEventCallback in this file)
        // 2. Getting a 200 response back from the API (happens right below)

        // Make a simple request every second to see if the API is online again
        xhr('Get', {doNotRetry: true})
            .then(() => setOfflineStatus(false));
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
 * When authTokens expire they will automatically be refreshed.
 * The authorizer helps make sure that we are always passing the
 * current valid token to generate the signed auth response
 * needed to subscribe to Pusher channels.
 */
Pusher.registerCustomAuthorizer((channel, {authEndpoint}) => ({
    authorize: (socketID, callback) => {
        console.debug('[Network] Attempting to authorize Pusher');

        const formData = new FormData();
        formData.append('socket_id', socketID);
        formData.append('channel_name', channel.name);
        formData.append('authToken', authToken);

        return fetch(authEndpoint, {
            method: 'POST',
            body: formData,
        })
            .then(authResponse => authResponse.json())
            .then(data => callback(null, data))
            .catch((err) => {
                console.debug('[Network] Failed to authorize Pusher');
                callback(new Error(`Error calling auth endpoint: ${err}`));
            });
    },
}));

// Initialize the pusher connection
Pusher.init();

/**
 * Events that happen on the pusher socket are used to determine if the app is online or offline. The offline setting
 * is stored in Ion so the rest of the app has access to it.
 *
 * @params {string} eventName,
 * @params {object} data
 */
Pusher.registerSocketEventCallback((eventName, data) => {
    let isCurrentlyOffline = false;
    switch (eventName) {
        case 'connected':
            isCurrentlyOffline = false;
            break;
        case 'disconnected':
            isCurrentlyOffline = true;
            break;
        case 'state_change':
            if (data.current === 'connecting' || data.current === 'unavailable') {
                isCurrentlyOffline = true;
            }
            break;
        default:
            break;
    }
    setOfflineStatus(isCurrentlyOffline);
});

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
 * Get the authToken that the network uses
 * @returns {string}
 */
function getAuthToken() {
    return authToken;
}

/**
 * @param {object} parameters
 * @param {string} parameters.partnerUserID
 * @param {string} parameters.partnerUserSecret
 * @param {string} parameters.twoFactorAuthCode
 * @param {string} [parameters.exitTo]
 * @returns {Promise}
 */
function authenticate(parameters) {
    return queueRequest('Authenticate', {
        // When authenticating for the first time, we pass useExpensifyLogin as true so we check for credentials for
        // the expensify partnerID to let users authenticate with their expensify user and password.
        useExpensifyLogin: true,
        partnerName: CONFIG.EXPENSIFY.PARTNER_NAME,
        partnerPassword: CONFIG.EXPENSIFY.PARTNER_PASSWORD,
        partnerUserID: parameters.partnerUserID,
        partnerUserSecret: parameters.partnerUserSecret,
        twoFactorAuthCode: parameters.twoFactorAuthCode,
        exitTo: parameters.exitTo,
    })
        .then((response) => {
            setSuccessfulSignInData(response, parameters.exitTo);
        })
        .catch((err) => {
            console.error(err);
            console.debug('[SIGNIN] Request error');
            return Ion.merge(IONKEYS.SESSION, {error: err.message});
        });
}

/**
 * @param {object} parameters
 * @param {string} parameters.partnerUserID
 * @returns {Promise}
 */
function deleteLogin(parameters) {
    return queueRequest('DeleteLogin', {
        authToken,
        partnerUserID: parameters.partnerUserID,
        partnerName: CONFIG.EXPENSIFY.PARTNER_NAME,
        partnerPassword: CONFIG.EXPENSIFY.PARTNER_PASSWORD,
    })
        .catch(err => Ion.merge(IONKEYS.SESSION, {error: err.message}));
}

export {
    authenticate,
    deleteLogin,
    getAuthToken,
    onReconnect,
    queueRequest,
};
