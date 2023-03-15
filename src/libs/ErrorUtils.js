import _ from 'underscore';
import CONST from '../CONST';

/**
 * @param {Object} response
 * @param {Number} response.jsonCode
 * @param {String} response.message
 * @returns {String}
 */
function getAuthenticateErrorMessage(response) {
    switch (response.jsonCode) {
        case CONST.JSON_CODE.UNABLE_TO_RETRY:
            return 'session.offlineMessageRetry';
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

/**
 * @param {Object} onyxData
 * @param {Object} onyxData.errors
 * @returns {String}
 */
function getLatestErrorMessage(onyxData) {
    if (_.isEmpty(onyxData.errors)) {
        return '';
    }
    return _.chain(onyxData.errors || [])
        .keys()
        .sortBy()
        .reverse()
        .map(key => onyxData.errors[key])
        .first()
        .value();
}

/**
 * Method used to generate error message for given inputID
 * @param {Object} errors - An object containing current errors in the form
 * @param {String} inputID
 * @param {String} message - Message to assign to the inputID errors
 * @returns {Object} - An object containing the errors for each inputID
 */
function addErrorMessage(errors, inputID, message) {
    const errorList = errors;

    if (_.isEmpty(errorList[inputID])) {
        errorList[inputID] = message;
    } else {
        errorList[inputID] = `${errorList[inputID]}\n${message}`;
    }

    return errorList;
}

export {
    // eslint-disable-next-line import/prefer-default-export
    getAuthenticateErrorMessage,
    getLatestErrorMessage,
    addErrorMessage,
};
