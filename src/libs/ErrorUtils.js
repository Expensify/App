import CONST from '../CONST';

/**
 * @param {Object} response
 * @returns {String}
 */
function getErrorKeyFromAuthenticateResponse(response) {
    // If we didn't get a 200 response from Authenticate we either failed to Authenticate with
    // an expensify login or the login credentials we created after the initial authentication.
    // In both cases, we need the user to sign in again with their expensify credentials
    if (response.jsonCode === CONST.JSON_CODE.SUCCESS) {
        return '';
    }

    switch (response.jsonCode) {
        case 401:
            return 'passwordForm.error.incorrectLoginOrPassword';
        case 402:
            // If too few characters are passed as the password, the WAF will pass it to the API as an empty
            // string, which results in a 402 error from Auth.
            if (response.message === '402 Missing partnerUserSecret') {
                return 'passwordForm.error.incorrectLoginOrPassword';
            }
            return 'passwordForm.error.twoFactorAuthenticationEnabled';
        case 403:
            if (response.message === 'Invalid code') {
                return 'passwordForm.error.incorrect2fa';
            }
            return 'passwordForm.error.invalidLoginOrPassword';
        case 404:
            return 'passwordForm.error.unableToResetPassword';
        case 405:
            return 'passwordForm.error.noAccess';
        case 413:
            return 'passwordForm.error.accountLocked';
        default:
            return 'passwordForm.error.fallback';
    }
}

export {
    // eslint-disable-next-line import/prefer-default-export
    getErrorKeyFromAuthenticateResponse,
};
