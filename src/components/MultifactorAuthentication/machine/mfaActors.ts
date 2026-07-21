import checkDeviceEligibility from '@components/MultifactorAuthentication/biometrics/checkDeviceEligibility';
import {areLocalCredentialsKnownToServer} from '@components/MultifactorAuthentication/biometrics/operations';

import type {MFAResult} from '@libs/MultifactorAuthentication/shared/MFAResult';
import readOnyxValueOnce from '@libs/MultifactorAuthentication/shared/readOnyxValueOnce';

import {getDeviceBiometricsOnyxKey} from '@userActions/MultifactorAuthentication';

import {fromPromise} from 'xstate';

import type {CheckLocalCredentialsInput, ReadHasAcceptedSoftPromptInput, ValidateDeviceInput} from './types';

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
 * Builds the side-effect actors that the machine states invoke. The machine is always created with
 * these working implementations, so no caller needs to provide stubs or overrides.
 */
function createActors() {
    return {validateDevice, readHasAcceptedSoftPrompt, checkLocalCredentials};
}

export default createActors;
