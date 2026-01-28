/* eslint-disable rulesdir/no-api-side-effects-method */
// These functions use makeRequestWithSideEffects because challenge data must be returned immediately
// for security and timing requirements (see detailed explanation below)
import Onyx from 'react-native-onyx';
import type {MultifactorAuthenticationScenarioParameters} from '@components/MultifactorAuthentication/config/types';
import {makeRequestWithSideEffects} from '@libs/API';
import {SIDE_EFFECT_REQUEST_COMMANDS} from '@libs/API/types';
import Log from '@libs/Log';
import {parseHttpRequest} from '@libs/MultifactorAuthentication/Biometrics/helpers';
import type {ChallengeType} from '@libs/MultifactorAuthentication/Biometrics/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

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

async function registerAuthenticationKey({keyInfo, validateCode, authenticationMethod}: MultifactorAuthenticationScenarioParameters['REGISTER-BIOMETRICS']) {
    try {
        const response = await makeRequestWithSideEffects(
            SIDE_EFFECT_REQUEST_COMMANDS.REGISTER_AUTHENTICATION_KEY,
            {keyInfo: JSON.stringify(keyInfo), validateCode, authenticationMethod},
            {},
        );

        const {jsonCode, message} = response ?? {};
        return parseHttpRequest(jsonCode, CONST.MULTIFACTOR_AUTHENTICATION.API_RESPONSE_MAP.REGISTER_AUTHENTICATION_KEY, message);
    } catch (error) {
        Log.hmmm('[MultifactorAuthentication] Failed to register an authentication key', {error});
        return parseHttpRequest(undefined, CONST.MULTIFACTOR_AUTHENTICATION.API_RESPONSE_MAP.REGISTER_AUTHENTICATION_KEY, undefined);
    }
}

async function requestAuthenticationChallenge(challengeType: ChallengeType = 'authentication') {
    try {
        const response = await makeRequestWithSideEffects(SIDE_EFFECT_REQUEST_COMMANDS.REQUEST_AUTHENTICATION_CHALLENGE, {challengeType}, {});
        const {jsonCode, challenge, publicKeys, message} = response ?? {};

        return {
            ...parseHttpRequest(jsonCode, CONST.MULTIFACTOR_AUTHENTICATION.API_RESPONSE_MAP.REQUEST_AUTHENTICATION_CHALLENGE, message),
            challenge,
            publicKeys,
        };
    } catch (error) {
        Log.hmmm('[MultifactorAuthentication] Failed to request an authentication challenge', {error});
        return {
            ...parseHttpRequest(undefined, CONST.MULTIFACTOR_AUTHENTICATION.API_RESPONSE_MAP.REQUEST_AUTHENTICATION_CHALLENGE, undefined),
            challenge: undefined,
            publicKeys: undefined,
        };
    }
}

async function troubleshootMultifactorAuthentication({signedChallenge, authenticationMethod}: MultifactorAuthenticationScenarioParameters['BIOMETRICS-TEST']) {
    try {
        const response = await makeRequestWithSideEffects(SIDE_EFFECT_REQUEST_COMMANDS.TROUBLESHOOT_MULTIFACTOR_AUTHENTICATION, {signedChallenge, authenticationMethod}, {});

        const {jsonCode, message} = response ?? {};

        return parseHttpRequest(jsonCode, CONST.MULTIFACTOR_AUTHENTICATION.API_RESPONSE_MAP.TROUBLESHOOT_MULTIFACTOR_AUTHENTICATION, message);
    } catch (error) {
        Log.hmmm('[MultifactorAuthentication] Failed to troubleshoot multifactor authentication', {error});
        return parseHttpRequest(undefined, CONST.MULTIFACTOR_AUTHENTICATION.API_RESPONSE_MAP.TROUBLESHOOT_MULTIFACTOR_AUTHENTICATION, undefined);
    }
}

async function revokeMultifactorAuthenticationCredentials() {
    try {
        Onyx.merge(ONYXKEYS.ACCOUNT, {isLoading: true});
        const response = await makeRequestWithSideEffects(SIDE_EFFECT_REQUEST_COMMANDS.REVOKE_MULTIFACTOR_AUTHENTICATION_CREDENTIALS, {});
        Onyx.merge(ONYXKEYS.ACCOUNT, {isLoading: false});

        const {jsonCode, message} = response ?? {};

        return parseHttpRequest(jsonCode, CONST.MULTIFACTOR_AUTHENTICATION.API_RESPONSE_MAP.REVOKE_MULTIFACTOR_AUTHENTICATION_SETUP, message);
    } catch (error) {
        Log.hmmm('[MultifactorAuthentication] Failed to revoke multifactor authentication credentials', {error});
        Onyx.merge(ONYXKEYS.ACCOUNT, {isLoading: false});
        return parseHttpRequest(undefined, CONST.MULTIFACTOR_AUTHENTICATION.API_RESPONSE_MAP.REVOKE_MULTIFACTOR_AUTHENTICATION_SETUP, undefined);
    }
}

export {registerAuthenticationKey, requestAuthenticationChallenge, troubleshootMultifactorAuthentication, revokeMultifactorAuthenticationCredentials};
