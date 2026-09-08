import {getScenarioConfig} from '@components/MultifactorAuthentication/config';
import mfaMachine from '@components/MultifactorAuthentication/machine/mfaMachine';
import snapshotToState from '@components/MultifactorAuthentication/machine/snapshotToState';
import type {AuthorizeInput, AuthorizeOutput, LoadRegistrationStateInput, LoadRegistrationStateOutput, ValidateDeviceInput} from '@components/MultifactorAuthentication/machine/types';

import {createLocalMFAError} from '@libs/MultifactorAuthentication/shared/MFAResult';
import type {MFAResult} from '@libs/MultifactorAuthentication/shared/MFAResult';

import {createScenarioActionRunner} from '@userActions/MultifactorAuthentication/processing';

import CONST from '@src/CONST';

import {createActorAtState, createFlowContext, sendAuthorizeDone} from 'tests/utils/mfa/flowActors';
import {MFA_TEST_AUTH_METHOD, MFA_TEST_SCENARIO_RESPONSE} from 'tests/utils/mfa/flowFixtures';
import waitForBatchedUpdates from 'tests/utils/waitForBatchedUpdates';
import {createActor, fromPromise, waitFor} from 'xstate';

const MFA_STATE = CONST.MULTIFACTOR_AUTHENTICATION.MFA_STATE;
const REASON = CONST.MULTIFACTOR_AUTHENTICATION.REASON;

// The graph-traversal suites generate their expectations from the machine, so a transition pointed at
// a wrong target adjusts those expectations and still passes. This suite pins the authorization
// actor's input and its own outcome routing, including the exact failure reasons it carries, by hand.

describe('MFA authorization', () => {
    describe('authorize actor outcome', () => {
        it('forwards the account and pre-bound scenario runner from INIT to the authorize actor', async () => {
            const accountID = 67890;
            const transactionID = 'transaction-from-machine-context';
            const scenarioName = CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.AUTHORIZE_TRANSACTION;
            const scenario = getScenarioConfig(scenarioName);
            const runScenarioAction = createScenarioActionRunner(scenarioName, scenario.action, {transactionID});
            let receivedInput: AuthorizeInput | undefined;
            const machine = mfaMachine.provide({
                actors: {
                    validateDevice: fromPromise<MFAResult, ValidateDeviceInput>(() => Promise.resolve({success: true})),
                    loadRegistrationState: fromPromise<LoadRegistrationStateOutput, LoadRegistrationStateInput>(() =>
                        Promise.resolve({hasLocalCredentials: true, hasEverAcceptedSoftPrompt: true}),
                    ),
                    authorize: fromPromise<AuthorizeOutput, AuthorizeInput>(({input}) => {
                        receivedInput = input;
                        return new Promise<AuthorizeOutput>(() => {});
                    }),
                },
            });
            const actor = createActor(machine);

            actor.start();
            actor.send({type: 'INIT', accountID, scenarioName, scenario, payload: {transactionID}, runScenarioAction});
            await waitFor(actor, (snapshot) => snapshot.matches({[MFA_STATE.OPEN]: {[MFA_STATE.PROMPT]: MFA_STATE.AUTHORIZING}}));

            expect(receivedInput).toEqual({accountID, runScenarioAction});

            actor.stop();
        });

        it('reaches the success outcome and stores the authentication method and scenario response', () => {
            const actor = createActorAtState({[MFA_STATE.OPEN]: {[MFA_STATE.PROMPT]: MFA_STATE.AUTHORIZING}});

            actor.start();
            sendAuthorizeDone(actor, {success: true, scenarioResponse: MFA_TEST_SCENARIO_RESPONSE, authenticationMethod: MFA_TEST_AUTH_METHOD});

            const result = actor.getSnapshot();
            expect(result.matches({[MFA_STATE.OPEN]: {[MFA_STATE.OUTCOME]: MFA_STATE.SUCCESS}})).toBe(true);
            expect(result.context.authenticationMethod).toBe(MFA_TEST_AUTH_METHOD);
            expect(result.context.scenarioResponse).toBe(MFA_TEST_SCENARIO_RESPONSE);

            actor.stop();
        });

        it('reaches the failure outcome carrying the exact error for an ordinary failure', () => {
            const actor = createActorAtState({[MFA_STATE.OPEN]: {[MFA_STATE.PROMPT]: MFA_STATE.AUTHORIZING}});
            const failureError = createLocalMFAError(REASON.LOCAL_ERRORS.HSM.CANCELED, 'Authorization transition spec cancellation');

            actor.start();
            sendAuthorizeDone(actor, {success: false, error: failureError});

            const result = actor.getSnapshot();
            expect(result.matches({[MFA_STATE.OPEN]: {[MFA_STATE.OUTCOME]: MFA_STATE.FAILURE}})).toBe(true);
            expect(result.context.error).toBe(failureError);

            actor.stop();
        });

        // This slice has no recovery actor yet — a recoverable failure routes to the generic failure
        // outcome like any other, with `error.reason` preserved verbatim so the recovery slice has an
        // exact value to route on once it adds its own branch.
        it('reaches the failure outcome preserving the exact reason for a recoverable credential failure', () => {
            const actor = createActorAtState({[MFA_STATE.OPEN]: {[MFA_STATE.PROMPT]: MFA_STATE.AUTHORIZING}});
            const recoverableError = createLocalMFAError(REASON.LOCAL_ERRORS.HSM.NO_MATCHING_LOCAL_CREDENTIAL, 'Authorization transition spec recoverable failure');

            actor.start();
            sendAuthorizeDone(actor, {success: false, error: recoverableError});

            const result = actor.getSnapshot();
            expect(result.matches({[MFA_STATE.OPEN]: {[MFA_STATE.OUTCOME]: MFA_STATE.FAILURE}})).toBe(true);
            expect(result.context.error?.reason).toBe(REASON.LOCAL_ERRORS.HSM.NO_MATCHING_LOCAL_CREDENTIAL);

            actor.stop();
        });

        it('reaches the failure outcome preserving the exact REGISTRATION_REQUIRED reason', () => {
            const actor = createActorAtState({[MFA_STATE.OPEN]: {[MFA_STATE.PROMPT]: MFA_STATE.AUTHORIZING}});
            const registrationRequiredError = createLocalMFAError(REASON.CLIENT_ERRORS.REGISTRATION_REQUIRED, 'Authorization transition spec registration required');

            actor.start();
            sendAuthorizeDone(actor, {success: false, error: registrationRequiredError});

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
            const actor = createActorAtState({[MFA_STATE.OPEN]: {[MFA_STATE.PROMPT]: MFA_STATE.AUTHORIZING}}, {promptPresentationPhase: MFA_STATE.AUTHORIZING});

            actor.start();
            actor.send({type: 'CLOSE_MODAL'});

            const result = actor.getSnapshot();
            expect(result.matches(MFA_STATE.CLOSING)).toBe(true);
            expect(snapshotToState(result).isAuthorizing).toBe(true);
            expect(snapshotToState(result).isProcessingPrompt).toBe(true);

            actor.stop();
        });

        it('marks the prompt as processing while authorizing', () => {
            const actor = createActorAtState({[MFA_STATE.OPEN]: {[MFA_STATE.PROMPT]: MFA_STATE.AUTHORIZING}}, {promptPresentationPhase: MFA_STATE.AUTHORIZING});

            actor.start();

            expect(snapshotToState(actor.getSnapshot()).isProcessingPrompt).toBe(true);

            actor.stop();
        });
    });
});
