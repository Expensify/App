import mfaMachine from '@components/MultifactorAuthentication/machine/mfaMachine';
import snapshotToState from '@components/MultifactorAuthentication/machine/snapshotToState';
import type {CreateCredentialInput, CreateCredentialOutput} from '@components/MultifactorAuthentication/machine/types';

import {createLocalMFAError} from '@libs/MultifactorAuthentication/shared/MFAResult';

import CONST from '@src/CONST';

import {createActorAtState, createFlowContext, sendCreateCredentialDone} from 'tests/utils/mfa/flowActors';
import {MFA_TEST_REGISTRATION_CHALLENGE} from 'tests/utils/mfa/flowFixtures';
import waitForBatchedUpdates from 'tests/utils/waitForBatchedUpdates';
import {createActor, fromPromise} from 'xstate';

const MFA_STATE = CONST.MULTIFACTOR_AUTHENTICATION.MFA_STATE;
const REASON = CONST.MULTIFACTOR_AUTHENTICATION.REASON;

// The graph-traversal suites generate their expectations from the machine, so a transition pointed at
// a wrong target adjusts those expectations and still passes. This suite pins the single entry into
// credential creation and the actor-outcome routing by hand.

describe('MFA credential creation', () => {
    describe('soft-prompt approval', () => {
        it('moves to credential creation when a registration challenge is pending', () => {
            const actor = createActorAtState({[MFA_STATE.OPEN]: {[MFA_STATE.PROMPT]: MFA_STATE.AWAITING_SOFT_PROMPT}}, {registrationChallenge: MFA_TEST_REGISTRATION_CHALLENGE});

            actor.start();
            actor.send({type: 'SOFT_PROMPT_APPROVED'});

            const result = actor.getSnapshot();
            expect(result.matches({[MFA_STATE.OPEN]: {[MFA_STATE.PROMPT]: MFA_STATE.CREATING_CREDENTIAL}})).toBe(true);
            expect(snapshotToState(result).isProcessingPrompt).toBe(true);
            expect(result.context.softPromptApproved).toBe(true);

            actor.stop();
        });

        it('moves to authorizing without a pending challenge (returning user)', () => {
            const actor = createActorAtState({[MFA_STATE.OPEN]: {[MFA_STATE.PROMPT]: MFA_STATE.AWAITING_SOFT_PROMPT}});

            actor.start();
            actor.send({type: 'SOFT_PROMPT_APPROVED'});

            const result = actor.getSnapshot();
            expect(result.matches({[MFA_STATE.OPEN]: {[MFA_STATE.PROMPT]: MFA_STATE.AUTHORIZING}})).toBe(true);
            expect(snapshotToState(result).isProcessingPrompt).toBe(true);

            actor.stop();
        });

        it('does not mark the prompt as processing when the flow is cancelled', () => {
            const actor = createActorAtState({[MFA_STATE.OPEN]: {[MFA_STATE.PROMPT]: MFA_STATE.AWAITING_SOFT_PROMPT}});

            actor.start();
            actor.send({type: 'CLOSE_MODAL'});

            const result = actor.getSnapshot();
            expect(result.matches(MFA_STATE.CLOSING)).toBe(true);
            expect(snapshotToState(result).isProcessingPrompt).toBe(false);

            actor.stop();
        });
    });

    describe('createCredential actor outcome', () => {
        it('invokes createCredential with the account and registration challenge stored in machine context', async () => {
            const accountID = 67890;
            let receivedInput: CreateCredentialInput | undefined;
            const machine = mfaMachine.provide({
                actors: {
                    createCredential: fromPromise<CreateCredentialOutput, CreateCredentialInput>(({input}) => {
                        receivedInput = input;
                        return new Promise<CreateCredentialOutput>(() => {});
                    }),
                },
            });
            const snapshot = machine.resolveState({
                value: {[MFA_STATE.OPEN]: {[MFA_STATE.PROMPT]: MFA_STATE.AWAITING_SOFT_PROMPT}},
                context: createFlowContext({accountID, registrationChallenge: MFA_TEST_REGISTRATION_CHALLENGE}),
            });
            const actor = createActor(machine, {snapshot});

            actor.start();
            actor.send({type: 'SOFT_PROMPT_APPROVED'});
            await waitForBatchedUpdates();

            expect(receivedInput).toEqual({accountID, registrationChallenge: MFA_TEST_REGISTRATION_CHALLENGE});

            actor.stop();
        });

        it('moves to authorizing when the actor resolves successfully', () => {
            const actor = createActorAtState({[MFA_STATE.OPEN]: {[MFA_STATE.PROMPT]: MFA_STATE.CREATING_CREDENTIAL}}, {registrationChallenge: MFA_TEST_REGISTRATION_CHALLENGE});

            actor.start();
            sendCreateCredentialDone(actor, {success: true});

            expect(actor.getSnapshot().matches({[MFA_STATE.OPEN]: {[MFA_STATE.PROMPT]: MFA_STATE.AUTHORIZING}})).toBe(true);

            actor.stop();
        });

        it('reaches the failure outcome carrying the exact reason when the actor resolves with a failure', () => {
            const actor = createActorAtState({[MFA_STATE.OPEN]: {[MFA_STATE.PROMPT]: MFA_STATE.CREATING_CREDENTIAL}}, {registrationChallenge: MFA_TEST_REGISTRATION_CHALLENGE});
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
                context: createFlowContext({registrationChallenge: MFA_TEST_REGISTRATION_CHALLENGE}),
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
