import type {MfaMachineEvent} from '@components/MultifactorAuthentication/machine/machineEvents';
import mfaMachine from '@components/MultifactorAuthentication/machine/mfaMachine';
import snapshotToState from '@components/MultifactorAuthentication/machine/snapshotToState';
import type {
    ExecuteScenarioActionInput,
    ExecuteScenarioActionOutput,
    FinalizeOutcomeInput,
    FinalizeOutcomeOutput,
    MfaContext,
    ValidateDeviceInput,
} from '@components/MultifactorAuthentication/machine/types';

import {createMFAErrorFromApiResponse} from '@libs/MultifactorAuthentication/shared/MFAResult';
import type {MFAResult} from '@libs/MultifactorAuthentication/shared/MFAResult';

import CONST from '@src/CONST';

import type {ActorLogic, InputFrom, SnapshotFrom} from 'xstate';

import {createActorAtState, createFlowContext, sendFinalizeOutcomeDone} from 'tests/utils/mfa/flowActors';
import createInitEvent, {
    MFA_TEST_ACCOUNT_ID,
    MFA_TEST_AUTH_METHOD,
    MFA_TEST_FINALIZE_OUTCOME_SHOW_SCREEN,
    MFA_TEST_REGISTRATION_STATE_AT_START,
    MFA_TEST_SCENARIO_RESPONSE,
    MFA_TEST_SIGNED_CHALLENGE,
} from 'tests/utils/mfa/flowFixtures';
import {createActorDoneEvent} from 'tests/utils/mfa/flowPaths';
import waitForBatchedUpdates from 'tests/utils/waitForBatchedUpdates';
import {createActor, fromPromise} from 'xstate';

const MFA_STATE = CONST.MULTIFACTOR_AUTHENTICATION.MFA_STATE;
const REASON = CONST.MULTIFACTOR_AUTHENTICATION.REASON;
const CALLBACK_RESPONSE = CONST.MULTIFACTOR_AUTHENTICATION.CALLBACK_RESPONSE;

const FINALIZING_OUTCOME_STATE = {[MFA_STATE.OPEN]: {[MFA_STATE.FLOW]: {[MFA_STATE.OUTCOME]: MFA_STATE.FINALIZING_OUTCOME}}};
const AUTHORIZING_STATE = {[MFA_STATE.OPEN]: {[MFA_STATE.FLOW]: {[MFA_STATE.PROMPT]: {[MFA_STATE.AUTHORIZING]: MFA_STATE.SIGNING_CHALLENGE}}}};
const CANCEL_CONFIRM_VISIBLE = {[MFA_STATE.CANCEL_CONFIRM]: MFA_STATE.CANCEL_CONFIRM_VISIBLE};

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
 * real transition with fabricated actor done events.
 */
function startFlowEnteringFinalization(finalizeOutcome: ReturnType<typeof fromPromise<FinalizeOutcomeOutput, FinalizeOutcomeInput>>, contextOverrides: Partial<MfaContext> = {}) {
    // The scenario action never settles on its own, so the real one never reaches the backend.
    const executeScenarioAction = fromPromise<ExecuteScenarioActionOutput, ExecuteScenarioActionInput>(() => new Promise(() => {}));
    const machine = mfaMachine.provide({actors: {finalizeOutcome, executeScenarioAction}});
    const context = createFlowContext(contextOverrides);
    const actor = createActor(withLifecycleEvents(machine), {snapshot: machine.resolveState({value: AUTHORIZING_STATE, context})});
    actor.start();
    return {actor, context};
}

/** Drives a successful ceremony and scenario action, which enters `finalizingOutcome`. */
function sendAuthorizationSuccess(actor: ReturnType<typeof startFlowEnteringFinalization>['actor']) {
    actor.send(createActorDoneEvent('authorize', {success: true, signedChallenge: MFA_TEST_SIGNED_CHALLENGE, authenticationMethod: MFA_TEST_AUTH_METHOD}));
    actor.send(createActorDoneEvent('executeScenarioAction', {success: true, scenarioResponse: MFA_TEST_SCENARIO_RESPONSE}));
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

            sendAuthorizationSuccess(actor);

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
        it('moves to closing on SKIP_OUTCOME_SCREEN and leaves no cancel-confirmation dialog behind', () => {
            // Given the cancel-confirmation dialog is up while the outcome is being finalized
            const actor = createActorAtState({[MFA_STATE.OPEN]: {...FINALIZING_OUTCOME_STATE[MFA_STATE.OPEN], ...CANCEL_CONFIRM_VISIBLE}}, {scenarioResponse: MFA_TEST_SCENARIO_RESPONSE});

            actor.start();

            // When the scenario callback asks to skip the outcome screen
            sendFinalizeOutcomeDone(actor, {callbackResponse: CALLBACK_RESPONSE.SKIP_OUTCOME_SCREEN});

            // Then the modal closes with no dialog left behind, because there is nothing left to cancel
            const result = actor.getSnapshot();
            expect(result.matches(MFA_STATE.CLOSING)).toBe(true);
            expect(snapshotToState(result).isCancelConfirmVisible).toBe(false);
            // The flow data outlives the close animation on purpose; only `closed` wipes it.
            expect(result.context.scenarioResponse).toBe(MFA_TEST_SCENARIO_RESPONSE);

            actor.stop();
        });

        it('shows the outcome screen on SHOW_OUTCOME_SCREEN and hides a cancel-confirmation dialog that was up', () => {
            // Given the cancel-confirmation dialog is up while the outcome is being finalized
            const actor = createActorAtState({[MFA_STATE.OPEN]: {...FINALIZING_OUTCOME_STATE[MFA_STATE.OPEN], ...CANCEL_CONFIRM_VISIBLE}});

            actor.start();

            // When the scenario callback asks to show the outcome screen
            sendFinalizeOutcomeDone(actor, MFA_TEST_FINALIZE_OUTCOME_SHOW_SCREEN);

            // Then the outcome screen shows without the dialog, because the flow has already ended
            const result = actor.getSnapshot();
            expect(result.matches({[MFA_STATE.OPEN]: {[MFA_STATE.FLOW]: {[MFA_STATE.OUTCOME]: MFA_STATE.SUCCESS}}})).toBe(true);
            expect(snapshotToState(result).isCancelConfirmVisible).toBe(false);

            actor.stop();
        });

        it('falls back to the failure outcome on the stored error when the actor rejects', async () => {
            const failureError = createMFAErrorFromApiResponse(404, REASON.LOCAL_ERRORS.HSM.CANCELED, 'Finalize rejection spec failure');
            const {actor} = startFlowEnteringFinalization(fromPromise<FinalizeOutcomeOutput, FinalizeOutcomeInput>(() => Promise.reject(new Error('Finalize outcome exploded'))));

            actor.send(createActorDoneEvent('authorize', {success: false, error: failureError}));
            await waitForBatchedUpdates();

            const result = actor.getSnapshot();
            expect(result.matches({[MFA_STATE.OPEN]: {[MFA_STATE.FLOW]: {[MFA_STATE.OUTCOME]: MFA_STATE.FAILURE}}})).toBe(true);
            expect(result.context.error).toBe(failureError);

            actor.stop();
        });

        it('falls back to the success outcome when the actor rejects without a stored error', async () => {
            const {actor} = startFlowEnteringFinalization(fromPromise<FinalizeOutcomeOutput, FinalizeOutcomeInput>(() => Promise.reject(new Error('Finalize outcome exploded'))));

            sendAuthorizationSuccess(actor);
            await waitForBatchedUpdates();

            const result = actor.getSnapshot();
            expect(result.matches({[MFA_STATE.OPEN]: {[MFA_STATE.FLOW]: {[MFA_STATE.OUTCOME]: MFA_STATE.SUCCESS}}})).toBe(true);
            expect(result.context.error).toBeUndefined();

            actor.stop();
        });
    });

    describe('closing while the actor is in flight', () => {
        it('moves to closing on REQUEST_CANCEL and ignores the late actor result', async () => {
            // Given a scenario callback that is still running when the flow reaches finalization
            let resolveFinalize: ((output: FinalizeOutcomeOutput) => void) | undefined;
            const {actor} = startFlowEnteringFinalization(
                fromPromise<FinalizeOutcomeOutput, FinalizeOutcomeInput>(
                    () =>
                        new Promise<FinalizeOutcomeOutput>((resolve) => {
                            resolveFinalize = resolve;
                        }),
                ),
            );

            // When the ceremony and scenario action succeed
            sendAuthorizationSuccess(actor);

            // Then the flow is waiting on the callback
            expect(actor.getSnapshot().matches(FINALIZING_OUTCOME_STATE)).toBe(true);
            expect(resolveFinalize).toBeDefined();

            // When the user presses back before the callback answers
            actor.send({type: 'REQUEST_CANCEL'});

            // Then the modal closes right away, with no dialog, rather than waiting on the callback
            const closing = actor.getSnapshot();
            expect(closing.matches(MFA_STATE.CLOSING)).toBe(true);
            expect(snapshotToState(closing).isCancelConfirmVisible).toBe(false);

            // When the callback answers late
            // The callback promise cannot be cancelled and may still navigate on its own; its answer,
            // however, must not push an outcome screen over a modal the user already closed.
            resolveFinalize?.(MFA_TEST_FINALIZE_OUTCOME_SHOW_SCREEN);
            await waitForBatchedUpdates();

            // Then the modal keeps closing, so the late answer cannot reopen a screen the user dismissed
            expect(actor.getSnapshot().matches(MFA_STATE.CLOSING)).toBe(true);

            actor.stop();
        });

        it('leaves no cancel-confirmation dialog behind when CLOSE_MODAL arrives while it is up', () => {
            // Given a flow with the cancel-confirmation dialog up
            const actor = createActorAtState({[MFA_STATE.OPEN]: {...AUTHORIZING_STATE[MFA_STATE.OPEN], ...CANCEL_CONFIRM_VISIBLE}});

            // When the modal is closed, e.g. by navigating away
            actor.start();
            actor.send({type: 'CLOSE_MODAL'});

            // Then the modal closes with the dialog hidden, so it can't stay on screen while the modal animates out
            const result = actor.getSnapshot();
            expect(result.matches(MFA_STATE.CLOSING)).toBe(true);
            expect(snapshotToState(result).isCancelConfirmVisible).toBe(false);

            actor.stop();
        });

        it('starts the next flow with the cancel-confirmation dialog hidden after the previous one closed with it up', () => {
            // Given a flow with the cancel-confirmation dialog open, whose next flow's device check never settles
            const validateDevice = fromPromise<MFAResult, ValidateDeviceInput>(() => new Promise(() => {}));
            const machine = mfaMachine.provide({actors: {validateDevice}});
            const actor = createActor(machine, {snapshot: machine.resolveState({value: AUTHORIZING_STATE, context: createFlowContext()})});
            actor.start();
            actor.send({type: 'REQUEST_CANCEL'});
            expect(snapshotToState(actor.getSnapshot()).isCancelConfirmVisible).toBe(true);

            // When the modal closes and a new flow starts
            actor.send({type: 'CLOSE_MODAL'});
            actor.send({type: 'MODAL_CLOSED'});
            actor.send(createInitEvent());

            // Then the new flow opens without the dialog, so a cancel the user started in the old flow never carries over
            const result = actor.getSnapshot();
            expect(result.matches({[MFA_STATE.OPEN]: {[MFA_STATE.FLOW]: {[MFA_STATE.PREPARING]: MFA_STATE.VALIDATING_DEVICE}}})).toBe(true);
            expect(snapshotToState(result).isCancelConfirmVisible).toBe(false);

            actor.stop();
        });
    });
});
