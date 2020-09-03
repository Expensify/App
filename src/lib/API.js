import Ion from './Ion';
import IONKEYS from '../IONKEYS';
import {request} from './Network';
import CONFIG from '../CONFIG';

/**
 * @param {object} parameters
 * @param {string} parameters.partnerUserID
 * @param {string} parameters.partnerUserSecret
 * @param {string} parameters.twoFactorAuthCode
 * @param {string} [parameters.exitTo]
 * @returns {Promise}
 */
function authenticate(parameters) {
    return request('Authenticate', {
        // When authenticating for the first time, we pass useExpensifyLogin as true so we check for credentials for
        // the expensify partnerID to let users authenticate with their expensify user and password.
        useExpensifyLogin: true,
        partnerName: CONFIG.EXPENSIFY.PARTNER_NAME,
        partnerPassword: CONFIG.EXPENSIFY.PARTNER_PASSWORD,
        partnerUserID: parameters.partnerUserID,
        partnerUserSecret: parameters.partnerUserSecret,
        twoFactorAuthCode: parameters.twoFactorAuthCode,
        exitTo: parameters.exitTo,
    })
        .catch((err) => {
            console.error(err);
            console.debug('[SIGNIN] Request error');
            return Ion.merge(IONKEYS.SESSION, {error: err.message});
        });
}

/**
 * @param {object} parameters
 * @param {string} parameters.authToken
 * @param {string} parameters.partnerUserID
 * @returns {Promise}
 */
function deleteLogin(parameters) {
    return request('DeleteLogin', {
        authToken: parameters.authToken,
        partnerUserID: parameters.partnerUserID,
        partnerName: CONFIG.EXPENSIFY.PARTNER_NAME,
        partnerPassword: CONFIG.EXPENSIFY.PARTNER_PASSWORD,
    })
        .catch(err => Ion.merge(IONKEYS.SESSION, {error: err.message}));
}

export {
    authenticate,
    deleteLogin,
};
