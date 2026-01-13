/* eslint-disable rulesdir/no-api-side-effects-method */
import type {MultifactorAuthenticationScenarioParameters} from '@components/MultifactorAuthentication/config/types';
import {makeRequestWithSideEffects} from '@libs/API';
import {SIDE_EFFECT_REQUEST_COMMANDS} from '@libs/API/types';
import {parseHttpCode} from '@libs/MultifactorAuthentication/Biometrics/helpers';
import type {ChallengeType} from '@libs/MultifactorAuthentication/Biometrics/types';
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

async function registerAuthenticationKey({keyInfo, validateCode}: MultifactorAuthenticationScenarioParameters['REGISTER-BIOMETRICS']) {
    if (!validateCode) {
        return parseHttpCode(401, CONST.MULTIFACTOR_AUTHENTICATION.API_RESPONSE_MAP.REGISTER_AUTHENTICATION_KEY);
    }

    const response = await makeRequestWithSideEffects(SIDE_EFFECT_REQUEST_COMMANDS.REGISTER_AUTHENTICATION_KEY, {keyInfo, validateCode}, {});

    const {jsonCode} = response ?? {};
    return parseHttpCode(jsonCode, CONST.MULTIFACTOR_AUTHENTICATION.API_RESPONSE_MAP.REGISTER_AUTHENTICATION_KEY);
}

async function requestAuthenticationChallenge(challengeType: ChallengeType = 'authentication') {
    const response = await makeRequestWithSideEffects(SIDE_EFFECT_REQUEST_COMMANDS.REQUEST_AUTHENTICATION_CHALLENGE, {challengeType}, {});
    const {jsonCode, challenge, publicKeys} = response ?? {};

    return {
        ...parseHttpCode(jsonCode, CONST.MULTIFACTOR_AUTHENTICATION.API_RESPONSE_MAP.REQUEST_AUTHENTICATION_CHALLENGE),
        challenge,
        publicKeys,
    };
}

async function troubleshootMultifactorAuthentication({signedChallenge}: MultifactorAuthenticationScenarioParameters['BIOMETRICS-TEST']) {
    if (!signedChallenge) {
        return parseHttpCode(400, CONST.MULTIFACTOR_AUTHENTICATION.API_RESPONSE_MAP.TROUBLESHOOT_MULTIFACTOR_AUTHENTICATION);
    }

    const response = await makeRequestWithSideEffects(SIDE_EFFECT_REQUEST_COMMANDS.TROUBLESHOOT_MULTIFACTOR_AUTHENTICATION, {signedChallenge}, {});

    const {jsonCode} = response ?? {};

    return parseHttpCode(jsonCode, CONST.MULTIFACTOR_AUTHENTICATION.API_RESPONSE_MAP.TROUBLESHOOT_MULTIFACTOR_AUTHENTICATION);
}

export {registerAuthenticationKey, requestAuthenticationChallenge, troubleshootMultifactorAuthentication};
