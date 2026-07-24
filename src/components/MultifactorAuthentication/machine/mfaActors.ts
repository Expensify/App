import checkDeviceEligibility from '@components/MultifactorAuthentication/biometrics/checkDeviceEligibility';
import {areLocalCredentialsKnownToServer} from '@components/MultifactorAuthentication/biometrics/operations';

import {isHttpSuccess} from '@libs/MultifactorAuthentication/shared/helpers';
import type {MFAResult} from '@libs/MultifactorAuthentication/shared/MFAResult';
import {createMFAErrorFromApiResponse} from '@libs/MultifactorAuthentication/shared/MFAResult';
import readOnyxValueOnce from '@libs/MultifactorAuthentication/shared/readOnyxValueOnce';

import {getDeviceBiometricsOnyxKey, requestRegistrationChallenge} from '@userActions/MultifactorAuthentication';

import {fromPromise} from 'xstate';

import type {CheckLocalCredentialsInput, ReadHasAcceptedSoftPromptInput, RequestRegistrationChallengeInput, RequestRegistrationChallengeOutput, ValidateDeviceInput} from './types';

/**
 * A refused device resolves as a failed MFAResult, so the machine's onError transition for this
 * actor fires only when the platform check throws unexpectedly.
 */
const validateDevice = fromPromise<MFAResult, ValidateDeviceInput>(({input}) => checkDeviceEligibility(input.allowedAuthenticationMethods));

/**
 * Reads the account's device-local soft-prompt flag once. The temporary Onyx connection is
 * disconnected after the first value or when XState stops the actor.
 */
const readHasAcceptedSoftPrompt = fromPromise<boolean, ReadHasAcceptedSoftPromptInput>(async ({input, signal}) => {
    const deviceBiometrics = await readOnyxValueOnce(getDeviceBiometricsOnyxKey(input.accountID), signal);
    return deviceBiometrics?.hasAcceptedSoftPrompt ?? false;
});

/**
 * Resolves to whether the account's local credentials are known to the server. A returning user
 * (true) skips the registration path entirely.
 */
const checkLocalCredentials = fromPromise<boolean, CheckLocalCredentialsInput>(({input}) => areLocalCredentialsKnownToServer(input.accountID));

/**
 * Exchanges the submitted magic code for a validated registration challenge. The action normalizes
 * backend failures into a reason; the actor exposes them as failed MFA results for machine routing.
 */
const requestRegistrationChallengeActor = fromPromise<RequestRegistrationChallengeOutput, RequestRegistrationChallengeInput>(async ({input}) => {
    const {challenge, httpStatusCode, reason, message} = await requestRegistrationChallenge(input.validateCode);
    if (!isHttpSuccess(httpStatusCode) || !challenge) {
        return {success: false, error: createMFAErrorFromApiResponse(httpStatusCode, reason, message)};
    }
    return {success: true, challenge};
});

/**
 * Builds the side-effect actors that the machine states invoke. The machine is always created with
 * these working implementations, so no caller needs to provide stubs or overrides.
 */
function createActors() {
    return {validateDevice, readHasAcceptedSoftPrompt, checkLocalCredentials, requestRegistrationChallenge: requestRegistrationChallengeActor};
}

export default createActors;
