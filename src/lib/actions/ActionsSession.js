import _ from 'underscore';
import Ion from '../Ion';
import {request} from '../Network';
import ROUTES from '../../ROUTES';
import IONKEYS from '../../IONKEYS';
import CONFIG from '../../CONFIG';
import Str from '../Str';
import Guid from '../Guid';
import redirectToSignIn from './ActionsSignInRedirect';

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
    }).then(() => Ion.set(IONKEYS.CREDENTIALS, {login, password}))
        .catch(err => Ion.merge(IONKEYS.SESSION, {error: err}));
}

/**
 * Sign in with the API
 *
 * @param {string} login
 * @param {string} password
 * @param {string} twoFactorAuthCode
 * @returns {Promise}
 */
function signIn(login, password, twoFactorAuthCode = '') {
    console.debug('[SIGNIN] Authenticating with expensify login');
    return request('Authenticate', {
        useExpensifyLogin: true,
        partnerName: CONFIG.EXPENSIFY.PARTNER_NAME,
        partnerPassword: CONFIG.EXPENSIFY.PARTNER_PASSWORD,
        partnerUserID: login,
        partnerUserSecret: password,
        twoFactorAuthCode
    })
        .then((data) => {
            console.debug('[SIGNIN] Authentication result. Code:', data && data.jsonCode);

            // If we didn't get a 200 response from authenticate, the user needs to sign in again
            if (data.jsonCode !== 200) {
                // eslint-disable-next-line no-console
                console.debug('[SIGNIN] Non-200 from authenticate, going back to sign in page');
                return Ion.multiSet({
                    [IONKEYS.CREDENTIALS]: {},
                    [IONKEYS.SESSION]: {error: data.message},
                })
                    .then(redirectToSignIn);
            }

            // If Expensify login, it's the users first time logging in and we need to create a login for the user
            console.debug('[SIGNIN] Creating a login');
            return createLogin(data.authToken, Str.generateDeviceLoginID(), Guid())
                .then(() => {
                    console.debug('[SIGNIN] Successful sign in', 2);
                    return Ion.multiSet({
                        // Response include things we don't need to store like jsonCode, httpCode, and requestID
                        [IONKEYS.SESSION]: _.pick(data, 'authToken', 'email', 'accountID'),
                        [IONKEYS.APP_REDIRECT_TO]: ROUTES.HOME,
                        [IONKEYS.LAST_AUTHENTICATED]: new Date().getTime(),
                    });
                });
        })
        .catch((err) => {
            console.error(err);
            console.debug('[SIGNIN] Request error');
            return Ion.merge(IONKEYS.SESSION, {error: err.message});
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
    }).catch(err => Ion.merge(IONKEYS.SESSION, {error: err.message}));
}

/**
 * Sign out of our application
 *
 * @returns {Promise}
 */
function signOut() {
    return redirectToSignIn()
        .then(() => Ion.multiGet([IONKEYS.SESSION, IONKEYS.CREDENTIALS]))
        .then(data => deleteLogin(data.session.authToken, data.credentials.login))
        .then(Ion.clear)
        .catch(err => Ion.merge(IONKEYS.SESSION, {error: err.message}));
}

/**
 * Make sure the authToken we have is OK to use
 *
 * @returns {Promise}
 */
function verifyAuthToken() {
    return Ion.multiGet([IONKEYS.LAST_AUTHENTICATED, IONKEYS.CREDENTIALS])
        .then(({last_authenticated, credentials}) => {
            const haveCredentials = !_.isNull(credentials);
            const haveExpiredAuthToken = last_authenticated < new Date().getTime() - CONFIG.AUTH_TOKEN_EXPIRATION_TIME;

            if (haveExpiredAuthToken && haveCredentials) {
                console.debug('Invalid auth token: Token has expired.');
                return signIn(credentials.login, credentials.password);
            }

            return request('Get', {returnValueList: 'account'}).then((data) => {
                if (data && data.jsonCode === 200) {
                    return Ion.merge(IONKEYS.SESSION, data);
                }

                // If the auth token is bad and we didn't have credentials saved, we want them to go to the sign in page
                return redirectToSignIn();
            });
        });
}

export {
    signIn,
    signOut,
    verifyAuthToken,
};
