import type TransactionPendingFraudReview from './TransactionPendingFraudReview';

/**
 * Record of pending fraud reviews indexed by transaction IDs.
 */
type TransactionsPendingFraudReview = Record<string, TransactionPendingFraudReview>;

export default TransactionsPendingFraudReview;
