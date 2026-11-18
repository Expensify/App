import {getScenarioConfig} from '@components/MultifactorAuthentication/config';
import mfaMachine from '@components/MultifactorAuthentication/machine/mfaMachine';
import snapshotToState from '@components/MultifactorAuthentication/machine/snapshotToState';
import type {
    AuthorizeInput,
    AuthorizeOutput,
    CancelScenarioInput,
    CancelScenarioOutput,
    CreateCredentialInput,
    CreateCredentialOutput,
    ExecuteScenarioActionInput,
    ExecuteScenarioActionOutput,
    FinalizeOutcomeInput,
    FinalizeOutcomeOutput,
    LoadRegistrationStateInput,
    LoadRegistrationStateOutput,
    MfaContext,
    RegisterCredentialInput,
    RegisterCredentialOutput,
    RequestRegistrationChallengeInput,
    RequestRegistrationChallengeOutput,
    ValidateDeviceInput,
} from '@components/MultifactorAuthentication/machine/types';

import type {MFAResult} from '@libs/MultifactorAuthentication/shared/MFAResult';
import {createLocalMFAError, createMFAErrorFromApiResponse} from '@libs/MultifactorAuthentication/shared/MFAResult';
import type {MultifactorAuthenticationReason} from '@libs/MultifactorAuthentication/shared/types';

import CONST from '@src/CONST';

import type {StateValue} from 'xstate';

import {createActorAtState, createFlowContext, sendExecuteScenarioActionDone, sendRegisterCredentialDone, sendRequestRegistrationChallengeDone} from 'tests/utils/mfa/flowActors';
import createInitEvent, {
    MFA_TEST_AUTH_METHOD,
    MFA_TEST_CANCEL_ERROR,
    MFA_TEST_KEY_INFO,
    MFA_TEST_REGISTRATION_CHALLENGE,
    MFA_TEST_SCENARIO_RESPONSE,
    MFA_TEST_SIGNED_CHALLENGE,
} from 'tests/utils/mfa/flowFixtures';
import {createActorDoneEvent} from 'tests/utils/mfa/flowPaths';
import waitForBatchedUpdates from 'tests/utils/waitForBatchedUpdates';
import {createActor, fromPromise, matchesState, SimulatedClock, waitFor} from 'xstate';

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
const EXECUTING_SCENARIO_ACTION = {[MFA_STATE.PROMPT]: {[MFA_STATE.AUTHORIZING]: MFA_STATE.EXECUTING_SCENARIO_ACTION}};
const WAITING_TO_SIGN = {[MFA_STATE.PROMPT]: {[MFA_STATE.AUTHORIZING]: MFA_STATE.WAITING_TO_SIGN}};
// Pinned to the leaf: `matchesState` accepts a shorter expected value, so `authorizing` alone would also
// match a flow that moved to another child.
const SIGNING_CHALLENGE = {[MFA_STATE.PROMPT]: {[MFA_STATE.AUTHORIZING]: MFA_STATE.SIGNING_CHALLENGE}};
const WAITING_TO_CREATE = {[MFA_STATE.PROMPT]: {[MFA_STATE.CREATING_CREDENTIAL]: MFA_STATE.WAITING_TO_CREATE}};
const CREATING_KEY = {[MFA_STATE.PROMPT]: {[MFA_STATE.CREATING_CREDENTIAL]: MFA_STATE.CREATING_KEY}};
const REGISTERING_KEY = {[MFA_STATE.PROMPT]: {[MFA_STATE.CREATING_CREDENTIAL]: MFA_STATE.REGISTERING_KEY}};

const CANCEL_TIMEOUT_MS = CONST.MULTIFACTOR_AUTHENTICATION.CANCEL_TIMEOUT_MS;

/** Never settles, so the invoked actor stays running until the machine stops it. */
const pendingCancelScenario = fromPromise<CancelScenarioOutput, CancelScenarioInput>(() => new Promise(() => {}));

/**
 * Starts a live actor requesting the registration challenge, a step that keeps running behind the dialog,
 * with the dialog up and the given cancel actor. `resolveState` cannot start an invoke, so the actor is
 * restored one step earlier and enters the request live.
 */
function startRunningStepWithDialog(cancelScenario = pendingCancelScenario, contextOverrides: Partial<MfaContext> = {}) {
    let runningStepSignal: AbortSignal | undefined;
    const machine = mfaMachine.provide({
        actors: {
            requestRegistrationChallenge: fromPromise<RequestRegistrationChallengeOutput, RequestRegistrationChallengeInput>(({signal}) => {
                runningStepSignal = signal;
                return new Promise(() => {});
            }),
            cancelScenario,
            finalizeOutcome: fromPromise<FinalizeOutcomeOutput, FinalizeOutcomeInput>(() => new Promise(() => {})),
        },
    });
    const snapshot = machine.resolveState({
        value: openAt({[MFA_STATE.VALIDATE_CODE]: {[MFA_STATE.AWAITING_VALIDATE_CODE]: MFA_STATE.AWAITING_INPUT}}),
        context: createFlowContext(contextOverrides),
    });
    const clock = new SimulatedClock();
    const actor = createActor(machine, {snapshot, clock});
    actor.start();
    actor.send({type: 'VALIDATE_CODE_ENTERED', validateCode: '123456'});
    actor.send({type: 'REQUEST_CANCEL'});
    return {actor, clock, getRunningStepSignal: () => runningStepSignal};
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
            const actor = createActorAtState(openAt(SIGNING_CHALLENGE, MFA_STATE.CANCEL_CONFIRM_VISIBLE));

            // When the user chooses to keep going
            actor.start();
            actor.send({type: 'DISMISS_CANCEL'});

            // Then the dialog hides and the flow stays on its step, so the user continues without redoing any work
            expect(matchesState(openAt(SIGNING_CHALLENGE), actor.getSnapshot().value)).toBe(true);

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

        it('holds a registration that finishes behind the dialog before the ceremony, so the scenario action never starts', () => {
            // Given the dialog is open while the backend registration of a new key runs behind it
            const actor = createActorAtState(openAt(REGISTERING_KEY, MFA_STATE.CANCEL_CONFIRM_VISIBLE), {registrationKeyInfo: MFA_TEST_KEY_INFO});

            // When the registration finishes before the user answers
            actor.start();
            sendRegisterCredentialDone(actor, {success: true});

            // Then the flow waits before the signing ceremony, because its platform prompt would cover the dialog and the user may still confirm the cancel
            const result = actor.getSnapshot();
            expect(matchesState(openAt(WAITING_TO_SIGN, MFA_STATE.CANCEL_CONFIRM_VISIBLE), result.value)).toBe(true);
            expect(result.children).not.toHaveProperty('authorize');

            actor.stop();
        });

        it('ignores a second REQUEST_CANCEL', () => {
            // Given the dialog is already open, with signing paused behind it
            const actor = createActorAtState(openAt(WAITING_TO_SIGN, MFA_STATE.CANCEL_CONFIRM_VISIBLE));

            // When another cancel request arrives, e.g. from a repeated back press
            actor.start();
            actor.send({type: 'REQUEST_CANCEL'});

            // Then the dialog stays as is, so repeated presses never stack dialogs or skip the confirmation
            expect(matchesState(openAt(WAITING_TO_SIGN, MFA_STATE.CANCEL_CONFIRM_VISIBLE), actor.getSnapshot().value)).toBe(true);

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
            const actor = createActorAtState(openAt(SIGNING_CHALLENGE, MFA_STATE.CANCEL_CONFIRM_VISIBLE));

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
            const snapshot = machine.resolveState({value: openAt(SIGNING_CHALLENGE, MFA_STATE.CANCEL_CONFIRM_VISIBLE), context: createFlowContext()});
            const actor = createActor(machine, {snapshot});
            actor.start();
            actor.send({type: 'CONFIRM_CANCEL'});
            actor.send({type: 'CLOSE_MODAL'});
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
        it('moves the flow to cancelling and hides the dialog', () => {
            // Given the dialog is open over the authorizing step
            const actor = createActorAtState(openAt(SIGNING_CHALLENGE, MFA_STATE.CANCEL_CONFIRM_VISIBLE));

            // When the user confirms they want to leave
            actor.start();
            actor.send({type: 'CONFIRM_CANCEL'});

            // Then the flow moves to cancelling and the dialog hides, so the scenario's cancel logic can run and lead to an outcome screen
            const result = actor.getSnapshot();
            expect(matchesState(openAt(MFA_STATE.CANCELLING), result.value)).toBe(true);
            expect(snapshotToState(result).isCancelConfirmVisible).toBe(false);

            actor.stop();
        });

        it('is ignored while the dialog is hidden', () => {
            // Given no dialog is shown
            const actor = createActorAtState(openAt(SIGNING_CHALLENGE));

            // When a confirm arrives anyway, e.g. a stale tap from a dialog that already closed
            actor.start();
            actor.send({type: 'CONFIRM_CANCEL'});

            // Then it is ignored, because a cancel must always be confirmed through a visible dialog
            expect(matchesState(openAt(SIGNING_CHALLENGE), actor.getSnapshot().value)).toBe(true);

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

        it('hands the scenario cancel logic and payload to the cancel actor', () => {
            // Given a scenario without its own cancel logic and a running step with the dialog up
            let receivedInput: CancelScenarioInput | undefined;
            const {actor} = startRunningStepWithDialog(
                fromPromise<CancelScenarioOutput, CancelScenarioInput>(({input}) => {
                    receivedInput = input;
                    return new Promise(() => {});
                }),
            );

            // When the user confirms the cancel
            actor.send({type: 'CONFIRM_CANCEL'});

            // Then the cancel actor gets the scenario's cancel inputs
            // BIOMETRICS_TEST defines no `onCancel`, so the actor falls back to the default cancel error.
            expect(receivedInput).toEqual({onCancel: undefined, payload: undefined});

            actor.stop();
        });

        it('hands a scenario-defined onCancel and its payload to the cancel actor', () => {
            // Given the authorize-transaction scenario, which denies the transaction on cancel
            const scenarioName = CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.AUTHORIZE_TRANSACTION;
            const scenario = getScenarioConfig(scenarioName);
            const payload = {transactionID: 'txn-cancel'};
            let receivedInput: CancelScenarioInput | undefined;
            const {actor} = startRunningStepWithDialog(
                fromPromise<CancelScenarioOutput, CancelScenarioInput>(({input}) => {
                    receivedInput = input;
                    return new Promise(() => {});
                }),
                {scenarioName, scenario, payload},
            );

            // When the user confirms the cancel before the scenario action was sent
            actor.send({type: 'CONFIRM_CANCEL'});

            // Then the cancel actor gets that scenario's onCancel and payload, so the right transaction is denied
            expect(receivedInput?.onCancel).toBe(scenario.onCancel);
            expect(receivedInput?.payload).toEqual(payload);

            actor.stop();
        });

        it('runs the cancel actor once on a double confirm', () => {
            // Given a running step with the dialog up
            let cancelRuns = 0;
            const {actor} = startRunningStepWithDialog(
                fromPromise<CancelScenarioOutput, CancelScenarioInput>(() => {
                    cancelRuns += 1;
                    return new Promise(() => {});
                }),
            );

            // When the confirm arrives twice, e.g. from a double tap
            actor.send({type: 'CONFIRM_CANCEL'});
            actor.send({type: 'CONFIRM_CANCEL'});

            // Then the cancel logic runs once, so a scenario like authorize-transaction never sends two deny requests
            expect(cancelRuns).toBe(1);

            actor.stop();
        });
    });

    describe('while cancelling', () => {
        it('does not reopen the dialog on REQUEST_CANCEL', () => {
            // Given the cancel is already confirmed and its logic is running
            const actor = createActorAtState(openAt(MFA_STATE.CANCELLING));

            // When the user presses back again
            actor.start();
            actor.send({type: 'REQUEST_CANCEL'});

            // Then the dialog stays closed, because the user already decided and the cancel can't be undone
            expect(matchesState(openAt(MFA_STATE.CANCELLING), actor.getSnapshot().value)).toBe(true);

            actor.stop();
        });

        it('fails the flow with the cancel actor output', () => {
            // Given the cancel logic is running
            const actor = createActorAtState(openAt(MFA_STATE.CANCELLING));

            // When it finishes with its error
            actor.start();
            actor.send(createActorDoneEvent('cancelScenario', MFA_TEST_CANCEL_ERROR));

            // Then the flow finalizes with that error, so the cancel goes through the same outcome path as any other failure
            const result = actor.getSnapshot();
            expect(matchesState(openAt(FINALIZING_OUTCOME), result.value)).toBe(true);
            expect(result.context.error).toBe(MFA_TEST_CANCEL_ERROR);

            actor.stop();
        });

        it('fails the flow with an unhandled-exception error when the cancel logic throws', async () => {
            // Given scenario cancel logic that throws
            const {actor} = startRunningStepWithDialog(fromPromise<CancelScenarioOutput, CancelScenarioInput>(() => Promise.reject(new Error('Deny exploded'))));

            // When the user confirms the cancel
            actor.send({type: 'CONFIRM_CANCEL'});
            await waitForBatchedUpdates();

            // Then the flow still reaches an outcome with an unhandled-exception error, so the user isn't stuck in cancelling
            const result = actor.getSnapshot();
            expect(matchesState(openAt(FINALIZING_OUTCOME), result.value)).toBe(true);
            expect(result.context.error).toEqual(createLocalMFAError(CONST.MULTIFACTOR_AUTHENTICATION.REASON.LOCAL_ERRORS.UNHANDLED_EXCEPTION, 'Cancel threw: Deny exploded'));

            actor.stop();
        });

        it('keeps waiting for the cancel logic until the timeout', () => {
            // Given a confirmed cancel whose logic hasn't returned
            const {actor, clock} = startRunningStepWithDialog();
            actor.send({type: 'CONFIRM_CANCEL'});

            // When the wait gets close to the timeout
            clock.increment(CANCEL_TIMEOUT_MS - 1);

            // Then the flow keeps waiting
            expect(matchesState(openAt(MFA_STATE.CANCELLING), actor.getSnapshot().value)).toBe(true);

            actor.stop();
        });

        it('fails the flow as a request without a response when the cancel logic does not return in time', () => {
            // Given a confirmed cancel whose logic never returns, e.g. a hung deny
            const {actor, clock} = startRunningStepWithDialog();
            actor.send({type: 'CONFIRM_CANCEL'});

            // When the wait times out
            clock.increment(CANCEL_TIMEOUT_MS);

            // Then the flow fails the same way a request without a response does, so back and Escape being blocked can't strand the user
            const result = actor.getSnapshot();
            expect(matchesState(openAt(FINALIZING_OUTCOME), result.value)).toBe(true);
            expect(result.context.error?.reason).toBe(CONST.MULTIFACTOR_AUTHENTICATION.REASON.LOCAL_ERRORS.UNHANDLED_API_RESPONSE);

            actor.stop();
        });

        it('keeps the timed-out outcome when the cancel logic returns afterwards', async () => {
            // Given a confirmed cancel that timed out before its logic returned
            let resolveCancel: ((error: CancelScenarioOutput) => void) | undefined;
            const {actor, clock} = startRunningStepWithDialog(
                fromPromise<CancelScenarioOutput, CancelScenarioInput>(
                    () =>
                        new Promise((resolve) => {
                            resolveCancel = resolve;
                        }),
                ),
            );
            actor.send({type: 'CONFIRM_CANCEL'});
            clock.increment(CANCEL_TIMEOUT_MS);

            // When the cancel logic returns late
            resolveCancel?.(MFA_TEST_CANCEL_ERROR);
            await waitForBatchedUpdates();

            // Then the outcome stays the same, because leaving for the outcome stopped the cancel actor
            expect(actor.getSnapshot().context.error?.reason).toBe(CONST.MULTIFACTOR_AUTHENTICATION.REASON.LOCAL_ERRORS.UNHANDLED_API_RESPONSE);

            actor.stop();
        });

        it('moves to closing on CLOSE_MODAL', () => {
            // Given the cancel logic is running
            const actor = createActorAtState(openAt(MFA_STATE.CANCELLING));

            // When the modal is closed, e.g. by navigating away
            actor.start();
            actor.send({type: 'CLOSE_MODAL'});

            // Then the machine closes, because closing the modal always wins over waiting for the cancel
            expect(actor.getSnapshot().matches(MFA_STATE.CLOSING)).toBe(true);

            actor.stop();
        });
    });

    /** Starts a live actor at the soft prompt with the given actors and approves it, so the ceremony begins. */
    function startFromSoftPrompt(actors: Parameters<typeof mfaMachine.provide>[0]['actors'], context: ReturnType<typeof createFlowContext>) {
        const machine = mfaMachine.provide({actors});
        const actor = createActor(machine, {snapshot: machine.resolveState({value: openAt({[MFA_STATE.PROMPT]: MFA_STATE.AWAITING_SOFT_PROMPT}), context})});
        actor.start();
        actor.send({type: 'SOFT_PROMPT_APPROVED'});
        return actor;
    }

    describe('stopping the credential ceremony when the dialog opens', () => {
        /**
         * Starts a live actor that enters credential creation with controllable actors. Each ceremony run settles
         * only when the spec resolves it, and the backend registration records each run and never settles.
         */
        function startCreatingKey() {
            let resolveCreateCredential: (output: CreateCredentialOutput) => void = () => {};
            const createCredentialInputs: Array<{input: CreateCredentialInput; signal: AbortSignal}> = [];
            const registerCredentialInputs: RegisterCredentialInput[] = [];
            const actor = startFromSoftPrompt(
                {
                    createCredential: fromPromise<CreateCredentialOutput, CreateCredentialInput>(({input, signal}) => {
                        createCredentialInputs.push({input, signal});
                        return new Promise((resolve) => {
                            resolveCreateCredential = resolve;
                        });
                    }),
                    registerCredential: fromPromise<RegisterCredentialOutput, RegisterCredentialInput>(({input}) => {
                        registerCredentialInputs.push(input);
                        return new Promise(() => {});
                    }),
                    cancelScenario: pendingCancelScenario,
                },
                createFlowContext({registrationChallenge: MFA_TEST_REGISTRATION_CHALLENGE}),
            );
            const finishCreatingKey = async () => {
                resolveCreateCredential({success: true, keyInfo: MFA_TEST_KEY_INFO});
                await waitForBatchedUpdates();
            };
            return {actor, createCredentialInputs, registerCredentialInputs, finishCreatingKey};
        }

        it('registers the key straight away when no dialog is up', async () => {
            // Given the platform ceremony to create a key is running with no dialog up
            const {actor, registerCredentialInputs, finishCreatingKey} = startCreatingKey();

            // When the ceremony returns a new key
            await finishCreatingKey();

            // Then the key is registered with the backend right away, because nothing is waiting on the user
            expect(matchesState(openAt(REGISTERING_KEY), actor.getSnapshot().value)).toBe(true);
            expect(registerCredentialInputs).toEqual([{keyInfo: MFA_TEST_KEY_INFO}]);

            actor.stop();
        });

        it('stops the ceremony and aborts its signal, so the platform prompt never opens over the dialog', () => {
            // Given the platform ceremony to create a key is running
            const {actor, createCredentialInputs} = startCreatingKey();
            expect(createCredentialInputs.at(0)?.signal.aborted).toBe(false);

            // When the user asks to cancel
            actor.send({type: 'REQUEST_CANCEL'});

            // Then the ceremony is stopped, because the platform prompt would cover the dialog and the user couldn't answer it
            const result = actor.getSnapshot();
            expect(matchesState(openAt(WAITING_TO_CREATE, MFA_STATE.CANCEL_CONFIRM_VISIBLE), result.value)).toBe(true);
            expect(result.children).not.toHaveProperty('createCredential');
            expect(createCredentialInputs.at(0)?.signal.aborted).toBe(true);

            actor.stop();
        });

        it('drops a ceremony that finishes after the dialog opened and never registers its key', async () => {
            // Given the dialog opened while the key ceremony was running
            const {actor, registerCredentialInputs, finishCreatingKey} = startCreatingKey();
            actor.send({type: 'REQUEST_CANCEL'});

            // When the stopped ceremony still returns a key afterwards
            await finishCreatingKey();

            // Then the key is ignored, so no credential is registered while the user may be about to cancel
            const result = actor.getSnapshot();
            expect(matchesState(openAt(WAITING_TO_CREATE, MFA_STATE.CANCEL_CONFIRM_VISIBLE), result.value)).toBe(true);
            expect(result.context.registrationKeyInfo).toBeUndefined();
            expect(registerCredentialInputs).toHaveLength(0);

            actor.stop();
        });

        it('restarts the ceremony with the same registration challenge once the dialog is dismissed', async () => {
            // Given the dialog stopped the key ceremony
            const {actor, createCredentialInputs, registerCredentialInputs, finishCreatingKey} = startCreatingKey();
            actor.send({type: 'REQUEST_CANCEL'});

            // When the user dismisses the dialog to continue
            actor.send({type: 'DISMISS_CANCEL'});

            // Then the ceremony restarts with the same challenge, so the user can finish creating the key without requesting a new one
            expect(matchesState(openAt(CREATING_KEY), actor.getSnapshot().value)).toBe(true);
            expect(createCredentialInputs).toHaveLength(2);
            expect(createCredentialInputs.at(1)?.input.registrationChallenge).toBe(MFA_TEST_REGISTRATION_CHALLENGE);
            expect(createCredentialInputs.at(1)?.signal.aborted).toBe(false);

            // When the restarted ceremony returns a key
            await finishCreatingKey();

            // Then the key is registered as usual, so dismissing the dialog leaves the flow working normally
            expect(matchesState(openAt(REGISTERING_KEY), actor.getSnapshot().value)).toBe(true);
            expect(registerCredentialInputs).toEqual([{keyInfo: MFA_TEST_KEY_INFO}]);

            actor.stop();
        });

        it('never restarts the ceremony once the cancel is confirmed', () => {
            // Given the dialog stopped the key ceremony
            const {actor, createCredentialInputs, registerCredentialInputs} = startCreatingKey();
            actor.send({type: 'REQUEST_CANCEL'});

            // When the user confirms the cancel
            actor.send({type: 'CONFIRM_CANCEL'});

            // Then no new ceremony starts, so the platform prompt never appears after the user chose to leave
            expect(matchesState(openAt(MFA_STATE.CANCELLING), actor.getSnapshot().value)).toBe(true);
            expect(createCredentialInputs).toHaveLength(1);
            expect(registerCredentialInputs).toHaveLength(0);

            actor.stop();
        });

        it('keeps the backend registration running behind the dialog', async () => {
            // Given a key was created and its backend registration is in flight
            const {actor, registerCredentialInputs, finishCreatingKey} = startCreatingKey();
            await finishCreatingKey();

            // When the user asks to cancel
            actor.send({type: 'REQUEST_CANCEL'});

            // Then the registration keeps running, because a sent request can't be taken back and a registered key is harmless if the user cancels
            const result = actor.getSnapshot();
            expect(matchesState(openAt(REGISTERING_KEY, MFA_STATE.CANCEL_CONFIRM_VISIBLE), result.value)).toBe(true);
            expect(result.children).toHaveProperty('registerCredential');
            expect(registerCredentialInputs).toHaveLength(1);

            actor.stop();
        });

        it('drops the key info when the flow leaves credential creation', async () => {
            // Given a key was created and stored in the context
            const {actor, finishCreatingKey} = startCreatingKey();
            await finishCreatingKey();
            expect(actor.getSnapshot().context.registrationKeyInfo).toBe(MFA_TEST_KEY_INFO);

            // When the modal closes before the key is registered
            actor.send({type: 'CLOSE_MODAL'});

            // Then the key info is cleared, so a later flow can't register a stale key
            const result = actor.getSnapshot();
            expect(result.matches(MFA_STATE.CLOSING)).toBe(true);
            expect(result.context.registrationKeyInfo).toBeUndefined();

            actor.stop();
        });
    });

    describe('stopping the ceremony when the dialog opens', () => {
        /**
         * Starts a live actor that enters `authorizing` with controllable actors. Each ceremony run settles only
         * when the spec resolves it, and the scenario action records each run and never settles.
         */
        function startSigning() {
            let resolveAuthorize: (output: AuthorizeOutput) => void = () => {};
            const authorizeSignals: AbortSignal[] = [];
            const scenarioActionInputs: ExecuteScenarioActionInput[] = [];
            const context = createFlowContext();
            const actor = startFromSoftPrompt(
                {
                    authorize: fromPromise<AuthorizeOutput, AuthorizeInput>(({signal}) => {
                        authorizeSignals.push(signal);
                        return new Promise((resolve) => {
                            resolveAuthorize = resolve;
                        });
                    }),
                    executeScenarioAction: fromPromise<ExecuteScenarioActionOutput, ExecuteScenarioActionInput>(({input}) => {
                        scenarioActionInputs.push(input);
                        return new Promise(() => {});
                    }),
                    cancelScenario: pendingCancelScenario,
                    finalizeOutcome: fromPromise<FinalizeOutcomeOutput, FinalizeOutcomeInput>(() => new Promise(() => {})),
                },
                context,
            );
            const finishSigning = async () => {
                resolveAuthorize({success: true, signedChallenge: MFA_TEST_SIGNED_CHALLENGE, authenticationMethod: MFA_TEST_AUTH_METHOD});
                await waitForBatchedUpdates();
            };
            return {actor, context, authorizeSignals, scenarioActionInputs, finishSigning};
        }

        it('sends the scenario action straight away when no dialog is up', async () => {
            // Given the signing ceremony is running with no dialog up
            const {actor, scenarioActionInputs, finishSigning} = startSigning();

            // When the ceremony returns a signed challenge
            await finishSigning();

            // Then the scenario action is sent right away, because nothing is waiting on the user
            expect(matchesState(openAt(EXECUTING_SCENARIO_ACTION), actor.getSnapshot().value)).toBe(true);
            expect(scenarioActionInputs).toHaveLength(1);

            actor.stop();
        });

        it('stops the ceremony and aborts its signal, so the platform prompt never opens over the dialog', () => {
            // Given the signing ceremony is running
            const {actor, authorizeSignals} = startSigning();
            expect(authorizeSignals.at(0)?.aborted).toBe(false);

            // When the user asks to cancel
            actor.send({type: 'REQUEST_CANCEL'});

            // Then the ceremony is stopped, because the platform prompt would cover the dialog and the user couldn't answer it
            const result = actor.getSnapshot();
            expect(matchesState(openAt(WAITING_TO_SIGN, MFA_STATE.CANCEL_CONFIRM_VISIBLE), result.value)).toBe(true);
            expect(result.children).not.toHaveProperty('authorize');
            expect(authorizeSignals.at(0)?.aborted).toBe(true);

            actor.stop();
        });

        it('drops a ceremony that finishes after the dialog opened and never sends the scenario action', async () => {
            // Given the dialog opened while the signing ceremony was running
            const {actor, scenarioActionInputs, finishSigning} = startSigning();
            actor.send({type: 'REQUEST_CANCEL'});

            // When the stopped ceremony still returns a signed challenge
            await finishSigning();

            // Then the challenge is dropped and the scenario action never sent, so e.g. a payment isn't approved while the user may be cancelling
            const result = actor.getSnapshot();
            expect(matchesState(openAt(WAITING_TO_SIGN, MFA_STATE.CANCEL_CONFIRM_VISIBLE), result.value)).toBe(true);
            expect(result.context.signedChallenge).toBeUndefined();
            expect(scenarioActionInputs).toHaveLength(0);

            actor.stop();
        });

        it('starts a fresh ceremony run once the dialog is dismissed and sends the scenario action with its signed challenge', async () => {
            // Given the dialog stopped the signing ceremony
            const {actor, context, authorizeSignals, scenarioActionInputs, finishSigning} = startSigning();
            actor.send({type: 'REQUEST_CANCEL'});

            // When the user dismisses the dialog to continue
            actor.send({type: 'DISMISS_CANCEL'});

            // Then a new ceremony run starts, so the user gets the platform prompt again
            expect(matchesState(openAt(SIGNING_CHALLENGE), actor.getSnapshot().value)).toBe(true);
            expect(authorizeSignals).toHaveLength(2);
            expect(authorizeSignals.at(1)?.aborted).toBe(false);

            // When the restarted ceremony returns a signed challenge
            await finishSigning();

            // Then the scenario action is sent with that challenge, so dismissing the dialog leaves the flow working normally
            expect(matchesState(openAt(EXECUTING_SCENARIO_ACTION), actor.getSnapshot().value)).toBe(true);
            expect(scenarioActionInputs).toEqual([{runScenarioAction: context.runScenarioAction, signedChallenge: MFA_TEST_SIGNED_CHALLENGE, authenticationMethod: MFA_TEST_AUTH_METHOD}]);

            actor.stop();
        });

        it('never restarts the ceremony once the cancel is confirmed', () => {
            // Given the dialog stopped the signing ceremony
            const {actor, authorizeSignals, scenarioActionInputs} = startSigning();
            actor.send({type: 'REQUEST_CANCEL'});

            // When the user confirms the cancel
            actor.send({type: 'CONFIRM_CANCEL'});

            // Then no new ceremony runs and nothing is sent, so e.g. a payment is never approved after the user chose to leave
            expect(matchesState(openAt(MFA_STATE.CANCELLING), actor.getSnapshot().value)).toBe(true);
            expect(authorizeSignals).toHaveLength(1);
            expect(scenarioActionInputs).toHaveLength(0);

            actor.stop();
        });

        it('drops the signed challenge when the flow leaves authorizing', async () => {
            // Given a signed challenge was stored in the context
            const {actor, finishSigning} = startSigning();
            await finishSigning();
            expect(actor.getSnapshot().context.signedChallenge).toBe(MFA_TEST_SIGNED_CHALLENGE);

            // When the modal closes before the scenario action runs
            actor.send({type: 'CLOSE_MODAL'});

            // Then the signed challenge is cleared, so a later flow can't reuse it
            const result = actor.getSnapshot();
            expect(result.matches(MFA_STATE.CLOSING)).toBe(true);
            expect(result.context.signedChallenge).toBeUndefined();

            actor.stop();
        });
    });

    describe('when the flow reaches signing behind the dialog', () => {
        /**
         * Starts a live flow for a returning user, optionally opening the dialog during the device check.
         * The preparing steps resolve on their own, so the flow reaches `authorizing` without a user action,
         * the way a credential registration finishing behind the dialog does.
         */
        async function reachAuthorizing({isDialogUp}: {isDialogUp: boolean}) {
            let authorizeRuns = 0;
            const machine = mfaMachine.provide({
                actors: {
                    validateDevice: fromPromise<MFAResult, ValidateDeviceInput>(() => Promise.resolve({success: true})),
                    loadRegistrationState: fromPromise<LoadRegistrationStateOutput, LoadRegistrationStateInput>(() =>
                        Promise.resolve({hasServerCredentials: true, hasLocalCredentials: true, hasEverAcceptedSoftPrompt: true}),
                    ),
                    authorize: fromPromise<AuthorizeOutput, AuthorizeInput>(() => {
                        authorizeRuns += 1;
                        return new Promise(() => {});
                    }),
                    cancelScenario: pendingCancelScenario,
                },
            });
            const actor = createActor(machine);
            actor.start();
            actor.send(createInitEvent());
            if (isDialogUp) {
                actor.send({type: 'REQUEST_CANCEL'});
            }
            await waitFor(actor, (snapshot) => snapshot.matches({[MFA_STATE.OPEN]: {[MFA_STATE.FLOW]: {[MFA_STATE.PROMPT]: MFA_STATE.AUTHORIZING}}}));
            return {actor, getAuthorizeRuns: () => authorizeRuns};
        }

        it('starts the ceremony straight away when no dialog is up', async () => {
            // Given a returning user with no dialog up
            // When the flow reaches the signing step on its own
            const {actor, getAuthorizeRuns} = await reachAuthorizing({isDialogUp: false});

            // Then the ceremony starts right away, because nothing is waiting on the user
            expect(matchesState(openAt(SIGNING_CHALLENGE), actor.getSnapshot().value)).toBe(true);
            expect(getAuthorizeRuns()).toBe(1);

            actor.stop();
        });

        it('holds the ceremony while the dialog is up, so the platform prompt never covers it', async () => {
            // Given a returning user who opened the dialog during the device check
            // When the flow reaches the signing step on its own behind the dialog
            const {actor, getAuthorizeRuns} = await reachAuthorizing({isDialogUp: true});

            // Then the ceremony is held, because the platform prompt would cover the dialog and the user couldn't answer it
            expect(matchesState(openAt(WAITING_TO_SIGN, MFA_STATE.CANCEL_CONFIRM_VISIBLE), actor.getSnapshot().value)).toBe(true);
            expect(actor.getSnapshot().children).not.toHaveProperty('authorize');
            expect(getAuthorizeRuns()).toBe(0);

            actor.stop();
        });

        it('starts the held ceremony once the dialog is dismissed', async () => {
            // Given the ceremony is held behind the dialog
            const {actor, getAuthorizeRuns} = await reachAuthorizing({isDialogUp: true});

            // When the user dismisses the dialog
            actor.send({type: 'DISMISS_CANCEL'});

            // Then the held ceremony starts, so the flow continues where it paused
            expect(matchesState(openAt(SIGNING_CHALLENGE), actor.getSnapshot().value)).toBe(true);
            expect(getAuthorizeRuns()).toBe(1);

            actor.stop();
        });

        it('never starts the held ceremony once the cancel is confirmed', async () => {
            // Given the ceremony is held behind the dialog
            const {actor, getAuthorizeRuns} = await reachAuthorizing({isDialogUp: true});

            // When the user confirms the cancel
            actor.send({type: 'CONFIRM_CANCEL'});

            // Then the ceremony never starts, so the platform prompt never appears after the user chose to leave
            expect(matchesState(openAt(MFA_STATE.CANCELLING), actor.getSnapshot().value)).toBe(true);
            expect(getAuthorizeRuns()).toBe(0);

            actor.stop();
        });
    });

    describe('while the scenario action is in flight', () => {
        const REASON = CONST.MULTIFACTOR_AUTHENTICATION.REASON;
        const AUTHORIZE_TRANSACTION = CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.AUTHORIZE_TRANSACTION;
        const AWAITING_RESULT = {[MFA_STATE.PROMPT]: {[MFA_STATE.AUTHORIZING]: {[MFA_STATE.EXECUTING_SCENARIO_ACTION]: MFA_STATE.AWAITING_RESULT}}};
        const CANCELLING_IN_FLIGHT = {[MFA_STATE.PROMPT]: {[MFA_STATE.AUTHORIZING]: {[MFA_STATE.EXECUTING_SCENARIO_ACTION]: MFA_STATE.CANCELLING_IN_FLIGHT}}};
        const APPROVED: ExecuteScenarioActionOutput = {success: true, scenarioResponse: MFA_TEST_SCENARIO_RESPONSE};
        const DENIED = createMFAErrorFromApiResponse(200, REASON.FLOW_OUTCOMES.TRANSACTION_DENIED, undefined);
        const NETWORK_ERROR = createMFAErrorFromApiResponse(0, REASON.LOCAL_ERRORS.UNHANDLED_API_RESPONSE, undefined);

        function failedApprove(reason: MultifactorAuthenticationReason): ExecuteScenarioActionOutput {
            return {success: false, error: createMFAErrorFromApiResponse(400, reason, undefined)};
        }

        function createDeferred<T>() {
            let resolve: (value: T) => void = () => {};
            let reject: (error: unknown) => void = () => {};
            const promise = new Promise<T>((onResolve, onReject) => {
                resolve = onResolve;
                reject = onReject;
            });
            return {promise, resolve, reject};
        }

        /**
         * Runs the flow live into the scenario action and opens the dialog, so the scenario action and the cancel
         * can settle in any order. A restored snapshot wouldn't start the scenario action actor.
         */
        async function startScenarioActionWithDialog({withOnCancel, contextOverrides = {}}: {withOnCancel: boolean; contextOverrides?: Partial<MfaContext>}) {
            const scenarioAction = createDeferred<ExecuteScenarioActionOutput>();
            const cancel = createDeferred<CancelScenarioOutput>();
            const cancelInputs: CancelScenarioInput[] = [];
            let finalizeRuns = 0;
            const machine = mfaMachine.provide({
                actors: {
                    authorize: fromPromise<AuthorizeOutput, AuthorizeInput>(() =>
                        Promise.resolve({success: true, signedChallenge: MFA_TEST_SIGNED_CHALLENGE, authenticationMethod: MFA_TEST_AUTH_METHOD}),
                    ),
                    executeScenarioAction: fromPromise<ExecuteScenarioActionOutput, ExecuteScenarioActionInput>(() => scenarioAction.promise),
                    cancelScenario: fromPromise<CancelScenarioOutput, CancelScenarioInput>(({input}) => {
                        cancelInputs.push(input);
                        return cancel.promise;
                    }),
                    finalizeOutcome: fromPromise<FinalizeOutcomeOutput, FinalizeOutcomeInput>(() => {
                        finalizeRuns += 1;
                        return new Promise(() => {});
                    }),
                },
            });
            const scenarioOverrides = withOnCancel ? {scenarioName: AUTHORIZE_TRANSACTION, scenario: getScenarioConfig(AUTHORIZE_TRANSACTION), payload: {transactionID: 'txn-race'}} : {};
            const context = createFlowContext({...scenarioOverrides, ...contextOverrides});
            const clock = new SimulatedClock();
            const actor = createActor(machine, {snapshot: machine.resolveState({value: openAt({[MFA_STATE.PROMPT]: MFA_STATE.AWAITING_SOFT_PROMPT}), context}), clock});
            actor.start();
            actor.send({type: 'SOFT_PROMPT_APPROVED'});
            await waitForBatchedUpdates();
            actor.send({type: 'REQUEST_CANCEL'});
            return {actor, scenarioAction, cancel, cancelInputs, clock, getFinalizeRuns: () => finalizeRuns};
        }

        /** Confirms the cancel while the approve is in flight, so the deny races it. */
        async function startCancellingInFlight() {
            const flow = await startScenarioActionWithDialog({withOnCancel: true});
            flow.actor.send({type: 'CONFIRM_CANCEL'});
            return flow;
        }

        async function settle<T>(deferred: ReturnType<typeof createDeferred<T>>, value: T) {
            deferred.resolve(value);
            await waitForBatchedUpdates();
        }

        it('opens the dialog while the request is in flight', async () => {
            // Given the scenario action was sent and is awaiting its result
            // When the user asks to cancel
            const {actor} = await startScenarioActionWithDialog({withOnCancel: true});

            // Then the dialog still opens, so the user can decide whether to send a deny alongside the request already out
            expect(matchesState(openAt(AWAITING_RESULT, MFA_STATE.CANCEL_CONFIRM_VISIBLE), actor.getSnapshot().value)).toBe(true);

            actor.stop();
        });

        describe('with a scenario onCancel', () => {
            it('sends the deny on confirm, hides the dialog and keeps the request running', async () => {
                // Given an authorize-transaction approve is in flight with the dialog up
                // When the user confirms the cancel
                const {actor, cancelInputs} = await startCancellingInFlight();

                // Then the deny is sent while the approve keeps running, because a sent request can't be taken back and both results decide the outcome
                const result = actor.getSnapshot();
                expect(matchesState(openAt(CANCELLING_IN_FLIGHT), result.value)).toBe(true);
                expect(snapshotToState(result).isCancelConfirmVisible).toBe(false);
                expect(result.context.isCancelConfirmed).toBe(true);
                expect(result.children).toHaveProperty('executeScenarioAction');
                expect(result.children).toHaveProperty('cancelScenario');
                expect(cancelInputs).toHaveLength(1);

                actor.stop();
            });

            it('ignores REQUEST_CANCEL while the deny is in flight, so the dialog stays hidden', async () => {
                // Given the deny is racing the approve
                const {actor} = await startCancellingInFlight();

                // When the user presses back again
                actor.send({type: 'REQUEST_CANCEL'});

                // Then nothing changes, because the cancel is already under way and a dialog would ask an answered question
                expect(matchesState(openAt(CANCELLING_IN_FLIGHT), actor.getSnapshot().value)).toBe(true);

                actor.stop();
            });

            it('sends the deny once on a double confirm', async () => {
                // Given the deny is racing the approve
                const {actor, cancelInputs} = await startCancellingInFlight();

                // When the confirm arrives again, e.g. from a double tap
                actor.send({type: 'CONFIRM_CANCEL'});

                // Then no second deny goes out, because the backend must get a single answer for the transaction
                expect(matchesState(openAt(CANCELLING_IN_FLIGHT), actor.getSnapshot().value)).toBe(true);
                expect(cancelInputs).toHaveLength(1);

                actor.stop();
            });

            it('ends with the approve as soon as it succeeds, without waiting for the deny', async () => {
                // Given the deny is racing the approve
                const {actor, scenarioAction} = await startCancellingInFlight();

                // When the approve succeeds first
                await settle(scenarioAction, APPROVED);

                // Then the flow ends with the approval right away, because no deny result can outrank a successful approve
                expect(matchesState(openAt(FINALIZING_OUTCOME), actor.getSnapshot().value)).toBe(true);
                expect(actor.getSnapshot().context.scenarioResponse).toBe(MFA_TEST_SCENARIO_RESPONSE);
                expect(actor.getSnapshot().context.error).toBeUndefined();

                actor.stop();
            });

            describe.each([
                {description: 'the approve', first: 'scenarioAction'},
                {description: 'the deny', first: 'cancel'},
            ] as const)('when $description returns first', ({first}) => {
                it.each([
                    [
                        'an approve success over the deny that found it approved',
                        APPROVED,
                        createMFAErrorFromApiResponse(400, REASON.CLIENT_ERRORS.ALREADY_APPROVED_DENY_ATTEMPTED, undefined),
                        undefined,
                    ],
                    ['an approve success over a deny network error', APPROVED, NETWORK_ERROR, undefined],
                    ['a successful deny over an already-denied approve', failedApprove(REASON.CLIENT_ERRORS.ALREADY_DENIED_APPROVE_ATTEMPTED), DENIED, DENIED],
                    ['a successful deny over an approve network error', {success: false, error: NETWORK_ERROR} as const, DENIED, DENIED],
                    [
                        'an already-denied approve over a deny network error',
                        failedApprove(REASON.CLIENT_ERRORS.ALREADY_DENIED_APPROVE_ATTEMPTED),
                        NETWORK_ERROR,
                        createMFAErrorFromApiResponse(400, REASON.CLIENT_ERRORS.ALREADY_DENIED_APPROVE_ATTEMPTED, undefined),
                    ],
                    [
                        'the deny that found it approved over an approve network error',
                        {success: false, error: NETWORK_ERROR} as const,
                        createMFAErrorFromApiResponse(400, REASON.CLIENT_ERRORS.ALREADY_APPROVED_DENY_ATTEMPTED, undefined),
                        createMFAErrorFromApiResponse(400, REASON.CLIENT_ERRORS.ALREADY_APPROVED_DENY_ATTEMPTED, undefined),
                    ],
                    [
                        'an expired approve over the deny that found it reviewed, when the server answered both',
                        failedApprove(REASON.CLIENT_ERRORS.TRANSACTION_EXPIRED),
                        createMFAErrorFromApiResponse(400, REASON.CLIENT_ERRORS.ALREADY_REVIEWED, undefined),
                        createMFAErrorFromApiResponse(400, REASON.CLIENT_ERRORS.TRANSACTION_EXPIRED, undefined),
                    ],
                    ['a network error when neither request gets a response', {success: false, error: NETWORK_ERROR} as const, NETWORK_ERROR, NETWORK_ERROR],
                ])('ends with %s', async (_, approveResult, denyResult, expectedError) => {
                    // Given the deny is racing the approve
                    const {actor, scenarioAction, cancel, getFinalizeRuns} = await startCancellingInFlight();

                    // When both results come back, in the given order
                    if (first === 'scenarioAction') {
                        await settle(scenarioAction, approveResult);
                        await settle(cancel, denyResult);
                    } else {
                        await settle(cancel, denyResult);
                        await settle(scenarioAction, approveResult);
                    }

                    // Then the outcome doesn't depend on the order, a server answer beats a lost request, and it is finalized once
                    const result = actor.getSnapshot();
                    expect(matchesState(openAt(FINALIZING_OUTCOME), result.value)).toBe(true);
                    expect(result.context.error).toEqual(expectedError);
                    expect(result.context.scenarioResponse).toBe(approveResult.success ? MFA_TEST_SCENARIO_RESPONSE : undefined);
                    expect(getFinalizeRuns()).toBe(1);

                    actor.stop();
                });
            });

            it('treats a rejected approve actor as a failed approve, so the deny decides', async () => {
                // Given the deny is racing the approve
                const {actor, scenarioAction, cancel} = await startCancellingInFlight();

                // When the approve actor rejects unexpectedly and the deny comes back
                scenarioAction.reject(new Error('Approve exploded'));
                await waitForBatchedUpdates();
                await settle(cancel, DENIED);

                // Then the deny's result decides the outcome
                expect(matchesState(openAt(FINALIZING_OUTCOME), actor.getSnapshot().value)).toBe(true);
                expect(actor.getSnapshot().context.error).toEqual(DENIED);

                actor.stop();
            });

            it('shows the approve exception when the deny returns an error that leaves the transaction status unknown and the approve actor then rejects', async () => {
                // Given the deny is racing the approve
                const {actor, scenarioAction, cancel} = await startCancellingInFlight();

                // When the deny returns a network error and the approve actor then rejects unexpectedly
                await settle(cancel, NETWORK_ERROR);
                scenarioAction.reject(new Error('Approve exploded'));
                await waitForBatchedUpdates();

                // Then the approve's exception is shown, because a failed approve comes before a failed deny
                expect(matchesState(openAt(FINALIZING_OUTCOME), actor.getSnapshot().value)).toBe(true);
                expect(actor.getSnapshot().context.error).toEqual(createLocalMFAError(REASON.LOCAL_ERRORS.UNHANDLED_EXCEPTION, 'Scenario action threw: Approve exploded'));

                actor.stop();
            });

            it('shows the approve error when the approve returns an error that leaves the transaction status unknown and the deny actor then rejects', async () => {
                // Given the deny is racing the approve
                const {actor, scenarioAction, cancel} = await startCancellingInFlight();

                // When the approve returns an unrecognized error and the deny actor then rejects unexpectedly
                await settle(scenarioAction, failedApprove(REASON.CLIENT_ERRORS.UNRECOGNIZED));
                cancel.reject(new Error('Deny exploded'));
                await waitForBatchedUpdates();

                // Then the approve's error is shown, because a failed approve comes before a failed deny
                expect(matchesState(openAt(FINALIZING_OUTCOME), actor.getSnapshot().value)).toBe(true);
                expect(actor.getSnapshot().context.error).toEqual(createMFAErrorFromApiResponse(400, REASON.CLIENT_ERRORS.UNRECOGNIZED, undefined));

                actor.stop();
            });

            it('treats a rejected deny actor as a failed deny, so a failed approve decides', async () => {
                // Given the deny is racing the approve
                const {actor, scenarioAction, cancel} = await startCancellingInFlight();

                // When the deny actor rejects unexpectedly and the approve fails
                cancel.reject(new Error('Deny exploded'));
                await waitForBatchedUpdates();
                await settle(scenarioAction, failedApprove(REASON.CLIENT_ERRORS.UNRECOGNIZED));

                // Then the approve's failure ends the flow, because a failed approve comes before a failed deny
                expect(matchesState(openAt(FINALIZING_OUTCOME), actor.getSnapshot().value)).toBe(true);
                expect(actor.getSnapshot().context.error?.reason).toBe(REASON.CLIENT_ERRORS.UNRECOGNIZED);

                actor.stop();
            });

            describe('when a request never returns', () => {
                it('keeps waiting until the timeout', async () => {
                    // Given the deny is racing the approve and the approve failed
                    const {actor, scenarioAction, clock} = await startCancellingInFlight();
                    await settle(scenarioAction, {success: false, error: NETWORK_ERROR});

                    // When the wait gets close to the timeout without the deny
                    clock.increment(CANCEL_TIMEOUT_MS - 1);

                    // Then the flow keeps waiting
                    expect(matchesState(openAt(CANCELLING_IN_FLIGHT), actor.getSnapshot().value)).toBe(true);

                    actor.stop();
                });

                it.each([
                    ['an approve failure', 'scenarioAction', {success: false, error: NETWORK_ERROR} as const, NETWORK_ERROR],
                    ['the deny', 'cancel', DENIED, DENIED],
                ] as const)('ends with %s when only that result is back at the timeout', async (_, settled, value, expectedError) => {
                    // Given the deny is racing the approve
                    const {actor, scenarioAction, cancel, clock, getFinalizeRuns} = await startCancellingInFlight();

                    // When only one result comes back before the timeout
                    if (settled === 'cancel') {
                        await settle(cancel, value);
                    } else {
                        await settle(scenarioAction, value);
                    }
                    clock.increment(CANCEL_TIMEOUT_MS);

                    // Then the flow ends once with the result that came back, so a hung request can't strand the user
                    const result = actor.getSnapshot();
                    expect(matchesState(openAt(FINALIZING_OUTCOME), result.value)).toBe(true);
                    expect(result.context.error).toEqual(expectedError);
                    expect(getFinalizeRuns()).toBe(1);

                    actor.stop();
                });

                it('ends as a request without a response when neither result is back at the timeout', async () => {
                    // Given the deny is racing the approve
                    const {actor, clock} = await startCancellingInFlight();

                    // When neither result comes back before the timeout
                    clock.increment(CANCEL_TIMEOUT_MS);

                    // Then the flow fails the same way a request without a response does
                    expect(matchesState(openAt(FINALIZING_OUTCOME), actor.getSnapshot().value)).toBe(true);
                    expect(actor.getSnapshot().context.error?.reason).toBe(REASON.LOCAL_ERRORS.UNHANDLED_API_RESPONSE);

                    actor.stop();
                });

                it('keeps the outcome when the missing result comes back afterwards', async () => {
                    // Given the wait timed out with only the deny back
                    const {actor, scenarioAction, cancel, clock, getFinalizeRuns} = await startCancellingInFlight();
                    await settle(cancel, DENIED);
                    clock.increment(CANCEL_TIMEOUT_MS);

                    // When the approve comes back late
                    await settle(scenarioAction, APPROVED);

                    // Then the outcome stays the same, because leaving for the outcome stopped the approve
                    expect(actor.getSnapshot().context.error).toEqual(DENIED);
                    expect(actor.getSnapshot().context.scenarioResponse).toBeUndefined();
                    expect(getFinalizeRuns()).toBe(1);

                    actor.stop();
                });
            });
        });

        describe('without a scenario onCancel', () => {
            it('keeps the request running on confirm and waits for its result', async () => {
                // Given a scenario without onCancel whose scenario action is in flight with the dialog up
                const {actor, cancel, cancelInputs} = await startScenarioActionWithDialog({withOnCancel: false});

                // When the user confirms the cancel and the cancel itself ends at once, as it has nothing to send
                actor.send({type: 'CONFIRM_CANCEL'});
                await settle(cancel, MFA_TEST_CANCEL_ERROR);

                // Then the request keeps running and the flow waits for it, because a sent request can't be taken back and its result is the truth
                const result = actor.getSnapshot();
                expect(matchesState(openAt(CANCELLING_IN_FLIGHT), result.value)).toBe(true);
                expect(result.children).toHaveProperty('executeScenarioAction');
                expect(cancelInputs).toEqual([{onCancel: undefined, payload: undefined}]);

                actor.stop();
            });

            it.each([
                ['a success', APPROVED, undefined],
                ['a failure the server answered', failedApprove(REASON.CLIENT_ERRORS.UNRECOGNIZED), createMFAErrorFromApiResponse(400, REASON.CLIENT_ERRORS.UNRECOGNIZED, undefined)],
                ['a lost request', {success: false, error: NETWORK_ERROR} as const, NETWORK_ERROR],
            ])('ends with the request result once it settles with %s', async (_, scenarioResult, expectedError) => {
                // Given a scenario without onCancel whose cancel was confirmed while the scenario action is in flight
                const {actor, scenarioAction, cancel, getFinalizeRuns} = await startScenarioActionWithDialog({withOnCancel: false});
                actor.send({type: 'CONFIRM_CANCEL'});
                await settle(cancel, MFA_TEST_CANCEL_ERROR);

                // When the request settles
                await settle(scenarioAction, scenarioResult);

                // Then its result decides the outcome, not the cancel, and the flow is finalized once
                const result = actor.getSnapshot();
                expect(matchesState(openAt(FINALIZING_OUTCOME), result.value)).toBe(true);
                expect(result.context.error).toEqual(expectedError);
                expect(result.context.scenarioResponse).toBe(scenarioResult.success ? MFA_TEST_SCENARIO_RESPONSE : undefined);
                expect(getFinalizeRuns()).toBe(1);

                actor.stop();
            });

            it('ends with the cancel error when the request does not return in time', async () => {
                // Given a scenario without onCancel whose cancel was confirmed while the scenario action is in flight
                const {actor, cancel, clock, getFinalizeRuns} = await startScenarioActionWithDialog({withOnCancel: false});
                actor.send({type: 'CONFIRM_CANCEL'});
                await settle(cancel, MFA_TEST_CANCEL_ERROR);

                // When the request is still out at the timeout
                clock.increment(CANCEL_TIMEOUT_MS);

                // Then the flow ends as cancelled, so a hung request can't strand the user
                const result = actor.getSnapshot();
                expect(matchesState(openAt(FINALIZING_OUTCOME), result.value)).toBe(true);
                expect(result.context.error).toBe(MFA_TEST_CANCEL_ERROR);
                expect(getFinalizeRuns()).toBe(1);

                actor.stop();
            });
        });
    });
});
