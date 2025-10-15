/* eslint-disable rulesdir/no-api-side-effects-method */
import type {ValueOf} from 'type-fest';
import * as API from '@libs/API';
import {SIDE_EFFECT_REQUEST_COMMANDS} from '@libs/API/types';
import type {MultifactorAuthenticationResponseTranslationPath} from '@libs/MultifactorAuthentication/types';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';

/** Helper method to create an object with an HTTP code and the reason translation path */
function parseHttpCode(
    jsonCode: string | number | undefined,
    source: ValueOf<Omit<MultifactorAuthenticationResponseTranslationPath, 'UNKNOWN'>>,
): {
    httpCode: number;
    reason: TranslationPaths;
} {
    const httpCode = Number(jsonCode) || 0;
    const translation = source[httpCode as keyof typeof source];

    const reason = `multifactorAuthentication.apiResponse.${translation || CONST.MULTI_FACTOR_AUTHENTICATION.RESPONSE_TRANSLATION_PATH.UNKNOWN}` as TranslationPaths;

    return {
        httpCode,
        reason,
    };
}

/**
 * To keep the code clean and readable, these functions return parsed data in order to:
 *
 * - Check whether multifactorial authentication scenario was successful as we need to know it as fast as possible
 *   to make the usage of authentication seamless and to tell if we should abort the process
 *   if an error occurred.
 *
 * - To avoid storing challenge in the persistent memory for security reasons.
 *
 * - As there is a certain short time frame in which the challenge needs to be signed,
 *   we should not delay the possibility to do so for the user.
 *
 * This is not a standard practice in the code base.
 * Please consult before using this pattern.
 */

/** Send multifactorial authentication public key to the API along with the validation code if required. */
async function registerBiometrics({publicKey, validateCode}: {publicKey: string; validateCode?: number}) {
    const response = await API.makeRequestWithSideEffects(SIDE_EFFECT_REQUEST_COMMANDS.REGISTER_BIOMETRICS, {publicKey, validateCode}, {});

    const {jsonCode} = response ?? {};
    return parseHttpCode(jsonCode, CONST.MULTI_FACTOR_AUTHENTICATION.RESPONSE_TRANSLATION_PATH.REGISTER_BIOMETRICS);
}

/** Ask API for the multifactorial authentication challenge. */
async function requestBiometricChallenge() {
    const response = await API.makeRequestWithSideEffects(SIDE_EFFECT_REQUEST_COMMANDS.REQUEST_BIOMETRIC_CHALLENGE, {}, {});
    const {jsonCode, challenge} = response ?? {};

    return {
        ...parseHttpCode(jsonCode, CONST.MULTI_FACTOR_AUTHENTICATION.RESPONSE_TRANSLATION_PATH.REQUEST_BIOMETRIC_CHALLENGE),
        challenge,
    };
}

/**
 * Authorize transaction using:
 * - signedChallenge when multifactorial authentication is available and configured
 * - signedChallenge and validateCode when multifactorial authentication is available but not configured
 * - or validateCode and otp when multifactorial authentication is not available or not configured
 * All parameters except transactionID are optional,
 * but at least one of the combinations listed above must be provided.
 *
 * Note: If the transaction should be authorized using otp + validateCode,
 * we actually need to make one call with validateCode only,
 * and then another one with otp + validateCode.
 */
async function authorizeTransaction({transactionID, signedChallenge, validateCode, otp}: {transactionID: string; signedChallenge?: string; validateCode?: number; otp?: number}) {
    const response = await API.makeRequestWithSideEffects(SIDE_EFFECT_REQUEST_COMMANDS.AUTHORIZE_TRANSACTION, {transactionID, signedChallenge, validateCode, otp}, {});

    const {jsonCode} = response ?? {};

    return parseHttpCode(jsonCode, CONST.MULTI_FACTOR_AUTHENTICATION.RESPONSE_TRANSLATION_PATH.AUTHORIZE_TRANSACTION);
}

export {registerBiometrics, requestBiometricChallenge, authorizeTransaction};
