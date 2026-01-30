/* eslint-disable rulesdir/no-api-side-effects-method */
// These functions use makeRequestWithSideEffects because challenge data must be returned immediately
// for security and timing requirements (see detailed explanation below)
import Onyx from 'react-native-onyx';
import type {OnyxUpdate} from 'react-native-onyx';
import type {MultifactorAuthenticationScenarioParameters} from '@components/MultifactorAuthentication/config/types';
import {makeRequestWithSideEffects} from '@libs/API';
import {SIDE_EFFECT_REQUEST_COMMANDS} from '@libs/API/types';
import Log from '@libs/Log';
import type {AuthenticationChallenge, RegistrationChallenge} from '@libs/MultifactorAuthentication/Biometrics/ED25519/types';
import {parseHttpRequest} from '@libs/MultifactorAuthentication/Biometrics/helpers';
import type {MultifactorAuthenticationReason} from '@libs/MultifactorAuthentication/Biometrics/types';
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

type RegisterAuthenticationKeyParams = {
    keyInfo: MultifactorAuthenticationScenarioParameters['REGISTER-BIOMETRICS']['keyInfo'];
    authenticationMethod: MultifactorAuthenticationScenarioParameters['REGISTER-BIOMETRICS']['authenticationMethod'];
    publicKey: string;
    currentPublicKeyIDs: string[];
};

async function registerAuthenticationKey({keyInfo, authenticationMethod, publicKey, currentPublicKeyIDs}: RegisterAuthenticationKeyParams) {
    const optimisticPublicKeyIDs = [...currentPublicKeyIDs, publicKey];

    try {
        const response = await makeRequestWithSideEffects(
            SIDE_EFFECT_REQUEST_COMMANDS.REGISTER_AUTHENTICATION_KEY,
            {keyInfo: JSON.stringify(keyInfo), authenticationMethod},
            {
                optimisticData: [
                    {
                        onyxMethod: 'merge',
                        key: ONYXKEYS.ACCOUNT,
                        value: {
                            multifactorAuthenticationPublicKeyIDs: optimisticPublicKeyIDs,
                        },
                    },
                ],
                failureData: [
                    {
                        onyxMethod: 'merge',
                        key: ONYXKEYS.ACCOUNT,
                        value: {
                            multifactorAuthenticationPublicKeyIDs: currentPublicKeyIDs,
                        },
                    },
                ],
            },
        );

        const {jsonCode, message} = response ?? {};
        return parseHttpRequest(jsonCode, CONST.MULTIFACTOR_AUTHENTICATION.API_RESPONSE_MAP.REGISTER_AUTHENTICATION_KEY, message);
    } catch (error) {
        Log.hmmm('[MultifactorAuthentication] Failed to register an authentication key', {error});
        return parseHttpRequest(undefined, CONST.MULTIFACTOR_AUTHENTICATION.API_RESPONSE_MAP.REGISTER_AUTHENTICATION_KEY, undefined);
    }
}

type RegistrationChallengeResponse = {
    httpCode: number;
    reason: MultifactorAuthenticationReason;
    challenge: RegistrationChallenge | undefined;
    publicKeys: string[] | undefined;
};

type AuthenticationChallengeResponse = {
    httpCode: number;
    reason: MultifactorAuthenticationReason;
    challenge: AuthenticationChallenge | undefined;
    publicKeys: string[] | undefined;
};

async function requestRegistrationChallenge(validateCode: string): Promise<RegistrationChallengeResponse> {
    try {
        const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.ACCOUNT>> = [
            {
                key: ONYXKEYS.ACCOUNT,
                onyxMethod: Onyx.METHOD.MERGE,
                value: {
                    isLoading: true,
                    loadingForm: CONST.FORMS.VALIDATE_CODE_FORM,
                },
            },
        ];
        const finallyData: Array<OnyxUpdate<typeof ONYXKEYS.ACCOUNT>> = [
            {
                key: ONYXKEYS.ACCOUNT,
                onyxMethod: Onyx.METHOD.MERGE,
                value: {
                    isLoading: false,
                    loadingForm: undefined,
                },
            },
        ];
        const response = await makeRequestWithSideEffects(
            SIDE_EFFECT_REQUEST_COMMANDS.REQUEST_AUTHENTICATION_CHALLENGE,
            {
                challengeType: 'registration',
                validateCode,
            },
            {optimisticData, finallyData},
        );
        const {jsonCode, challenge, publicKeys, message} = response ?? {};
        const parsedResponse = parseHttpRequest(jsonCode, CONST.MULTIFACTOR_AUTHENTICATION.API_RESPONSE_MAP.REQUEST_AUTHENTICATION_CHALLENGE, message);

        return {
            ...parsedResponse,
            challenge: challenge as RegistrationChallenge | undefined,
            publicKeys,
        };
    } catch (error) {
        Log.hmmm('[MultifactorAuthentication] Failed to request a registration challenge', {error});
        return {
            ...parseHttpRequest(undefined, CONST.MULTIFACTOR_AUTHENTICATION.API_RESPONSE_MAP.REQUEST_AUTHENTICATION_CHALLENGE, undefined),
            challenge: undefined,
            publicKeys: undefined,
        };
    }
}

async function requestAuthorizationChallenge(): Promise<AuthenticationChallengeResponse> {
    try {
        const response = await makeRequestWithSideEffects(
            SIDE_EFFECT_REQUEST_COMMANDS.REQUEST_AUTHENTICATION_CHALLENGE,
            {
                challengeType: 'authentication',
            },
            {},
        );
        const {jsonCode, challenge, publicKeys, message} = response ?? {};
        const parsedResponse = parseHttpRequest(jsonCode, CONST.MULTIFACTOR_AUTHENTICATION.API_RESPONSE_MAP.REQUEST_AUTHENTICATION_CHALLENGE, message);

        return {
            ...parsedResponse,
            challenge: challenge as AuthenticationChallenge | undefined,
            publicKeys,
        };
    } catch (error) {
        Log.hmmm('[MultifactorAuthentication] Failed to request an authorization challenge', {error});
        return {
            ...parseHttpRequest(undefined, CONST.MULTIFACTOR_AUTHENTICATION.API_RESPONSE_MAP.REQUEST_AUTHENTICATION_CHALLENGE, undefined),
            challenge: undefined,
            publicKeys: undefined,
        };
    }
}

async function troubleshootMultifactorAuthentication({signedChallenge, authenticationMethod}: MultifactorAuthenticationScenarioParameters['BIOMETRICS-TEST']) {
    try {
        const response = await makeRequestWithSideEffects(
            SIDE_EFFECT_REQUEST_COMMANDS.TROUBLESHOOT_MULTIFACTOR_AUTHENTICATION,
            {signedChallenge: JSON.stringify(signedChallenge), authenticationMethod},
            {},
        );

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

export {registerAuthenticationKey, requestRegistrationChallenge, requestAuthorizationChallenge, troubleshootMultifactorAuthentication, revokeMultifactorAuthenticationCredentials};
