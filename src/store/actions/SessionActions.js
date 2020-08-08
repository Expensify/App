import { Platform } from 'react-native';
import * as _ from 'lodash';
import * as Store from '../Store.js';
import {request} from '../../lib/Network.js';
import ROUTES from '../../ROUTES.js';
import STOREKEYS from '../STOREKEYS.js';
import * as PersistentStorage from '../../lib/PersistentStorage.js';
import Str from '../../lib/Str';
import Guid from '../../lib/Guid';

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
 * Sign in with the API
 * @param {string} login
 * @param {string} password
 * @param {boolean} useExpensifyLogin
 */
function signIn(login, password, useExpensifyLogin = false) {
    return request('Authenticate', {
        useExpensifyLogin,
        partnerName,
        partnerPassword,
        partnerUserID: login,
        partnerUserSecret: password,
    })
        .then((data) => {
            // If we didn't get a 200 response from authenticate, the user needs to sign in again
            if (data.jsonCode !== 200) {
                console.debug('Non-200 from authenticate, going back to sign in page');
                Store.set(STOREKEYS.CREDENTIALS, {});
                Store.set(STOREKEYS.SESSION, {error: data.message});
                Store.set(STOREKEYS.APP_REDIRECT_TO, ROUTES.SIGNIN);
                return;
            }

            // If we used the Expensify login, it's the users first time logging in and we need to create a login for the user
            if (useExpensifyLogin) {
                createLogin(data.authToken, Str.generateDeviceLoginID(), Guid()).then(() => {
                    setSuccessfulData(data);
                });
                return;
            }


            setSuccessfulData(data);
            return data;
        })
        .catch((err) => {
            console.warn(err);
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
 */
async function signOut() {
    Store.set(STOREKEYS.APP_REDIRECT_TO, ROUTES.SIGNIN);
    await PersistentStorage.clear();
    await deleteLogin();
}

/**
 * Make sure the authToken we have is OK to use
 */
async function verifyAuthToken() {
    const lastAuthenticated = await Store.get(STOREKEYS.LAST_AUTHENTICATED);
    const credentials = await Store.get(STOREKEYS.CREDENTIALS);
    const haveCredentials = !_.isNull(credentials);
    const haveExpiredAuthToken = lastAuthenticated < new Date().getTime() - AUTH_TOKEN_EXPIRATION_TIME;

    if (haveExpiredAuthToken && haveCredentials) {
        console.debug('Invalid auth token: Token has expired.');
        signIn(credentials.login, credentials.password);
        return;
    }

    request('Get', {returnValueList: 'account'}).then((data) => {
        if (data.jsonCode === 200) {
            console.debug('We have valid auth token');
            Store.set(STOREKEYS.SESSION, data);
            return;
        }

        // If the auth token is bad and we didn't have credentials saved, we want them to go to the sign in page
        Store.set(STOREKEYS.APP_REDIRECT_TO, ROUTES.SIGNIN);
    });
}

export {signIn, signOut, verifyAuthToken};
