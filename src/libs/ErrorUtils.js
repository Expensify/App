import _ from 'underscore';
import lodashGet from 'lodash/get';
import CONST from '../CONST';
import DateUtils from './DateUtils';
import * as Localize from './Localize';

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
 * Method used to get an error object with microsecond as the key.
 * @param {String} error - error key or message to be saved
 * @return {Object}
 *
 */
function getMicroSecondOnyxError(error) {
    return {[DateUtils.getMicroseconds()]: error};
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
        .map((key) => onyxData.errors[key])
        .first()
        .value();
}

/**
 * @param {Object} onyxData
 * @param {Object} onyxData.errorFields
 * @param {String} fieldName
 * @returns {Object}
 */
function getLatestErrorField(onyxData, fieldName) {
    const errorsForField = lodashGet(onyxData, ['errorFields', fieldName], {});

    if (_.isEmpty(errorsForField)) {
        return {};
    }
    return _.chain(errorsForField)
        .keys()
        .sortBy()
        .reverse()
        .map((key) => ({[key]: errorsForField[key]}))
        .first()
        .value();
}

/**
 * @param {Object} onyxData
 * @param {Object} onyxData.errorFields
 * @param {String} fieldName
 * @returns {Object}
 */
function getEarliestErrorField(onyxData, fieldName) {
    const errorsForField = lodashGet(onyxData, ['errorFields', fieldName], {});

    if (_.isEmpty(errorsForField)) {
        return {};
    }
    return _.chain(errorsForField)
        .keys()
        .sortBy()
        .map((key) => ({[key]: errorsForField[key]}))
        .first()
        .value();
}

/**
 * Method used to generate error message for given inputID
 * @param {Object} errors - An object containing current errors in the form
 * @param {String} inputID
 * @param {String|Array} message - Message to assign to the inputID errors
 *
 */
function addErrorMessage(errors, inputID, message) {
    if (!message || !inputID) {
        return;
    }

    const errorList = errors;
    const translatedMessage = Localize.translateIfPhraseKey(message);

    if (_.isEmpty(errorList[inputID])) {
        errorList[inputID] = [translatedMessage, {isTranslated: true}];
    } else if (_.isString(errorList[inputID])) {
        errorList[inputID] = [`${errorList[inputID]}\n${translatedMessage}`, {isTranslated: true}];
    } else {
        errorList[inputID][0] = `${errorList[inputID][0]}\n${translatedMessage}`;
    }
}

export {getAuthenticateErrorMessage, getMicroSecondOnyxError, getLatestErrorMessage, getLatestErrorField, getEarliestErrorField, addErrorMessage};
