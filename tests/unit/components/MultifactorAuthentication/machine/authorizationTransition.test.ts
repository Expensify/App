import {getScenarioConfig} from '@components/MultifactorAuthentication/config';
import mfaMachine from '@components/MultifactorAuthentication/machine/mfaMachine';
import snapshotToState from '@components/MultifactorAuthentication/machine/snapshotToState';
import type {
    AuthorizeInput,
    AuthorizeOutput,
    ExecuteScenarioActionInput,
    ExecuteScenarioActionOutput,
    FinalizeOutcomeInput,
    FinalizeOutcomeOutput,
    LoadRegistrationStateInput,
    LoadRegistrationStateOutput,
    ValidateDeviceInput,
} from '@components/MultifactorAuthentication/machine/types';

import {createLocalMFAError} from '@libs/MultifactorAuthentication/shared/MFAResult';
import type {MFAResult} from '@libs/MultifactorAuthentication/shared/MFAResult';

import {createScenarioActionRunner} from '@userActions/MultifactorAuthentication/processing';

import CONST from '@src/CONST';

import {createActorAtState, createFlowContext, sendAuthorizeDone, sendExecuteScenarioActionDone, sendFinalizeOutcomeDone} from 'tests/utils/mfa/flowActors';
import {
    MFA_TEST_AUTH_METHOD,
    MFA_TEST_FINALIZE_OUTCOME_SHOW_SCREEN,
    MFA_TEST_REGISTRATION_STATE_AT_START,
    MFA_TEST_SCENARIO_ACTION_ERROR,
    MFA_TEST_SCENARIO_RESPONSE,
    MFA_TEST_SIGNED_CHALLENGE,
} from 'tests/utils/mfa/flowFixtures';
import waitForBatchedUpdates from 'tests/utils/waitForBatchedUpdates';
import {createActor, fromPromise, waitFor} from 'xstate';

const MFA_STATE = CONST.MULTIFACTOR_AUTHENTICATION.MFA_STATE;
const REASON = CONST.MULTIFACTOR_AUTHENTICATION.REASON;

const SIGNING_CHALLENGE = {[MFA_STATE.OPEN]: {[MFA_STATE.PROMPT]: {[MFA_STATE.AUTHORIZING]: MFA_STATE.SIGNING_CHALLENGE}}};
const EXECUTING_SCENARIO_ACTION = {[MFA_STATE.OPEN]: {[MFA_STATE.PROMPT]: {[MFA_STATE.AUTHORIZING]: MFA_STATE.EXECUTING_SCENARIO_ACTION}}};

// The graph-traversal suites generate their expectations from the machine, so a transition pointed at
// a wrong target adjusts those expectations and still passes. This suite pins the authorization
// actor's input and its own outcome routing, including the exact failure reasons it carries, by hand.

describe('MFA authorization', () => {
    describe('authorize actor outcome', () => {
        it('forwards the account from INIT to the authorize actor and the INIT runner to the scenario action, and keeps the start-of-flow registration snapshot', async () => {
            // Given a transaction scenario whose ceremony succeeds and whose scenario action records its input and never settles
            const accountID = 67890;
            const transactionID = 'transaction-from-machine-context';
            const scenarioName = CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.AUTHORIZE_TRANSACTION;
            const scenario = getScenarioConfig(scenarioName);
            const runScenarioAction = createScenarioActionRunner(scenarioName, scenario.action, {transactionID});
            let receivedAuthorizeInput: AuthorizeInput | undefined;
            let receivedScenarioActionInput: ExecuteScenarioActionInput | undefined;
            const machine = mfaMachine.provide({
                actors: {
                    validateDevice: fromPromise<MFAResult, ValidateDeviceInput>(() => Promise.resolve({success: true})),
                    loadRegistrationState: fromPromise<LoadRegistrationStateOutput, LoadRegistrationStateInput>(() =>
                        Promise.resolve({hasServerCredentials: false, hasLocalCredentials: true, hasEverAcceptedSoftPrompt: true}),
                    ),
                    authorize: fromPromise<AuthorizeOutput, AuthorizeInput>(({input}) => {
                        receivedAuthorizeInput = input;
                        return Promise.resolve({success: true, signedChallenge: MFA_TEST_SIGNED_CHALLENGE, authenticationMethod: MFA_TEST_AUTH_METHOD});
                    }),
                    executeScenarioAction: fromPromise<ExecuteScenarioActionOutput, ExecuteScenarioActionInput>(({input}) => {
                        receivedScenarioActionInput = input;
                        return new Promise<ExecuteScenarioActionOutput>(() => {});
                    }),
                },
            });
            const actor = createActor(machine);

            // When the flow is initialised and the ceremony completes
            actor.start();
            actor.send({
                type: 'INIT',
                accountID,
                scenarioName,
                scenario,
                payload: {transactionID},
                runScenarioAction,
                registrationStateAtStart: MFA_TEST_REGISTRATION_STATE_AT_START,
            });
            await waitFor(actor, (snapshot) => snapshot.matches(EXECUTING_SCENARIO_ACTION));

            // Then the ceremony only gets the account, and the scenario action gets the exact runner passed to INIT
            expect(receivedAuthorizeInput).toEqual({accountID});
            expect(receivedScenarioActionInput?.runScenarioAction).toBe(runScenarioAction);
            expect(actor.getSnapshot().context.registrationStateAtStart).toEqual(MFA_TEST_REGISTRATION_STATE_AT_START);

            actor.stop();
        });

        it('moves to the scenario action with the signed challenge and authentication method once the ceremony succeeds', () => {
            // Given the flow is signing the authorization challenge
            const actor = createActorAtState(SIGNING_CHALLENGE);

            actor.start();

            // When the platform ceremony signs the challenge
            sendAuthorizeDone(actor, {success: true, signedChallenge: MFA_TEST_SIGNED_CHALLENGE, authenticationMethod: MFA_TEST_AUTH_METHOD});

            // Then the flow moves on to the backend action holding what it needs to send, since a signature alone authorizes nothing
            const result = actor.getSnapshot();
            expect(result.matches(EXECUTING_SCENARIO_ACTION)).toBe(true);
            expect(result.context.signedChallenge).toBe(MFA_TEST_SIGNED_CHALLENGE);
            expect(result.context.authenticationMethod).toBe(MFA_TEST_AUTH_METHOD);

            actor.stop();
        });

        it('reaches the failure outcome carrying the exact error for an ordinary failure', () => {
            const actor = createActorAtState(SIGNING_CHALLENGE);
            const failureError = createLocalMFAError(REASON.LOCAL_ERRORS.HSM.CANCELED, 'Authorization transition spec cancellation');

            actor.start();
            sendAuthorizeDone(actor, {success: false, error: failureError});
            sendFinalizeOutcomeDone(actor, MFA_TEST_FINALIZE_OUTCOME_SHOW_SCREEN);

            const result = actor.getSnapshot();
            expect(result.matches({[MFA_STATE.OPEN]: {[MFA_STATE.OUTCOME]: MFA_STATE.FAILURE}})).toBe(true);
            expect(result.context.error).toBe(failureError);

            actor.stop();
        });

        // This slice has no recovery actor yet — a recoverable failure routes to the generic failure
        // outcome like any other, with `error.reason` preserved verbatim so the recovery slice has an
        // exact value to route on once it adds its own branch.
        it('reaches the failure outcome preserving the exact reason for a recoverable credential failure', () => {
            const actor = createActorAtState(SIGNING_CHALLENGE);
            const recoverableError = createLocalMFAError(REASON.LOCAL_ERRORS.HSM.NO_MATCHING_LOCAL_CREDENTIAL, 'Authorization transition spec recoverable failure');

            actor.start();
            sendAuthorizeDone(actor, {success: false, error: recoverableError});
            sendFinalizeOutcomeDone(actor, MFA_TEST_FINALIZE_OUTCOME_SHOW_SCREEN);

            const result = actor.getSnapshot();
            expect(result.matches({[MFA_STATE.OPEN]: {[MFA_STATE.OUTCOME]: MFA_STATE.FAILURE}})).toBe(true);
            expect(result.context.error?.reason).toBe(REASON.LOCAL_ERRORS.HSM.NO_MATCHING_LOCAL_CREDENTIAL);

            actor.stop();
        });

        it('reaches the failure outcome preserving the exact REGISTRATION_REQUIRED reason', () => {
            const actor = createActorAtState(SIGNING_CHALLENGE);
            const registrationRequiredError = createLocalMFAError(REASON.CLIENT_ERRORS.REGISTRATION_REQUIRED, 'Authorization transition spec registration required');

            actor.start();
            sendAuthorizeDone(actor, {success: false, error: registrationRequiredError});
            sendFinalizeOutcomeDone(actor, MFA_TEST_FINALIZE_OUTCOME_SHOW_SCREEN);

            const result = actor.getSnapshot();
            expect(result.matches({[MFA_STATE.OPEN]: {[MFA_STATE.OUTCOME]: MFA_STATE.FAILURE}})).toBe(true);
            expect(result.context.error?.reason).toBe(REASON.CLIENT_ERRORS.REGISTRATION_REQUIRED);
            expect(CONST.MULTIFACTOR_AUTHENTICATION.RECOVERABLE_CREDENTIAL_FAILURES.has(REASON.CLIENT_ERRORS.REGISTRATION_REQUIRED)).toBe(true);
            expect(CONST.MULTIFACTOR_AUTHENTICATION.CREDENTIAL_FAILURES_REQUIRING_LOCAL_DELETION.has(REASON.CLIENT_ERRORS.REGISTRATION_REQUIRED)).toBe(false);

            actor.stop();
        });

        it('reaches the failure outcome with an unhandled-exception error when the actor rejects', async () => {
            // `resolveState` can't jump straight into `authorizing` and have the invoke fire — XState only
            // invokes an actor on a live transition into a state, not a snapshot resolved already inside
            // it. So we start one hop earlier and drive a real transition, letting the mocked actor
            // genuinely run and reject.
            const machine = mfaMachine.provide({
                actors: {
                    authorize: fromPromise<AuthorizeOutput, AuthorizeInput>(() => Promise.reject(new Error('Authorization exploded'))),
                    finalizeOutcome: fromPromise<FinalizeOutcomeOutput, FinalizeOutcomeInput>(() => Promise.resolve(MFA_TEST_FINALIZE_OUTCOME_SHOW_SCREEN)),
                },
            });
            const snapshot = machine.resolveState({
                value: {[MFA_STATE.OPEN]: {[MFA_STATE.PROMPT]: MFA_STATE.AWAITING_SOFT_PROMPT}},
                context: createFlowContext(),
            });
            const actor = createActor(machine, {snapshot});

            actor.start();
            actor.send({type: 'SOFT_PROMPT_APPROVED'});
            await waitForBatchedUpdates();

            const result = actor.getSnapshot();
            expect(result.matches({[MFA_STATE.OPEN]: {[MFA_STATE.OUTCOME]: MFA_STATE.FAILURE}})).toBe(true);
            expect(result.context.error?.reason).toBe(REASON.LOCAL_ERRORS.UNHANDLED_EXCEPTION);
            expect(result.context.error?.message).toContain('Authorization threw:');

            actor.stop();
        });

        it('moves to closing on CLOSE_MODAL and keeps the authorizing presentation during the close animation', () => {
            // The context override stands in for the entry action a live transition would have run.
            const actor = createActorAtState(SIGNING_CHALLENGE, {promptPresentationPhase: MFA_STATE.AUTHORIZING});

            actor.start();
            actor.send({type: 'CLOSE_MODAL'});

            const result = actor.getSnapshot();
            expect(result.matches(MFA_STATE.CLOSING)).toBe(true);
            expect(snapshotToState(result).isAuthorizing).toBe(true);
            expect(snapshotToState(result).isProcessingPrompt).toBe(true);

            actor.stop();
        });

        it('never runs the scenario action when the flow closes before the ceremony finishes', async () => {
            // Given a ceremony still waiting on the user
            let resolveCeremony: ((output: AuthorizeOutput) => void) | undefined;
            const executeScenarioAction = jest.fn(() => new Promise<ExecuteScenarioActionOutput>(() => {}));
            const machine = mfaMachine.provide({
                actors: {
                    authorize: fromPromise<AuthorizeOutput, AuthorizeInput>(
                        () =>
                            new Promise<AuthorizeOutput>((resolve) => {
                                resolveCeremony = resolve;
                            }),
                    ),
                    executeScenarioAction: fromPromise<ExecuteScenarioActionOutput, ExecuteScenarioActionInput>(executeScenarioAction),
                },
            });
            const snapshot = machine.resolveState({
                value: {[MFA_STATE.OPEN]: {[MFA_STATE.PROMPT]: MFA_STATE.AWAITING_SOFT_PROMPT}},
                context: createFlowContext(),
            });
            const actor = createActor(machine, {snapshot});
            actor.start();
            actor.send({type: 'SOFT_PROMPT_APPROVED'});
            await waitForBatchedUpdates();
            expect(resolveCeremony).toBeDefined();

            // When the user closes the flow and the ceremony then signs the challenge anyway
            actor.send({type: 'CLOSE_MODAL'});
            resolveCeremony?.({success: true, signedChallenge: MFA_TEST_SIGNED_CHALLENGE, authenticationMethod: MFA_TEST_AUTH_METHOD});
            await waitForBatchedUpdates();

            // Then the scenario action is never sent, since a state that was left drops its actor's late result
            expect(actor.getSnapshot().matches(MFA_STATE.CLOSING)).toBe(true);
            expect(executeScenarioAction).not.toHaveBeenCalled();

            actor.stop();
        });

        it('marks the prompt as processing while authorizing', () => {
            const actor = createActorAtState(SIGNING_CHALLENGE, {promptPresentationPhase: MFA_STATE.AUTHORIZING});

            actor.start();

            expect(snapshotToState(actor.getSnapshot()).isProcessingPrompt).toBe(true);

            actor.stop();
        });
    });
    describe('scenario action outcome', () => {
        it('hands the pre-bound scenario runner, the signed challenge and the authentication method to the scenario action', async () => {
            // Given a flow whose ceremony succeeds and whose scenario action records its input
            const context = createFlowContext();
            let receivedInput: ExecuteScenarioActionInput | undefined;
            const machine = mfaMachine.provide({
                actors: {
                    authorize: fromPromise<AuthorizeOutput, AuthorizeInput>(() =>
                        Promise.resolve({success: true, signedChallenge: MFA_TEST_SIGNED_CHALLENGE, authenticationMethod: MFA_TEST_AUTH_METHOD}),
                    ),
                    executeScenarioAction: fromPromise<ExecuteScenarioActionOutput, ExecuteScenarioActionInput>(({input}) => {
                        receivedInput = input;
                        return new Promise<ExecuteScenarioActionOutput>(() => {});
                    }),
                },
            });
            const snapshot = machine.resolveState({
                value: {[MFA_STATE.OPEN]: {[MFA_STATE.PROMPT]: MFA_STATE.AWAITING_SOFT_PROMPT}},
                context,
            });
            const actor = createActor(machine, {snapshot});

            // When the user approves the soft prompt and the flow reaches the scenario action
            actor.start();
            actor.send({type: 'SOFT_PROMPT_APPROVED'});
            await waitFor(actor, (current) => current.matches(EXECUTING_SCENARIO_ACTION));

            // Then the action gets the scenario's runner plus the ceremony's signature and method, which the backend needs to accept it
            expect(receivedInput).toEqual({runScenarioAction: context.runScenarioAction, signedChallenge: MFA_TEST_SIGNED_CHALLENGE, authenticationMethod: MFA_TEST_AUTH_METHOD});

            actor.stop();
        });

        it('reaches the success outcome, stores the scenario response and drops the signed challenge', () => {
            // Given the scenario action is in flight with a signed challenge stored
            const actor = createActorAtState(EXECUTING_SCENARIO_ACTION, {signedChallenge: MFA_TEST_SIGNED_CHALLENGE, authenticationMethod: MFA_TEST_AUTH_METHOD});

            actor.start();

            // When the backend accepts the action and the outcome is finalized
            sendExecuteScenarioActionDone(actor, {success: true, scenarioResponse: MFA_TEST_SCENARIO_RESPONSE});
            sendFinalizeOutcomeDone(actor, MFA_TEST_FINALIZE_OUTCOME_SHOW_SCREEN);

            // Then the flow succeeds with the response for the outcome screen, and the used signature is cleared since it is single-use
            const result = actor.getSnapshot();
            expect(result.matches({[MFA_STATE.OPEN]: {[MFA_STATE.OUTCOME]: MFA_STATE.SUCCESS}})).toBe(true);
            expect(result.context.authenticationMethod).toBe(MFA_TEST_AUTH_METHOD);
            expect(result.context.scenarioResponse).toBe(MFA_TEST_SCENARIO_RESPONSE);
            expect(result.context.signedChallenge).toBeUndefined();

            actor.stop();
        });

        it('reaches the failure outcome carrying the exact scenario action error', () => {
            // Given the scenario action is in flight with a signed challenge stored
            const actor = createActorAtState(EXECUTING_SCENARIO_ACTION, {signedChallenge: MFA_TEST_SIGNED_CHALLENGE, authenticationMethod: MFA_TEST_AUTH_METHOD});

            actor.start();

            // When the backend rejects the action and the outcome is finalized
            sendExecuteScenarioActionDone(actor, {success: false, error: MFA_TEST_SCENARIO_ACTION_ERROR});
            sendFinalizeOutcomeDone(actor, MFA_TEST_FINALIZE_OUTCOME_SHOW_SCREEN);

            // Then the flow fails with the backend's exact error, so the outcome screen shows the real reason
            const result = actor.getSnapshot();
            expect(result.matches({[MFA_STATE.OPEN]: {[MFA_STATE.OUTCOME]: MFA_STATE.FAILURE}})).toBe(true);
            expect(result.context.error).toBe(MFA_TEST_SCENARIO_ACTION_ERROR);
            expect(result.context.scenarioResponse).toBeUndefined();

            actor.stop();
        });

        it('reaches the failure outcome with an unhandled-exception error when the scenario action rejects', async () => {
            // Given a flow whose scenario action throws instead of returning a result
            const machine = mfaMachine.provide({
                actors: {
                    authorize: fromPromise<AuthorizeOutput, AuthorizeInput>(() =>
                        Promise.resolve({success: true, signedChallenge: MFA_TEST_SIGNED_CHALLENGE, authenticationMethod: MFA_TEST_AUTH_METHOD}),
                    ),
                    executeScenarioAction: fromPromise<ExecuteScenarioActionOutput, ExecuteScenarioActionInput>(() => Promise.reject(new Error('Scenario action exploded'))),
                    finalizeOutcome: fromPromise<FinalizeOutcomeOutput, FinalizeOutcomeInput>(() => Promise.resolve(MFA_TEST_FINALIZE_OUTCOME_SHOW_SCREEN)),
                },
            });
            const snapshot = machine.resolveState({
                value: {[MFA_STATE.OPEN]: {[MFA_STATE.PROMPT]: MFA_STATE.AWAITING_SOFT_PROMPT}},
                context: createFlowContext(),
            });
            const actor = createActor(machine, {snapshot});

            // When the user approves the soft prompt and the flow reaches the scenario action
            actor.start();
            actor.send({type: 'SOFT_PROMPT_APPROVED'});
            await waitForBatchedUpdates();

            // Then the flow fails with an unhandled-exception error, so a crashing action still ends on a failure screen instead of hanging
            const result = actor.getSnapshot();
            expect(result.matches({[MFA_STATE.OPEN]: {[MFA_STATE.OUTCOME]: MFA_STATE.FAILURE}})).toBe(true);
            expect(result.context.error?.reason).toBe(REASON.LOCAL_ERRORS.UNHANDLED_EXCEPTION);
            expect(result.context.error?.message).toContain('Scenario action threw:');

            actor.stop();
        });
    });
});
