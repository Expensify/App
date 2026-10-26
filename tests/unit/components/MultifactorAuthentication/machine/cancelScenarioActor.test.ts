import createActors from '@components/MultifactorAuthentication/machine/mfaActors';
import type {CancelScenarioInput} from '@components/MultifactorAuthentication/machine/types';
import addMFABreadcrumb from '@components/MultifactorAuthentication/observability/breadcrumbs';

import {createLocalMFAError, createMFAErrorFromApiResponse} from '@libs/MultifactorAuthentication/shared/MFAResult';

import CONST from '@src/CONST';

import {createActor, waitFor} from 'xstate';

jest.mock('@components/MultifactorAuthentication/observability/breadcrumbs', () => ({__esModule: true, default: jest.fn()}));

const REASON = CONST.MULTIFACTOR_AUTHENTICATION.REASON;
const PAYLOAD = {transactionID: 'txn-cancel'};

const addMFABreadcrumbMock = jest.mocked(addMFABreadcrumb);

/** Runs the machine's real `cancelScenario` actor logic to completion and returns its final snapshot. */
async function runCancelScenarioActor(input: CancelScenarioInput) {
    const {cancelScenario} = createActors();
    const actorRef = createActor(cancelScenario, {input});
    actorRef.start();
    await waitFor(actorRef, (snapshot) => snapshot.status !== 'active');
    return actorRef.getSnapshot();
}

describe('cancelScenario actor', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('with a scenario onCancel', () => {
        it('awaits it with the unchanged payload and returns its error', async () => {
            // Given a scenario whose onCancel denies the transaction on the backend
            const deniedError = createMFAErrorFromApiResponse(200, REASON.FLOW_OUTCOMES.TRANSACTION_DENIED, undefined);
            const onCancel = jest.fn().mockResolvedValue(deniedError);

            // When the cancel runs
            const snapshot = await runCancelScenarioActor({onCancel, payload: PAYLOAD});

            // Then onCancel gets the payload untouched, and its error becomes the flow's failure so the outcome path reports the deny
            expect(onCancel).toHaveBeenCalledTimes(1);
            expect(onCancel).toHaveBeenCalledWith(PAYLOAD);
            expect(snapshot.output).toBe(deniedError);
        });

        it('leaves the legacy warning breadcrumb with the returned error', async () => {
            // Given a scenario whose onCancel resolves with a deny error
            const deniedError = createMFAErrorFromApiResponse(200, REASON.FLOW_OUTCOMES.TRANSACTION_DENIED, undefined);

            // When the cancel runs
            await runCancelScenarioActor({onCancel: jest.fn().mockResolvedValue(deniedError), payload: PAYLOAD});

            // Then the breadcrumb keeps its legacy label and level, so existing telemetry queries still match cancels
            expect(addMFABreadcrumbMock).toHaveBeenCalledWith('Flow cancelled with onCancel', deniedError, 'warning');
        });

        it('rejects when onCancel throws, so the machine routes it as an unhandled exception', async () => {
            // Given a scenario onCancel that throws instead of returning an error
            // When the cancel runs
            // Then the actor rejects, so the machine's error handler fails the flow instead of leaving it stuck
            await expect(runCancelScenarioActor({onCancel: jest.fn().mockRejectedValue(new Error('Deny exploded')), payload: PAYLOAD})).rejects.toThrow('Deny exploded');
        });
    });

    describe('without a scenario onCancel', () => {
        it('returns the CANCELED error', async () => {
            // Given a scenario with no cancel logic of its own
            // When the cancel runs
            const snapshot = await runCancelScenarioActor({onCancel: undefined, payload: undefined});

            // Then the flow fails with the generic CANCELED error, so the outcome path still has a reason to show and report
            expect(snapshot.output).toEqual(createLocalMFAError(REASON.LOCAL_ERRORS.CANCELED, 'User cancelled the MFA flow'));
        });

        it('leaves the legacy warning breadcrumb with the CANCELED reason', async () => {
            // Given a scenario with no cancel logic of its own
            // When the cancel runs
            await runCancelScenarioActor({onCancel: undefined, payload: undefined});

            // Then the legacy breadcrumb is kept, so telemetry for plain cancels matches the old flow
            expect(addMFABreadcrumbMock).toHaveBeenCalledWith('Flow cancelled', {reason: REASON.LOCAL_ERRORS.CANCELED}, 'warning');
        });
    });
});
