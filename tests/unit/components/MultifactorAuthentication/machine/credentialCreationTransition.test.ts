import mfaMachine from '@components/MultifactorAuthentication/machine/mfaMachine';
import type {CreateCredentialInput, CreateCredentialOutput} from '@components/MultifactorAuthentication/machine/types';

import {createLocalMFAError} from '@libs/MultifactorAuthentication/shared/MFAResult';

import CONST from '@src/CONST';

import {createActorAtState, sendCreateCredentialDone, sendReadHasAcceptedSoftPromptDone} from 'tests/utils/mfa/flowActors';
import createInitEvent, {MFA_TEST_REGISTRATION_CHALLENGE} from 'tests/utils/mfa/flowFixtures';
import waitForBatchedUpdates from 'tests/utils/waitForBatchedUpdates';
import {createActor, fromPromise} from 'xstate';

const MFA_STATE = CONST.MULTIFACTOR_AUTHENTICATION.MFA_STATE;
const REASON = CONST.MULTIFACTOR_AUTHENTICATION.REASON;

// The graph-traversal suites generate their expectations from the machine, so a transition pointed at
// a wrong target adjusts those expectations and still passes. This suite pins the two entries into
// credential creation and the actor-outcome routing by hand. `softPromptTransition.test.ts` keeps
// passing untouched because `createFlowContext` leaves `registrationChallenge` undefined.

describe('MFA credential creation', () => {
    describe('soft-prompt approval', () => {
        it('moves to credential creation when a registration challenge is pending', () => {
            const actor = createActorAtState({[MFA_STATE.OPEN]: {[MFA_STATE.PROMPT]: MFA_STATE.AWAITING_SOFT_PROMPT}}, {registrationChallenge: MFA_TEST_REGISTRATION_CHALLENGE});

            actor.start();
            actor.send({type: 'SOFT_PROMPT_APPROVED'});

            const result = actor.getSnapshot();
            expect(result.matches({[MFA_STATE.OPEN]: MFA_STATE.CREATING_CREDENTIAL})).toBe(true);
            expect(result.context.softPromptApproved).toBe(true);

            actor.stop();
        });

        it('reaches the success outcome without a pending challenge (returning user)', () => {
            const actor = createActorAtState({[MFA_STATE.OPEN]: {[MFA_STATE.PROMPT]: MFA_STATE.AWAITING_SOFT_PROMPT}});

            actor.start();
            actor.send({type: 'SOFT_PROMPT_APPROVED'});

            const result = actor.getSnapshot();
            expect(result.matches({[MFA_STATE.OPEN]: {[MFA_STATE.OUTCOME]: MFA_STATE.SUCCESS}})).toBe(true);

            actor.stop();
        });
    });

    describe('soft-prompt acceptance read', () => {
        it('moves to credential creation when acceptance was already stored and a challenge is pending', () => {
            const actor = createActorAtState(
                {[MFA_STATE.OPEN]: {[MFA_STATE.PREPARING]: MFA_STATE.CHECKING_SOFT_PROMPT_ACCEPTANCE}},
                {registrationChallenge: MFA_TEST_REGISTRATION_CHALLENGE},
            );

            actor.start();
            sendReadHasAcceptedSoftPromptDone(actor, true);

            expect(actor.getSnapshot().matches({[MFA_STATE.OPEN]: MFA_STATE.CREATING_CREDENTIAL})).toBe(true);

            actor.stop();
        });

        it('reaches the success outcome when acceptance was stored without a pending challenge', () => {
            const actor = createActorAtState({[MFA_STATE.OPEN]: {[MFA_STATE.PREPARING]: MFA_STATE.CHECKING_SOFT_PROMPT_ACCEPTANCE}});

            actor.start();
            sendReadHasAcceptedSoftPromptDone(actor, true);

            expect(actor.getSnapshot().matches({[MFA_STATE.OPEN]: {[MFA_STATE.OUTCOME]: MFA_STATE.SUCCESS}})).toBe(true);

            actor.stop();
        });

        it('shows the prompt when acceptance was not stored, regardless of a pending challenge', () => {
            const actor = createActorAtState(
                {[MFA_STATE.OPEN]: {[MFA_STATE.PREPARING]: MFA_STATE.CHECKING_SOFT_PROMPT_ACCEPTANCE}},
                {registrationChallenge: MFA_TEST_REGISTRATION_CHALLENGE},
            );

            actor.start();
            sendReadHasAcceptedSoftPromptDone(actor, false);

            expect(actor.getSnapshot().matches({[MFA_STATE.OPEN]: {[MFA_STATE.PROMPT]: MFA_STATE.AWAITING_SOFT_PROMPT}})).toBe(true);

            actor.stop();
        });
    });

    describe('createCredential actor outcome', () => {
        it('reaches the success outcome when the actor resolves successfully', () => {
            const actor = createActorAtState({[MFA_STATE.OPEN]: MFA_STATE.CREATING_CREDENTIAL}, {registrationChallenge: MFA_TEST_REGISTRATION_CHALLENGE});

            actor.start();
            sendCreateCredentialDone(actor, {success: true});

            expect(actor.getSnapshot().matches({[MFA_STATE.OPEN]: {[MFA_STATE.OUTCOME]: MFA_STATE.SUCCESS}})).toBe(true);

            actor.stop();
        });

        it('reaches the failure outcome carrying the exact reason when the actor resolves with a failure', () => {
            const actor = createActorAtState({[MFA_STATE.OPEN]: MFA_STATE.CREATING_CREDENTIAL}, {registrationChallenge: MFA_TEST_REGISTRATION_CHALLENGE});
            const failureError = createLocalMFAError(REASON.LOCAL_ERRORS.HSM.KEY_CREATION_FAILED, 'Credential creation transition spec failure');

            actor.start();
            sendCreateCredentialDone(actor, {success: false, error: failureError});

            const result = actor.getSnapshot();
            expect(result.matches({[MFA_STATE.OPEN]: {[MFA_STATE.OUTCOME]: MFA_STATE.FAILURE}})).toBe(true);
            expect(result.context.error).toBe(failureError);

            actor.stop();
        });

        it('reaches the failure outcome with an unhandled-exception error when the actor rejects', async () => {
            // `resolveState` can't jump straight into `creatingCredential` and have the invoke fire —
            // XState only invokes an actor on a live transition into a state, not a snapshot resolved
            // already inside it. So we start one hop earlier and send the real approval event, which
            // drives an actual transition and lets the mocked actor genuinely run and reject.
            const machine = mfaMachine.provide({
                actors: {
                    createCredential: fromPromise<CreateCredentialOutput, CreateCredentialInput>(() => Promise.reject(new Error('Credential registration exploded'))),
                },
            });
            const snapshot = machine.resolveState({
                value: {[MFA_STATE.OPEN]: {[MFA_STATE.PROMPT]: MFA_STATE.AWAITING_SOFT_PROMPT}},
                context: {
                    accountID: 12345,
                    error: undefined,
                    scenarioName: createInitEvent().scenarioName,
                    scenario: createInitEvent().scenario,
                    payload: undefined,
                    validateCode: undefined,
                    registrationChallenge: MFA_TEST_REGISTRATION_CHALLENGE,
                    softPromptApproved: false,
                    isCancelConfirmVisible: false,
                },
            });
            const actor = createActor(machine, {snapshot});

            actor.start();
            actor.send({type: 'SOFT_PROMPT_APPROVED'});
            await waitForBatchedUpdates();

            const result = actor.getSnapshot();
            expect(result.matches({[MFA_STATE.OPEN]: {[MFA_STATE.OUTCOME]: MFA_STATE.FAILURE}})).toBe(true);
            expect(result.context.error?.reason).toBe(REASON.LOCAL_ERRORS.UNHANDLED_EXCEPTION);
            expect(result.context.error?.message).toContain('Credential registration threw:');

            actor.stop();
        });
    });
});
