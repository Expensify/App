import {request} from '../Network';
import Ion from '../Ion';
import Guid from '../Guid';
import Str from '../Str';
import ROUTES from '../../ROUTES';
import IONKEYS from '../../IONKEYS';
import CONFIG from '../../CONFIG';
import redirectToSignIn from './ActionsSignInRedirect';

/**
 * Sets API data in the store when we make a successful "Authenticate"/"CreateLogin" request
 *
 * @param {object} data
 * @param {string} exitTo
 * @returns {Promise}
 */
function setSuccessfulSignInData(data, exitTo) {
    return Ion.multiSet({
        [IONKEYS.SESSION]: data,
        [IONKEYS.APP_REDIRECT_TO]: exitTo ? `/${exitTo}` : ROUTES.HOME,
        [IONKEYS.LAST_AUTHENTICATED]: new Date().getTime(),
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
 * Sign in with the API
 *
 * @param {string} login
 * @param {string} password
 * @param {string} twoFactorAuthCode
 * @param {boolean} useExpensifyLogin
 * @param {string} exitTo
 * @returns {Promise}
 */
function signIn(login, password, twoFactorAuthCode = '', useExpensifyLogin = false, exitTo) {
    console.debug('[SIGNIN] Authenticating with expensify login?', useExpensifyLogin ? 'yes' : 'no');
    return request('Authenticate', {
        useExpensifyLogin,
        partnerName: CONFIG.EXPENSIFY.PARTNER_NAME,
        partnerPassword: CONFIG.EXPENSIFY.PARTNER_PASSWORD,
        partnerUserID: login,
        partnerUserSecret: password,
        twoFactorAuthCode
    })
        .then((data) => {
            console.debug('[SIGNIN] Authentication result. Code:', data && data.jsonCode);

            // If we didn't get a 200 response from authenticate, the user needs to sign in again
            if (!useExpensifyLogin && data.jsonCode !== 200) {
                // eslint-disable-next-line no-console
                console.debug('[SIGNIN] Non-200 from authenticate, going back to sign in page');
                return Ion.multiSet({
                    [IONKEYS.CREDENTIALS]: {},
                    [IONKEYS.SESSION]: {error: data.message},
                })
                    .then(redirectToSignIn);
            }
            return setSuccessfulSignInData(data, exitTo);
        })
        .then(() => {
            // If Expensify login, it's the users first time logging in and we need to create a login for the user
            if (useExpensifyLogin) {
                console.debug('[SIGNIN] Creating a login');
                return createLogin(Str.generateDeviceLoginID(), Guid());
            }

            return new Promise();
        })
        .catch((err) => {
            console.error(err);
            console.debug('[SIGNIN] Request error');
            return Ion.merge(IONKEYS.SESSION, {error: err.message});
        });
}

export default signIn;
