/**
 * Declined transaction that the cardholder has to review as possible fraud.
 * This is stored under the `transactionsPendingFraudReview` Onyx key.
 */
type TransactionPendingFraudReview = {
    /** Transaction amount in cents */
    amount?: number;

    currency?: string;

    merchant?: string;

    /** Created date (YYYY-MM-DD HH:MM:SS) */
    created: string;

    /** Last 4 digits of the card PAN */
    lastFourPAN: string;

    /** Card used for the transaction, needed to unfreeze it or open its details after the review */
    cardID: number;

    transactionID: string;
};

export default TransactionPendingFraudReview;
