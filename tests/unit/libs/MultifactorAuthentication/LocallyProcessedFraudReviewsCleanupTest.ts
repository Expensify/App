import {cleanUpLocallyProcessedFraudTransactionReviews, getLocallyProcessedFraudReviewIDsToCleanUp} from '@libs/actions/MultifactorAuthentication';

import ONYXKEYS from '@src/ONYXKEYS';
import type TransactionPendingFraudReview from '@src/types/onyx/TransactionPendingFraudReview';

import Onyx from 'react-native-onyx';

import getOnyxValue from '../../../utils/getOnyxValue';
import waitForBatchedUpdates from '../../../utils/waitForBatchedUpdates';

jest.mock('@libs/API');

function buildReview(transactionID: string): TransactionPendingFraudReview {
    return {transactionID, created: '2026-11-02 10:00:00', lastFourPAN: '1234', cardID: 1};
}

describe('locally processed fraud reviews cleanup', () => {
    describe('getLocallyProcessedFraudReviewIDsToCleanUp', () => {
        it('returns only the local entries whose review the server dropped from the queue', () => {
            // Given two reviews answered on this device, of which the server still lists only the second one
            const queue = Object.fromEntries([['2', buildReview('2')]]);
            const locallyProcessed = Object.fromEntries([
                ['1', '2026-11-02T10:00:00.000Z'],
                ['2', '2026-11-02T10:01:00.000Z'],
            ]);

            // When we look for entries to clean up
            const transactionIDs = getLocallyProcessedFraudReviewIDsToCleanUp(queue, locallyProcessed);

            // Then only the first one is returned, while the second one is kept in case its answer never reached the server
            expect(transactionIDs).toEqual(['1']);
        });

        it('returns every local entry when the queue is empty', () => {
            // Given a review answered on this device and a queue the server sent as empty (null)
            const locallyProcessed = Object.fromEntries([['1', '2026-11-02T10:00:00.000Z']]);

            // When we look for entries to clean up
            const transactionIDs = getLocallyProcessedFraudReviewIDsToCleanUp(undefined, locallyProcessed);

            // Then the entry is returned, since nothing is pending anymore
            expect(transactionIDs).toEqual(['1']);
        });

        it('returns nothing when no review was answered on this device', () => {
            // Given a pending review and no local entries
            const queue = Object.fromEntries([['1', buildReview('1')]]);

            // When we look for entries to clean up
            const transactionIDs = getLocallyProcessedFraudReviewIDsToCleanUp(queue, undefined);

            // Then there is nothing to clean up
            expect(transactionIDs).toEqual([]);
        });
    });

    describe('cleanUpLocallyProcessedFraudTransactionReviews', () => {
        beforeAll(() => {
            Onyx.init({keys: ONYXKEYS});
        });

        beforeEach(async () => {
            await Onyx.clear();
            await waitForBatchedUpdates();
        });

        it('removes only the given local entries', async () => {
            // Given two reviews answered on this device
            await Onyx.set(
                ONYXKEYS.LOCALLY_PROCESSED_FRAUD_TRANSACTION_REVIEWS,
                Object.fromEntries([
                    ['1', '2026-11-02T10:00:00.000Z'],
                    ['2', '2026-11-02T10:01:00.000Z'],
                ]),
            );
            await waitForBatchedUpdates();

            // When the first one is cleaned up
            cleanUpLocallyProcessedFraudTransactionReviews(['1']);
            await waitForBatchedUpdates();

            // Then the other entry stays, so its review keeps its resurface timestamp
            const locallyProcessed = await getOnyxValue(ONYXKEYS.LOCALLY_PROCESSED_FRAUD_TRANSACTION_REVIEWS);
            expect(Object.keys(locallyProcessed ?? {})).toEqual(['2']);
        });
    });
});
