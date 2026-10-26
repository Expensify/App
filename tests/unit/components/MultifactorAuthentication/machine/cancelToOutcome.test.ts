import type {MFARegistrationStateSnapshot} from '@components/MultifactorAuthentication/biometrics/captureRegistrationState';
import {getScenarioConfig} from '@components/MultifactorAuthentication/config';
import mfaMachine from '@components/MultifactorAuthentication/machine/mfaMachine';
import trackMFAFlowOutcome from '@components/MultifactorAuthentication/observability/trackMFAFlowOutcome';

import {createLocalMFAError, createMFAErrorFromApiResponse} from '@libs/MultifactorAuthentication/shared/MFAResult';

import CONST from '@src/CONST';

import {createFlowContext} from 'tests/utils/mfa/flowActors';
import {createActor, waitFor} from 'xstate';

const MFA_STATE = CONST.MULTIFACTOR_AUTHENTICATION.MFA_STATE;
const REASON = CONST.MULTIFACTOR_AUTHENTICATION.REASON;
const CALLBACK_RESPONSE = CONST.MULTIFACTOR_AUTHENTICATION.CALLBACK_RESPONSE;

const END_STATE: MFARegistrationStateSnapshot = {hasServerCredentials: true, hasLocalCredentials: true, hasEverAcceptedSoftPrompt: true};

// The cancel and finalize actors run for real here. Only the end-of-flow snapshot read and the
// telemetry sink are mocked, so the spec can assert what the cancelled flow reports.
jest.mock('@components/MultifactorAuthentication/biometrics/captureRegistrationState', () => ({
    __esModule: true,
    default: () => Promise.resolve(END_STATE),
}));

jest.mock('@components/MultifactorAuthentication/observability/trackMFAFlowOutcome', () => ({
    __esModule: true,
    default: jest.fn(),
}));

jest.mock('@components/MultifactorAuthentication/observability/breadcrumbs', () => ({__esModule: true, default: jest.fn()}));

const trackMFAFlowOutcomeMock = jest.mocked(trackMFAFlowOutcome);

const FAILURE_OUTCOME = {[MFA_STATE.OPEN]: {[MFA_STATE.FLOW]: {[MFA_STATE.OUTCOME]: MFA_STATE.FAILURE}}};

/**
 * Starts a live flow on the soft prompt with the cancel confirmation up, using the machine's real
 * actors, and confirms the cancel. No step actor is running there, so only the cancel and finalize
 * actors do any work.
 */
async function confirmCancelOnSoftPrompt(scenario: ReturnType<typeof getScenarioConfig>, payload?: Record<string, unknown>) {
    const snapshot = mfaMachine.resolveState({
        value: {[MFA_STATE.OPEN]: {[MFA_STATE.FLOW]: {[MFA_STATE.PROMPT]: MFA_STATE.AWAITING_SOFT_PROMPT}, [MFA_STATE.CANCEL_CONFIRM]: MFA_STATE.CANCEL_CONFIRM_VISIBLE}},
        context: createFlowContext({scenario, payload}),
    });
    const actor = createActor(mfaMachine, {snapshot});
    actor.start();
    actor.send({type: 'CONFIRM_CANCEL'});
    await waitFor(actor, (state) => state.matches(FAILURE_OUTCOME));
    return actor;
}

describe('MFA cancel through to the outcome', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('fails the flow with CANCELED and reports it to the callback and telemetry when the scenario has no onCancel', async () => {
        // Given a scenario without onCancel whose callback wants the outcome screen
        const callback = jest.fn().mockResolvedValue(CALLBACK_RESPONSE.SHOW_OUTCOME_SCREEN);
        const scenario = {...getScenarioConfig(CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.BIOMETRICS_TEST), callback};
        const canceledError = createLocalMFAError(REASON.LOCAL_ERRORS.CANCELED, 'User cancelled the MFA flow');

        // When the user confirms the cancel on the soft prompt
        const actor = await confirmCancelOnSoftPrompt(scenario);

        // Then the cancel runs through the normal failure outcome, so the callback and telemetry learn the flow was cancelled
        expect(actor.getSnapshot().context.error).toEqual(canceledError);
        expect(callback).toHaveBeenCalledWith(false, {httpStatusCode: undefined, message: REASON.LOCAL_ERRORS.CANCELED, reason: REASON.LOCAL_ERRORS.CANCELED, body: undefined}, undefined);
        await waitFor(actor, () => trackMFAFlowOutcomeMock.mock.calls.length > 0);
        expect(trackMFAFlowOutcomeMock).toHaveBeenCalledWith(expect.objectContaining({isSuccessful: false, error: canceledError, isAuthorizationComplete: false}));

        actor.stop();
    });

    it("fails the flow with the scenario onCancel's error and hands it the payload", async () => {
        // Given a scenario whose onCancel denies the transaction and needs the payload to know which one
        const deniedError = createMFAErrorFromApiResponse(200, REASON.FLOW_OUTCOMES.TRANSACTION_DENIED, undefined);
        const onCancel = jest.fn().mockResolvedValue(deniedError);
        const callback = jest.fn().mockResolvedValue(CALLBACK_RESPONSE.SHOW_OUTCOME_SCREEN);
        const scenario = {...getScenarioConfig(CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.BIOMETRICS_TEST), callback, onCancel};
        const payload = {transactionID: 'txn-cancel'};

        // When the user confirms the cancel before any scenario action was sent
        const actor = await confirmCancelOnSoftPrompt(scenario, payload);

        // Then the deny error, not a generic cancel, reaches the callback and telemetry, so callers learn the transaction was denied
        expect(onCancel).toHaveBeenCalledWith(payload);
        expect(actor.getSnapshot().context.error).toBe(deniedError);
        expect(callback).toHaveBeenCalledWith(
            false,
            {httpStatusCode: undefined, message: REASON.FLOW_OUTCOMES.TRANSACTION_DENIED, reason: REASON.FLOW_OUTCOMES.TRANSACTION_DENIED, body: undefined},
            payload,
        );
        await waitFor(actor, () => trackMFAFlowOutcomeMock.mock.calls.length > 0);
        expect(trackMFAFlowOutcomeMock).toHaveBeenCalledWith(expect.objectContaining({isSuccessful: false, error: deniedError}));

        actor.stop();
    });
});
