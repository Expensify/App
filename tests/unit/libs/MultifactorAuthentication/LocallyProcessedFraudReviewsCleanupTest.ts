import '@libs/actions/MultifactorAuthentication';
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
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('removes a local entry once the server drops the review from the queue', async () => {
        // Given two reviews answered on this client, both still in the server queue
        await Onyx.set(ONYXKEYS.TRANSACTIONS_PENDING_FRAUD_REVIEW, Object.fromEntries([buildReview('1'), buildReview('2')].map((review) => [review.transactionID, review])));
        await Onyx.set(
            ONYXKEYS.LOCALLY_PROCESSED_FRAUD_TRANSACTION_REVIEWS,
            Object.fromEntries([
                ['1', '2026-11-02T10:00:00.000Z'],
                ['2', '2026-11-02T10:01:00.000Z'],
            ]),
        );
        await waitForBatchedUpdates();

        // When the server confirms the first answer and removes that review from the queue
        await Onyx.merge(ONYXKEYS.TRANSACTIONS_PENDING_FRAUD_REVIEW, Object.fromEntries([['1', null]]));
        await waitForBatchedUpdates();

        // Then only its local entry is dropped, while the other one is kept in case its answer never reached the server
        const locallyProcessed = await getOnyxValue(ONYXKEYS.LOCALLY_PROCESSED_FRAUD_TRANSACTION_REVIEWS);
        expect(Object.keys(locallyProcessed ?? {})).toEqual(['2']);
    });

    it('removes every local entry when the server sends an empty queue', async () => {
        // Given a review answered on this client that is still in the server queue
        await Onyx.set(ONYXKEYS.TRANSACTIONS_PENDING_FRAUD_REVIEW, Object.fromEntries([['1', buildReview('1')]]));
        await Onyx.set(ONYXKEYS.LOCALLY_PROCESSED_FRAUD_TRANSACTION_REVIEWS, Object.fromEntries([['1', '2026-11-02T10:00:00.000Z']]));
        await waitForBatchedUpdates();

        // When the server reports that nothing is pending, which it sends as null
        await Onyx.set(ONYXKEYS.TRANSACTIONS_PENDING_FRAUD_REVIEW, null);
        await waitForBatchedUpdates();

        // Then no local entries are left behind
        const locallyProcessed = await getOnyxValue(ONYXKEYS.LOCALLY_PROCESSED_FRAUD_TRANSACTION_REVIEWS);
        expect(Object.keys(locallyProcessed ?? {})).toEqual([]);
    });
});
