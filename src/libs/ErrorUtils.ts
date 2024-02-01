import CONST from '@src/CONST';
import type {TranslationFlatObject, TranslationPaths} from '@src/languages/types';
import type {ErrorFields, Errors} from '@src/types/onyx/OnyxCommon';
import type Response from '@src/types/onyx/Response';
import type {ReceiptError, ReceiptErrors} from '@src/types/onyx/Transaction';
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
function getMicroSecondOnyxError(error: string): Errors {
    return {[DateUtils.getMicroseconds()]: error};
}

/**
 * Method used to get an error object with microsecond as the key and an object as the value.
 * @param error - error key or message to be saved
 */
function getMicroSecondOnyxErrorObject(error: Record<string, string>): Record<number, Record<string, string>> {
    return {[DateUtils.getMicroseconds()]: error};
}

type OnyxDataWithErrors = {
    errors?: Errors | null;
};

function getLatestErrorMessage<TOnyxData extends OnyxDataWithErrors>(onyxData: TOnyxData): string {
    const errors = onyxData.errors ?? {};

    if (Object.keys(errors).length === 0) {
        return '';
    }

    const key = Object.keys(errors).sort().reverse()[0];

    return errors[key];
}

type OnyxDataWithErrorFields = {
    errorFields?: ErrorFields;
};

function getLatestErrorField<TOnyxData extends OnyxDataWithErrorFields>(onyxData: TOnyxData, fieldName: string): Record<string, string> {
    const errorsForField = onyxData.errorFields?.[fieldName] ?? {};

    if (Object.keys(errorsForField).length === 0) {
        return {};
    }

    const key = Object.keys(errorsForField).sort().reverse()[0];

    return {[key]: errorsForField[key]};
}

function getEarliestErrorField<TOnyxData extends OnyxDataWithErrorFields>(onyxData: TOnyxData, fieldName: string): Record<string, string> {
    const errorsForField = onyxData.errorFields?.[fieldName] ?? {};

    if (Object.keys(errorsForField).length === 0) {
        return {};
    }

    const key = Object.keys(errorsForField).sort()[0];

    return {[key]: errorsForField[key]};
}

type ErrorsList = Record<string, string | [string, {isTranslated: boolean}]>;

/**
 * Method used to generate error message for given inputID
 * @param errors - An object containing current errors in the form
 * @param message - Message to assign to the inputID errors
 */
function addErrorMessage<TKey extends TranslationPaths>(errors: ErrorsList, inputID?: string, message?: TKey) {
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

function removeErrorsWithNullMessage(errors: Errors | ReceiptErrors | null | undefined) {
    if (!errors) {
        return errors;
    }
    const nonNullEntries = Object.entries(errors).filter(([, message]) => message !== null);

    return Object.fromEntries(nonNullEntries);
}

/** Check if the error includes a receipt. */
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
    getAuthenticateErrorMessage,
    getMicroSecondOnyxError,
    getMicroSecondOnyxErrorObject,
    getLatestErrorMessage,
    getLatestErrorField,
    getEarliestErrorField,
    addErrorMessage,
    removeErrorsWithNullMessage,
    isReceiptError,
};
