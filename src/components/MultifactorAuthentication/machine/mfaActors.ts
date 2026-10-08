import captureRegistrationState from '@components/MultifactorAuthentication/biometrics/captureRegistrationState';
import checkDeviceEligibility from '@components/MultifactorAuthentication/biometrics/checkDeviceEligibility';
import {authorize, createCredential, deleteLocalCredentials} from '@components/MultifactorAuthentication/biometrics/operations';
import addMFABreadcrumb from '@components/MultifactorAuthentication/observability/breadcrumbs';
import trackMFAFlowOutcome from '@components/MultifactorAuthentication/observability/trackMFAFlowOutcome';

import {getErrorMessage} from '@libs/ErrorUtils';
import {isHttpSuccess} from '@libs/MultifactorAuthentication/shared/helpers';
import type {MFAResult} from '@libs/MultifactorAuthentication/shared/MFAResult';
import {createCanceledMFAResult, createMFAErrorFromApiResponse} from '@libs/MultifactorAuthentication/shared/MFAResult';
import type {MultifactorAuthenticationCallbackInput, MultifactorAuthenticationCallbackResponse} from '@libs/MultifactorAuthentication/shared/types';

import {requestAuthorizationChallenge, requestRegistrationChallenge} from '@userActions/MultifactorAuthentication';
import {processRegistration} from '@userActions/MultifactorAuthentication/processing';

import CONST from '@src/CONST';

import {fromPromise} from 'xstate';

import type {
    AuthorizeInput,
    AuthorizeOutput,
    CreateCredentialInput,
    CreateCredentialOutput,
    FinalizeOutcomeInput,
    FinalizeOutcomeOutput,
    LoadRegistrationStateInput,
    LoadRegistrationStateOutput,
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
 * Loads the account-scoped signals the machine needs to choose registration or authorization.
 * Keeping this read inside the actor makes INIT independent of Onyx and lets cancellation tear down
 * the temporary connection. It is the same snapshot the provider and the finalize-outcome actor take
 * at their flow boundaries, read through the one shared helper so the three cannot drift.
 */
const loadRegistrationState = fromPromise<LoadRegistrationStateOutput, LoadRegistrationStateInput>(({input, signal}) => captureRegistrationState(input.accountID, signal));

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
        return createCanceledMFAResult('MFA flow canceled before backend registration');
    }
    const registrationResult = await processRegistration({keyInfo: creationResult.keyInfo});
    addMFABreadcrumb('Backend registration completed', registrationResult.success ? {success: true} : registrationResult.error, registrationResult.success ? 'info' : 'error');
    return registrationResult;
});

/**
 * Requests the authorization challenge, runs the platform ceremony, then invokes the scenario's
 * action with the signed challenge. While the flow is active, a local failure showing that the device
 * credential is unusable clears it before returning; cancellation skips that cleanup. The reason itself
 * is forwarded unchanged so the recovery slice can route recoverable failures to re-registration. No
 * rollback happens after the scenario action fails, matching `createCredentialActor`'s contract.
 */
const authorizeActor = fromPromise<AuthorizeOutput, AuthorizeInput>(async ({input, signal}) => {
    const {httpStatusCode, challenge, reason, message} = await requestAuthorizationChallenge();
    if (!isHttpSuccess(httpStatusCode) || !challenge) {
        const challengeError = createMFAErrorFromApiResponse(httpStatusCode, reason, message);
        addMFABreadcrumb('Authorization challenge failed', challengeError, 'error');
        return {success: false, error: challengeError};
    }
    addMFABreadcrumb('Authorization challenge received');

    // The flow may have been cancelled while the challenge request was in flight. Skip opening the
    // platform dialog rather than prompting for a ceremony nobody asked for anymore.
    if (signal.aborted) {
        return createCanceledMFAResult('MFA flow canceled before the authorization ceremony');
    }

    const authResult = await authorize({accountID: input.accountID, challenge, signal});
    addMFABreadcrumb(
        'Biometric authorization completed',
        authResult.success ? {success: true, authMethod: authResult.authenticationMethod.code} : authResult.error,
        authResult.success ? 'info' : 'error',
    );
    if (!authResult.success) {
        if (!signal.aborted && CONST.MULTIFACTOR_AUTHENTICATION.CREDENTIAL_FAILURES_REQUIRING_LOCAL_DELETION.has(authResult.error.reason)) {
            addMFABreadcrumb('Authorization key reset', authResult.error, 'warning');
            await deleteLocalCredentials(input.accountID, signal);
        }
        return authResult;
    }

    // The native ceremony cannot be interrupted mid-flight, so it can still succeed after the flow
    // was cancelled. Skip the scenario action rather than invoking one nobody asked for anymore.
    if (signal.aborted) {
        return createCanceledMFAResult('MFA flow canceled before the scenario action');
    }

    const scenarioResult = await input.runScenarioAction({
        signedChallenge: authResult.signedChallenge,
        authenticationMethod: authResult.authenticationMethod.marqetaValue,
    });
    addMFABreadcrumb('Scenario action completed', scenarioResult.success ? {success: true} : scenarioResult.error, scenarioResult.success ? 'info' : 'error');
    if (!scenarioResult.success) {
        return scenarioResult;
    }

    const {success, ...scenarioResponse} = scenarioResult;
    return {success, scenarioResponse, authenticationMethod: authResult.authenticationMethod};
});

/**
 * Runs the scenario's callback, then fires the end-of-flow telemetry without awaiting it, so the
 * outcome screen never waits on the end-state read. The callback is arbitrary scenario code (it fires
 * backend side effects, e.g. `AuthorizeTransaction`'s fire-and-forget deny), so a throw there falls
 * back to showing the outcome screen rather than stranding the modal. The telemetry swallows its own
 * failures because by then the callback has already stored secrets or navigated.
 *
 * The input below is also what the dev-only XState inspector serializes, and that masking is by key
 * name: `maskSensitive.ts` redacts the whole subtree under any key in its `SENSITIVE_KEYS` set, which
 * includes `payload`. The field carrying the scenario payload therefore has to stay named exactly
 * `payload` - renaming it to something more descriptive would silently ship arbitrary scenario PII to
 * the stately.ai window.
 */
const finalizeOutcomeActor = fromPromise<FinalizeOutcomeOutput, FinalizeOutcomeInput>(async ({input}) => {
    const isSuccessful = input.error === undefined;
    // Odd but deliberate parity with legacy: `message` carries the reason, not the message, and
    // `httpStatusCode` does not fall back to the error's. The reveal and set-PIN callbacks only read `body`.
    const callbackInput: MultifactorAuthenticationCallbackInput = {
        httpStatusCode: input.scenarioResponse?.httpStatusCode,
        message: input.scenarioResponse?.reason ?? input.error?.reason,
        body: input.scenarioResponse?.body,
    };

    let callbackResponse: MultifactorAuthenticationCallbackResponse;
    try {
        callbackResponse = await input.callback(isSuccessful, callbackInput, input.payload);
    } catch (error) {
        addMFABreadcrumb('Scenario callback threw', {message: getErrorMessage(error)}, 'error');
        callbackResponse = CONST.MULTIFACTOR_AUTHENTICATION.CALLBACK_RESPONSE.SHOW_OUTCOME_SCREEN;
    }

    addMFABreadcrumb('Flow completed', {
        isSuccessful,
        callbackResponse,
        httpStatusCode: input.scenarioResponse?.httpStatusCode ?? input.error?.httpStatusCode,
        reason: input.scenarioResponse?.reason ?? input.error?.reason,
        message: input.scenarioResponse?.message ?? input.error?.message,
    });

    // Deliberately not passed the actor's `signal`: closing the modal while this actor runs stops
    // it, and an aborted read would drop the outcome telemetry for exactly the flows where the user
    // bailed at the very end.
    captureRegistrationState(input.accountID)
        .then((endState) =>
            trackMFAFlowOutcome({
                isSuccessful,
                scenario: input.scenarioName,
                scenarioResponse: input.scenarioResponse,
                error: input.error,
                authenticationMethod: input.authenticationMethod?.name,
                isRegistrationComplete: input.isRegistrationComplete,
                isAuthorizationComplete: input.scenarioResponse !== undefined,
                softPromptApproved: input.softPromptApproved,
                startState: input.registrationStateAtStart ?? endState,
                endState,
            }),
        )
        .catch((error: unknown) => {
            addMFABreadcrumb('Flow outcome telemetry failed', {message: getErrorMessage(error)}, 'error');
        });

    return {callbackResponse};
});

/**
 * Builds the side-effect actors that the machine states invoke. The machine is always created with
 * these working implementations, so no caller needs to provide stubs or overrides.
 */
function createActors() {
    return {
        validateDevice,
        loadRegistrationState,
        requestRegistrationChallenge: requestRegistrationChallengeActor,
        createCredential: createCredentialActor,
        authorize: authorizeActor,
        finalizeOutcome: finalizeOutcomeActor,
    };
}

export default createActors;
