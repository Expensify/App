import {getPendingFraudReviewToShow} from '@libs/Navigation/useNavigateToForcedTransactionReview';

import type {TransactionPendingFraudReview, TransactionsPendingFraudReview} from '@src/types/onyx';

const NOW = new Date('2026-11-03T12:00:00.000Z').getTime();
const DAY_MS = 24 * 60 * 60 * 1000;

function buildReview(transactionID: string, created: string): TransactionPendingFraudReview {
    return {transactionID, created, lastFourPAN: '1234', cardID: 1};
}

function buildQueue(reviews: TransactionPendingFraudReview[]): TransactionsPendingFraudReview {
    return Object.fromEntries(reviews.map((review) => [review.transactionID, review]));
}

describe('getPendingFraudReviewToShow', () => {
    it('returns the oldest unanswered review', () => {
        // Given several unanswered reviews whose IDs run opposite to their dates
        const queue = buildQueue([buildReview('1', '2026-11-03 11:00:00'), buildReview('2', '2026-11-03 10:00:00')]);

        // When we pick the review to show
        const review = getPendingFraudReviewToShow(queue, undefined, NOW);

        // Then the oldest one is shown first, keeping the order stable while the user works through them
        expect(review?.transactionID).toBe('2');
    });

    it('skips a review answered on this device less than 3 days ago', () => {
        // Given the oldest review was answered here yesterday and the server hasn't removed it yet
        const queue = buildQueue([buildReview('1', '2026-11-03 10:00:00'), buildReview('2', '2026-11-03 11:00:00')]);
        const locallyProcessed = Object.fromEntries([['1', new Date(NOW - DAY_MS).toISOString()]]);

        // When we pick the review to show
        const review = getPendingFraudReviewToShow(queue, locallyProcessed, NOW);

        // Then the next review is shown instead, so the user isn't asked twice right away
        expect(review?.transactionID).toBe('2');
    });

    it('shows a review again once its answer is more than 3 days old', () => {
        // Given a review answered here 4 days ago that the server still lists, so the answer never reached it
        const queue = buildQueue([buildReview('1', '2026-10-30 10:00:00')]);
        const locallyProcessed = Object.fromEntries([['1', new Date(NOW - 4 * DAY_MS).toISOString()]]);

        // When we pick the review to show
        const review = getPendingFraudReviewToShow(queue, locallyProcessed, NOW);

        // Then it is shown again, since fraud reviews don't expire and still need an answer
        expect(review?.transactionID).toBe('1');
    });
});
