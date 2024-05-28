import mapValues from 'lodash/mapValues';
import type {OnyxEntry} from 'react-native-onyx';
import CONST from '@src/CONST';
import type {TranslationFlatObject, TranslationPaths} from '@src/languages/types';
import type {ErrorFields, Errors} from '@src/types/onyx/OnyxCommon';
import type Response from '@src/types/onyx/Response';
import type {ReceiptError} from '@src/types/onyx/Transaction';
import DateUtils from './DateUtils';
import * as Localize from './Localize';

function getAuthenticateErrorMessage(response: Response): keyof TranslationFlatObject {
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
 * @param error - error key or message to be saved
 */
function getMicroSecondOnyxError(error: string, isTranslated = false, errorKey?: number): Errors {
    return {[errorKey ?? DateUtils.getMicroseconds()]: error && [error, {isTranslated}]};
}

/**
 * Method used to get an error object with microsecond as the key and an object as the value.
 * @param error - error key or message to be saved
 */
function getMicroSecondOnyxErrorObject(error: Errors, errorKey?: number): ErrorFields {
    return {[errorKey ?? DateUtils.getMicroseconds()]: error};
}

// We can assume that if error is a string, it has already been translated because it is server error
function getErrorMessageWithTranslationData(error: Localize.MaybePhraseKey): Localize.MaybePhraseKey {
    return typeof error === 'string' ? [error, {isTranslated: true}] : error;
}

type OnyxDataWithErrors = {
    errors?: Errors | null;
};

function getLatestErrorMessage<TOnyxData extends OnyxDataWithErrors>(onyxData: OnyxEntry<TOnyxData>): Localize.MaybePhraseKey {
    const errors = onyxData?.errors ?? {};

    if (Object.keys(errors).length === 0) {
        return '';
    }

    const key = Object.keys(errors).sort().reverse()[0];
    return getErrorMessageWithTranslationData(errors[key]);
}

function getLatestErrorMessageField<TOnyxData extends OnyxDataWithErrors>(onyxData: OnyxEntry<TOnyxData>): Errors {
    const errors = onyxData?.errors ?? {};

    if (Object.keys(errors).length === 0) {
        return {};
    }

    const key = Object.keys(errors).sort().reverse()[0];

    return {key: errors[key]};
}

type OnyxDataWithErrorFields = {
    errorFields?: ErrorFields;
};

function getLatestErrorField<TOnyxData extends OnyxDataWithErrorFields>(onyxData: OnyxEntry<TOnyxData>, fieldName: string): Errors {
    const errorsForField = onyxData?.errorFields?.[fieldName] ?? {};

    if (Object.keys(errorsForField).length === 0) {
        return {};
    }

    const key = Object.keys(errorsForField).sort().reverse()[0];
    return {[key]: getErrorMessageWithTranslationData(errorsForField[key])};
}

function getEarliestErrorField<TOnyxData extends OnyxDataWithErrorFields>(onyxData: OnyxEntry<TOnyxData>, fieldName: string): Errors {
    const errorsForField = onyxData?.errorFields?.[fieldName] ?? {};

    if (Object.keys(errorsForField).length === 0) {
        return {};
    }

    const key = Object.keys(errorsForField).sort()[0];
    return {[key]: getErrorMessageWithTranslationData(errorsForField[key])};
}

/**
 * Method used to get the latest error field for any field
 */
function getLatestErrorFieldForAnyField<TOnyxData extends OnyxDataWithErrorFields>(onyxData: OnyxEntry<TOnyxData>): Errors {
    const errorFields = onyxData?.errorFields ?? {};

    if (Object.keys(errorFields).length === 0) {
        return {};
    }

    const fieldNames = Object.keys(errorFields);
    const latestErrorFields = fieldNames.map((fieldName) => getLatestErrorField(onyxData, fieldName));
    return latestErrorFields.reduce((acc, error) => Object.assign(acc, error), {});
}

/**
 * Method used to attach already translated message with isTranslated property
 * @param errors - An object containing current errors in the form
 * @returns Errors in the form of {timestamp: [message, {isTranslated}]}
 */
function getErrorsWithTranslationData(errors: Localize.MaybePhraseKey | Errors): Errors {
    if (!errors || (Array.isArray(errors) && errors.length === 0)) {
        return {};
    }

    if (typeof errors === 'string' || Array.isArray(errors)) {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        return {'0': getErrorMessageWithTranslationData(errors)};
    }

    return mapValues(errors, getErrorMessageWithTranslationData);
}

/**
 * Method used to generate error message for given inputID
 * @param errors - An object containing current errors in the form
 * @param message - Message to assign to the inputID errors
 */
function addErrorMessage<TKey extends TranslationPaths>(errors: Errors, inputID?: string | null, message?: TKey | Localize.MaybePhraseKey) {
    if (!message || !inputID) {
        return;
    }

    const errorList = errors;
    const error = errorList[inputID];
    const translatedMessage = Localize.translateIfPhraseKey(message);

    if (!error) {
        errorList[inputID] = [translatedMessage, {isTranslated: true}];
    } else if (typeof error === 'string') {
        errorList[inputID] = [`${error}\n${translatedMessage}`, {isTranslated: true}];
    } else if (Array.isArray(error)) {
        error[0] = `${error[0]}\n${translatedMessage}`;
    }
}

/**
 * Check if the error includes a receipt.
 */
function isReceiptError(message: unknown): message is ReceiptError {
    if (typeof message === 'string') {
        return false;
    }
    if (Array.isArray(message)) {
        return false;
    }
    if (Object.keys(message as Record<string, unknown>).length === 0) {
        return false;
    }
    return ((message as Record<string, unknown>)?.error ?? '') === CONST.IOU.RECEIPT_ERROR;
}

export {
    addErrorMessage,
    getAuthenticateErrorMessage,
    getEarliestErrorField,
    getErrorMessageWithTranslationData,
    getErrorsWithTranslationData,
    getLatestErrorField,
    getLatestErrorFieldForAnyField,
    getLatestErrorMessage,
    getLatestErrorMessageField,
    getMicroSecondOnyxError,
    getMicroSecondOnyxErrorObject,
    isReceiptError,
};

export type {OnyxDataWithErrors};
