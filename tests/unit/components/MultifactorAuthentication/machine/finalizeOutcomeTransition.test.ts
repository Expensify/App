import type {MfaMachineEvent} from '@components/MultifactorAuthentication/machine/machineEvents';
import mfaMachine from '@components/MultifactorAuthentication/machine/mfaMachine';
import type {FinalizeOutcomeInput, FinalizeOutcomeOutput, MfaContext} from '@components/MultifactorAuthentication/machine/types';

import {createMFAErrorFromApiResponse} from '@libs/MultifactorAuthentication/shared/MFAResult';

import CONST from '@src/CONST';

import type {ActorLogic, InputFrom, SnapshotFrom} from 'xstate';

import {createActorAtState, createFlowContext, sendFinalizeOutcomeDone} from 'tests/utils/mfa/flowActors';
import {
    MFA_TEST_ACCOUNT_ID,
    MFA_TEST_AUTH_METHOD,
    MFA_TEST_FINALIZE_OUTCOME_SHOW_SCREEN,
    MFA_TEST_REGISTRATION_STATE_AT_START,
    MFA_TEST_SCENARIO_RESPONSE,
} from 'tests/utils/mfa/flowFixtures';
import {createActorDoneEvent} from 'tests/utils/mfa/flowPaths';
import waitForBatchedUpdates from 'tests/utils/waitForBatchedUpdates';
import {createActor, fromPromise} from 'xstate';

const MFA_STATE = CONST.MULTIFACTOR_AUTHENTICATION.MFA_STATE;
const REASON = CONST.MULTIFACTOR_AUTHENTICATION.REASON;
const CALLBACK_RESPONSE = CONST.MULTIFACTOR_AUTHENTICATION.CALLBACK_RESPONSE;

const FINALIZING_OUTCOME_STATE = {[MFA_STATE.OPEN]: {[MFA_STATE.OUTCOME]: MFA_STATE.FINALIZING_OUTCOME}};
const AUTHORIZING_STATE = {[MFA_STATE.OPEN]: {[MFA_STATE.PROMPT]: MFA_STATE.AUTHORIZING}};

/**
 * `mfaMachine` only declares `MfaEvent`, so production code cannot send the events XState raises
 * itself. This test needs to inject a fabricated `authorize` done event, so it widens the machine's
 * event type the same way `tests/utils/mfa/flowPaths.ts` does for the shared graph-traversal machine.
 */
function withLifecycleEvents<M>(machine: M) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- see the comment above.
    return machine as unknown as ActorLogic<SnapshotFrom<M>, MfaMachineEvent, InputFrom<M>>;
}

/**
 * Starts a live actor one hop before `finalizingOutcome`, with the finalize actor replaced by the given
 * logic. `resolveState` cannot land inside the state and have the invoke fire, so the spec drives the
 * real transition with a fabricated `authorize` done event.
 */
function startFlowEnteringFinalization(finalizeOutcome: ReturnType<typeof fromPromise<FinalizeOutcomeOutput, FinalizeOutcomeInput>>, contextOverrides: Partial<MfaContext> = {}) {
    const machine = mfaMachine.provide({actors: {finalizeOutcome}});
    const context = createFlowContext(contextOverrides);
    const actor = createActor(withLifecycleEvents(machine), {snapshot: machine.resolveState({value: AUTHORIZING_STATE, context})});
    actor.start();
    return {actor, context};
}

// The graph-traversal suites generate their expectations from the machine, so a transition pointed at
// a wrong target adjusts those expectations and still passes. This suite pins by hand what the machine
// hands the finalize-outcome actor, how it routes on the actor's answer, and what happens when the
// modal closes while that actor is still running.

describe('MFA outcome finalization', () => {
    describe('actor input', () => {
        it('forwards the raw results of a successful authorization and leaves their interpretation to the actor', () => {
            let receivedInput: FinalizeOutcomeInput | undefined;
            const {actor, context} = startFlowEnteringFinalization(
                fromPromise<FinalizeOutcomeOutput, FinalizeOutcomeInput>(({input}) => {
                    receivedInput = input;
                    return new Promise(() => {});
                }),
                {softPromptApproved: true, isRegistrationComplete: true},
            );

            actor.send(createActorDoneEvent('authorize', {success: true, scenarioResponse: MFA_TEST_SCENARIO_RESPONSE, authenticationMethod: MFA_TEST_AUTH_METHOD}));

            // `toEqual` on purpose: this pins exactly which context fields cross the boundary. Derived
            // values (success, the callback input) are the actor's business, so none appear here.
            expect(receivedInput).toEqual({
                callback: context.scenario?.callback,
                payload: undefined,
                accountID: MFA_TEST_ACCOUNT_ID,
                scenarioName: context.scenarioName,
                scenarioResponse: MFA_TEST_SCENARIO_RESPONSE,
                error: undefined,
                authenticationMethod: MFA_TEST_AUTH_METHOD,
                isRegistrationComplete: true,
                softPromptApproved: true,
                registrationStateAtStart: MFA_TEST_REGISTRATION_STATE_AT_START,
            });

            actor.stop();
        });

        it('forwards the failure error with no scenario response', () => {
            let receivedInput: FinalizeOutcomeInput | undefined;
            const failureError = createMFAErrorFromApiResponse(404, REASON.LOCAL_ERRORS.HSM.CANCELED, 'Finalize input spec failure');
            const {actor} = startFlowEnteringFinalization(
                fromPromise<FinalizeOutcomeOutput, FinalizeOutcomeInput>(({input}) => {
                    receivedInput = input;
                    return new Promise(() => {});
                }),
            );

            actor.send(createActorDoneEvent('authorize', {success: false, error: failureError}));

            expect(receivedInput).toMatchObject({error: failureError, scenarioResponse: undefined, authenticationMethod: undefined});

            actor.stop();
        });
    });

    describe('routing on the actor result', () => {
        it('moves to closing on SKIP_OUTCOME_SCREEN and drops the cancel-confirmation modal on entry', () => {
            const actor = createActorAtState(FINALIZING_OUTCOME_STATE, {scenarioResponse: MFA_TEST_SCENARIO_RESPONSE, isCancelConfirmVisible: true});

            actor.start();
            sendFinalizeOutcomeDone(actor, {callbackResponse: CALLBACK_RESPONSE.SKIP_OUTCOME_SCREEN});

            const result = actor.getSnapshot();
            expect(result.matches(MFA_STATE.CLOSING)).toBe(true);
            expect(result.context.isCancelConfirmVisible).toBe(false);
            // The flow data outlives the close animation on purpose; only `closed` wipes it.
            expect(result.context.scenarioResponse).toBe(MFA_TEST_SCENARIO_RESPONSE);

            actor.stop();
        });

        it('shows the outcome screen on SHOW_OUTCOME_SCREEN even when the cancel-confirmation modal was up', () => {
            const actor = createActorAtState(FINALIZING_OUTCOME_STATE, {isCancelConfirmVisible: true});

            actor.start();
            sendFinalizeOutcomeDone(actor, MFA_TEST_FINALIZE_OUTCOME_SHOW_SCREEN);

            const result = actor.getSnapshot();
            expect(result.matches({[MFA_STATE.OPEN]: {[MFA_STATE.OUTCOME]: MFA_STATE.SUCCESS}})).toBe(true);
            // Only entering `closing` drops the flag; an outcome screen is still inside the open modal.
            expect(result.context.isCancelConfirmVisible).toBe(true);

            actor.stop();
        });

        it('falls back to the failure outcome on the stored error when the actor rejects', async () => {
            const failureError = createMFAErrorFromApiResponse(404, REASON.LOCAL_ERRORS.HSM.CANCELED, 'Finalize rejection spec failure');
            const {actor} = startFlowEnteringFinalization(fromPromise<FinalizeOutcomeOutput, FinalizeOutcomeInput>(() => Promise.reject(new Error('Finalize outcome exploded'))));

            actor.send(createActorDoneEvent('authorize', {success: false, error: failureError}));
            await waitForBatchedUpdates();

            const result = actor.getSnapshot();
            expect(result.matches({[MFA_STATE.OPEN]: {[MFA_STATE.OUTCOME]: MFA_STATE.FAILURE}})).toBe(true);
            expect(result.context.error).toBe(failureError);

            actor.stop();
        });

        it('falls back to the success outcome when the actor rejects without a stored error', async () => {
            const {actor} = startFlowEnteringFinalization(fromPromise<FinalizeOutcomeOutput, FinalizeOutcomeInput>(() => Promise.reject(new Error('Finalize outcome exploded'))));

            actor.send(createActorDoneEvent('authorize', {success: true, scenarioResponse: MFA_TEST_SCENARIO_RESPONSE, authenticationMethod: MFA_TEST_AUTH_METHOD}));
            await waitForBatchedUpdates();

            const result = actor.getSnapshot();
            expect(result.matches({[MFA_STATE.OPEN]: {[MFA_STATE.OUTCOME]: MFA_STATE.SUCCESS}})).toBe(true);
            expect(result.context.error).toBeUndefined();

            actor.stop();
        });
    });

    describe('closing while the actor is in flight', () => {
        it('moves to closing on CLOSE_MODAL, drops the cancel-confirmation modal, and ignores the late actor result', async () => {
            let resolveFinalize: ((output: FinalizeOutcomeOutput) => void) | undefined;
            const {actor} = startFlowEnteringFinalization(
                fromPromise<FinalizeOutcomeOutput, FinalizeOutcomeInput>(
                    () =>
                        new Promise<FinalizeOutcomeOutput>((resolve) => {
                            resolveFinalize = resolve;
                        }),
                ),
                {isCancelConfirmVisible: true},
            );

            actor.send(createActorDoneEvent('authorize', {success: true, scenarioResponse: MFA_TEST_SCENARIO_RESPONSE, authenticationMethod: MFA_TEST_AUTH_METHOD}));
            expect(actor.getSnapshot().matches(FINALIZING_OUTCOME_STATE)).toBe(true);
            expect(resolveFinalize).toBeDefined();

            actor.send({type: 'CLOSE_MODAL'});

            const closing = actor.getSnapshot();
            expect(closing.matches(MFA_STATE.CLOSING)).toBe(true);
            expect(closing.context.isCancelConfirmVisible).toBe(false);

            // The callback promise cannot be cancelled and may still navigate on its own; its answer,
            // however, must not push an outcome screen over a modal the user already closed.
            resolveFinalize?.(MFA_TEST_FINALIZE_OUTCOME_SHOW_SCREEN);
            await waitForBatchedUpdates();

            expect(actor.getSnapshot().matches(MFA_STATE.CLOSING)).toBe(true);

            actor.stop();
        });

        it('drops the cancel-confirmation modal on the explicit CLOSE_MODAL route too', () => {
            const actor = createActorAtState(AUTHORIZING_STATE, {isCancelConfirmVisible: true});

            actor.start();
            actor.send({type: 'CLOSE_MODAL'});

            const result = actor.getSnapshot();
            expect(result.matches(MFA_STATE.CLOSING)).toBe(true);
            expect(result.context.isCancelConfirmVisible).toBe(false);

            actor.stop();
        });
    });
});
