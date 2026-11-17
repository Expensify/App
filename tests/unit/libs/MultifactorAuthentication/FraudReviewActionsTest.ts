import {
    fireAndForgetReportFraudulentTransaction,
    isTransactionStillPendingFraudReview,
    reportFraudulentTransaction,
    confirmRecognizedTransaction,
} from '@libs/actions/MultifactorAuthentication';
import {makeRequestWithSideEffects} from '@libs/API';
import {SIDE_EFFECT_REQUEST_COMMANDS} from '@libs/API/types';
import Log from '@libs/Log';
import MARQETA_VALUES from '@libs/MultifactorAuthentication/shared/MarqetaValues';
import VALUES from '@libs/MultifactorAuthentication/shared/VALUES';

import ONYXKEYS from '@src/ONYXKEYS';

jest.mock('@libs/API');

const mockMakeRequestWithSideEffects = jest.mocked(makeRequestWithSideEffects);

const TRANSACTION_ID = '9990001';
const SIGNED_CHALLENGE = {
    rawId: 'rawId',
    type: 'public-key',
    response: {authenticatorData: 'authenticatorData', clientDataJSON: 'clientDataJSON', signature: 'signature'},
};

function getRequestParams() {
    return mockMakeRequestWithSideEffects.mock.calls.at(0)?.[1];
}

function getLocallyProcessedTimestamp(): unknown {
    const update = mockMakeRequestWithSideEffects.mock.calls.at(0)?.[2]?.optimisticData?.find((u) => u.key === ONYXKEYS.LOCALLY_PROCESSED_FRAUD_TRANSACTION_REVIEWS);
    if (!update || !('value' in update) || typeof update.value !== 'object' || update.value === null || !(TRANSACTION_ID in update.value)) {
        return undefined;
    }
    return Object.entries(update.value)
        .find(([transactionID]) => transactionID === TRANSACTION_ID)
        ?.at(1);
}

describe('fraud review actions', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('confirmRecognizedTransaction', () => {
        it('sends the signed challenge and marks the review as answered on this device', async () => {
            // Given the backend accepts the feedback
            mockMakeRequestWithSideEffects.mockResolvedValue({jsonCode: 200});

            // When the cardholder confirms the transaction after authenticating
            const result = await confirmRecognizedTransaction({
                transactionID: TRANSACTION_ID,
                signedChallenge: SIGNED_CHALLENGE,
                authenticationMethod: MARQETA_VALUES.AUTHENTICATION_METHOD.BIOMETRIC_FACE,
            });

            // Then the request carries the recognized answer with the stringified challenge, so the backend can verify it
            expect(mockMakeRequestWithSideEffects.mock.calls.at(0)?.[0]).toBe(SIDE_EFFECT_REQUEST_COMMANDS.RECORD_FRAUD_FEEDBACK);
            expect(getRequestParams()).toEqual({
                transactionID: TRANSACTION_ID,
                transactionRecognized: true,
                signedChallenge: JSON.stringify(SIGNED_CHALLENGE),
                authenticationMethod: MARQETA_VALUES.AUTHENTICATION_METHOD.BIOMETRIC_FACE,
            });

            // Then the review is stored with a timestamp, so it can be shown again later if the answer never reached the server
            expect(typeof getLocallyProcessedTimestamp()).toBe('string');

            // Then a successful answer is not treated as a failure
            expect(result.httpStatusCode).toBe(200);
            expect(result.reason).toBeUndefined();
        });

        it('maps an already reviewed response to the already reviewed outcome', async () => {
            // Given the transaction was already reviewed on another device
            mockMakeRequestWithSideEffects.mockResolvedValue({jsonCode: 400, message: 'Transaction already reviewed'});

            // When the cardholder confirms the transaction
            const result = await confirmRecognizedTransaction({
                transactionID: TRANSACTION_ID,
                signedChallenge: SIGNED_CHALLENGE,
                authenticationMethod: MARQETA_VALUES.AUTHENTICATION_METHOD.BIOMETRIC_FACE,
            });

            // Then the screen can show the dedicated "already reviewed" outcome instead of a generic error
            expect(result.reason).toBe(VALUES.REASON.CLIENT_ERRORS.ALREADY_REVIEWED);
        });
    });

    describe('reportFraudulentTransaction', () => {
        it('reports the transaction as fraud without MFA and returns the fraud reported outcome', async () => {
            // Given the backend accepts the feedback
            mockMakeRequestWithSideEffects.mockResolvedValue({jsonCode: 200});

            // When the cardholder says they don't recognize the transaction
            const result = await reportFraudulentTransaction({transactionID: TRANSACTION_ID});

            // Then only the transaction and the answer are sent, since reporting fraud must not require authentication
            expect(getRequestParams()).toEqual({transactionID: TRANSACTION_ID, transactionRecognized: false});
            expect(typeof getLocallyProcessedTimestamp()).toBe('string');

            // Then success maps to a completed flow outcome, which the screen uses to show the frozen card result
            expect(result.reason).toBe(VALUES.REASON.FLOW_OUTCOMES.FRAUD_REPORTED);
        });

        it('maps an already reviewed response to the already reviewed outcome', async () => {
            // Given the transaction was already reviewed on another device
            mockMakeRequestWithSideEffects.mockResolvedValue({jsonCode: 400, message: 'Transaction already reviewed'});

            // When the cardholder reports the transaction as fraud
            const result = await reportFraudulentTransaction({transactionID: TRANSACTION_ID});

            // Then the screen can show the dedicated "already reviewed" outcome
            expect(result.reason).toBe(VALUES.REASON.CLIENT_ERRORS.ALREADY_REVIEWED);
        });
    });

    describe('fireAndForgetReportFraudulentTransaction', () => {
        it('reports the transaction as fraud and marks the review as answered', () => {
            // Given the request would never resolve, as when the cardholder leaves the screen right away
            mockMakeRequestWithSideEffects.mockReturnValue(new Promise(() => {}));

            // When the cardholder backs out of the review
            fireAndForgetReportFraudulentTransaction({transactionID: TRANSACTION_ID});

            // Then the not recognized answer is still sent and the device won't prompt for this review again right away
            expect(getRequestParams()).toEqual({transactionID: TRANSACTION_ID, transactionRecognized: false});
            expect(typeof getLocallyProcessedTimestamp()).toBe('string');
        });

        it('handles a failed request instead of leaving it unhandled', async () => {
            // Given the request fails, e.g. because of a network error after the cardholder left the screen
            mockMakeRequestWithSideEffects.mockRejectedValue(new Error('Network request failed'));
            const logSpy = jest.spyOn(Log, 'hmmm');

            // When the cardholder backs out of the review
            fireAndForgetReportFraudulentTransaction({transactionID: TRANSACTION_ID});
            await new Promise((resolve) => {
                setTimeout(resolve, 0);
            });

            // Then the failure is caught and logged, since nobody waits for this request to report it
            expect(logSpy).toHaveBeenCalledWith('[MFA] Failed to report fraudulent transaction', expect.anything());
        });
    });

    describe('isTransactionStillPendingFraudReview', () => {
        it('is true only when the server still lists the transaction', async () => {
            // Given the server lists a different transaction as pending
            mockMakeRequestWithSideEffects.mockResolvedValue({
                jsonCode: 200,
                transactionsPendingFraudReview: {other: {transactionID: 'other', created: '2026-10-22 10:00:00', lastFourPAN: '1234', cardID: 1}},
            });

            // When we check whether our transaction still needs a review
            const isPending = await isTransactionStillPendingFraudReview(TRANSACTION_ID);

            // Then it is not pending, so the review screen isn't forced on the user
            expect(mockMakeRequestWithSideEffects.mock.calls.at(0)?.[0]).toBe(SIDE_EFFECT_REQUEST_COMMANDS.GET_TRANSACTIONS_PENDING_FRAUD_REVIEW);
            expect(isPending).toBe(false);
        });
    });
});
