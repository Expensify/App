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
 * Create login
 * @param {string} login
 * @param {string} password
 * @returns {Promise}
 */
function createLogin(login, password) {
    return request('CreateLogin', {
        partnerName: CONFIG.EXPENSIFY.PARTNER_NAME,
        partnerPassword: CONFIG.EXPENSIFY.PARTNER_PASSWORD,
        partnerUserID: login,
        partnerUserSecret: password,
    }).then(() => Ion.set(IONKEYS.CREDENTIALS, {login, password}))
        .catch(err => Ion.merge(IONKEYS.SESSION, {error: err}));
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

function xhr(command, data, type = 'post') {
    return Ion.get(IONKEYS.SESSION, 'authToken')
        .then((authToken) => {
            const formData = new FormData();

            // If we're calling Authenticate we don't need an authToken, so let's not send "undefined"
            if (command !== 'Authenticate') {
                formData.append('authToken', authToken);
            }
            _.each(data, (val, key) => formData.append(key, val));
            return Promise.resolve(formData);
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
 * Make an XHR to the server
 *
 * @param {string} command
 * @param {mixed} data
 * @param {string} [type]
 * @returns {Promise}
 */
function request(command, data, type = 'post') {
    // TODO: add chceke for expiration
    // const haveCredentials = !_.isNull(credentials);
    // const haveExpiredAuthToken = last_authenticated < new Date().getTime() - CONFIG.AUTH_TOKEN_EXPIRATION_TIME;

    // if (haveExpiredAuthToken && haveCredentials) {
    //     console.debug('Invalid auth token: Token has expired.');
    //     return signIn(credentials.login, credentials.password);
    // }

    if (reauthenticating) {
        return delayedWrite(command, data);
    }

    // We treat Authenticate in a special way
    // TODO explain why
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

                // TODO: check for exitTo
                return setSuccessfulSignInData(response, command.exitTo);
            })
            .then((response) => {
                // If Expensify login, it's the users first time signing in and we need to
                // create a login for the user
                if (data.useExpensifyLogin) {
                    console.debug('[SIGNIN] Creating a login');
                    return createLogin(Str.generateDeviceLoginID(), Guid());
                }

                return Promise.resolve(response);
            });
    }

    return xhr(command, data, type)

        // Handle any of our jsonCodes
        .then((responseData) => {
            // AuthToken expired, re-authenticate
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
            return Promise.resolve(responseData);
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
