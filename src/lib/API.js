import _ from 'underscore';
import Ion from './Ion';
import IONKEYS from '../IONKEYS';
import {request, setNewOfflineStatus, onReconnect} from './Network';
import CONFIG from '../CONFIG';
import * as Pusher from './Pusher/pusher';
import ROUTES from '../ROUTES';

let authToken;
Ion.connect({key: IONKEYS.SESSION, path: 'authToken', callback: val => authToken = val});

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
    setNewOfflineStatus(isCurrentlyOffline);
});

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

// PUBLIC

/**
 * Register a callback function to be called when the network reconnects
 *
 * @public
 * @param {function} cb
 */
function whenReconnected(cb) {
    onReconnect(cb);
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
    return request('Authenticate', {
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
    return request('DeleteLogin', {
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
    whenReconnected,
};
