import mfaMachine from '@components/MultifactorAuthentication/machine/mfaMachine';
import snapshotToState from '@components/MultifactorAuthentication/machine/snapshotToState';
import type {
    FinalizeOutcomeInput,
    FinalizeOutcomeOutput,
    RequestRegistrationChallengeInput,
    RequestRegistrationChallengeOutput,
    ValidateDeviceInput,
} from '@components/MultifactorAuthentication/machine/types';

import type {MFAResult} from '@libs/MultifactorAuthentication/shared/MFAResult';

import CONST from '@src/CONST';

import type {StateValue} from 'xstate';

import {createActorAtState, createFlowContext, sendExecuteScenarioActionDone, sendRequestRegistrationChallengeDone} from 'tests/utils/mfa/flowActors';
import createInitEvent, {MFA_TEST_REGISTRATION_CHALLENGE, MFA_TEST_SCENARIO_RESPONSE} from 'tests/utils/mfa/flowFixtures';
import {createActor, fromPromise, matchesState} from 'xstate';

const MFA_STATE = CONST.MULTIFACTOR_AUTHENTICATION.MFA_STATE;

type CancelConfirmState = typeof MFA_STATE.CANCEL_CONFIRM_HIDDEN | typeof MFA_STATE.CANCEL_CONFIRM_VISIBLE;

/** Builds an `open` state value with both regions pinned: the flow step and the dialog. */
function openAt(flow: StateValue, cancelConfirm: CancelConfirmState = MFA_STATE.CANCEL_CONFIRM_HIDDEN): StateValue {
    return {[MFA_STATE.OPEN]: {[MFA_STATE.FLOW]: flow, [MFA_STATE.CANCEL_CONFIRM]: cancelConfirm}};
}

const STEP_STATES: Array<{description: string; flow: StateValue}> = [
    {description: 'validating the device', flow: {[MFA_STATE.PREPARING]: MFA_STATE.VALIDATING_DEVICE}},
    {description: 'deciding registration', flow: {[MFA_STATE.PREPARING]: MFA_STATE.DECIDING_REGISTRATION}},
    {description: 'awaiting the validate code', flow: {[MFA_STATE.VALIDATE_CODE]: {[MFA_STATE.AWAITING_VALIDATE_CODE]: MFA_STATE.AWAITING_INPUT}}},
    {description: 'showing the invalid-code error', flow: {[MFA_STATE.VALIDATE_CODE]: {[MFA_STATE.AWAITING_VALIDATE_CODE]: MFA_STATE.INVALID_CODE}}},
    {description: 'requesting the registration challenge', flow: {[MFA_STATE.VALIDATE_CODE]: MFA_STATE.REQUESTING_REGISTRATION_CHALLENGE}},
    {description: 'awaiting the soft prompt', flow: {[MFA_STATE.PROMPT]: MFA_STATE.AWAITING_SOFT_PROMPT}},
    {description: 'registering the credential', flow: {[MFA_STATE.PROMPT]: {[MFA_STATE.CREATING_CREDENTIAL]: MFA_STATE.REGISTERING_KEY}}},
    {description: 'executing the scenario action', flow: {[MFA_STATE.PROMPT]: {[MFA_STATE.AUTHORIZING]: MFA_STATE.EXECUTING_SCENARIO_ACTION}}},
];

const FINALIZING_OUTCOME = {[MFA_STATE.OUTCOME]: MFA_STATE.FINALIZING_OUTCOME};
// Pinned to the leaf: `matchesState` accepts a shorter expected value, so `authorizing` alone would also
// match a flow that moved to another child.
const AUTHORIZING = {[MFA_STATE.PROMPT]: {[MFA_STATE.AUTHORIZING]: MFA_STATE.SIGNING_CHALLENGE}};
const EXECUTING_SCENARIO_ACTION = {[MFA_STATE.PROMPT]: {[MFA_STATE.AUTHORIZING]: MFA_STATE.EXECUTING_SCENARIO_ACTION}};

/**
 * Starts a live actor requesting the registration challenge, a step that keeps running behind the dialog,
 * with the dialog up. `resolveState` cannot start an invoke, so the actor is restored one step earlier and
 * enters the request live.
 */
function startRunningStepWithDialog() {
    let runningStepSignal: AbortSignal | undefined;
    const machine = mfaMachine.provide({
        actors: {
            requestRegistrationChallenge: fromPromise<RequestRegistrationChallengeOutput, RequestRegistrationChallengeInput>(({signal}) => {
                runningStepSignal = signal;
                return new Promise(() => {});
            }),
            finalizeOutcome: fromPromise<FinalizeOutcomeOutput, FinalizeOutcomeInput>(() => new Promise(() => {})),
        },
    });
    const snapshot = machine.resolveState({
        value: openAt({[MFA_STATE.VALIDATE_CODE]: {[MFA_STATE.AWAITING_VALIDATE_CODE]: MFA_STATE.AWAITING_INPUT}}),
        context: createFlowContext(),
    });
    const actor = createActor(machine, {snapshot});
    actor.start();
    actor.send({type: 'VALIDATE_CODE_ENTERED', validateCode: '123456'});
    actor.send({type: 'REQUEST_CANCEL'});
    return {actor, getRunningStepSignal: () => runningStepSignal};
}

// The graph-traversal suites generate their expectations from the machine, so a transition pointed at
// a wrong target adjusts those expectations and still passes. This suite pins the cancel-confirmation
// dialog and the cancel routing by hand.

describe('MFA cancel', () => {
    describe('requesting a cancel', () => {
        it.each(STEP_STATES)('opens the dialog and keeps the flow step while $description', ({flow}) => {
            // Given the flow is mid-step, where a back press should ask before abandoning the authentication
            const actor = createActorAtState(openAt(flow));

            // When the user asks to cancel
            actor.start();
            actor.send({type: 'REQUEST_CANCEL'});

            // Then the dialog opens while the step keeps its place, so dismissing it resumes exactly where the user was
            const result = actor.getSnapshot();
            expect(matchesState(openAt(flow, MFA_STATE.CANCEL_CONFIRM_VISIBLE), result.value)).toBe(true);
            expect(snapshotToState(result).isCancelConfirmVisible).toBe(true);

            actor.stop();
        });

        it.each([MFA_STATE.FINALIZING_OUTCOME, MFA_STATE.SUCCESS, MFA_STATE.FAILURE])('closes the modal from the %s outcome', (outcome) => {
            // Given the flow has its result, whether the callback is still running or the outcome screen already shows, so there is nothing left to cancel
            const actor = createActorAtState(openAt({[MFA_STATE.OUTCOME]: outcome}));

            // When the user presses back or cancel
            actor.start();
            actor.send({type: 'REQUEST_CANCEL'});

            // Then the modal closes without a dialog, because leaving can no longer change the result
            const result = actor.getSnapshot();
            expect(result.matches(MFA_STATE.CLOSING)).toBe(true);
            expect(snapshotToState(result).isCancelConfirmVisible).toBe(false);

            actor.stop();
        });
    });

    describe('while the dialog is visible', () => {
        it('hides the dialog on DISMISS_CANCEL without touching the flow step', () => {
            // Given the dialog is open over the authorizing step
            const actor = createActorAtState(openAt(AUTHORIZING, MFA_STATE.CANCEL_CONFIRM_VISIBLE));

            // When the user chooses to keep going
            actor.start();
            actor.send({type: 'DISMISS_CANCEL'});

            // Then the dialog hides and the flow stays on its step, so the user continues without redoing any work
            expect(matchesState(openAt(AUTHORIZING), actor.getSnapshot().value)).toBe(true);

            actor.stop();
        });

        it('lets the flow step finish and keeps the dialog up on the next step', () => {
            // Given the dialog is open while the registration challenge request still runs behind it
            const actor = createActorAtState(openAt({[MFA_STATE.VALIDATE_CODE]: MFA_STATE.REQUESTING_REGISTRATION_CHALLENGE}, MFA_STATE.CANCEL_CONFIRM_VISIBLE), {
                validateCode: '123456',
            });

            // When the request finishes before the user answers the dialog
            actor.start();
            sendRequestRegistrationChallengeDone(actor, {success: true, challenge: MFA_TEST_REGISTRATION_CHALLENGE});

            // Then the flow advances but the dialog stays up, because background progress must not dismiss the user's pending decision
            expect(matchesState(openAt({[MFA_STATE.PROMPT]: MFA_STATE.AWAITING_SOFT_PROMPT}, MFA_STATE.CANCEL_CONFIRM_VISIBLE), actor.getSnapshot().value)).toBe(true);

            actor.stop();
        });

        it('ignores a second REQUEST_CANCEL', () => {
            // Given the dialog is already open
            const actor = createActorAtState(openAt(AUTHORIZING, MFA_STATE.CANCEL_CONFIRM_VISIBLE));

            // When another cancel request arrives, e.g. from a repeated back press
            actor.start();
            actor.send({type: 'REQUEST_CANCEL'});

            // Then the dialog stays as is, so repeated presses never stack dialogs or skip the confirmation
            expect(matchesState(openAt(AUTHORIZING, MFA_STATE.CANCEL_CONFIRM_VISIBLE), actor.getSnapshot().value)).toBe(true);

            actor.stop();
        });

        // A restored snapshot never evaluates `always`, so this case has to reach the outcome through a live event.
        // A scenario action already sent can't be held, so it is the step that finishes behind the dialog.
        it('hides the dialog once the flow reaches the outcome', () => {
            // Given the dialog is open while the scenario action, which can't be held back once sent, is in flight
            const actor = createActorAtState(openAt(EXECUTING_SCENARIO_ACTION, MFA_STATE.CANCEL_CONFIRM_VISIBLE));

            // When the scenario action finishes before the user answers
            actor.start();
            sendExecuteScenarioActionDone(actor, {success: true, scenarioResponse: MFA_TEST_SCENARIO_RESPONSE});

            // Then the dialog hides, because the outcome is decided and there is nothing left to cancel
            const result = actor.getSnapshot();
            expect(matchesState(openAt(FINALIZING_OUTCOME), result.value)).toBe(true);
            expect(snapshotToState(result).isCancelConfirmVisible).toBe(false);

            actor.stop();
        });

        it('closes the modal and hides the dialog on CLOSE_MODAL', () => {
            // Given the dialog is open over the authorizing step
            const actor = createActorAtState(openAt(AUTHORIZING, MFA_STATE.CANCEL_CONFIRM_VISIBLE));

            // When the modal is closed from outside the dialog, e.g. because the account changed
            actor.start();
            actor.send({type: 'CLOSE_MODAL'});

            // Then the modal closes and takes the dialog with it, so it can't linger over the closing navigator
            const result = actor.getSnapshot();
            expect(result.matches(MFA_STATE.CLOSING)).toBe(true);
            expect(snapshotToState(result).isCancelConfirmVisible).toBe(false);

            actor.stop();
        });
    });

    describe('starting a new flow after a cancel', () => {
        it('opens with the dialog hidden', () => {
            // Given a flow that was cancelled from the dialog and closed, with the next flow's first step held open
            const machine = mfaMachine.provide({
                actors: {validateDevice: fromPromise<MFAResult, ValidateDeviceInput>(() => new Promise(() => {}))},
            });
            const snapshot = machine.resolveState({value: openAt(AUTHORIZING, MFA_STATE.CANCEL_CONFIRM_VISIBLE), context: createFlowContext()});
            const actor = createActor(machine, {snapshot});
            actor.start();
            actor.send({type: 'CONFIRM_CANCEL'});
            actor.send({type: 'MODAL_CLOSED'});
            expect(actor.getSnapshot().matches(MFA_STATE.CLOSED)).toBe(true);

            // When a new flow starts
            actor.send(createInitEvent());

            // Then it opens with no dialog, so a cancel confirmed last time can't greet the user again
            const result = actor.getSnapshot();
            expect(matchesState(openAt({[MFA_STATE.PREPARING]: MFA_STATE.VALIDATING_DEVICE}), result.value)).toBe(true);
            expect(snapshotToState(result).isCancelConfirmVisible).toBe(false);

            actor.stop();
        });
    });

    describe('confirming the cancel', () => {
        it('closes the modal and hides the dialog', () => {
            // Given the dialog is open over the authorizing step
            const actor = createActorAtState(openAt(AUTHORIZING, MFA_STATE.CANCEL_CONFIRM_VISIBLE));

            // When the user confirms they want to leave
            actor.start();
            actor.send({type: 'CONFIRM_CANCEL'});

            // Then the modal closes with the dialog hidden
            const result = actor.getSnapshot();
            expect(result.matches(MFA_STATE.CLOSING)).toBe(true);
            expect(snapshotToState(result).isCancelConfirmVisible).toBe(false);

            actor.stop();
        });

        it('is ignored while the dialog is hidden', () => {
            // Given no dialog is shown
            const actor = createActorAtState(openAt(AUTHORIZING));

            // When a confirm arrives anyway, e.g. a stale tap from a dialog that already closed
            actor.start();
            actor.send({type: 'CONFIRM_CANCEL'});

            // Then it is ignored, because a cancel must always be confirmed through a visible dialog
            expect(matchesState(openAt(AUTHORIZING), actor.getSnapshot().value)).toBe(true);

            actor.stop();
        });

        it('stops the running step and aborts its signal', () => {
            // Given a step is running with the dialog up
            const {actor, getRunningStepSignal} = startRunningStepWithDialog();
            expect(actor.getSnapshot().children).toHaveProperty('requestRegistrationChallenge');
            expect(getRunningStepSignal()?.aborted).toBe(false);

            // When the user confirms the cancel
            actor.send({type: 'CONFIRM_CANCEL'});

            // Then the step is stopped and its signal aborted, so the in-flight request is dropped and its late result can't move the flow
            expect(actor.getSnapshot().children).not.toHaveProperty('requestRegistrationChallenge');
            expect(getRunningStepSignal()?.aborted).toBe(true);

            actor.stop();
        });
    });
});
