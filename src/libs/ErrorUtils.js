'use strict';
exports.__esModule = true;
exports.isReceiptError =
    exports.getMicroSecondOnyxErrorObject =
    exports.getMicroSecondOnyxErrorWithMessage =
    exports.getMicroSecondOnyxErrorWithTranslationKey =
    exports.getLatestError =
    exports.getLatestErrorMessageField =
    exports.getLatestErrorMessage =
    exports.getLatestErrorFieldForAnyField =
    exports.getLatestErrorField =
    exports.getErrorsWithTranslationData =
    exports.getErrorMessageWithTranslationData =
    exports.getEarliestErrorField =
    exports.getAuthenticateErrorMessage =
    exports.addErrorMessage =
        void 0;
var mapValues_1 = require('lodash/mapValues');
var CONST_1 = require('@src/CONST');
var DateUtils_1 = require('./DateUtils');
var Localize = require('./Localize');
function getAuthenticateErrorMessage(response) {
    switch (response.jsonCode) {
        case CONST_1['default'].JSON_CODE.UNABLE_TO_RETRY:
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
exports.getAuthenticateErrorMessage = getAuthenticateErrorMessage;
/**
 * Creates an error object with a timestamp (in microseconds) as the key and the translated error message as the value.
 * @param error - The translation key for the error message.
 */
function getMicroSecondOnyxErrorWithTranslationKey(error, errorKey) {
    var _a;
    return (_a = {}), (_a[errorKey !== null && errorKey !== void 0 ? errorKey : DateUtils_1['default'].getMicroseconds()] = Localize.translateLocal(error)), _a;
}
exports.getMicroSecondOnyxErrorWithTranslationKey = getMicroSecondOnyxErrorWithTranslationKey;
/**
 * Creates an error object with a timestamp (in microseconds) as the key and the error message as the value.
 * @param error - The error message.
 */
function getMicroSecondOnyxErrorWithMessage(error, errorKey) {
    var _a;
    return (_a = {}), (_a[errorKey !== null && errorKey !== void 0 ? errorKey : DateUtils_1['default'].getMicroseconds()] = error), _a;
}
exports.getMicroSecondOnyxErrorWithMessage = getMicroSecondOnyxErrorWithMessage;
/**
 * Method used to get an error object with microsecond as the key and an object as the value.
 * @param error - error key or message to be saved
 */
function getMicroSecondOnyxErrorObject(error, errorKey) {
    var _a;
    return (_a = {}), (_a[errorKey !== null && errorKey !== void 0 ? errorKey : DateUtils_1['default'].getMicroseconds()] = error), _a;
}
exports.getMicroSecondOnyxErrorObject = getMicroSecondOnyxErrorObject;
// We can assume that if error is a string, it has already been translated because it is server error
function getErrorMessageWithTranslationData(error) {
    return error !== null && error !== void 0 ? error : '';
}
exports.getErrorMessageWithTranslationData = getErrorMessageWithTranslationData;
function getLatestErrorMessage(onyxData) {
    var _a, _b, _c;
    var errors = (_a = onyxData === null || onyxData === void 0 ? void 0 : onyxData.errors) !== null && _a !== void 0 ? _a : {};
    if (Object.keys(errors).length === 0) {
        return '';
    }
    var key = (_b = Object.keys(errors).sort().reverse().at(0)) !== null && _b !== void 0 ? _b : '';
    return getErrorMessageWithTranslationData((_c = errors[key]) !== null && _c !== void 0 ? _c : '');
}
exports.getLatestErrorMessage = getLatestErrorMessage;
function getLatestErrorMessageField(onyxData) {
    var _a, _b;
    var errors = (_a = onyxData === null || onyxData === void 0 ? void 0 : onyxData.errors) !== null && _a !== void 0 ? _a : {};
    if (Object.keys(errors).length === 0) {
        return {};
    }
    var key = (_b = Object.keys(errors).sort().reverse().at(0)) !== null && _b !== void 0 ? _b : '';
    return {key: errors[key]};
}
exports.getLatestErrorMessageField = getLatestErrorMessageField;
function getLatestErrorField(onyxData, fieldName) {
    var _a;
    var _b, _c, _d;
    var errorsForField =
        (_c = (_b = onyxData === null || onyxData === void 0 ? void 0 : onyxData.errorFields) === null || _b === void 0 ? void 0 : _b[fieldName]) !== null && _c !== void 0 ? _c : {};
    if (Object.keys(errorsForField).length === 0) {
        return {};
    }
    var key = (_d = Object.keys(errorsForField).sort().reverse().at(0)) !== null && _d !== void 0 ? _d : '';
    return (_a = {}), (_a[key] = getErrorMessageWithTranslationData(errorsForField[key])), _a;
}
exports.getLatestErrorField = getLatestErrorField;
function getEarliestErrorField(onyxData, fieldName) {
    var _a;
    var _b, _c, _d;
    var errorsForField =
        (_c = (_b = onyxData === null || onyxData === void 0 ? void 0 : onyxData.errorFields) === null || _b === void 0 ? void 0 : _b[fieldName]) !== null && _c !== void 0 ? _c : {};
    if (Object.keys(errorsForField).length === 0) {
        return {};
    }
    var key = (_d = Object.keys(errorsForField).sort().at(0)) !== null && _d !== void 0 ? _d : '';
    return (_a = {}), (_a[key] = getErrorMessageWithTranslationData(errorsForField[key])), _a;
}
exports.getEarliestErrorField = getEarliestErrorField;
/**
 * Method used to get the latest error field for any field
 */
function getLatestErrorFieldForAnyField(onyxData) {
    var _a;
    var errorFields = (_a = onyxData === null || onyxData === void 0 ? void 0 : onyxData.errorFields) !== null && _a !== void 0 ? _a : {};
    if (Object.keys(errorFields).length === 0) {
        return {};
    }
    var fieldNames = Object.keys(errorFields);
    var latestErrorFields = fieldNames.map(function (fieldName) {
        return getLatestErrorField(onyxData, fieldName);
    });
    return latestErrorFields.reduce(function (acc, error) {
        return Object.assign(acc, error);
    }, {});
}
exports.getLatestErrorFieldForAnyField = getLatestErrorFieldForAnyField;
function getLatestError(errors) {
    var _a;
    var _b;
    if (!errors || Object.keys(errors).length === 0) {
        return {};
    }
    var key = (_b = Object.keys(errors).sort().reverse().at(0)) !== null && _b !== void 0 ? _b : '';
    return (_a = {}), (_a[key] = getErrorMessageWithTranslationData(errors[key])), _a;
}
exports.getLatestError = getLatestError;
/**
 * Method used to attach already translated message
 * @param errors - An object containing current errors in the form
 * @returns Errors in the form of {timestamp: message}
 */
function getErrorsWithTranslationData(errors) {
    if (!errors) {
        return {};
    }
    if (typeof errors === 'string') {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        return {0: getErrorMessageWithTranslationData(errors)};
    }
    return mapValues_1['default'](errors, getErrorMessageWithTranslationData);
}
exports.getErrorsWithTranslationData = getErrorsWithTranslationData;
/**
 * Method used to generate error message for given inputID
 * @param errors - An object containing current errors in the form
 * @param message - Message to assign to the inputID errors
 */
function addErrorMessage(errors, inputID, message) {
    if (!message || !inputID) {
        return;
    }
    var errorList = errors;
    var error = errorList[inputID];
    if (!error) {
        errorList[inputID] = message;
    } else if (typeof error === 'string') {
        errorList[inputID] = error + '\n' + message;
    }
}
exports.addErrorMessage = addErrorMessage;
/**
 * Check if the error includes a receipt.
 */
function isReceiptError(message) {
    var _a, _b;
    if (typeof message === 'string') {
        return false;
    }
    if (Array.isArray(message)) {
        return false;
    }
    if (Object.keys(message).length === 0) {
        return false;
    }
    return ((_b = (_a = message) === null || _a === void 0 ? void 0 : _a.error) !== null && _b !== void 0 ? _b : '') === CONST_1['default'].IOU.RECEIPT_ERROR;
}
exports.isReceiptError = isReceiptError;
