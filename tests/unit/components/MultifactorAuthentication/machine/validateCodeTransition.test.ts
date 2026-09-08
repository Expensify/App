import mfaMachine from '@components/MultifactorAuthentication/machine/mfaMachine';
import snapshotToState from '@components/MultifactorAuthentication/machine/snapshotToState';
import type {LoadRegistrationStateInput, LoadRegistrationStateOutput, ValidateDeviceInput} from '@components/MultifactorAuthentication/machine/types';

import type {MFAResult} from '@libs/MultifactorAuthentication/shared/MFAResult';

import {requestRegistrationChallenge} from '@userActions/MultifactorAuthentication';
import type * as MultifactorAuthenticationActions from '@userActions/MultifactorAuthentication';
import {requestValidateCodeAction} from '@userActions/User';
import type * as UserActions from '@userActions/User';

import CONST from '@src/CONST';

import {CONST as COMMON_CONST} from 'expensify-common';
import {createActorAtState, sendLoadRegistrationStateDone} from 'tests/utils/mfa/flowActors';
import createInitEvent, {MFA_TEST_REGISTRATION_CHALLENGE, MFA_TEST_VALIDATE_CODE} from 'tests/utils/mfa/flowFixtures';
import waitForBatchedUpdates from 'tests/utils/waitForBatchedUpdates';
import {createActor, fromPromise} from 'xstate';

// The machine fires the validate-code email request, which is a backend call this suite only observes.
jest.mock('@userActions/User', () => ({
    ...jest.requireActual<typeof UserActions>('@userActions/User'),
    requestValidateCodeAction: jest.fn(),
}));
jest.mock('@userActions/MultifactorAuthentication', () => ({
    ...jest.requireActual<typeof MultifactorAuthenticationActions>('@userActions/MultifactorAuthentication'),
    requestRegistrationChallenge: jest.fn(),
}));

const MFA_STATE = CONST.MULTIFACTOR_AUTHENTICATION.MFA_STATE;
const REASON = CONST.MULTIFACTOR_AUTHENTICATION.REASON;

const requestValidateCodeActionMock = jest.mocked(requestValidateCodeAction);
const requestRegistrationChallengeMock = jest.mocked(requestRegistrationChallenge);
type RegistrationChallengeResponse = Awaited<ReturnType<typeof requestRegistrationChallenge>>;
const VALID_REGISTRATION_CHALLENGE_RESPONSE = {
    httpStatusCode: 200,
    reason: undefined,
    message: undefined,
    challenge: MFA_TEST_REGISTRATION_CHALLENGE,
    publicKeys: [],
} satisfies RegistrationChallengeResponse;
const INVALID_CODE_RESPONSE = {
    httpStatusCode: 400,
    reason: REASON.CLIENT_ERRORS.INVALID_VALIDATE_CODE,
    message: 'Invalid code for the transition spec',
    challenge: undefined,
    publicKeys: undefined,
} satisfies RegistrationChallengeResponse;
const MISSING_REGISTRATION_CHALLENGE_RESPONSE = {
    httpStatusCode: 200,
    reason: undefined,
    message: undefined,
    challenge: undefined,
    publicKeys: [],
} satisfies RegistrationChallengeResponse;
const FATAL_REGISTRATION_CHALLENGE_RESPONSE = {
    httpStatusCode: 500,
    reason: REASON.SERVER_ERRORS.UNRECOGNIZED,
    message: 'Fatal registration challenge rejection',
    challenge: undefined,
    publicKeys: undefined,
} satisfies RegistrationChallengeResponse;

// The graph-traversal suites generate their expectations from the machine, so a transition pointed at
// a wrong target adjusts those expectations and still passes. This suite pins the registration
// decision and the validate-code loop by hand, including that only the decision transition and an
// explicit resend request may send the validate-code email.

describe('MFA validate code and registration decision', () => {
    beforeEach(() => {
        requestValidateCodeActionMock.mockClear();
        requestRegistrationChallengeMock.mockReset();
        requestRegistrationChallengeMock.mockImplementation(
            () =>
                new Promise(() => {
                    // Keep the actor pending so the test can assert the challenge-request gate.
                }),
        );
    });

    it('requests a validate code exactly once when a fresh registration reaches the validate-code screen', () => {
        const actor = createActorAtState({[MFA_STATE.OPEN]: {[MFA_STATE.PREPARING]: MFA_STATE.DECIDING_REGISTRATION}});

        actor.start();
        sendLoadRegistrationStateDone(actor, {hasLocalCredentials: false, hasEverAcceptedSoftPrompt: false});

        expect(actor.getSnapshot().matches({[MFA_STATE.OPEN]: {[MFA_STATE.VALIDATE_CODE]: MFA_STATE.AWAITING_VALIDATE_CODE}})).toBe(true);
        expect(requestValidateCodeActionMock).toHaveBeenCalledTimes(1);
        expect(requestValidateCodeActionMock).toHaveBeenCalledWith({reasonCode: COMMON_CONST.VALIDATE_CODE_REASONS.REGISTER_AUTHENTICATION_KEY});

        actor.stop();
    });

    it('skips the validate code for a returning user whose credentials the server knows', () => {
        const actor = createActorAtState({[MFA_STATE.OPEN]: {[MFA_STATE.PREPARING]: MFA_STATE.DECIDING_REGISTRATION}});

        actor.start();
        sendLoadRegistrationStateDone(actor, {hasLocalCredentials: true, hasEverAcceptedSoftPrompt: false});

        expect(actor.getSnapshot().matches({[MFA_STATE.OPEN]: {[MFA_STATE.PROMPT]: MFA_STATE.AWAITING_SOFT_PROMPT}})).toBe(true);
        expect(requestValidateCodeActionMock).not.toHaveBeenCalled();

        actor.stop();
    });

    it('sends a fresh validate-code email and stays on the screen when the user requests a resend', () => {
        const actor = createActorAtState({[MFA_STATE.OPEN]: {[MFA_STATE.VALIDATE_CODE]: MFA_STATE.AWAITING_VALIDATE_CODE}});

        actor.start();
        actor.send({type: 'RESEND_VALIDATE_CODE'});

        expect(actor.getSnapshot().matches({[MFA_STATE.OPEN]: {[MFA_STATE.VALIDATE_CODE]: MFA_STATE.AWAITING_VALIDATE_CODE}})).toBe(true);
        expect(requestValidateCodeActionMock).toHaveBeenCalledTimes(1);

        actor.stop();
    });

    it('clears the inline error when the user requests a resend after a rejected code', () => {
        const actor = createActorAtState({[MFA_STATE.OPEN]: {[MFA_STATE.VALIDATE_CODE]: {[MFA_STATE.AWAITING_VALIDATE_CODE]: MFA_STATE.INVALID_CODE}}});

        actor.start();
        actor.send({type: 'RESEND_VALIDATE_CODE'});

        const result = actor.getSnapshot();
        expect(result.matches({[MFA_STATE.OPEN]: {[MFA_STATE.VALIDATE_CODE]: {[MFA_STATE.AWAITING_VALIDATE_CODE]: MFA_STATE.AWAITING_INPUT}}})).toBe(true);
        expect(snapshotToState(result).showsInvalidCodeError).toBe(false);
        expect(requestValidateCodeActionMock).toHaveBeenCalledTimes(1);

        actor.stop();
    });

    it('drops a resend request while the registration challenge request is in flight', () => {
        const actor = createActorAtState({[MFA_STATE.OPEN]: {[MFA_STATE.VALIDATE_CODE]: MFA_STATE.AWAITING_VALIDATE_CODE}});

        actor.start();
        actor.send({type: 'VALIDATE_CODE_ENTERED', validateCode: MFA_TEST_VALIDATE_CODE});
        actor.send({type: 'RESEND_VALIDATE_CODE'});

        expect(actor.getSnapshot().matches({[MFA_STATE.OPEN]: {[MFA_STATE.VALIDATE_CODE]: MFA_STATE.REQUESTING_REGISTRATION_CHALLENGE}})).toBe(true);
        expect(requestValidateCodeActionMock).not.toHaveBeenCalled();

        actor.stop();
    });

    it('stores the submitted code and waits for a registration challenge before continuing', () => {
        const actor = createActorAtState({[MFA_STATE.OPEN]: {[MFA_STATE.VALIDATE_CODE]: MFA_STATE.AWAITING_VALIDATE_CODE}});

        actor.start();
        actor.send({type: 'VALIDATE_CODE_ENTERED', validateCode: MFA_TEST_VALIDATE_CODE});

        const result = actor.getSnapshot();
        expect(result.matches({[MFA_STATE.OPEN]: {[MFA_STATE.VALIDATE_CODE]: MFA_STATE.REQUESTING_REGISTRATION_CHALLENGE}})).toBe(true);
        expect(snapshotToState(result).isValidateCodeFormSubmitting).toBe(true);
        expect(result.context.validateCode).toBe(MFA_TEST_VALIDATE_CODE);
        expect(result.context.registrationChallenge).toBeUndefined();
        expect(requestRegistrationChallengeMock).toHaveBeenCalledWith(MFA_TEST_VALIDATE_CODE);

        actor.stop();
    });

    it('stores a valid registration challenge before continuing the flow', async () => {
        const actor = createActorAtState({[MFA_STATE.OPEN]: {[MFA_STATE.VALIDATE_CODE]: MFA_STATE.AWAITING_VALIDATE_CODE}});
        requestRegistrationChallengeMock.mockResolvedValue(VALID_REGISTRATION_CHALLENGE_RESPONSE);

        actor.start();
        actor.send({type: 'VALIDATE_CODE_ENTERED', validateCode: MFA_TEST_VALIDATE_CODE});
        await waitForBatchedUpdates();

        const result = actor.getSnapshot();
        expect(result.matches({[MFA_STATE.OPEN]: {[MFA_STATE.VALIDATE_CODE]: MFA_STATE.REQUESTING_REGISTRATION_CHALLENGE}})).toBe(false);
        // Still true on purpose - the screen stays mounted while it animates out to the prompt screen.
        expect(snapshotToState(result).isValidateCodeFormSubmitting).toBe(true);
        expect(result.context.validateCode).toBeUndefined();
        expect(result.context.registrationChallenge).toBe(MFA_TEST_REGISTRATION_CHALLENGE);
        expect(result.context.error).toBeUndefined();

        actor.stop();
    });

    it('stays on the validate-code screen with an inline error and no new email when the code is invalid', async () => {
        const actor = createActorAtState({[MFA_STATE.OPEN]: {[MFA_STATE.VALIDATE_CODE]: MFA_STATE.AWAITING_VALIDATE_CODE}});
        requestRegistrationChallengeMock.mockResolvedValue(INVALID_CODE_RESPONSE);

        actor.start();
        actor.send({type: 'VALIDATE_CODE_ENTERED', validateCode: MFA_TEST_VALIDATE_CODE});
        await waitForBatchedUpdates();

        const result = actor.getSnapshot();
        expect(result.matches({[MFA_STATE.OPEN]: {[MFA_STATE.VALIDATE_CODE]: {[MFA_STATE.AWAITING_VALIDATE_CODE]: MFA_STATE.INVALID_CODE}}})).toBe(true);
        expect(snapshotToState(result).showsInvalidCodeError).toBe(true);
        expect(result.context.validateCode).toBeUndefined();
        expect(result.context.registrationChallenge).toBeUndefined();
        expect(result.context.error).toBeUndefined();
        expect(requestValidateCodeActionMock).not.toHaveBeenCalled();

        actor.stop();
    });

    it('clears the inline error when the rejected code is submitted again without editing', async () => {
        const actor = createActorAtState({[MFA_STATE.OPEN]: {[MFA_STATE.VALIDATE_CODE]: MFA_STATE.AWAITING_VALIDATE_CODE}});
        requestRegistrationChallengeMock.mockResolvedValueOnce(INVALID_CODE_RESPONSE).mockResolvedValueOnce(VALID_REGISTRATION_CHALLENGE_RESPONSE);

        actor.start();
        actor.send({type: 'VALIDATE_CODE_ENTERED', validateCode: MFA_TEST_VALIDATE_CODE});
        await waitForBatchedUpdates();
        expect(snapshotToState(actor.getSnapshot()).showsInvalidCodeError).toBe(true);
        actor.send({type: 'VALIDATE_CODE_ENTERED', validateCode: MFA_TEST_VALIDATE_CODE});
        await waitForBatchedUpdates();

        const result = actor.getSnapshot();
        expect(result.context.registrationChallenge).toBe(MFA_TEST_REGISTRATION_CHALLENGE);
        expect(result.context.validateCode).toBeUndefined();
        expect(snapshotToState(result).showsInvalidCodeError).toBe(false);

        actor.stop();
    });

    it('ends the flow with the failure outcome when the challenge request fails fatally', async () => {
        const actor = createActorAtState({[MFA_STATE.OPEN]: {[MFA_STATE.VALIDATE_CODE]: MFA_STATE.AWAITING_VALIDATE_CODE}});
        requestRegistrationChallengeMock.mockResolvedValue(FATAL_REGISTRATION_CHALLENGE_RESPONSE);

        actor.start();
        actor.send({type: 'VALIDATE_CODE_ENTERED', validateCode: MFA_TEST_VALIDATE_CODE});
        await waitForBatchedUpdates();

        const result = actor.getSnapshot();
        expect(result.matches({[MFA_STATE.OPEN]: {[MFA_STATE.OUTCOME]: MFA_STATE.FAILURE}})).toBe(true);
        expect(result.context.validateCode).toBeUndefined();
        expect(result.context.error?.reason).toBe(REASON.SERVER_ERRORS.UNRECOGNIZED);
        expect(result.context.registrationChallenge).toBeUndefined();

        actor.stop();
    });

    it('does not continue when a successful response has no valid registration challenge', async () => {
        const actor = createActorAtState({[MFA_STATE.OPEN]: {[MFA_STATE.VALIDATE_CODE]: MFA_STATE.AWAITING_VALIDATE_CODE}});
        requestRegistrationChallengeMock.mockResolvedValue(MISSING_REGISTRATION_CHALLENGE_RESPONSE);

        actor.start();
        actor.send({type: 'VALIDATE_CODE_ENTERED', validateCode: MFA_TEST_VALIDATE_CODE});
        await waitForBatchedUpdates();

        const result = actor.getSnapshot();
        expect(result.matches({[MFA_STATE.OPEN]: {[MFA_STATE.OUTCOME]: MFA_STATE.FAILURE}})).toBe(true);
        expect(result.context.validateCode).toBeUndefined();
        expect(result.context.error?.reason).toBe(REASON.LOCAL_ERRORS.UNHANDLED_API_RESPONSE);
        expect(result.context.registrationChallenge).toBeUndefined();

        actor.stop();
    });

    it('clears the inline error when the user starts typing again', () => {
        const actor = createActorAtState({[MFA_STATE.OPEN]: {[MFA_STATE.VALIDATE_CODE]: {[MFA_STATE.AWAITING_VALIDATE_CODE]: MFA_STATE.INVALID_CODE}}});

        actor.start();
        actor.send({type: 'VALIDATE_CODE_CHANGED'});

        const result = actor.getSnapshot();
        expect(result.matches({[MFA_STATE.OPEN]: {[MFA_STATE.VALIDATE_CODE]: {[MFA_STATE.AWAITING_VALIDATE_CODE]: MFA_STATE.AWAITING_INPUT}}})).toBe(true);
        expect(snapshotToState(result).showsInvalidCodeError).toBe(false);

        actor.stop();
    });

    it('ends the current flow with an error when the credentials check rejects', async () => {
        const machine = mfaMachine.provide({
            actors: {
                validateDevice: fromPromise<MFAResult, ValidateDeviceInput>(() => Promise.resolve({success: true})),
                loadRegistrationState: fromPromise<LoadRegistrationStateOutput, LoadRegistrationStateInput>(() => Promise.reject(new Error('Keystore read failed'))),
            },
        });
        const actor = createActor(machine);

        actor.start();
        actor.send(createInitEvent());
        await waitForBatchedUpdates();

        const result = actor.getSnapshot();
        expect(result.matches({[MFA_STATE.OPEN]: {[MFA_STATE.OUTCOME]: MFA_STATE.FAILURE}})).toBe(true);
        expect(result.context.error?.reason).toBe(REASON.LOCAL_ERRORS.UNHANDLED_EXCEPTION);
        expect(result.context.error?.message).toContain('Registration state check threw: Keystore read failed');

        actor.stop();
    });
});
