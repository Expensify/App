import * as _ from 'lodash';
import * as Store from '../Store';
import {request} from '../../lib/Network';
import ROUTES from '../../ROUTES';
import STOREKEYS from '../STOREKEYS';
import * as PersistentStorage from '../../lib/PersistentStorage';
import CONFIG from '../../CONFIG';
import { Platform } from 'react-native';

const IS_IN_PRODUCTION = Platform.OS === 'web' ? process.env.NODE_ENV === 'production' : !__DEV__;
const partnerName = IS_IN_PRODUCTION ? 'chat-expensify-com' : 'expensify.com';
const partnerPassword = IS_IN_PRODUCTION ? 'e21965746fd75f82bb66' : 'MkgLvVAyaTlmw';

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
 */
function createLogin(authToken, login, password) {
    request('CreateLogin', {
        authToken,
        partnerName: CONFIG.EXPENSIFY.PARTNER_NAME,
        partnerPassword: CONFIG.EXPENSIFY.PARTNER_PASSWORD,
        partnerUserID: login,
        partnerUserSecret: password,
    }).catch((err) => {
        Store.set(STOREKEYS.SESSION, {error: err});
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
            if (data.jsonCode !== 200) {
                //TODO: Implement promise
                console.debug('Non-200 from authenticate, going back to sign in page');
                Store.set(STOREKEYS.CREDENTIALS, {});
                Store.set(STOREKEYS.SESSION, {error: data.message});
                Store.set(STOREKEYS.APP_REDIRECT_TO, ROUTES.SIGNIN);
                return;
            }

            // TODO: Fix merge, implement promise
            /*
            // If we used the Expensify login, it's the users first time logging in and we need to create a login for the user
            if (useExpensifyLogin) {
                createLogin(data.authToken, Str.generateDeviceLoginID(), Guid()).then(() => {
                    setSuccessfulData(data);
                });
                return;
            }


            setSuccessfulData(data);
            return data;



            // If we didn't get a 200 response from authenticate, the user needs to sign in again
            if (data.jsonCode !== 200) {
                console.warn('Did not get a 200 from authenticate, going back to sign in page');
                return Store.set(STOREKEYS.APP_REDIRECT_TO, ROUTES.SIGNIN);
            }

            return Store.multiSet({
                [STOREKEYS.SESSION]: data,
                [STOREKEYS.APP_REDIRECT_TO]: ROUTES.HOME,
                [STOREKEYS.LAST_AUTHENTICATED]: new Date().getTime(),
            });*/
        })
        .then(() => authToken)
        .catch((err) => {
            console.error(err);
            Store.set(STOREKEYS.SESSION, {error: err.message});
        });
}

/**
 * Sets API data in the store when we make a successful "Authenticate"/"CreateLogin" request
 * @param {object} data
 */
function setSuccessfulData(data) {
    Store.set(STOREKEYS.SESSION, data);
    Store.set(STOREKEYS.APP_REDIRECT_TO, ROUTES.HOME);
    Store.set(STOREKEYS.LAST_AUTHENTICATED, new Date().getTime());
}

/**
 * Create login
 * @param {string} authToken
 * @param {string} login
 * @param {string} password
 */
function createLogin(authToken, login, password) {
    return request('CreateLogin', {
        authToken,
        partnerName,
        partnerPassword,
        partnerUserID: login,
        partnerUserSecret: password,
    }).then(() => {
        Store.set(STOREKEYS.CREDENTIALS, {login, password});
    })
        .catch((err) => {
            Store.set(STOREKEYS.SESSION, {error: err.message});
        });
}

/**
 * Delete login
 * @param {string} authToken
 * @param {string} login
 */
function deleteLogin(authToken, login) {
    return request('DeleteLogin', {
        authToken,
        partnerName,
        partnerPassword,
        partnerUserID: login,
    })
        .catch((err) => {
            Store.set(STOREKEYS.SESSION, {error: err.message});
        });
}

/**
 * Sign out of our application
 *
 * @returns {Promise}
 */
async function signOut() {
    return Store.set(STOREKEYS.APP_REDIRECT_TO, ROUTES.SIGNIN)
        .then(Store.clear);
    await deleteLogin();
}

/**
 * Make sure the authToken we have is OK to use
 *
 * @returns {Promise}
 */
async function verifyAuthToken() {
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
