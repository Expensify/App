import mapValues from 'lodash/mapValues';
import type {OnyxEntry} from 'react-native-onyx';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type {ErrorFields, Errors} from '@src/types/onyx/OnyxCommon';
import type Response from '@src/types/onyx/Response';
import type {ReceiptError} from '@src/types/onyx/Transaction';
import DateUtils from './DateUtils';
import * as Localize from './Localize';

function getAuthenticateErrorMessage(response: Response): TranslationPaths {
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
 * Creates an error object with a timestamp (in microseconds) as the key and the translated error message as the value.
 * @param error - The translation key for the error message.
 */
function getMicroSecondOnyxErrorWithTranslationKey(error: TranslationPaths, errorKey?: number): Errors {
    return {[errorKey ?? DateUtils.getMicroseconds()]: Localize.translateLocal(error)};
}

/**
 * Creates an error object with a timestamp (in microseconds) as the key and the error message as the value.
 * @param error - The error message.
 */
function getMicroSecondOnyxErrorWithMessage(error: string, errorKey?: number): Errors {
    return {[errorKey ?? DateUtils.getMicroseconds()]: error};
}

/**
 * Method used to get an error object with microsecond as the key and an object as the value.
 * @param error - error key or message to be saved
 */
function getMicroSecondOnyxErrorObject(error: Errors, errorKey?: number): ErrorFields {
    return {[errorKey ?? DateUtils.getMicroseconds()]: error};
}

// We can assume that if error is a string, it has already been translated because it is server error
function getErrorMessageWithTranslationData(error: string | null): string {
    return error ?? '';
}

type OnyxDataWithErrors = {
    errors?: Errors | null;
};

function getLatestErrorMessage<TOnyxData extends OnyxDataWithErrors>(onyxData: OnyxEntry<TOnyxData> | null): string {
    const errors = onyxData?.errors ?? {};

    if (Object.keys(errors).length === 0) {
        return '';
    }

    const key = Object.keys(errors).sort().reverse()[0];
    return getErrorMessageWithTranslationData(errors[key] ?? '');
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
 * Method used to attach already translated message
 * @param errors - An object containing current errors in the form
 * @returns Errors in the form of {timestamp: message}
 */
function getErrorsWithTranslationData(errors: Errors): Errors {
    if (!errors) {
        return {};
    }

    if (typeof errors === 'string') {
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
function addErrorMessage(errors: Errors, inputID?: string | null, message?: string | null) {
    if (!message || !inputID) {
        return;
    }

    const errorList = errors;
    const error = errorList[inputID];

    if (!error) {
        errorList[inputID] = message;
    } else if (typeof error === 'string') {
        errorList[inputID] = `${error}\n${message}`;
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
    getMicroSecondOnyxErrorWithTranslationKey,
    getMicroSecondOnyxErrorWithMessage,
    getMicroSecondOnyxErrorObject,
    isReceiptError,
};

export type {OnyxDataWithErrors};
