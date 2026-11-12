import {getPending3DSReviewToShow} from '@libs/Navigation/useNavigateToForcedTransactionReview';

import type {TransactionPending3DSReview, TransactionsPending3DSReview} from '@src/types/onyx';

function buildQueue(reviews: TransactionPending3DSReview[]): TransactionsPending3DSReview {
    return Object.fromEntries(reviews.map((review) => [review.transactionID || 'broken', review]));
}

function buildReview(transactionID: string, created: string): TransactionPending3DSReview {
    return {transactionID, created, expires: '2099-01-01 00:00:00', lastFourPAN: '1234', amount: 4000, currency: 'USD', merchant: 'Coffee shop'};
}

describe('getPending3DSReviewToShow', () => {
    it('returns nothing when there is no queue', () => {
        // Given the queue hasn't been loaded from the server
        // When we pick the review to show
        const review = getPending3DSReviewToShow(undefined, undefined);

        // Then nothing is shown, so the user isn't navigated anywhere
        expect(review).toBeUndefined();
    });

    it('skips reviews already answered on this device', () => {
        // Given the oldest review was already answered here and the server hasn't removed it from the queue yet
        const queue = buildQueue([buildReview('1', '2026-10-27 10:00:00'), buildReview('2', '2026-10-27 11:00:00')]);

        // When we pick the review to show
        const review = getPending3DSReviewToShow(queue, Object.fromEntries([['1', 'Approve' as const]]));

        // Then the next review is shown instead, so the user isn't prompted twice for the same transaction
        expect(review?.transactionID).toBe('2');
    });

    it('skips entries without a transaction ID', () => {
        // Given a malformed entry that has no transaction ID, which can't be reviewed
        const queue = buildQueue([buildReview('', '2026-10-27 09:00:00'), buildReview('2', '2026-10-27 11:00:00')]);

        // When we pick the review to show
        const review = getPending3DSReviewToShow(queue, undefined);

        // Then the malformed entry is ignored even though it is the oldest
        expect(review?.transactionID).toBe('2');
    });

    it('returns the oldest eligible review', () => {
        // Given several unanswered reviews whose IDs run opposite to their age, since Object.values iterates numeric keys in ascending order
        const queue = buildQueue([buildReview('1', '2026-10-27 12:00:00'), buildReview('2', '2026-10-27 11:00:00'), buildReview('3', '2026-10-27 10:00:00')]);

        // When we pick the review to show
        const review = getPending3DSReviewToShow(queue, {});

        // Then the oldest one is shown first, keeping the order stable while the user works through them
        expect(review?.transactionID).toBe('3');
    });
});
