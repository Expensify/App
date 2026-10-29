import type * as BiometricsOperations from '@components/MultifactorAuthentication/biometrics/operations';
import createActors from '@components/MultifactorAuthentication/machine/mfaActors';
import type {AuthorizeInput, ExecuteScenarioActionInput} from '@components/MultifactorAuthentication/machine/types';
import type * as BreadcrumbsModule from '@components/MultifactorAuthentication/observability/breadcrumbs';

import NATIVE_BIOMETRICS_HSM_VALUES from '@libs/MultifactorAuthentication/NativeBiometricsHSM/VALUES';
import {createLocalMFAError} from '@libs/MultifactorAuthentication/shared/MFAResult';

import {requestAuthorizationChallenge} from '@userActions/MultifactorAuthentication';
import type * as MultifactorAuthenticationActions from '@userActions/MultifactorAuthentication';

import CONST from '@src/CONST';

import {MFA_TEST_ACCOUNT_ID, MFA_TEST_AUTH_METHOD, MFA_TEST_AUTHENTICATION_CHALLENGE, MFA_TEST_SIGNED_CHALLENGE} from 'tests/utils/mfa/flowFixtures';
import waitForBatchedUpdates from 'tests/utils/waitForBatchedUpdates';
import {createActor, waitFor} from 'xstate';

const REASON = CONST.MULTIFACTOR_AUTHENTICATION.REASON;
// Only failures that confirm the credential is unusable belong here. A keystore the device merely
// failed to read may recover, so it must not reach the deletion path.
const EXPECTED_CREDENTIAL_FAILURES_REQUIRING_LOCAL_DELETION = [
    REASON.LOCAL_ERRORS.HSM.KEY_NOT_FOUND,
    REASON.LOCAL_ERRORS.HSM.NO_MATCHING_LOCAL_CREDENTIAL,
    REASON.LOCAL_ERRORS.WEBAUTHN.NO_MATCHING_LOCAL_CREDENTIAL,
] as const;

const mockAuthorize = jest.fn();
const mockDeleteLocalCredentials = jest.fn();
const mockRunScenarioAction = jest.fn();

// The actor's own decisions (fire the challenge request exactly once, short-circuit on refusal,
// clear the local credential only on a recoverable failure, forward the signed challenge) are what
// this suite pins, so the platform ceremony and the backend calls are mocked here.
jest.mock('@components/MultifactorAuthentication/biometrics/operations', () => ({
    ...jest.requireActual<typeof BiometricsOperations>('@components/MultifactorAuthentication/biometrics/operations'),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    authorize: (...args: unknown[]) => mockAuthorize(...args),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    deleteLocalCredentials: (...args: unknown[]) => mockDeleteLocalCredentials(...args),
}));

jest.mock('@userActions/MultifactorAuthentication', () => ({
    ...jest.requireActual<typeof MultifactorAuthenticationActions>('@userActions/MultifactorAuthentication'),
    requestAuthorizationChallenge: jest.fn(),
}));

const mockAddMFABreadcrumb = jest.fn();

jest.mock('@components/MultifactorAuthentication/observability/breadcrumbs', () => {
    const actual = jest.requireActual<typeof BreadcrumbsModule>('@components/MultifactorAuthentication/observability/breadcrumbs');
    return {
        __esModule: true,
        ...actual,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        default: (...args: Parameters<typeof BreadcrumbsModule.default>) => mockAddMFABreadcrumb(...args),
    };
});

const requestAuthorizationChallengeMock = jest.mocked(requestAuthorizationChallenge);

// `expect.any` is typed as `any`, which cannot be assigned inside a matcher object literal.
const ANY_ABORT_SIGNAL: unknown = expect.any(AbortSignal);

const AUTHORIZE_INPUT: AuthorizeInput = {
    accountID: MFA_TEST_ACCOUNT_ID,
};

const EXECUTE_SCENARIO_ACTION_INPUT: ExecuteScenarioActionInput = {
    runScenarioAction: mockRunScenarioAction,
    signedChallenge: MFA_TEST_SIGNED_CHALLENGE,
    authenticationMethod: MFA_TEST_AUTH_METHOD,
};

const CHALLENGE_SUCCESS_RESPONSE = {
    httpStatusCode: 200,
    reason: undefined,
    message: undefined,
    challenge: MFA_TEST_AUTHENTICATION_CHALLENGE,
    publicKeys: undefined,
};

const SCENARIO_RESPONSE_SUCCESS = {httpStatusCode: 200, reason: undefined, message: undefined, body: undefined};

/** Runs the machine's real `authorize` actor logic to completion and returns its final snapshot. */
async function runAuthorizeActor(input: AuthorizeInput = AUTHORIZE_INPUT) {
    const {authorize} = createActors();
    const actorRef = createActor(authorize, {input});
    actorRef.start();
    await waitFor(actorRef, (snapshot) => snapshot.status !== 'active');
    return actorRef.getSnapshot();
}

/** Runs the machine's real `executeScenarioAction` actor logic to completion and returns its final snapshot. */
async function runExecuteScenarioActionActor(input: ExecuteScenarioActionInput = EXECUTE_SCENARIO_ACTION_INPUT) {
    const {executeScenarioAction} = createActors();
    const actorRef = createActor(executeScenarioAction, {input});
    actorRef.start();
    await waitFor(actorRef, (snapshot) => snapshot.status !== 'active');
    return actorRef.getSnapshot();
}

describe('authorize actor', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        requestAuthorizationChallengeMock.mockResolvedValue(CHALLENGE_SUCCESS_RESPONSE);
        mockAuthorize.mockResolvedValue({success: true, signedChallenge: MFA_TEST_SIGNED_CHALLENGE, authenticationMethod: MFA_TEST_AUTH_METHOD});
    });

    it('requests the authorization challenge exactly once per run', async () => {
        await runAuthorizeActor();

        expect(requestAuthorizationChallengeMock).toHaveBeenCalledTimes(1);
    });

    it('returns a failed result with the exact reason when the challenge request fails over HTTP, and never calls the platform ceremony', async () => {
        // Given the backend refuses to issue an authorization challenge
        const challengeError = {httpStatusCode: 400, reason: REASON.CLIENT_ERRORS.UNRECOGNIZED, message: 'Challenge request rejected', challenge: undefined, publicKeys: undefined};
        requestAuthorizationChallengeMock.mockResolvedValue(challengeError);

        // When the authorize actor runs
        const snapshot = await runAuthorizeActor();

        // Then it fails with the backend reason and skips the ceremony, since there is nothing to sign
        expect(snapshot.output?.success).toBe(false);
        if (snapshot.output?.success !== false) {
            throw new Error('Expected authorization to fail');
        }
        expect(snapshot.output.error.reason).toBe(REASON.CLIENT_ERRORS.UNRECOGNIZED);
        expect(mockAuthorize).not.toHaveBeenCalled();
    });

    it('returns a failed result when the challenge response is otherwise successful but carries no challenge', async () => {
        requestAuthorizationChallengeMock.mockResolvedValue({httpStatusCode: 200, reason: undefined, message: undefined, challenge: undefined, publicKeys: undefined});

        const snapshot = await runAuthorizeActor();

        expect(snapshot.output?.success).toBe(false);
        if (snapshot.output?.success !== false) {
            throw new Error('Expected authorization to fail');
        }
        expect(snapshot.output.error.reason).toBe(REASON.LOCAL_ERRORS.UNHANDLED_API_RESPONSE);
        expect(mockAuthorize).not.toHaveBeenCalled();
    });

    it('preserves the REGISTRATION_REQUIRED reason unchanged when the challenge request reports it', async () => {
        requestAuthorizationChallengeMock.mockResolvedValue({
            httpStatusCode: 400,
            reason: REASON.CLIENT_ERRORS.REGISTRATION_REQUIRED,
            message: 'Registration required',
            challenge: undefined,
            publicKeys: undefined,
        });

        const snapshot = await runAuthorizeActor();

        expect(snapshot.output?.success).toBe(false);
        if (snapshot.output?.success !== false) {
            throw new Error('Expected authorization to fail');
        }
        expect(snapshot.output.error.reason).toBe(REASON.CLIENT_ERRORS.REGISTRATION_REQUIRED);
        expect(mockDeleteLocalCredentials).not.toHaveBeenCalled();
    });

    it('does not start the authorization ceremony when the flow is cancelled while requesting the challenge', async () => {
        let resolveChallenge: (response: typeof CHALLENGE_SUCCESS_RESPONSE) => void = () => {};
        requestAuthorizationChallengeMock.mockImplementation(
            () =>
                new Promise((resolve) => {
                    resolveChallenge = resolve;
                }),
        );
        const {authorize} = createActors();
        const actorRef = createActor(authorize, {input: AUTHORIZE_INPUT});

        actorRef.start();
        await waitForBatchedUpdates();
        actorRef.stop();
        resolveChallenge(CHALLENGE_SUCCESS_RESPONSE);
        await waitForBatchedUpdates();

        expect(mockAuthorize).not.toHaveBeenCalled();
    });

    it('surfaces a platform refusal unchanged and never clears local credentials', async () => {
        // Given the user dismisses the biometric prompt
        const platformError = createLocalMFAError(REASON.LOCAL_ERRORS.HSM.CANCELED, 'User canceled the biometric prompt');
        mockAuthorize.mockResolvedValue({success: false, error: platformError});

        // When the authorize actor runs
        const snapshot = await runAuthorizeActor();

        // Then the refusal is passed on as-is and the credential is kept, because a dismissal says nothing about the key being broken
        expect(snapshot.output).toEqual({success: false, error: platformError});
        expect(mockDeleteLocalCredentials).not.toHaveBeenCalled();
    });

    it.each(EXPECTED_CREDENTIAL_FAILURES_REQUIRING_LOCAL_DELETION)('clears the local credential and preserves the exact reason for the local credential failure "%s"', async (reason) => {
        const recoverableError = createLocalMFAError(reason, 'Recoverable authorization failure');
        mockAuthorize.mockResolvedValue({success: false, error: recoverableError});

        const snapshot = await runAuthorizeActor();

        expect(mockDeleteLocalCredentials).toHaveBeenCalledTimes(1);
        expect(mockDeleteLocalCredentials).toHaveBeenCalledWith(MFA_TEST_ACCOUNT_ID, expect.any(AbortSignal));
        expect(snapshot.output).toEqual({success: false, error: recoverableError});
    });

    it('stays active until the credential cleanup resolves, so the deletion cannot be skipped by its own abort check', async () => {
        const recoverableError = createLocalMFAError(REASON.LOCAL_ERRORS.HSM.NO_MATCHING_LOCAL_CREDENTIAL, 'No matching local credential');
        mockAuthorize.mockResolvedValue({success: false, error: recoverableError});
        let resolveDeletion = () => {};
        // `mockImplementationOnce`: `clearAllMocks` resets calls but not implementations, so a pending
        // promise left behind here would hang every later test.
        mockDeleteLocalCredentials.mockImplementationOnce(
            () =>
                new Promise<void>((resolve) => {
                    resolveDeletion = resolve;
                }),
        );

        const {authorize} = createActors();
        const actorRef = createActor(authorize, {input: AUTHORIZE_INPUT});
        actorRef.start();
        await waitForBatchedUpdates();

        expect(mockDeleteLocalCredentials).toHaveBeenCalledTimes(1);
        expect(actorRef.getSnapshot().status).toBe('active');

        resolveDeletion();
        await waitFor(actorRef, (snapshot) => snapshot.status !== 'active');
        expect(actorRef.getSnapshot().output).toEqual({success: false, error: recoverableError});
    });

    it('keeps the local credential after a keystore read failure, which cannot confirm the credential is unusable', async () => {
        const readError = createLocalMFAError(REASON.LOCAL_ERRORS.HSM.KEY_ACCESS_FAILED, 'Keystore unavailable');
        mockAuthorize.mockResolvedValue({success: false, error: readError});

        const snapshot = await runAuthorizeActor();

        expect(CONST.MULTIFACTOR_AUTHENTICATION.CREDENTIAL_FAILURES_REQUIRING_LOCAL_DELETION.has(REASON.LOCAL_ERRORS.HSM.KEY_ACCESS_FAILED)).toBe(false);
        expect(mockDeleteLocalCredentials).not.toHaveBeenCalled();
        expect(snapshot.output).toEqual({success: false, error: readError});
    });

    it('does not delete credentials when a recoverable failure resolves after the flow was cancelled', async () => {
        const recoverableError = createLocalMFAError(REASON.LOCAL_ERRORS.HSM.NO_MATCHING_LOCAL_CREDENTIAL, 'No matching local credential');
        let resolveCeremony: (result: {success: false; error: typeof recoverableError}) => void = () => {};
        mockAuthorize.mockImplementation(
            () =>
                new Promise((resolve) => {
                    resolveCeremony = resolve;
                }),
        );

        const {authorize} = createActors();
        const actorRef = createActor(authorize, {input: AUTHORIZE_INPUT});
        actorRef.start();
        await waitForBatchedUpdates();
        actorRef.stop();
        resolveCeremony({success: false, error: recoverableError});
        await waitForBatchedUpdates();

        expect(mockDeleteLocalCredentials).not.toHaveBeenCalled();
    });

    it('passes the account, the requested challenge and the cancellation signal into the platform ceremony', async () => {
        await runAuthorizeActor();

        expect(mockAuthorize).toHaveBeenCalledTimes(1);
        expect(mockAuthorize).toHaveBeenCalledWith({accountID: MFA_TEST_ACCOUNT_ID, challenge: MFA_TEST_AUTHENTICATION_CHALLENGE, signal: ANY_ABORT_SIGNAL});
    });

    it('hands the ceremony the flow-scoped signal, so cancelling the flow reaches it', async () => {
        let ceremonySignal: AbortSignal | undefined;
        // Never resolves: the signal has to be the actor's own, so it aborts while the ceremony is still pending.
        mockAuthorize.mockImplementation((params: {signal: AbortSignal}) => {
            ceremonySignal = params.signal;
            return new Promise(() => {});
        });

        const {authorize} = createActors();
        const actorRef = createActor(authorize, {input: AUTHORIZE_INPUT});
        actorRef.start();
        await waitForBatchedUpdates();

        expect(ceremonySignal?.aborted).toBe(false);

        actorRef.stop();

        expect(ceremonySignal?.aborted).toBe(true);
    });

    it('returns the exact signed challenge and authentication method on success', async () => {
        // Given the challenge request and ceremony both succeed
        // When the authorize actor runs
        const snapshot = await runAuthorizeActor();

        // Then it returns the signature and method, which the scenario action step needs to send the backend request
        expect(snapshot.output).toEqual({success: true, signedChallenge: MFA_TEST_SIGNED_CHALLENGE, authenticationMethod: MFA_TEST_AUTH_METHOD});
    });

    it('records a breadcrumb for the challenge request and the ceremony outcome', async () => {
        // Given the ceremony succeeds with Face ID
        const nativeAuthenticationMethod = NATIVE_BIOMETRICS_HSM_VALUES.AUTH_TYPE.FACE_ID;
        mockAuthorize.mockResolvedValue({
            success: true,
            signedChallenge: MFA_TEST_SIGNED_CHALLENGE,
            authenticationMethod: {
                code: nativeAuthenticationMethod.CODE,
                name: nativeAuthenticationMethod.NAME,
                marqetaValue: nativeAuthenticationMethod.MARQETA_VALUE,
            },
        });

        // When the authorize actor runs
        await runAuthorizeActor();

        // Then both steps leave breadcrumbs with the legacy labels, so existing telemetry keeps tracing the ceremony
        expect(mockAddMFABreadcrumb).toHaveBeenCalledWith('Authorization challenge received');
        expect(mockAddMFABreadcrumb).toHaveBeenCalledWith('Biometric authorization completed', {success: true, authMethod: nativeAuthenticationMethod.CODE}, 'info');
    });

    it('records a warning breadcrumb when a recoverable failure resets the local credential', async () => {
        const recoverableError = createLocalMFAError(REASON.LOCAL_ERRORS.HSM.NO_MATCHING_LOCAL_CREDENTIAL, 'No matching local credential');
        mockAuthorize.mockResolvedValue({success: false, error: recoverableError});

        await runAuthorizeActor();

        expect(mockAddMFABreadcrumb).toHaveBeenCalledWith('Authorization key reset', recoverableError, 'warning');
    });
});

describe('executeScenarioAction actor', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Given the backend accepts the scenario action
        mockRunScenarioAction.mockResolvedValue({success: true, ...SCENARIO_RESPONSE_SUCCESS});
    });

    it('forwards the exact signed challenge and marqeta authentication method to the pre-bound scenario runner', async () => {
        // When the scenario action actor runs
        await runExecuteScenarioActionActor();

        // Then the runner gets the signature and the marqeta value, since that is the form the backend expects the method in
        expect(mockRunScenarioAction).toHaveBeenCalledTimes(1);
        expect(mockRunScenarioAction).toHaveBeenCalledWith({
            signedChallenge: MFA_TEST_SIGNED_CHALLENGE,
            authenticationMethod: MFA_TEST_AUTH_METHOD.marqetaValue,
        });
    });

    it('returns the exact scenario response on success', async () => {
        // When the scenario action actor runs
        const snapshot = await runExecuteScenarioActionActor();

        // Then the backend response is returned for the outcome screen and callback to use
        expect(snapshot.output).toEqual({success: true, scenarioResponse: SCENARIO_RESPONSE_SUCCESS});
    });

    it('surfaces a scenario action failure unchanged', async () => {
        // Given the backend rejects the scenario action
        const scenarioError = createLocalMFAError(REASON.CLIENT_ERRORS.UNRECOGNIZED, 'Scenario action rejected');
        mockRunScenarioAction.mockResolvedValue({success: false, error: scenarioError});

        // When the scenario action actor runs
        const snapshot = await runExecuteScenarioActionActor();

        // Then the failure is passed on unchanged, so the outcome screen can show the real reason
        expect(snapshot.output).toEqual({success: false, error: scenarioError});
    });

    it('records a breadcrumb for the scenario action', async () => {
        // When the scenario action actor runs
        await runExecuteScenarioActionActor();

        // Then a breadcrumb records the result, so telemetry can tell a failed ceremony from a failed backend action
        expect(mockAddMFABreadcrumb).toHaveBeenCalledWith('Scenario action completed', {success: true}, 'info');
    });
});
