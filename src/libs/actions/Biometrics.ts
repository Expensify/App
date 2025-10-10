import type {ValueOf} from 'type-fest';
import * as API from '@libs/API';
import {SIDE_EFFECT_REQUEST_COMMANDS} from '@libs/API/types';
import type {TranslationPaths} from '@src/languages/types';

/** HTTP codes returned by the API, mapped to the biometrics translation paths */
const RESPONSE_TRANSLATION_PATH = {
    UNKNOWN: 'unknownResponse',
    REQUEST_BIOMETRIC_CHALLENGE: {
        401: 'registrationRequired',
        200: 'challengeGenerated',
    },
    REGISTER_BIOMETRICS: {
        422: 'noPublicKey',
        409: 'keyAlreadyRegistered',
        401: 'validationCodeRequired',
        400: 'validationCodeInvalid',
        200: 'biometricsSuccess',
    },
    AUTHORIZE_TRANSACTION: {
        422: 'noTransactionID',
        401: 'userNotRegistered',
        409: 'unableToAuthorize',
        200: 'userAuthorized',
        400: 'badRequest',
        202: 'otpCodeRequired',
    },
} as const;

/** Helper method to create an object with an HTTP code and the reason translation path */
function parseHttpCode(
    jsonCode: string | number | undefined,
    source: Omit<ValueOf<typeof RESPONSE_TRANSLATION_PATH>, 'UNKNOWN'>,
): {
    httpCode: number;
    reason: TranslationPaths;
} {
    const httpCode = Number(jsonCode) || 0;
    const translation = source[httpCode as keyof typeof source];

    return {
        httpCode,
        reason: `biometrics.apiResponse.${translation || RESPONSE_TRANSLATION_PATH.UNKNOWN}`,
    };
}

/**
 * To keep the code clean and readable, these functions return parsed data in order to:
 *
 * - Check whether biometrics scenario was successful as we need to know it as fast as possible
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

/** Send biometrics public key to the API along with the validation code if required. */
async function registerBiometrics({publicKey, validateCode}: {publicKey: string; validateCode?: number}) {
    const {jsonCode} = await API.makeRequestWithSideEffects(SIDE_EFFECT_REQUEST_COMMANDS.REGISTER_BIOMETRICS, {publicKey, validateCode}, {});
    return parseHttpCode(jsonCode, RESPONSE_TRANSLATION_PATH.REGISTER_BIOMETRICS);
}

/** Ask API for the biometrics challenge. */
async function requestBiometricsChallenge() {
    const {jsonCode, challenge} = await API.makeRequestWithSideEffects(SIDE_EFFECT_REQUEST_COMMANDS.REQUEST_BIOMETRIC_CHALLENGE, {}, {});
    return {
        ...parseHttpCode(jsonCode, RESPONSE_TRANSLATION_PATH.REQUEST_BIOMETRIC_CHALLENGE),
        challenge,
    };
}

/**
 * Authorize transaction using:
 * - signedChallenge when biometrics is available and configured
 * - signedChallenge and validateCode when biometrics is available but not configured
 * - or validateCode and otp when biometrics is not available or not configured
 * All parameters except transactionID are optional,
 * but at least one of the combinations listed above must be provided.
 *
 * Note: If the transaction should be authorized using otp + validateCode,
 * we actually need to make one call with validateCode only,
 * and then another one with otp + validateCode.
 */
async function authorizeTransaction({transactionID, signedChallenge, validateCode, otp}: {transactionID: string; signedChallenge?: string; validateCode?: number; otp?: number}) {
    const {jsonCode} = await API.makeRequestWithSideEffects(SIDE_EFFECT_REQUEST_COMMANDS.AUTHORIZE_TRANSACTION, {transactionID, signedChallenge, validateCode, otp}, {});
    return parseHttpCode(jsonCode, RESPONSE_TRANSLATION_PATH.AUTHORIZE_TRANSACTION);
}

export {registerBiometrics, requestBiometricsChallenge, authorizeTransaction};
