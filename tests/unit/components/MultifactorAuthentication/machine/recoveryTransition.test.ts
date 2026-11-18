import {getScenarioConfig} from '@components/MultifactorAuthentication/config';
import type * as BreadcrumbsModule from '@components/MultifactorAuthentication/observability/breadcrumbs';

import type {MFAError} from '@libs/MultifactorAuthentication/shared/MFAResult';
import {createLocalMFAError, createMFAErrorFromApiResponse} from '@libs/MultifactorAuthentication/shared/MFAResult';
import Navigation from '@libs/Navigation/Navigation';

import {clearLocalMFAPublicKeyList} from '@userActions/MultifactorAuthentication';
import type * as MultifactorAuthenticationActions from '@userActions/MultifactorAuthentication';
import {requestValidateCodeAction} from '@userActions/User';
import type * as UserActions from '@userActions/User';

import CONST from '@src/CONST';

import type {StateValue} from 'xstate';

import {
    createActorAtState,
    sendAuthorizeDone,
    sendExecuteScenarioActionDone,
    sendFinalizeOutcomeDone,
    sendRegisterCredentialDone,
    sendRequestRegistrationChallengeDone,
} from 'tests/utils/mfa/flowActors';
import createInitEvent, {
    MFA_TEST_AUTH_METHOD,
    MFA_TEST_CANCEL_ERROR,
    MFA_TEST_FINALIZE_OUTCOME_SHOW_SCREEN,
    MFA_TEST_KEY_INFO,
    MFA_TEST_REGISTRATION_CHALLENGE,
    MFA_TEST_REGISTRATION_REQUIRED_ERROR,
    MFA_TEST_SIGNED_CHALLENGE,
    MFA_TEST_VALIDATE_CODE,
} from 'tests/utils/mfa/flowFixtures';
import {createActorDoneEvent} from 'tests/utils/mfa/flowPaths';
import waitForBatchedUpdates from 'tests/utils/waitForBatchedUpdates';

// Both are side effects this suite only observes: the validate-code email and the Onyx write.
jest.mock('@userActions/User', () => ({
    ...jest.requireActual<typeof UserActions>('@userActions/User'),
    requestValidateCodeAction: jest.fn(),
}));
jest.mock('@userActions/MultifactorAuthentication', () => ({
    ...jest.requireActual<typeof MultifactorAuthenticationActions>('@userActions/MultifactorAuthentication'),
    clearLocalMFAPublicKeyList: jest.fn(),
}));

const mockAddMFABreadcrumb = jest.fn<void, Parameters<typeof BreadcrumbsModule.default>>();

jest.mock('@components/MultifactorAuthentication/observability/breadcrumbs', () => {
    const actual = jest.requireActual<typeof BreadcrumbsModule>('@components/MultifactorAuthentication/observability/breadcrumbs');
    return {
        __esModule: true,
        ...actual,
        default: (...args: Parameters<typeof BreadcrumbsModule.default>) => mockAddMFABreadcrumb(...args),
    };
});

const MFA_STATE = CONST.MULTIFACTOR_AUTHENTICATION.MFA_STATE;
const REASON = CONST.MULTIFACTOR_AUTHENTICATION.REASON;
const {MAX_RECOVERY_ATTEMPTS} = CONST.MULTIFACTOR_AUTHENTICATION;

const requestValidateCodeActionMock = jest.mocked(requestValidateCodeAction);
const clearLocalMFAPublicKeyListMock = jest.mocked(clearLocalMFAPublicKeyList);

const KEY_NOT_FOUND_ERROR = createLocalMFAError(REASON.LOCAL_ERRORS.HSM.KEY_NOT_FOUND, 'Recovery spec missing key');
const HSM_NO_MATCHING_ERROR = createLocalMFAError(REASON.LOCAL_ERRORS.HSM.NO_MATCHING_LOCAL_CREDENTIAL, 'Recovery spec unknown key');
const KEY_ACCESS_FAILED_ERROR = createLocalMFAError(REASON.LOCAL_ERRORS.HSM.KEY_ACCESS_FAILED, 'Recovery spec corrupted key');
const WEBAUTHN_NO_MATCHING_ERROR = createLocalMFAError(REASON.LOCAL_ERRORS.WEBAUTHN.NO_MATCHING_LOCAL_CREDENTIAL, 'Recovery spec unknown passkey');

const AWAITING_CODE_INPUT = {[MFA_STATE.OPEN]: {[MFA_STATE.FLOW]: {[MFA_STATE.VALIDATE_CODE]: {[MFA_STATE.AWAITING_VALIDATE_CODE]: MFA_STATE.AWAITING_INPUT}}}};
const CANCEL_CONFIRM_VISIBLE = {[MFA_STATE.OPEN]: {[MFA_STATE.CANCEL_CONFIRM]: MFA_STATE.CANCEL_CONFIRM_VISIBLE}};
const CANCELLING = {[MFA_STATE.OPEN]: {[MFA_STATE.FLOW]: MFA_STATE.CANCELLING}};
const CANCEL_PAYLOAD = {transactionID: 'recovery-spec-transaction'};
const OUTCOME = {[MFA_STATE.OPEN]: {[MFA_STATE.FLOW]: MFA_STATE.OUTCOME}};

type ActorAtState = ReturnType<typeof createActorAtState>;

/** A step of the flow, with the context it needs to be running and the way its result arrives. */
type FlowStep = {
    description: string;
    name: string;
    flow: StateValue;
    context: Parameters<typeof createActorAtState>[1];
    sendFailure: (actor: ActorAtState, error: MFAError) => void;
};

/** A step that can recover, with the failures it can really return that a fresh registration fixes. */
type RecoverableStep = FlowStep & {recoverableErrors: MFAError[]};

// Signing reads the local key and requests the authentication challenge, so it meets both kinds of recoverable failure.
const SIGNING_CHALLENGE_STEP: RecoverableStep = {
    description: 'signing the challenge',
    name: MFA_STATE.SIGNING_CHALLENGE,
    flow: {[MFA_STATE.PROMPT]: {[MFA_STATE.AUTHORIZING]: MFA_STATE.SIGNING_CHALLENGE}},
    context: {registrationChallenge: MFA_TEST_REGISTRATION_CHALLENGE, isRegistrationComplete: true, softPromptApproved: true},
    sendFailure: (actor, error) => sendAuthorizeDone(actor, {success: false, error}),
    recoverableErrors: [MFA_TEST_REGISTRATION_REQUIRED_ERROR, KEY_NOT_FOUND_ERROR, HSM_NO_MATCHING_ERROR, KEY_ACCESS_FAILED_ERROR, WEBAUTHN_NO_MATCHING_ERROR],
};

// The scenario action only hears from the server that it no longer knows the key.
const EXECUTING_SCENARIO_ACTION_STEP: RecoverableStep = {
    description: 'executing the scenario action',
    name: MFA_STATE.EXECUTING_SCENARIO_ACTION,
    flow: {[MFA_STATE.PROMPT]: {[MFA_STATE.AUTHORIZING]: MFA_STATE.EXECUTING_SCENARIO_ACTION}},
    context: {signedChallenge: MFA_TEST_SIGNED_CHALLENGE, authenticationMethod: MFA_TEST_AUTH_METHOD, isRegistrationComplete: true, softPromptApproved: true},
    sendFailure: (actor, error) => sendExecuteScenarioActionDone(actor, {success: false, error}),
    recoverableErrors: [MFA_TEST_REGISTRATION_REQUIRED_ERROR],
};

const RECOVERABLE_STEPS = [SIGNING_CHALLENGE_STEP, EXECUTING_SCENARIO_ACTION_STEP];

// The server never answers these steps with `Registration required`, so they don't recover.
const NON_RECOVERABLE_STEPS: FlowStep[] = [
    {
        description: 'requesting the registration challenge',
        name: MFA_STATE.REQUESTING_REGISTRATION_CHALLENGE,
        flow: {[MFA_STATE.VALIDATE_CODE]: MFA_STATE.REQUESTING_REGISTRATION_CHALLENGE},
        context: {validateCode: MFA_TEST_VALIDATE_CODE},
        sendFailure: (actor, error) => sendRequestRegistrationChallengeDone(actor, {success: false, error}),
    },
    {
        description: 'registering the key',
        name: MFA_STATE.REGISTERING_KEY,
        flow: {[MFA_STATE.PROMPT]: {[MFA_STATE.CREATING_CREDENTIAL]: MFA_STATE.REGISTERING_KEY}},
        context: {registrationChallenge: MFA_TEST_REGISTRATION_CHALLENGE, registrationKeyInfo: MFA_TEST_KEY_INFO, softPromptApproved: true},
        sendFailure: (actor, error) => sendRegisterCredentialDone(actor, {success: false, error}),
    },
];

/**
 * Starts the step with the cancel dialog open, in a scenario whose `onCancel` is a mock that never
 * settles, so a test can read what the cancel was told and the flow stays where the test left it.
 */
function startWithDialog(step: FlowStep, cancelConfirm: StateValue = MFA_STATE.CANCEL_CONFIRM_VISIBLE) {
    const onCancel = jest.fn(() => new Promise<MFAError>(() => {}));
    const scenario = {...getScenarioConfig(CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.AUTHORIZE_TRANSACTION), onCancel};
    const actor = createActorAtState({[MFA_STATE.OPEN]: {[MFA_STATE.FLOW]: step.flow, [MFA_STATE.CANCEL_CONFIRM]: cancelConfirm}}, {...step.context, scenario, payload: CANCEL_PAYLOAD});
    actor.start();
    return {actor, onCancel};
}

function startAt(step: FlowStep, contextOverrides: Parameters<typeof createActorAtState>[1] = {}) {
    const actor = createActorAtState({[MFA_STATE.OPEN]: {[MFA_STATE.FLOW]: step.flow}}, {...step.context, ...contextOverrides});
    actor.start();
    return actor;
}

/** Each recoverable step paired with each failure it can recover from, for `it.each`. */
const RECOVERABLE_CASES = RECOVERABLE_STEPS.flatMap((step) => step.recoverableErrors.map((error) => ({step, error, description: step.description, reason: error.reason})));

// The graph-traversal suites never reach recovery on their own, because their failure fixtures are
// ones a fresh registration can't fix. This suite pins where recovery goes, what it clears and when
// it gives up, by hand.

describe('MFA recovery', () => {
    let runAfterTransitionSpy: jest.SpyInstance;

    /** The recovery breadcrumbs so far; each one is a recovery that started. */
    const recoveryBreadcrumbs = () => mockAddMFABreadcrumb.mock.calls.filter(([message]) => message === 'Recovery started');

    beforeEach(() => {
        jest.clearAllMocks();
        runAfterTransitionSpy = jest.spyOn(Navigation, 'runAfterTransition').mockReturnValue({cancel: () => {}});
    });

    afterEach(() => {
        runAfterTransitionSpy.mockRestore();
    });

    it.each(RECOVERABLE_CASES)('goes back to the validate-code screen and emails a new code after $reason while $description', ({step, error}) => {
        // Given the step is running in a flow that hasn't recovered yet
        const actor = startAt(step);

        // When it fails in a way a fresh registration can fix
        step.sendFailure(actor, error);

        // Then the flow asks for a new code on the validate-code screen and leaves a breadcrumb with the step and the reason
        expect(actor.getSnapshot().matches(AWAITING_CODE_INPUT)).toBe(true);
        expect(requestValidateCodeActionMock).toHaveBeenCalledTimes(1);
        expect(runAfterTransitionSpy).toHaveBeenCalledTimes(1);
        expect(recoveryBreadcrumbs()).toEqual([['Recovery started', {reason: error.reason, step: step.name}, 'warning']]);

        actor.stop();
    });

    it.each(RECOVERABLE_STEPS)('clears the registration challenge and records the recovery after a failure while $description', (step) => {
        // Given the step is running in a flow that hasn't recovered yet
        const actor = startAt(step);

        // When it fails with `Registration required`
        step.sendFailure(actor, MFA_TEST_REGISTRATION_REQUIRED_ERROR);

        // Then the challenge of the failed attempt is gone, and the counter and the first failure are recorded for the limit and the outcome telemetry
        expect(actor.getSnapshot().context).toMatchObject({
            registrationChallenge: undefined,
            recoveryAttempts: 1,
            recoveredFrom: {reason: REASON.CLIENT_ERRORS.REGISTRATION_REQUIRED, step: step.name},
        });

        actor.stop();
    });

    it('keeps what the failed attempt did for the outcome telemetry', () => {
        // Given the flow registered a key and the user approved the soft prompt before signing
        const actor = startAt(SIGNING_CHALLENGE_STEP);

        // When signing fails and the flow recovers
        SIGNING_CHALLENGE_STEP.sendFailure(actor, KEY_NOT_FOUND_ERROR);

        // Then the telemetry fields still say so, since the outcome reports what happened in the whole flow
        expect(actor.getSnapshot().context).toMatchObject({isRegistrationComplete: true, softPromptApproved: true});

        actor.stop();
    });

    it.each(RECOVERABLE_STEPS)('lands on the outcome with the second failure’s own error once the flow is out of recoveries, while $description', (step) => {
        // Given the flow already used all its recoveries
        const recoveredFrom = {reason: REASON.CLIENT_ERRORS.REGISTRATION_REQUIRED, step: MFA_STATE.SIGNING_CHALLENGE};
        const actor = startAt(step, {recoveryAttempts: MAX_RECOVERY_ATTEMPTS, recoveredFrom});

        // When the step fails in a way that would otherwise recover
        step.sendFailure(actor, MFA_TEST_REGISTRATION_REQUIRED_ERROR);

        // Then the flow ends with this failure and keeps the first one for the telemetry
        const result = actor.getSnapshot();
        expect(result.matches(OUTCOME)).toBe(true);
        expect(result.context.error).toBe(MFA_TEST_REGISTRATION_REQUIRED_ERROR);
        expect(result.context.recoveredFrom).toBe(recoveredFrom);
        expect(requestValidateCodeActionMock).not.toHaveBeenCalled();
        expect(recoveryBreadcrumbs()).toHaveLength(0);

        actor.stop();
    });

    it.each(NON_RECOVERABLE_STEPS)('lands on the outcome without recovering after `Registration required` while $description', (step) => {
        // Given a step the server never answers with `Registration required`
        const actor = startAt(step);

        // When it fails that way anyway
        step.sendFailure(actor, MFA_TEST_REGISTRATION_REQUIRED_ERROR);

        // Then the flow ends with that error instead of spending its recovery
        const result = actor.getSnapshot();
        expect(result.matches(OUTCOME)).toBe(true);
        expect(result.context.error).toBe(MFA_TEST_REGISTRATION_REQUIRED_ERROR);
        expect(result.context.recoveryAttempts).toBe(0);
        expect(requestValidateCodeActionMock).not.toHaveBeenCalled();

        actor.stop();
    });

    describe('the server key list', () => {
        it.each(RECOVERABLE_STEPS)('is cleared when the server no longer knows the key, while $description', (step) => {
            // Given the step is running
            const actor = startAt(step);

            // When the server answers that the key needs registering again
            step.sendFailure(actor, MFA_TEST_REGISTRATION_REQUIRED_ERROR);

            // Then the cached server key list is cleared, because it still lists the forgotten key
            expect(clearLocalMFAPublicKeyListMock).toHaveBeenCalledTimes(1);

            actor.stop();
        });

        it('is left alone when the local key is the broken part', () => {
            // Given the flow is signing the challenge
            const actor = startAt(SIGNING_CHALLENGE_STEP);

            // When signing finds the local key unusable
            SIGNING_CHALLENGE_STEP.sendFailure(actor, KEY_ACCESS_FAILED_ERROR);

            // Then the server key list stays, because the server still knows its keys and the authorize actor already deleted the local one
            expect(clearLocalMFAPublicKeyListMock).not.toHaveBeenCalled();

            actor.stop();
        });
    });

    it.each([
        createLocalMFAError(REASON.LOCAL_ERRORS.HSM.CANCELED, 'Recovery spec user cancel'),
        createLocalMFAError(REASON.LOCAL_ERRORS.HSM.LOCKOUT, 'Recovery spec lockout'),
        createLocalMFAError(REASON.LOCAL_ERRORS.HSM.UNRECOGNIZED, 'Recovery spec unreadable keystore'),
        createMFAErrorFromApiResponse(400, REASON.CLIENT_ERRORS.UNRECOGNIZED, 'Recovery spec unrecognized rejection'),
    ])('lands on the outcome for $reason without recovering', (error) => {
        // Given the flow is signing the challenge
        const actor = startAt(SIGNING_CHALLENGE_STEP);

        // When signing fails in a way a fresh registration can't fix
        SIGNING_CHALLENGE_STEP.sendFailure(actor, error);

        // Then the flow ends with that error and nothing is cleared or emailed
        const result = actor.getSnapshot();
        expect(result.matches(OUTCOME)).toBe(true);
        expect(result.context.error).toBe(error);
        expect(result.context.recoveryAttempts).toBe(0);
        expect(requestValidateCodeActionMock).not.toHaveBeenCalled();
        expect(clearLocalMFAPublicKeyListMock).not.toHaveBeenCalled();

        actor.stop();
    });

    describe('the once-per-flow limit', () => {
        it('lets a cancel during recovery take the ordinary cancel path', () => {
            // Given the flow recovered and waits for the new code
            const actor = startAt(SIGNING_CHALLENGE_STEP);
            SIGNING_CHALLENGE_STEP.sendFailure(actor, MFA_TEST_REGISTRATION_REQUIRED_ERROR);

            // When the user cancels and the cancel returns
            actor.send({type: 'REQUEST_CANCEL'});
            actor.send({type: 'CONFIRM_CANCEL'});
            actor.send(createActorDoneEvent('cancelScenario', MFA_TEST_CANCEL_ERROR));
            sendFinalizeOutcomeDone(actor, MFA_TEST_FINALIZE_OUTCOME_SHOW_SCREEN);

            // Then the flow fails with the cancel's error, as without recovery
            expect(actor.getSnapshot().matches({[MFA_STATE.OPEN]: {[MFA_STATE.FLOW]: {[MFA_STATE.OUTCOME]: MFA_STATE.FAILURE}}})).toBe(true);
            expect(actor.getSnapshot().context.error).toBe(MFA_TEST_CANCEL_ERROR);

            actor.stop();
        });

        it('is reset by INIT, so the next flow gets its own recovery', () => {
            // Given a closed machine whose context still carries a spent recovery
            const actor = createActorAtState(MFA_STATE.CLOSED, {
                recoveryAttempts: MAX_RECOVERY_ATTEMPTS,
                recoveredFrom: {reason: REASON.CLIENT_ERRORS.REGISTRATION_REQUIRED, step: MFA_STATE.SIGNING_CHALLENGE},
            });
            actor.start();

            // When a new flow starts
            actor.send(createInitEvent());

            // Then it starts with no recovery spent
            expect(actor.getSnapshot().context).toMatchObject({recoveryAttempts: 0, recoveredFrom: undefined});

            actor.stop();
        });
    });

    describe('with the cancel dialog', () => {
        it('recovers behind the open dialog while executing the scenario action, and a confirm still cancels', async () => {
            // Given the cancel dialog is open while the scenario action runs
            const {actor, onCancel} = startWithDialog(EXECUTING_SCENARIO_ACTION_STEP);

            // When the scenario action fails in a way a fresh registration can fix
            EXECUTING_SCENARIO_ACTION_STEP.sendFailure(actor, MFA_TEST_REGISTRATION_REQUIRED_ERROR);

            // Then recovery runs behind the dialog, because opening the dialog never stops the step that is running
            expect(actor.getSnapshot().matches(AWAITING_CODE_INPUT)).toBe(true);
            expect(actor.getSnapshot().matches(CANCEL_CONFIRM_VISIBLE)).toBe(true);
            expect(requestValidateCodeActionMock).toHaveBeenCalledTimes(1);

            // When the user confirms the cancel
            actor.send({type: 'CONFIRM_CANCEL'});
            await waitForBatchedUpdates();

            // Then the flow cancels as usual, because recovery left nothing in flight for a deny to race
            expect(actor.getSnapshot().matches(CANCELLING)).toBe(true);
            expect(onCancel).toHaveBeenCalledTimes(1);
            expect(onCancel).toHaveBeenCalledWith(CANCEL_PAYLOAD);

            actor.stop();
        });

        it('keeps recovering once the dialog is dismissed', () => {
            // Given recovery started behind the open dialog
            const {actor, onCancel} = startWithDialog(EXECUTING_SCENARIO_ACTION_STEP);
            EXECUTING_SCENARIO_ACTION_STEP.sendFailure(actor, MFA_TEST_REGISTRATION_REQUIRED_ERROR);

            // When the user dismisses the dialog
            actor.send({type: 'DISMISS_CANCEL'});

            // Then the validate-code screen stays and nothing is cancelled
            expect(actor.getSnapshot().matches(AWAITING_CODE_INPUT)).toBe(true);
            expect(actor.getSnapshot().matches(CANCEL_CONFIRM_VISIBLE)).toBe(false);
            expect(onCancel).not.toHaveBeenCalled();

            actor.stop();
        });

        it('ignores a recoverable approve failure once the cancel is confirmed, so the deny decides', () => {
            // Given the user confirmed the cancel while the approve was in flight, so the deny races it
            const cancellingInFlightStep = {
                ...EXECUTING_SCENARIO_ACTION_STEP,
                flow: {[MFA_STATE.PROMPT]: {[MFA_STATE.AUTHORIZING]: {[MFA_STATE.EXECUTING_SCENARIO_ACTION]: MFA_STATE.CANCELLING_IN_FLIGHT}}},
            };
            const {actor} = startWithDialog(cancellingInFlightStep, MFA_STATE.CANCEL_CONFIRM_HIDDEN);

            // When the approve comes back saying the key needs registering again
            EXECUTING_SCENARIO_ACTION_STEP.sendFailure(actor, MFA_TEST_REGISTRATION_REQUIRED_ERROR);

            // Then recovery doesn't start, because the user asked to leave, and the flow keeps waiting for the deny
            expect(actor.getSnapshot().matches({[MFA_STATE.OPEN]: {[MFA_STATE.FLOW]: cancellingInFlightStep.flow}})).toBe(true);
            expect(actor.getSnapshot().context.recoveryAttempts).toBe(0);
            expect(requestValidateCodeActionMock).not.toHaveBeenCalled();
            expect(clearLocalMFAPublicKeyListMock).not.toHaveBeenCalled();
            expect(recoveryBreadcrumbs()).toHaveLength(0);

            // When the deny comes back
            const denied = createMFAErrorFromApiResponse(200, REASON.FLOW_OUTCOMES.TRANSACTION_DENIED, undefined);
            actor.send(createActorDoneEvent('cancelScenario', denied));

            // Then the deny's result decides the outcome
            expect(actor.getSnapshot().matches(OUTCOME)).toBe(true);
            expect(actor.getSnapshot().context.error).toEqual(denied);

            actor.stop();
        });
    });
});
