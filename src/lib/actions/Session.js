import Ion from '../Ion';
import * as API from '../API';
import IONKEYS from '../../IONKEYS';
import CONFIG from '../../CONFIG';
import redirectToSignIn from './SignInRedirect';

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
function signIn(login, password, twoFactorAuthCode = '', exitTo) {
    return API.authenticate({
        // When authenticating for the first time, we pass useExpensifyLogin as true so we check for credentials for
        // the expensify partnerID to let users authenticate with their expensify user and password.
        useExpensifyLogin: true,
        partnerName: CONFIG.EXPENSIFY.PARTNER_NAME,
        partnerPassword: CONFIG.EXPENSIFY.PARTNER_PASSWORD,
        partnerUserID: login,
        partnerUserSecret: password,
        twoFactorAuthCode,
        exitTo
    });
}

/**
 * Delete login
 * @param {string} authToken
 * @param {string} login
 * @returns {Promise}
 */
function deleteLogin(authToken, login) {
    return API.deleteLogin({
        authToken,
        partnerName: CONFIG.EXPENSIFY.PARTNER_NAME,
        partnerPassword: CONFIG.EXPENSIFY.PARTNER_PASSWORD,
        partnerUserID: login,
    });
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

export {
    signIn,
    signOut,
};
