/* eslint-disable rulesdir/no-api-side-effects-method */
import type {MultifactorAuthenticationScenarioParameters} from '@components/MultifactorAuthentication/config/types';
// TODO: MFA/Release Remove this
import {makeRequestWithSideEffects} from '@libs/API/MultifactorAuthenticationMock';
import {SIDE_EFFECT_REQUEST_COMMANDS} from '@libs/API/types';
import {parseHttpCode} from '@libs/MultifactorAuthentication/Biometrics/helpers';
import CONST from '@src/CONST';

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
async function registerBiometrics({keyInfo, validateCode}: MultifactorAuthenticationScenarioParameters['REGISTER-BIOMETRICS']) {
    if (!validateCode) {
        return parseHttpCode(401, CONST.MULTIFACTOR_AUTHENTICATION.API_RESPONSE_MAP.REGISTER_BIOMETRICS);
    }

    const response = await makeRequestWithSideEffects(SIDE_EFFECT_REQUEST_COMMANDS.REGISTER_BIOMETRICS, {keyInfo, validateCode}, {});

    const {jsonCode} = response ?? {};
    return parseHttpCode(jsonCode, CONST.MULTIFACTOR_AUTHENTICATION.API_RESPONSE_MAP.REGISTER_BIOMETRICS);
}

async function revokePublicKeys() {
    const response = await makeRequestWithSideEffects(SIDE_EFFECT_REQUEST_COMMANDS.REVOKE_MULTIFACTOR_AUTHENTICATION_KEYS, {}, {});

    const {jsonCode} = response ?? {};
    return parseHttpCode(jsonCode, CONST.MULTIFACTOR_AUTHENTICATION.API_RESPONSE_MAP.REVOKE_MULTIFACTOR_AUTHENTICATION_KEYS);
}

/** Ask API for the multifactorial authentication challenge. */
async function requestBiometricChallenge() {
    const response = await makeRequestWithSideEffects(SIDE_EFFECT_REQUEST_COMMANDS.REQUEST_BIOMETRIC_CHALLENGE, {}, {});
    const {jsonCode, challenge, publicKeys} = response ?? {};

    return {
        ...parseHttpCode(jsonCode, CONST.MULTIFACTOR_AUTHENTICATION.API_RESPONSE_MAP.REQUEST_BIOMETRIC_CHALLENGE),
        challenge,
        publicKeys,
    };
}

/**
 * Authorize transaction using:
 * - signedChallenge when multifactorial authentication is available and configured
 * - signedChallenge and validateCode when multifactorial authentication is available but not configured
 * All parameters except transactionID are optional,
 * but at least one of the combinations listed above must be provided.
 */
async function authorizeTransaction({transactionID, signedChallenge}: MultifactorAuthenticationScenarioParameters['AUTHORIZE-TRANSACTION']) {
    if (!signedChallenge) {
        return parseHttpCode(400, CONST.MULTIFACTOR_AUTHENTICATION.API_RESPONSE_MAP.AUTHORIZE_TRANSACTION);
    }

    const response = await makeRequestWithSideEffects(SIDE_EFFECT_REQUEST_COMMANDS.AUTHORIZE_TRANSACTION, {transactionID, signedChallenge}, {});

    const {jsonCode} = response ?? {};

    return parseHttpCode(jsonCode, CONST.MULTIFACTOR_AUTHENTICATION.API_RESPONSE_MAP.AUTHORIZE_TRANSACTION);
}

async function biometricsTest({signedChallenge}: MultifactorAuthenticationScenarioParameters['BIOMETRICS-TEST']) {
    if (!signedChallenge) {
        return parseHttpCode(400, CONST.MULTIFACTOR_AUTHENTICATION.API_RESPONSE_MAP.BIOMETRICS_TEST);
    }

    const response = await makeRequestWithSideEffects(SIDE_EFFECT_REQUEST_COMMANDS.BIOMETRICS_TEST, {signedChallenge}, {});

    const {jsonCode} = response ?? {};

    return parseHttpCode(jsonCode, CONST.MULTIFACTOR_AUTHENTICATION.API_RESPONSE_MAP.BIOMETRICS_TEST);
}

export {registerBiometrics, requestBiometricChallenge, authorizeTransaction, revokePublicKeys, biometricsTest};
