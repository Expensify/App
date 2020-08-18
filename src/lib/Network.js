import _ from 'underscore';
import Ion from './Ion';
import CONFIG from '../CONFIG';
import IONKEYS from '../IONKEYS';
import ROUTES from '../ROUTES';
import Str from './Str';
import Guid from './Guid';
import redirectToSignIn from './actions/ActionsSignInRedirect';

let isAppOffline = false;
let reauthenticating = false;

// Holds a queue of all the write requests that need to happen
const delayedWriteQueue = [];

/**
 * A method to write data to the API in a delayed fashion that supports the app being offline
 *
 * @param {string} command
 * @param {mixed} data
 * @returns {Promise}
 */
function delayedWrite(command, data) {
    return new Promise((resolve) => {
        // Add the write request to a queue of actions to perform
        delayedWriteQueue.push({
            command,
            data,
            callback: resolve,
        });
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
    return Ion.multiSet({
        // The response from Authenticate includes requestID, jsonCode, etc
        // but we only care about setting these three values in Ion
        [IONKEYS.SESSION]: _.pick(data, 'authToken', 'accountID', 'email'),
        [IONKEYS.APP_REDIRECT_TO]: exitTo ? `/${exitTo}` : ROUTES.HOME,
        [IONKEYS.LAST_AUTHENTICATED]: new Date().getTime(),
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
    return Ion.get(IONKEYS.SESSION, 'authToken')
        .then((authToken) => {
            const formData = new FormData();

            // If we're calling Authenticate we don't need an authToken, so let's not send "undefined"
            if (command !== 'Authenticate') {
                formData.append('authToken', authToken);
            }
            _.each(data, (val, key) => formData.append(key, val));
            return formData;
        })
        .then(formData => fetch(`${CONFIG.EXPENSIFY.API_ROOT}command=${command}`, {
            method: type,
            body: formData,
        })
            .then(response => response.json()))

        // This will catch any HTTP network errors (like 404s and such), not to be confused with jsonCode which this
        // does NOT catch
        .catch(() => {
            isAppOffline = true;

            // Throw a new error to prevent any other `then()` in the promise chain from being triggered (until another
            // catch() happens
            throw new Error('API is offline');
        });
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
 * Make an XHR to the server
 *
 * @param {string} command
 * @param {mixed} data
 * @param {string} [type]
 * @returns {Promise}
 */
function request(command, data, type = 'post') {
    // If we're in the process of re-authenticating, queue this request for after we're done re-authenticating
    if (reauthenticating) {
        return delayedWrite(command, data);
    }

    // We treat Authenticate in a special way because unlike other commands, this one can't fail
    // with 407 authToken expired. When other api commands fail with this error we call Authenticate
    // to get a new authToken and then fire the original api command again
    if (command === 'Authenticate') {
        return xhr(command, data, type)
            .then((response) => {
                // If we didn't get a 200 response from authenticate, the user needs to sign in again
                // TODO: check for response.useExpensifyLogin
                if (!command.useExpensifyLogin && response.jsonCode !== 200) {
                    // eslint-disable-next-line no-console
                    return Ion.multiSet({
                        [IONKEYS.CREDENTIALS]: {},
                        [IONKEYS.SESSION]: {error: response.message},
                    })
                        .then(redirectToSignIn);
                }
                return setSuccessfulSignInData(response, command.exitTo);
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
            if (!reauthenticating && responseData.jsonCode === 407) {
                reauthenticating = true;
                return Ion.get(IONKEYS.CREDENTIALS)
                    .then(({login, password}) => xhr('Authenticate', {
                        useExpensifyLogin: false,
                        partnerName: CONFIG.EXPENSIFY.PARTNER_NAME,
                        partnerPassword: CONFIG.EXPENSIFY.PARTNER_PASSWORD,
                        partnerUserID: login,
                        partnerUserSecret: password,
                        twoFactorAuthCode: ''
                    })
                        .then((response) => {
                            reauthenticating = false;
                            return setSuccessfulSignInData(response);
                        })
                        .then(() => xhr(command, data, type))
                        .catch(() => {
                            reauthenticating = false;
                            redirectToSignIn();
                            return Promise.reject();
                        }));
            }
            return responseData;
        });
}

/**
 * Process the write queue by looping through the queue and attempting to make the requests
 */
function processWriteQueue() {
    if (isAppOffline) {
        // Make a simple request to see if we're online again
        request('Get', null)
            .then(() => isAppOffline = false);
        return;
    }

    // Don't make any requests until we're done re-authenticating
    if (reauthenticating) {
        return;
    }

    if (delayedWriteQueue.length === 0) {
        return;
    }

    for (let i = 0; i < delayedWriteQueue.length; i++) {
        // Take the request object out of the queue and make the request
        const delayedWriteRequest = delayedWriteQueue.shift();

        request(delayedWriteRequest.command, delayedWriteRequest.data)
            .then(delayedWriteRequest.callback)
            .catch(() => {
                // If the request failed, we need to put the request object back into the queue
                delayedWriteQueue.push(delayedWriteRequest);
            });
    }
}

// Process our write queue very often
setInterval(processWriteQueue, 1000);

export {
    request,
    delayedWrite,
};
