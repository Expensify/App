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
import {redirect} from './actions/App';

// Holds all of the callbacks that need to be triggered when the network reconnects
const reconnectionCallbacks = [];

// Queue for network requests so we don't lose actions done by the user while offline
let networkRequestQueue = [];

// Indicates if we're in the process of re-authenticating. When an API call returns jsonCode 407 indicating that the
// authToken expired, we set this to true, pause all API calls, re-authenticate, and then use the authToken fromm the
// response in the subsequent API calls
let reauthenticating = false;

let authToken;
Ion.connect({
    key: IONKEYS.SESSION,
    callback: val => authToken = val ? val.authToken : null,
});

// We subscribe to changes to the online/offline status of the network to determine when we should fire off API calls
// vs queueing them for later. When reconnecting, ie, going from offline to online, all the reconnection callbacks
// are triggered (this is usually Actions that need to re-download data from the server)
let isOffline;
Ion.connect({
    key: IONKEYS.NETWORK,
    callback: (val) => {
        if (isOffline && !val.isOffline) {
            _.each(reconnectionCallbacks, callback => callback());
        }
        isOffline = val && val.isOffline;
    }
});

// When the user authenticates for the first time we create a login and store credentials in Ion.
// When the user's authToken expires we use this login to re-authenticate and get a new authToken
// and use that new authToken in subsequent API calls
let credentials;
Ion.connect({
    key: IONKEYS.CREDENTIALS,
    callback: ionCredentials => credentials = ionCredentials,
});

/**
 * @param {string} login
 * @param {string} password
 * @returns {Promise}
 */
function createLogin(login, password) {
    if (!authToken) {
        throw new Error('createLogin() can\'t be called when there is no authToken');
    }

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
        .then((response) => {
            if (response.jsonCode !== 200) {
                return redirectToSignIn(response.message);
            }
            Ion.merge(IONKEYS.CREDENTIALS, {login, password});
        })
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
    redirect(redirectTo);
    Ion.merge(IONKEYS.SESSION, _.pick(data, 'authToken', 'accountID', 'email'));
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
                    return redirectToSignIn(response.message);
                }

                // We need to return the promise from setSuccessfulSignInData to ensure the authToken is updated before
                // we try to create a login below
                setSuccessfulSignInData(response, parameters.exitTo);
                authToken = response.authToken;
            })
            .then(() => {
                // If Expensify login, it's the users first time signing in and we need to
                // create a login for the user
                if (parameters.useExpensifyLogin) {
                    console.debug('[SIGNIN] Creating a login');
                    return createLogin(Str.generateDeviceLoginID(), Guid());
                }
            })
            .catch(err => Ion.merge(IONKEYS.SESSION, {error: err}));
    }

    // Add authToken automatically to all commands
    const parametersWithAuthToken = {...parameters, ...{authToken}};

    // Make the http request, and if we get 407 jsonCode in the response,
    // re-authenticate to get a fresh authToken and make the original http request again
    return xhr(command, parametersWithAuthToken, type)
        .then((responseData) => {
            // We can end up here if we have queued up many
            // requests and have an expired authToken. In these cases,
            // we just need to requeue the request
            if (reauthenticating) {
                return queueRequest(command, parametersWithAuthToken);
            }

            // If we're not re-authenticating and we get 407 (authToken expired)
            // we re-authenticate and then re-try the original request
            if (responseData.jsonCode === 407 && parametersWithAuthToken.doNotRetry !== true) {
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

                        // Update the authToken that will be used to retry the command since the one we have is expired
                        parametersWithAuthToken.authToken = response.authToken;

                        // Update authToken in Ion store otherwise subsequent API calls will use the expired one
                        Ion.merge(IONKEYS.SESSION, _.pick(response, 'authToken'));
                        return response;
                    })
                    .then(() => xhr(command, parametersWithAuthToken, type))
                    .catch((error) => {
                        reauthenticating = false;
                        redirectToSignIn(error.message);
                        return Promise.reject();
                    });
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
 * Pusher.reconnect() calls disconnect and connect on the
 * Pusher socket. In some cases, the authorizer might fail
 * or an error will be returned due to an out of date authToken.
 * Reconnect will preserve our existing subscriptions and retry
 * connecting until it succeeds. We're throttling this call so
 * that we retry as few times as possible.
 */
const reconnectToPusher = _.throttle(Pusher.reconnect, 1000);

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
                reconnectToPusher();
                console.debug('[Network] Failed to authorize Pusher');
                callback(new Error(`Error calling auth endpoint: ${err}`));
            });
    },
}));

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
            if (data.current === 'failed') {
                // WebSockets are not natively available. In this case,
                // we should not let Pusher influence the offline state of the app.
                return;
            }

            if (data.current === 'disconnected' || data.current === 'connecting' || data.current === 'unavailable') {
                isCurrentlyOffline = true;
            }
            break;
        case 'error':
            reconnectToPusher();
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
        .catch((err) => {
            console.error(err);
            console.debug('[SIGNIN] Request error');
            Ion.merge(IONKEYS.SESSION, {error: err.message});
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
        doNotRetry: true,
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
