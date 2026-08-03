import checkDeviceEligibility from '@components/MultifactorAuthentication/biometrics/checkDeviceEligibility';
import {areLocalCredentialsKnownToServer, createCredential} from '@components/MultifactorAuthentication/biometrics/operations';
import addMFABreadcrumb from '@components/MultifactorAuthentication/observability/breadcrumbs';

import {isHttpSuccess} from '@libs/MultifactorAuthentication/shared/helpers';
import type {MFAResult} from '@libs/MultifactorAuthentication/shared/MFAResult';
import {createLocalMFAError, createMFAErrorFromApiResponse} from '@libs/MultifactorAuthentication/shared/MFAResult';
import readOnyxValueOnce from '@libs/MultifactorAuthentication/shared/readOnyxValueOnce';

import {getDeviceBiometricsOnyxKey, requestRegistrationChallenge} from '@userActions/MultifactorAuthentication';
import {processRegistration} from '@userActions/MultifactorAuthentication/processing';

import CONST from '@src/CONST';

import {fromPromise} from 'xstate';

import type {
    CheckLocalCredentialsInput,
    CreateCredentialInput,
    CreateCredentialOutput,
    ReadHasAcceptedSoftPromptInput,
    RequestRegistrationChallengeInput,
    RequestRegistrationChallengeOutput,
    ValidateDeviceInput,
} from './types';

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
const checkLocalCredentials = fromPromise<boolean, CheckLocalCredentialsInput>(({input, signal}) => areLocalCredentialsKnownToServer(input.accountID, signal));

/**
 * Exchanges the submitted validate code for a validated registration challenge. The action normalizes
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
 * Platform ceremony, then backend registration. A refusal on the platform side short-circuits
 * before the backend is ever called; a backend failure is returned as-is, with no rollback of the
 * credential the platform already created. Breadcrumb labels match legacy `Main.tsx` for telemetry
 * continuity.
 */
const createCredentialActor = fromPromise<CreateCredentialOutput, CreateCredentialInput>(async ({input, signal}) => {
    const creationResult = await createCredential({...input, signal});
    addMFABreadcrumb('Biometric registration completed', creationResult.success ? {success: true} : creationResult.error, creationResult.success ? 'info' : 'error');
    if (!creationResult.success) {
        return creationResult;
    }
    // The flow may have been cancelled while the ceremony ran. Skip the backend call rather than
    // registering a key nobody asked for — this only catches it before the request starts, there's
    // no way to cancel one already in flight.
    if (signal.aborted) {
        return {success: false, error: createLocalMFAError(CONST.MULTIFACTOR_AUTHENTICATION.REASON.LOCAL_ERRORS.CANCELED, 'MFA flow canceled before backend registration')};
    }
    const registrationResult = await processRegistration({keyInfo: creationResult.keyInfo});
    addMFABreadcrumb('Backend registration completed', registrationResult.success ? {success: true} : registrationResult.error, registrationResult.success ? 'info' : 'error');
    return registrationResult;
});

/**
 * Builds the side-effect actors that the machine states invoke. The machine is always created with
 * these working implementations, so no caller needs to provide stubs or overrides.
 */
function createActors() {
    return {
        validateDevice,
        readHasAcceptedSoftPrompt,
        checkLocalCredentials,
        requestRegistrationChallenge: requestRegistrationChallengeActor,
        createCredential: createCredentialActor,
    };
}

export default createActors;
