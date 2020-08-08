import _ from 'underscore';
import * as Store from '../Store';
import {request} from '../../lib/Network';
import ROUTES from '../../ROUTES';
import STOREKEYS from '../STOREKEYS';
import CONFIG from '../../CONFIG';
import Str from '../../lib/Str';
import Guid from '../../lib/Guid';

/**
 * Amount of time (in ms) after which an authToken is considered expired.
 * Currently set to 90min
 *
 * @private
 * @type {Number}
 */
const AUTH_TOKEN_EXPIRATION_TIME = 1000 * 60 * 90;

/**
 * Create login
 * @param {string} authToken
 * @param {string} login
 * @param {string} password
 * @returns {Promise}
 */
function createLogin(authToken, login, password) {
    return request('CreateLogin', {
        authToken,
        partnerName: CONFIG.EXPENSIFY.PARTNER_NAME,
        partnerPassword: CONFIG.EXPENSIFY.PARTNER_PASSWORD,
        partnerUserID: login,
        partnerUserSecret: password,
    }).then(() => Store.set(STOREKEYS.CREDENTIALS, {login, password}))
        .catch(err => Store.set(STOREKEYS.SESSION, {error: err}));
}

/**
 * Sets API data in the store when we make a successful "Authenticate"/"CreateLogin" request
 * @param {object} data
 * @returns {Promise}
 */
function setSuccessfulSignInData(data) {
    return Store.multiSet({
        [STOREKEYS.SESSION]: data,
        [STOREKEYS.APP_REDIRECT_TO]: ROUTES.HOME,
        [STOREKEYS.LAST_AUTHENTICATED]: new Date().getTime(),
    });
}

/**
 * Sign in with the API
 *
 * @param {string} login
 * @param {string} password
 * @param {boolean} useExpensifyLogin
 * @returns {Promise}
 */
function signIn(login, password, useExpensifyLogin = false) {
    let authToken;
    return request('Authenticate', {
        useExpensifyLogin,
        partnerName: CONFIG.EXPENSIFY.PARTNER_NAME,
        partnerPassword: CONFIG.EXPENSIFY.PARTNER_PASSWORD,
        partnerUserID: login,
        partnerUserSecret: password,
    })
        .then((data) => {
            authToken = data && data.authToken;

            // If we didn't get a 200 response from authenticate, the user needs to sign in again
            if (!useExpensifyLogin && data.jsonCode !== 200) {
                // eslint-disable-next-line no-console
                console.debug('Non-200 from authenticate, going back to sign in page', data.jsonCode);
                return Store.multiSet({
                    [STOREKEYS.CREDENTIALS]: {},
                    [STOREKEYS.SESSION]: {error: data.message},
                    [STOREKEYS.APP_REDIRECT_TO]: ROUTES.SIGNIN,
                });
            }

            // If Expensify login, it's the users first time logging in and we need to create a login for the user
            if (useExpensifyLogin) {
                return createLogin(data.authToken, Str.generateDeviceLoginID(), Guid())
                    .then(() => setSuccessfulSignInData(data));
            }

            return setSuccessfulSignInData();
        })
        .then(() => authToken)
        .catch((err) => {
            console.error(err);
            return Store.set(STOREKEYS.SESSION, {error: err.message});
        });
}

/**
 * Delete login
 * @param {string} authToken
 * @param {string} login
 * @returns {Promise}
 */
function deleteLogin(authToken, login) {
    return request('DeleteLogin', {
        authToken,
        partnerName: CONFIG.EXPENSIFY.PARTNER_NAME,
        partnerPassword: CONFIG.EXPENSIFY.PARTNER_PASSWORD,
        partnerUserID: login,
    }).catch(err => Store.set(STOREKEYS.SESSION, {error: err.message}));
}

/**
 * Sign out of our application
 *
 * @returns {Promise}
 */
function signOut() {
    return Store.set(STOREKEYS.APP_REDIRECT_TO, ROUTES.SIGNIN)
        .then(() => Store.multiGet([STOREKEYS.SESSION, STOREKEYS.CREDENTIALS]))
        .then(data => deleteLogin(data.session.authToken, data.credentials.login))
        .then(Store.clear)
        .catch(err => Store.set(STOREKEYS.SESSION, {error: err.message}));
}

/**
 * Make sure the authToken we have is OK to use
 *
 * @returns {Promise}
 */
function verifyAuthToken() {
    return Store.multiGet([STOREKEYS.LAST_AUTHENTICATED, STOREKEYS.CREDENTIALS])
        .then(({last_authenticated, credentials}) => {
            const haveCredentials = !_.isNull(credentials);
            const haveExpiredAuthToken = last_authenticated < new Date().getTime() - AUTH_TOKEN_EXPIRATION_TIME;

            if (haveExpiredAuthToken && haveCredentials) {
                console.debug('Invalid auth token: Token has expired.');
                return signIn(credentials.login, credentials.password);
            }

            return request('Get', {returnValueList: 'account'}).then((data) => {
                if (data.jsonCode === 200) {
                    console.debug('We have valid auth token');
                    return Store.set(STOREKEYS.SESSION, data);
                }

                // If the auth token is bad and we didn't have credentials saved, we want them to go to the sign in page
                return Store.set(STOREKEYS.APP_REDIRECT_TO, ROUTES.SIGNIN);
            });
        });
}

export {
    signIn,
    signOut,
    verifyAuthToken
};
