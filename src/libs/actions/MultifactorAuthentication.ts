/* eslint-disable rulesdir/no-api-side-effects-method */
// These functions use makeRequestWithSideEffects because challenge data must be returned immediately
// for security and timing requirements (see detailed explanation below)
import type {MultifactorAuthenticationScenarioParameters} from '@components/MultifactorAuthentication/config/types';
import {makeRequestWithSideEffects} from '@libs/API';
import {SIDE_EFFECT_REQUEST_COMMANDS} from '@libs/API/types';
import Log from '@libs/Log';
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
    try {
        const response = await makeRequestWithSideEffects(SIDE_EFFECT_REQUEST_COMMANDS.REGISTER_AUTHENTICATION_KEY, {keyInfo, validateCode}, {});

        const {jsonCode} = response ?? {};
        return parseHttpCode(jsonCode, CONST.MULTIFACTOR_AUTHENTICATION.API_RESPONSE_MAP.REGISTER_AUTHENTICATION_KEY);
    } catch (error) {
        Log.hmmm('[MultifactorAuthentication] Failed to register an authentication key', {error});
        return parseHttpCode(undefined, CONST.MULTIFACTOR_AUTHENTICATION.API_RESPONSE_MAP.REGISTER_AUTHENTICATION_KEY);
    }
}

async function requestAuthenticationChallenge(challengeType: ChallengeType = 'authentication') {
    try {
        const response = await makeRequestWithSideEffects(SIDE_EFFECT_REQUEST_COMMANDS.REQUEST_AUTHENTICATION_CHALLENGE, {challengeType}, {});
        const {jsonCode, challenge, publicKeys} = response ?? {};

        return {
            ...parseHttpCode(jsonCode, CONST.MULTIFACTOR_AUTHENTICATION.API_RESPONSE_MAP.REQUEST_AUTHENTICATION_CHALLENGE),
            challenge,
            publicKeys,
        };
    } catch (error) {
        Log.hmmm('[MultifactorAuthentication] Failed to request an authentication challenge', {error});
        return {
            ...parseHttpCode(undefined, CONST.MULTIFACTOR_AUTHENTICATION.API_RESPONSE_MAP.REQUEST_AUTHENTICATION_CHALLENGE),
            challenge: undefined,
            publicKeys: undefined,
        };
    }
}

async function troubleshootMultifactorAuthentication({signedChallenge}: MultifactorAuthenticationScenarioParameters['BIOMETRICS-TEST']) {
    try {
        const response = await makeRequestWithSideEffects(SIDE_EFFECT_REQUEST_COMMANDS.TROUBLESHOOT_MULTIFACTOR_AUTHENTICATION, {signedChallenge}, {});

        const {jsonCode} = response ?? {};

        return parseHttpCode(jsonCode, CONST.MULTIFACTOR_AUTHENTICATION.API_RESPONSE_MAP.TROUBLESHOOT_MULTIFACTOR_AUTHENTICATION);
    } catch (error) {
        Log.hmmm('[MultifactorAuthentication] Failed to troubleshoot multifactor authentication', {error});
        return parseHttpCode(undefined, CONST.MULTIFACTOR_AUTHENTICATION.API_RESPONSE_MAP.TROUBLESHOOT_MULTIFACTOR_AUTHENTICATION);
    }
}

export {registerAuthenticationKey, requestAuthenticationChallenge, troubleshootMultifactorAuthentication};
