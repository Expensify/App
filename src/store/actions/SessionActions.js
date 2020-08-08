import * as _ from 'lodash';
import * as Store from '../Store';
import {request} from '../../lib/Network';
import ROUTES from '../../ROUTES';
import STOREKEYS from '../STOREKEYS';
import * as PersistentStorage from '../../lib/PersistentStorage';
import CONFIG from '../../CONFIG';

/**
 * Amount of time (in ms) after which an authToken is considered expired.
 * Currently set to 90min
 *
 * @private
 * @type {Number}
 */
const AUTH_TOKEN_EXPIRATION_TIME = 1000 * 60;

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
    return Store.multiSet({
        [STOREKEYS.CREDENTIALS]: {login, password},
        [STOREKEYS.SESSION]: {},
    })
        .then(() => request('Authenticate', {
            useExpensifyLogin,
            partnerName: CONFIG.EXPENSIFY.PARTNER_NAME,
            partnerPassword: CONFIG.EXPENSIFY.PARTNER_PASSWORD,
            partnerUserID: login,
            partnerUserSecret: password,
        }))
        .then((data) => {
            authToken = data.authToken;

            // 404 We need to create a login
            if (data.jsonCode === 404 && !useExpensifyLogin) {
                return signIn(login, password, true)
                    .then((newAuthToken) => {
                        createLogin(newAuthToken, login, password);
                    });
            }

            // If we didn't get a 200 response from authenticate, the user needs to sign in again
            if (data.jsonCode !== 200) {
                console.warn('Did not get a 200 from authenticate, going back to sign in page');
                return Store.set(STOREKEYS.APP_REDIRECT_TO, ROUTES.SIGNIN);
            }

            return Store.multiSet({
                [STOREKEYS.SESSION]: data,
                [STOREKEYS.APP_REDIRECT_TO]: ROUTES.HOME,
                [STOREKEYS.LAST_AUTHENTICATED]: new Date().getTime(),
            });
        })
        .then(() => authToken)
        .catch((err) => {
            console.error(err);
            Store.set(STOREKEYS.SESSION, {error: err});
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
