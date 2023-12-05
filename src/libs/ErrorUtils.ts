import CONST from '@src/CONST';
import {TranslationFlatObject, TranslationPaths} from '@src/languages/types';
import {ErrorFields, Errors} from '@src/types/onyx/OnyxCommon';
import Response from '@src/types/onyx/Response';
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
function getMicroSecondOnyxError(error: string): Record<number, string> {
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
    errors?: Errors;
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
 * @param errorList - An object containing current errors in the form
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

export {getAuthenticateErrorMessage, getMicroSecondOnyxError, getMicroSecondOnyxErrorObject, getLatestErrorMessage, getLatestErrorField, getEarliestErrorField, addErrorMessage};
