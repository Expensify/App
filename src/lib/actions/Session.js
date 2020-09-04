import Ion from '../Ion';
import {request} from '../Network';
import IONKEYS from '../../IONKEYS';
import CONFIG from '../../CONFIG';
import redirectToSignIn from './SignInRedirect';

let session;
Ion.connect({
    key: IONKEYS.SESSION,
    callback: val => session = val,
});

let credentials;
Ion.connect({
    key: IONKEYS.CREDENTIALS,
    callback: val => credentials = val,
});

/**
 * Sign in with the API
 *
 * @param {string} login
 * @param {string} password
 * @param {string} twoFactorAuthCode
 * @param {string} exitTo
 * @param {boolean} useExpensifyLogin
 *
 * @returns {Promise}
 */
function signIn(login, password, twoFactorAuthCode = '', exitTo, useExpensifyLogin = true) {
    console.debug('[SIGNIN] Authenticating with login type:', useExpensifyLogin ? 'expensify' : 'device');
    return request('Authenticate', {
        // When authenticating for the first time, we pass useExpensifyLogin as true so we check for credentials for
        // the expensify partnerID to let users authenticate with their expensify user and password.
        useExpensifyLogin,
        partnerName: CONFIG.EXPENSIFY.PARTNER_NAME,
        partnerPassword: CONFIG.EXPENSIFY.PARTNER_PASSWORD,
        partnerUserID: login,
        partnerUserSecret: password,
        twoFactorAuthCode,
        exitTo
    })
        .catch((err) => {
            console.error(err);
            console.debug('[SIGNIN] Request error');
            return Ion.merge(IONKEYS.SESSION, {error: err.message});
        });
}

/**
 * Delete login
 *
 * @param {string} authToken
 * @param {string} login
 *
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
 */
function signOut() {
    deleteLogin(session.authToken, credentials.login)
        .then(redirectToSignIn)
        .then(Ion.clear)
        .catch(err => Ion.merge(IONKEYS.SESSION, {error: err.message}));
}

export {
    signIn,
    signOut,
};
