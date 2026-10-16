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
    MFA_TEST_SIGNED_CHALLENGE,
} from 'tests/utils/mfa/flowFixtures';
import {createActorDoneEvent} from 'tests/utils/mfa/flowPaths';

// Both are side effects this suite only observes: the validate-code email and the Onyx write.
jest.mock('@userActions/User', () => ({
    ...jest.requireActual<typeof UserActions>('@userActions/User'),
    requestValidateCodeAction: jest.fn(),
}));
jest.mock('@userActions/MultifactorAuthentication', () => ({
    ...jest.requireActual<typeof MultifactorAuthenticationActions>('@userActions/MultifactorAuthentication'),
    clearLocalMFAPublicKeyList: jest.fn(),
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

const MFA_STATE = CONST.MULTIFACTOR_AUTHENTICATION.MFA_STATE;
const REASON = CONST.MULTIFACTOR_AUTHENTICATION.REASON;

const requestValidateCodeActionMock = jest.mocked(requestValidateCodeAction);
const clearLocalMFAPublicKeyListMock = jest.mocked(clearLocalMFAPublicKeyList);

const REGISTRATION_REQUIRED_ERROR = createMFAErrorFromApiResponse(400, REASON.CLIENT_ERRORS.REGISTRATION_REQUIRED, 'Recovery spec registration required');
const KEY_NOT_FOUND_ERROR = createLocalMFAError(REASON.LOCAL_ERRORS.HSM.KEY_NOT_FOUND, 'Recovery spec missing key');
const KEY_ACCESS_FAILED_ERROR = createLocalMFAError(REASON.LOCAL_ERRORS.HSM.KEY_ACCESS_FAILED, 'Recovery spec unreadable key');
const WEBAUTHN_NO_MATCHING_ERROR = createLocalMFAError(REASON.LOCAL_ERRORS.WEBAUTHN.NO_MATCHING_LOCAL_CREDENTIAL, 'Recovery spec unknown passkey');

const AWAITING_CODE_INPUT = {[MFA_STATE.OPEN]: {[MFA_STATE.FLOW]: {[MFA_STATE.VALIDATE_CODE]: {[MFA_STATE.AWAITING_VALIDATE_CODE]: MFA_STATE.AWAITING_INPUT}}}};
const OUTCOME = {[MFA_STATE.OPEN]: {[MFA_STATE.FLOW]: MFA_STATE.OUTCOME}};

type ActorAtState = ReturnType<typeof createActorAtState>;

/** The four steps whose failure a fresh key registration can fix, each with the context it needs to be running and the way its result arrives. */
type RecoverableStep = {
    description: string;
    flow: StateValue;
    context: Parameters<typeof createActorAtState>[1];
    sendFailure: (actor: ActorAtState, error: MFAError) => void;
};

// The authorize actor is where both kinds of recoverable failure meet, so the cross-cutting cases run there.
const SIGNING_CHALLENGE_STEP: RecoverableStep = {
    description: 'signing the challenge',
    flow: {[MFA_STATE.PROMPT]: {[MFA_STATE.AUTHORIZING]: MFA_STATE.SIGNING_CHALLENGE}},
    context: {registrationChallenge: MFA_TEST_REGISTRATION_CHALLENGE, isRegistrationComplete: true, softPromptApproved: true},
    sendFailure: (actor, error) => sendAuthorizeDone(actor, {success: false, error}),
};

const RECOVERABLE_STEPS: RecoverableStep[] = [
    {
        description: 'requesting the registration challenge',
        flow: {[MFA_STATE.VALIDATE_CODE]: MFA_STATE.REQUESTING_REGISTRATION_CHALLENGE},
        context: {validateCode: '123456'},
        sendFailure: (actor, error) => sendRequestRegistrationChallengeDone(actor, {success: false, error}),
    },
    {
        description: 'registering the key',
        flow: {[MFA_STATE.PROMPT]: {[MFA_STATE.CREATING_CREDENTIAL]: MFA_STATE.REGISTERING_KEY}},
        context: {registrationChallenge: MFA_TEST_REGISTRATION_CHALLENGE, registrationKeyInfo: MFA_TEST_KEY_INFO, softPromptApproved: true},
        sendFailure: (actor, error) => sendRegisterCredentialDone(actor, {success: false, error}),
    },
    SIGNING_CHALLENGE_STEP,
    {
        description: 'executing the scenario action',
        flow: {[MFA_STATE.PROMPT]: {[MFA_STATE.AUTHORIZING]: MFA_STATE.EXECUTING_SCENARIO_ACTION}},
        context: {signedChallenge: MFA_TEST_SIGNED_CHALLENGE, authenticationMethod: MFA_TEST_AUTH_METHOD, isRegistrationComplete: true, softPromptApproved: true},
        sendFailure: (actor, error) => sendExecuteScenarioActionDone(actor, {success: false, error}),
    },
];

function startAt(step: RecoverableStep, contextOverrides: Parameters<typeof createActorAtState>[1] = {}) {
    const actor = createActorAtState({[MFA_STATE.OPEN]: {[MFA_STATE.FLOW]: step.flow}}, {...step.context, ...contextOverrides});
    actor.start();
    return actor;
}

// The graph-traversal suites never reach recovery on their own, because it depends on the
// once-per-flow flag in context. This suite pins where recovery goes, what it clears and when it
// gives up, by hand.

describe('MFA recovery', () => {
    let runAfterTransitionSpy: jest.SpyInstance;

    beforeEach(() => {
        jest.clearAllMocks();
        runAfterTransitionSpy = jest.spyOn(Navigation, 'runAfterTransition').mockReturnValue({cancel: () => {}});
    });

    afterEach(() => {
        runAfterTransitionSpy.mockRestore();
    });

    describe.each(RECOVERABLE_STEPS)('a recoverable failure while $description', (step) => {
        it.each([REGISTRATION_REQUIRED_ERROR, KEY_NOT_FOUND_ERROR, KEY_ACCESS_FAILED_ERROR, WEBAUTHN_NO_MATCHING_ERROR])(
            'goes back to the validate-code screen and emails a new code for $reason',
            (error) => {
                const actor = startAt(step);

                step.sendFailure(actor, error);

                const result = actor.getSnapshot();
                expect(result.matches(AWAITING_CODE_INPUT)).toBe(true);
                expect(requestValidateCodeActionMock).toHaveBeenCalledTimes(1);
                // Every step re-enters the validate-code screen state, including the one already under it.
                // `mfaNavigate` ignores a navigation to the screen already shown; the page remounts its form
                // instead, which `ValidateCodePage.test.tsx` covers.
                expect(runAfterTransitionSpy).toHaveBeenCalledTimes(1);

                actor.stop();
            },
        );

        it('clears what the failed attempt produced and spends the flow’s one recovery', () => {
            const actor = startAt(step);
            const contextBefore = actor.getSnapshot().context;

            step.sendFailure(actor, REGISTRATION_REQUIRED_ERROR);

            const {context} = actor.getSnapshot();
            expect(context).toMatchObject({
                error: undefined,
                validateCode: undefined,
                registrationChallenge: undefined,
                registrationKeyInfo: undefined,
                authenticationMethod: undefined,
                signedChallenge: undefined,
                isRegistrationComplete: false,
                softPromptApproved: false,
                hasAttemptedRecovery: true,
            });
            expect(context.accountID).toBe(contextBefore.accountID);
            expect(context.scenarioName).toBe(contextBefore.scenarioName);
            expect(context.payload).toBe(contextBefore.payload);
            expect(context.runScenarioAction).toBe(contextBefore.runScenarioAction);
            expect(context.registrationStateAtStart).toBe(contextBefore.registrationStateAtStart);

            actor.stop();
        });

        it('lands on the outcome with the second failure’s own error once the flow already recovered', () => {
            const actor = startAt(step, {hasAttemptedRecovery: true});

            step.sendFailure(actor, KEY_NOT_FOUND_ERROR);

            const result = actor.getSnapshot();
            expect(result.matches(OUTCOME)).toBe(true);
            expect(result.context.error).toBe(KEY_NOT_FOUND_ERROR);
            expect(requestValidateCodeActionMock).not.toHaveBeenCalled();

            actor.stop();
        });
    });

    describe('the server key list', () => {
        it('is cleared, with a breadcrumb, when the server says the key needs registering again', () => {
            const actor = startAt(SIGNING_CHALLENGE_STEP);

            sendAuthorizeDone(actor, {success: false, error: REGISTRATION_REQUIRED_ERROR});

            expect(clearLocalMFAPublicKeyListMock).toHaveBeenCalledTimes(1);
            expect(mockAddMFABreadcrumb).toHaveBeenCalledWith('Re-registration triggered', REGISTRATION_REQUIRED_ERROR, 'warning');

            actor.stop();
        });

        // The authorize actor already deleted the broken key and left its own breadcrumb.
        it('is left alone when the local key is the broken part', () => {
            const actor = startAt(SIGNING_CHALLENGE_STEP);

            sendAuthorizeDone(actor, {success: false, error: KEY_ACCESS_FAILED_ERROR});

            expect(clearLocalMFAPublicKeyListMock).not.toHaveBeenCalled();
            expect(mockAddMFABreadcrumb).not.toHaveBeenCalledWith('Re-registration triggered', expect.anything(), expect.anything());

            actor.stop();
        });
    });

    describe('failures a fresh registration cannot fix', () => {
        it.each([
            createLocalMFAError(REASON.LOCAL_ERRORS.HSM.CANCELED, 'Recovery spec user cancel'),
            createLocalMFAError(REASON.LOCAL_ERRORS.HSM.LOCKOUT, 'Recovery spec lockout'),
            createMFAErrorFromApiResponse(400, REASON.CLIENT_ERRORS.UNRECOGNIZED, 'Recovery spec unrecognized rejection'),
        ])('land on the outcome for $reason, as before', (error) => {
            const actor = startAt(SIGNING_CHALLENGE_STEP);

            sendAuthorizeDone(actor, {success: false, error});

            const result = actor.getSnapshot();
            expect(result.matches(OUTCOME)).toBe(true);
            expect(result.context.error).toBe(error);
            expect(result.context.hasAttemptedRecovery).toBe(false);
            expect(requestValidateCodeActionMock).not.toHaveBeenCalled();
            expect(clearLocalMFAPublicKeyListMock).not.toHaveBeenCalled();

            actor.stop();
        });
    });

    describe('the once-per-flow limit', () => {
        it('takes the ordinary cancel path during recovery and is reset once the modal closes, so the next flow gets its own attempt', () => {
            const actor = startAt(SIGNING_CHALLENGE_STEP);
            sendAuthorizeDone(actor, {success: false, error: REGISTRATION_REQUIRED_ERROR});
            expect(actor.getSnapshot().context.hasAttemptedRecovery).toBe(true);

            actor.send({type: 'REQUEST_CANCEL'});
            actor.send({type: 'CONFIRM_CANCEL'});
            actor.send(createActorDoneEvent('cancelScenario', MFA_TEST_CANCEL_ERROR));
            sendFinalizeOutcomeDone(actor, MFA_TEST_FINALIZE_OUTCOME_SHOW_SCREEN);
            expect(actor.getSnapshot().matches({[MFA_STATE.OPEN]: {[MFA_STATE.FLOW]: {[MFA_STATE.OUTCOME]: MFA_STATE.FAILURE}}})).toBe(true);
            expect(actor.getSnapshot().context.error).toBe(MFA_TEST_CANCEL_ERROR);

            actor.send({type: 'REQUEST_CANCEL'});
            actor.send({type: 'MODAL_CLOSED'});
            expect(actor.getSnapshot().matches(MFA_STATE.CLOSED)).toBe(true);
            expect(actor.getSnapshot().context.hasAttemptedRecovery).toBe(false);

            actor.send(createInitEvent());
            expect(actor.getSnapshot().context.hasAttemptedRecovery).toBe(false);

            actor.stop();
        });
    });
});
