/* eslint-disable rulesdir/no-api-side-effects-method */
// These functions use makeRequestWithSideEffects because challenge data must be returned immediately
// for security and timing requirements (see detailed explanation below)
import Onyx from 'react-native-onyx';
import type {OnyxEntry, OnyxUpdate} from 'react-native-onyx';
import type {MultifactorAuthenticationScenarioParameters} from '@components/MultifactorAuthentication/config/types';
import {makeRequestWithSideEffects} from '@libs/API';
import type {DenyTransactionParams} from '@libs/API/parameters';
import {SIDE_EFFECT_REQUEST_COMMANDS} from '@libs/API/types';
import Log from '@libs/Log';
import type {AuthenticationChallenge, RegistrationChallenge} from '@libs/MultifactorAuthentication/Biometrics/ED25519/types';
import {parseHttpRequest} from '@libs/MultifactorAuthentication/Biometrics/helpers';
import type {MultifactorAuthenticationReason} from '@libs/MultifactorAuthentication/Biometrics/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {LocallyProcessed3DSChallengeReviews} from '@src/types/onyx';

/**
 * These subscriptions keep ONYXKEYS.LOCALLY_PROCESSED_3DS_TRANSACTION_REVIEWS tidy as values within it are no longer needed
 */

let locallyProcessed3DSTransactionReviews: OnyxEntry<LocallyProcessed3DSChallengeReviews> = {};

Onyx.connectWithoutView({
    key: ONYXKEYS.LOCALLY_PROCESSED_3DS_TRANSACTION_REVIEWS,
    callback: (storedLocallyProcessed3DSTransactionReviews) => {
        locallyProcessed3DSTransactionReviews = storedLocallyProcessed3DSTransactionReviews;
    },
});

// Clean up list of locally-reviewed transactions when they are removed from queue by the server
Onyx.connectWithoutView({
    key: ONYXKEYS.TRANSACTIONS_PENDING_3DS_REVIEW,
    callback: (queue) => {
        if (!locallyProcessed3DSTransactionReviews || !queue) {
            return;
        }
        const queuedTransactionIDs = Object.keys(queue);
        const locallyProcessedTransactionIDsToCleanup = Object.keys(locallyProcessed3DSTransactionReviews).filter(
            (locallyProcessedTransactionID) => !queuedTransactionIDs.includes(locallyProcessedTransactionID),
        );
        if (locallyProcessedTransactionIDsToCleanup.length > 0) {
            cleanUpLocallyProcessed3DSTransactionReviews(locallyProcessedTransactionIDsToCleanup);
        }
    },
});

function cleanUpLocallyProcessed3DSTransactionReviews(entriesToDelete: string[]) {
    const value: Record<string, null> = {};
    for (const entry of entriesToDelete) {
        value[entry] = null;
    }
    Onyx.merge(ONYXKEYS.LOCALLY_PROCESSED_3DS_TRANSACTION_REVIEWS, value);
}

/**
 * The rest of this file is concerned with MFA-related API calls
 *
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

async function registerAuthenticationKey({keyInfo, authenticationMethod}: MultifactorAuthenticationScenarioParameters['REGISTER-BIOMETRICS']) {
    try {
        const response = await makeRequestWithSideEffects(SIDE_EFFECT_REQUEST_COMMANDS.REGISTER_AUTHENTICATION_KEY, {keyInfo: JSON.stringify(keyInfo), authenticationMethod});

        const {jsonCode, message} = response ?? {};
        return parseHttpRequest(jsonCode, CONST.MULTIFACTOR_AUTHENTICATION.API_RESPONSE_MAP.REGISTER_AUTHENTICATION_KEY, message);
    } catch (error) {
        Log.hmmm('[MultifactorAuthentication] Failed to register an authentication key', {error});
        return parseHttpRequest(undefined, CONST.MULTIFACTOR_AUTHENTICATION.API_RESPONSE_MAP.REGISTER_AUTHENTICATION_KEY, undefined);
    }
}

type RegistrationChallengeResponse = {
    httpStatusCode: number;
    reason: MultifactorAuthenticationReason;
    challenge: RegistrationChallenge | undefined;
    publicKeys: string[] | undefined;
};

type AuthenticationChallengeResponse = {
    httpStatusCode: number;
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
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.ACCOUNT>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.ACCOUNT,
            value: {
                isLoading: true,
            },
        },
    ];
    const successData: Array<OnyxUpdate<typeof ONYXKEYS.ACCOUNT>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.ACCOUNT,
            value: {
                isLoading: false,
            },
        },
    ];
    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.ACCOUNT>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.ACCOUNT,
            value: {
                isLoading: false,
            },
        },
    ];
    try {
        const response = await makeRequestWithSideEffects(SIDE_EFFECT_REQUEST_COMMANDS.REVOKE_MULTIFACTOR_AUTHENTICATION_CREDENTIALS, {}, {optimisticData, successData, failureData});

        const {jsonCode, message} = response ?? {};

        return parseHttpRequest(jsonCode, CONST.MULTIFACTOR_AUTHENTICATION.API_RESPONSE_MAP.REVOKE_MULTIFACTOR_AUTHENTICATION_SETUP, message);
    } catch (error) {
        Log.hmmm('[MultifactorAuthentication] Failed to revoke multifactor authentication credentials', {error});
        return parseHttpRequest(undefined, CONST.MULTIFACTOR_AUTHENTICATION.API_RESPONSE_MAP.REVOKE_MULTIFACTOR_AUTHENTICATION_SETUP, undefined);
    }
}

/** Check whether a given transaction is still pending review and update the transactionsPending3DSReview key in Onyx */
async function isTransactionStillPending3DSReview(transactionID: string) {
    const response = await makeRequestWithSideEffects(SIDE_EFFECT_REQUEST_COMMANDS.GET_TRANSACTIONS_PENDING_3DS_REVIEW, null, {});
    return !!response?.transactionsPending3DSReview?.[transactionID];
}

async function authorizeTransaction({transactionID, signedChallenge, authenticationMethod}: MultifactorAuthenticationScenarioParameters['AUTHORIZE-TRANSACTION']) {
    try {
        const response = await makeRequestWithSideEffects(
            SIDE_EFFECT_REQUEST_COMMANDS.AUTHORIZE_TRANSACTION,
            {transactionID, signedChallenge: JSON.stringify(signedChallenge), authenticationMethod},
            {
                optimisticData: [
                    {
                        key: ONYXKEYS.LOCALLY_PROCESSED_3DS_TRANSACTION_REVIEWS,
                        onyxMethod: Onyx.METHOD.MERGE,
                        value: {
                            [transactionID]: CONST.MULTIFACTOR_AUTHENTICATION.LOCALLY_PROCESSED_TRANSACTION_ACTION.APPROVE,
                        },
                    },
                ],
            },
        );

        const {jsonCode, message} = response ?? {};

        return parseHttpRequest(jsonCode, CONST.MULTIFACTOR_AUTHENTICATION.API_RESPONSE_MAP.APPROVE_TRANSACTION, message);
    } catch (error) {
        Log.hmmm('[MultifactorAuthentication] Failed to authorize transaction', {error});
        return parseHttpRequest(undefined, CONST.MULTIFACTOR_AUTHENTICATION.API_RESPONSE_MAP.APPROVE_TRANSACTION, undefined);
    }
}

async function denyTransaction({transactionID}: DenyTransactionParams) {
    try {
        const response = await makeRequestWithSideEffects(
            SIDE_EFFECT_REQUEST_COMMANDS.DENY_TRANSACTION,
            {transactionID},
            {
                optimisticData: [
                    {
                        key: ONYXKEYS.LOCALLY_PROCESSED_3DS_TRANSACTION_REVIEWS,
                        onyxMethod: Onyx.METHOD.MERGE,
                        value: {
                            [transactionID]: CONST.MULTIFACTOR_AUTHENTICATION.LOCALLY_PROCESSED_TRANSACTION_ACTION.DENY,
                        },
                    },
                ],
            },
        );

        const {jsonCode, message} = response ?? {};

        return parseHttpRequest(jsonCode, CONST.MULTIFACTOR_AUTHENTICATION.API_RESPONSE_MAP.DENY_TRANSACTION, message);
    } catch (error) {
        Log.hmmm('[MultifactorAuthentication] Failed to deny transaction', {error});
        return parseHttpRequest(undefined, CONST.MULTIFACTOR_AUTHENTICATION.API_RESPONSE_MAP.DENY_TRANSACTION, undefined);
    }
}

/** Attempt to deny the transaction without handling errors or waiting for a response. We use this to clean up after something unexpected happened trying to authorize or deny a challenge */
async function fireAndForgetDenyTransaction({transactionID}: DenyTransactionParams) {
    makeRequestWithSideEffects(SIDE_EFFECT_REQUEST_COMMANDS.DENY_TRANSACTION, {transactionID}, {});
}

function markHasAcceptedSoftPrompt() {
    Onyx.merge(ONYXKEYS.DEVICE_BIOMETRICS, {
        hasAcceptedSoftPrompt: true,
    });
}

function clearLocalMFAPublicKeyList() {
    Onyx.merge(ONYXKEYS.ACCOUNT, {
        multifactorAuthenticationPublicKeyIDs: CONST.MULTIFACTOR_AUTHENTICATION.PUBLIC_KEYS_PREVIOUSLY_BUT_NOT_CURRENTLY_REGISTERED,
    });
}

export {
    registerAuthenticationKey,
    requestRegistrationChallenge,
    requestAuthorizationChallenge,
    troubleshootMultifactorAuthentication,
    revokeMultifactorAuthenticationCredentials,
    markHasAcceptedSoftPrompt,
    clearLocalMFAPublicKeyList,
    isTransactionStillPending3DSReview,
    denyTransaction,
    authorizeTransaction,
    fireAndForgetDenyTransaction,
};
