import mfaMachine from '@components/MultifactorAuthentication/machine/mfaMachine';
import snapshotToState from '@components/MultifactorAuthentication/machine/snapshotToState';
import type {
    CreateCredentialInput,
    CreateCredentialOutput,
    FinalizeOutcomeInput,
    FinalizeOutcomeOutput,
    RegisterCredentialInput,
    RegisterCredentialOutput,
} from '@components/MultifactorAuthentication/machine/types';

import {createLocalMFAError} from '@libs/MultifactorAuthentication/shared/MFAResult';

import CONST from '@src/CONST';

import {createActorAtState, createFlowContext, sendCreateCredentialDone, sendFinalizeOutcomeDone, sendRegisterCredentialDone} from 'tests/utils/mfa/flowActors';
import {MFA_TEST_FINALIZE_OUTCOME_SHOW_SCREEN, MFA_TEST_KEY_INFO, MFA_TEST_REGISTRATION_CHALLENGE} from 'tests/utils/mfa/flowFixtures';
import waitForBatchedUpdates from 'tests/utils/waitForBatchedUpdates';
import {createActor, fromPromise} from 'xstate';

const MFA_STATE = CONST.MULTIFACTOR_AUTHENTICATION.MFA_STATE;
const REASON = CONST.MULTIFACTOR_AUTHENTICATION.REASON;

const AWAITING_SOFT_PROMPT = {[MFA_STATE.OPEN]: {[MFA_STATE.PROMPT]: MFA_STATE.AWAITING_SOFT_PROMPT}};
const CREATING_KEY = {[MFA_STATE.OPEN]: {[MFA_STATE.PROMPT]: {[MFA_STATE.CREATING_CREDENTIAL]: MFA_STATE.CREATING_KEY}}};
const REGISTERING_KEY = {[MFA_STATE.OPEN]: {[MFA_STATE.PROMPT]: {[MFA_STATE.CREATING_CREDENTIAL]: MFA_STATE.REGISTERING_KEY}}};
const AUTHORIZING = {[MFA_STATE.OPEN]: {[MFA_STATE.PROMPT]: MFA_STATE.AUTHORIZING}};
const OUTCOME_FAILURE = {[MFA_STATE.OPEN]: {[MFA_STATE.OUTCOME]: MFA_STATE.FAILURE}};

/**
 * Starts a live actor on the soft prompt with the given actors and approves it. `resolveState` can't
 * jump straight into an invoking state and have the invoke fire, since XState only invokes an actor on
 * a live transition into a state, so the actor starts one hop earlier and the approval drives it in.
 */
function approveSoftPromptWith(actors: Parameters<typeof mfaMachine.provide>[0]['actors'], contextOverrides: Parameters<typeof createFlowContext>[0] = {}) {
    const machine = mfaMachine.provide({actors});
    const snapshot = machine.resolveState({
        value: AWAITING_SOFT_PROMPT,
        context: createFlowContext({registrationChallenge: MFA_TEST_REGISTRATION_CHALLENGE, ...contextOverrides}),
    });
    const actor = createActor(machine, {snapshot});
    actor.start();
    actor.send({type: 'SOFT_PROMPT_APPROVED'});
    return actor;
}

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
            expect(result.matches(CREATING_KEY)).toBe(true);
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
            // Given a pending registration challenge and a ceremony that records its input
            const accountID = 67890;
            let receivedInput: CreateCredentialInput | undefined;
            // When the user approves the soft prompt
            const actor = approveSoftPromptWith(
                {
                    createCredential: fromPromise<CreateCredentialOutput, CreateCredentialInput>(({input}) => {
                        receivedInput = input;
                        return new Promise<CreateCredentialOutput>(() => {});
                    }),
                },
                {accountID},
            );
            await waitForBatchedUpdates();

            // Then the ceremony creates the key for this account against the challenge the backend issued
            expect(receivedInput).toEqual({accountID, registrationChallenge: MFA_TEST_REGISTRATION_CHALLENGE});

            actor.stop();
        });

        it('never registers the key when the flow closes before the ceremony finishes', async () => {
            // Given a ceremony still waiting on the user
            let resolveCeremony: ((output: CreateCredentialOutput) => void) | undefined;
            const registerCredential = jest.fn(() => new Promise<RegisterCredentialOutput>(() => {}));
            const actor = approveSoftPromptWith({
                createCredential: fromPromise<CreateCredentialOutput, CreateCredentialInput>(
                    () =>
                        new Promise<CreateCredentialOutput>((resolve) => {
                            resolveCeremony = resolve;
                        }),
                ),
                registerCredential: fromPromise<RegisterCredentialOutput, RegisterCredentialInput>(registerCredential),
            });
            await waitForBatchedUpdates();
            expect(resolveCeremony).toBeDefined();

            // When the user closes the flow and the ceremony then succeeds anyway
            actor.send({type: 'CLOSE_MODAL'});
            resolveCeremony?.({success: true, keyInfo: MFA_TEST_KEY_INFO});
            await waitForBatchedUpdates();

            // Then the key never reaches the backend, since a state that was left drops its actor's late result
            expect(actor.getSnapshot().matches(MFA_STATE.CLOSING)).toBe(true);
            expect(registerCredential).not.toHaveBeenCalled();

            actor.stop();
        });

        it('moves to backend registration and stores the key info when the ceremony succeeds', () => {
            // Given the flow is creating a new key on the device
            const actor = createActorAtState(CREATING_KEY, {registrationChallenge: MFA_TEST_REGISTRATION_CHALLENGE});

            actor.start();

            // When the platform ceremony creates the key
            sendCreateCredentialDone(actor, {success: true, keyInfo: MFA_TEST_KEY_INFO});

            // Then the flow moves on to register that key with the backend, since an unregistered key cannot authorize anything
            const result = actor.getSnapshot();
            expect(result.matches(REGISTERING_KEY)).toBe(true);
            expect(result.context.registrationKeyInfo).toBe(MFA_TEST_KEY_INFO);
            expect(result.context.isRegistrationComplete).toBe(false);

            actor.stop();
        });

        it('reaches the failure outcome carrying the exact reason when the ceremony resolves with a failure', () => {
            // Given the flow is creating a new key on the device
            const actor = createActorAtState(CREATING_KEY, {registrationChallenge: MFA_TEST_REGISTRATION_CHALLENGE});
            const failureError = createLocalMFAError(REASON.LOCAL_ERRORS.HSM.KEY_CREATION_FAILED, 'Credential creation transition spec failure');

            actor.start();

            // When the ceremony fails and the outcome is finalized
            sendCreateCredentialDone(actor, {success: false, error: failureError});
            sendFinalizeOutcomeDone(actor, MFA_TEST_FINALIZE_OUTCOME_SHOW_SCREEN);

            // Then the flow fails with the ceremony's exact error, so the outcome screen shows the real reason
            const result = actor.getSnapshot();
            expect(result.matches(OUTCOME_FAILURE)).toBe(true);
            expect(result.context.error).toBe(failureError);

            actor.stop();
        });

        it('reaches the failure outcome with an unhandled-exception error when the ceremony rejects', async () => {
            // Given a ceremony that throws instead of returning a result
            // When the user approves the soft prompt
            const actor = approveSoftPromptWith({
                createCredential: fromPromise<CreateCredentialOutput, CreateCredentialInput>(() => Promise.reject(new Error('Credential creation exploded'))),
                finalizeOutcome: fromPromise<FinalizeOutcomeOutput, FinalizeOutcomeInput>(() => Promise.resolve(MFA_TEST_FINALIZE_OUTCOME_SHOW_SCREEN)),
            });
            await waitForBatchedUpdates();

            // Then the flow fails with an unhandled-exception error, so a crashing ceremony still ends on a failure screen
            const result = actor.getSnapshot();
            expect(result.matches(OUTCOME_FAILURE)).toBe(true);
            expect(result.context.error?.reason).toBe(REASON.LOCAL_ERRORS.UNHANDLED_EXCEPTION);
            expect(result.context.error?.message).toContain('Credential creation threw:');

            actor.stop();
        });
    });

    describe('registerCredential actor outcome', () => {
        it('invokes registerCredential with the key info the ceremony produced', async () => {
            // Given a ceremony that succeeds and a registration that records its input
            let receivedInput: RegisterCredentialInput | undefined;
            // When the user approves the soft prompt
            const actor = approveSoftPromptWith({
                createCredential: fromPromise<CreateCredentialOutput, CreateCredentialInput>(() => Promise.resolve({success: true, keyInfo: MFA_TEST_KEY_INFO})),
                registerCredential: fromPromise<RegisterCredentialOutput, RegisterCredentialInput>(({input}) => {
                    receivedInput = input;
                    return new Promise<RegisterCredentialOutput>(() => {});
                }),
            });
            await waitForBatchedUpdates();

            // Then the backend gets exactly the key the ceremony created, since any other key would leave the device unable to sign
            expect(actor.getSnapshot().matches(REGISTERING_KEY)).toBe(true);
            expect(receivedInput).toEqual({keyInfo: MFA_TEST_KEY_INFO});

            actor.stop();
        });

        it('moves to authorizing and drops the key info when the registration succeeds', () => {
            // Given the flow is registering a freshly created key
            const actor = createActorAtState(REGISTERING_KEY, {registrationChallenge: MFA_TEST_REGISTRATION_CHALLENGE, registrationKeyInfo: MFA_TEST_KEY_INFO});

            actor.start();

            // When the backend accepts the key
            sendRegisterCredentialDone(actor, {success: true});

            // Then the flow moves on to authorization and drops the key info, since it is no longer needed once registered
            const result = actor.getSnapshot();
            expect(result.matches(AUTHORIZING)).toBe(true);
            expect(result.context.isRegistrationComplete).toBe(true);
            expect(result.context.registrationKeyInfo).toBeUndefined();

            actor.stop();
        });

        it('reaches the failure outcome carrying the exact reason when the registration resolves with a failure', () => {
            // Given the flow is registering a freshly created key
            const actor = createActorAtState(REGISTERING_KEY, {registrationChallenge: MFA_TEST_REGISTRATION_CHALLENGE, registrationKeyInfo: MFA_TEST_KEY_INFO});
            const failureError = createLocalMFAError(REASON.CLIENT_ERRORS.UNRECOGNIZED, 'Credential registration transition spec failure');

            actor.start();

            // When the backend rejects the key and the outcome is finalized
            sendRegisterCredentialDone(actor, {success: false, error: failureError});
            sendFinalizeOutcomeDone(actor, MFA_TEST_FINALIZE_OUTCOME_SHOW_SCREEN);

            // Then the flow fails with the backend's exact error and drops the key info, so nothing stale is left for a later attempt
            const result = actor.getSnapshot();
            expect(result.matches(OUTCOME_FAILURE)).toBe(true);
            expect(result.context.error).toBe(failureError);
            expect(result.context.registrationKeyInfo).toBeUndefined();

            actor.stop();
        });

        it('reaches the failure outcome with an unhandled-exception error when the registration rejects', async () => {
            // Given a registration that throws instead of returning a result
            // When the user approves the soft prompt
            const actor = approveSoftPromptWith({
                createCredential: fromPromise<CreateCredentialOutput, CreateCredentialInput>(() => Promise.resolve({success: true, keyInfo: MFA_TEST_KEY_INFO})),
                registerCredential: fromPromise<RegisterCredentialOutput, RegisterCredentialInput>(() => Promise.reject(new Error('Credential registration exploded'))),
                finalizeOutcome: fromPromise<FinalizeOutcomeOutput, FinalizeOutcomeInput>(() => Promise.resolve(MFA_TEST_FINALIZE_OUTCOME_SHOW_SCREEN)),
            });
            await waitForBatchedUpdates();

            // Then the flow fails with an unhandled-exception error, so a crashing registration still ends on a failure screen
            const result = actor.getSnapshot();
            expect(result.matches(OUTCOME_FAILURE)).toBe(true);
            expect(result.context.error?.reason).toBe(REASON.LOCAL_ERRORS.UNHANDLED_EXCEPTION);
            expect(result.context.error?.message).toContain('Credential registration threw:');

            actor.stop();
        });
    });
});
