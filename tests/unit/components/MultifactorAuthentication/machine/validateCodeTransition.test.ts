import mfaMachine from '@components/MultifactorAuthentication/machine/mfaMachine';
import type {CheckLocalCredentialsInput, ValidateDeviceInput} from '@components/MultifactorAuthentication/machine/types';

import type {MFAResult} from '@libs/MultifactorAuthentication/shared/MFAResult';
import {createMFAErrorFromApiResponse} from '@libs/MultifactorAuthentication/shared/MFAResult';

import {requestValidateCodeAction} from '@userActions/User';
import type * as UserActions from '@userActions/User';

import CONST from '@src/CONST';

import {createActorAtState, sendCheckLocalCredentialsDone} from 'tests/utils/mfa/flowActors';
import createInitEvent, {MFA_TEST_VALIDATE_CODE} from 'tests/utils/mfa/flowFixtures';
import waitForBatchedUpdates from 'tests/utils/waitForBatchedUpdates';
import {createActor, fromPromise} from 'xstate';

// The machine fires the magic-code email request, which is a backend call this suite only observes.
jest.mock('@userActions/User', () => ({
    ...jest.requireActual<typeof UserActions>('@userActions/User'),
    requestValidateCodeAction: jest.fn(),
}));

const MFA_STATE = CONST.MULTIFACTOR_AUTHENTICATION.MFA_STATE;
const REASON = CONST.MULTIFACTOR_AUTHENTICATION.REASON;

const requestValidateCodeActionMock = jest.mocked(requestValidateCodeAction);

const INVALID_CODE_ERROR = createMFAErrorFromApiResponse(400, REASON.CLIENT_ERRORS.INVALID_VALIDATE_CODE, 'Invalid code for the transition spec');
const FATAL_CODE_ERROR = createMFAErrorFromApiResponse(400, REASON.CLIENT_ERRORS.UNRECOGNIZED, 'Fatal rejection for the transition spec');

// The graph-traversal suites generate their expectations from the machine, so a transition pointed at
// a wrong target adjusts those expectations and still passes. This suite pins the registration
// decision and the magic-code loop by hand, including that only the decision transition may send the
// magic-code email.

describe('MFA magic code and registration decision', () => {
    beforeEach(() => {
        requestValidateCodeActionMock.mockClear();
    });

    it('requests a validate code exactly once when a fresh registration reaches the magic-code screen', () => {
        const actor = createActorAtState({[MFA_STATE.OPEN]: {[MFA_STATE.PREPARING]: MFA_STATE.DECIDING_REGISTRATION}});

        actor.start();
        sendCheckLocalCredentialsDone(actor, false);

        expect(actor.getSnapshot().matches({[MFA_STATE.OPEN]: MFA_STATE.REQUESTING_VALIDATE_CODE})).toBe(true);
        expect(requestValidateCodeActionMock).toHaveBeenCalledTimes(1);

        actor.stop();
    });

    it('skips the magic code for a returning user whose credentials the server knows', () => {
        const actor = createActorAtState({[MFA_STATE.OPEN]: {[MFA_STATE.PREPARING]: MFA_STATE.DECIDING_REGISTRATION}});

        actor.start();
        sendCheckLocalCredentialsDone(actor, true);

        expect(actor.getSnapshot().matches({[MFA_STATE.OPEN]: {[MFA_STATE.PREPARING]: MFA_STATE.CHECKING_SOFT_PROMPT_ACCEPTANCE}})).toBe(true);
        expect(requestValidateCodeActionMock).not.toHaveBeenCalled();

        actor.stop();
    });

    it('skips the magic code when the flow already carries a code', () => {
        const actor = createActorAtState({[MFA_STATE.OPEN]: {[MFA_STATE.PREPARING]: MFA_STATE.DECIDING_REGISTRATION}}, {validateCode: MFA_TEST_VALIDATE_CODE});

        actor.start();
        sendCheckLocalCredentialsDone(actor, false);

        expect(actor.getSnapshot().matches({[MFA_STATE.OPEN]: {[MFA_STATE.PREPARING]: MFA_STATE.CHECKING_SOFT_PROMPT_ACCEPTANCE}})).toBe(true);
        expect(requestValidateCodeActionMock).not.toHaveBeenCalled();

        actor.stop();
    });

    it('stores the submitted code and continues the flow', () => {
        const actor = createActorAtState({[MFA_STATE.OPEN]: MFA_STATE.REQUESTING_VALIDATE_CODE});

        actor.start();
        actor.send({type: 'VALIDATE_CODE_ENTERED', validateCode: MFA_TEST_VALIDATE_CODE});

        const result = actor.getSnapshot();
        expect(result.matches({[MFA_STATE.OPEN]: {[MFA_STATE.PREPARING]: MFA_STATE.CHECKING_SOFT_PROMPT_ACCEPTANCE}})).toBe(true);
        expect(result.context.validateCode).toBe(MFA_TEST_VALIDATE_CODE);

        actor.stop();
    });

    it('stays on the magic-code screen with an inline error and no new email when the code is invalid', () => {
        const actor = createActorAtState({[MFA_STATE.OPEN]: MFA_STATE.REQUESTING_VALIDATE_CODE});

        actor.start();
        actor.send({type: 'VALIDATE_CODE_REJECTED', error: INVALID_CODE_ERROR});

        const result = actor.getSnapshot();
        expect(result.matches({[MFA_STATE.OPEN]: MFA_STATE.REQUESTING_VALIDATE_CODE})).toBe(true);
        expect(result.context.continuableError).toBe(INVALID_CODE_ERROR);
        expect(result.context.error).toBeUndefined();
        expect(requestValidateCodeActionMock).not.toHaveBeenCalled();

        actor.stop();
    });

    it('ends the flow with the failure outcome when the code rejection is not continuable', () => {
        const actor = createActorAtState({[MFA_STATE.OPEN]: MFA_STATE.REQUESTING_VALIDATE_CODE});

        actor.start();
        actor.send({type: 'VALIDATE_CODE_REJECTED', error: FATAL_CODE_ERROR});

        const result = actor.getSnapshot();
        expect(result.matches({[MFA_STATE.OPEN]: {[MFA_STATE.OUTCOME]: MFA_STATE.FAILURE}})).toBe(true);
        expect(result.context.error).toBe(FATAL_CODE_ERROR);
        expect(result.context.continuableError).toBeUndefined();

        actor.stop();
    });

    it('clears the inline error when the user starts typing again', () => {
        const actor = createActorAtState({[MFA_STATE.OPEN]: MFA_STATE.REQUESTING_VALIDATE_CODE}, {continuableError: INVALID_CODE_ERROR});

        actor.start();
        actor.send({type: 'CLEAR_CONTINUABLE_ERROR'});

        const result = actor.getSnapshot();
        expect(result.matches({[MFA_STATE.OPEN]: MFA_STATE.REQUESTING_VALIDATE_CODE})).toBe(true);
        expect(result.context.continuableError).toBeUndefined();

        actor.stop();
    });

    it('ends the current flow with an error when the credentials check rejects', async () => {
        const machine = mfaMachine.provide({
            actors: {
                validateDevice: fromPromise<MFAResult, ValidateDeviceInput>(() => Promise.resolve({success: true})),
                checkLocalCredentials: fromPromise<boolean, CheckLocalCredentialsInput>(() => Promise.reject(new Error('Keystore read failed'))),
            },
        });
        const actor = createActor(machine);

        actor.start();
        actor.send(createInitEvent());
        await waitForBatchedUpdates();

        const result = actor.getSnapshot();
        expect(result.matches({[MFA_STATE.OPEN]: {[MFA_STATE.OUTCOME]: MFA_STATE.FAILURE}})).toBe(true);
        expect(result.context.error?.reason).toBe(REASON.LOCAL_ERRORS.UNHANDLED_EXCEPTION);
        expect(result.context.error?.message).toContain('Local credentials check threw: Keystore read failed');

        actor.stop();
    });
});
