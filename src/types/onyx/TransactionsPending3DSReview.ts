import type TransactionPending3DSReview from './TransactionPending3DSReview';

/**
 * Record of pending 3DS reviews indexed by transaction IDs.
 */
type TransactionsPending3DSReview = Record<string, TransactionPending3DSReview>;

export default TransactionsPending3DSReview;
