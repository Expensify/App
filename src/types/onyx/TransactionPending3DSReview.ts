/**
 * Minimal transaction data needed to render the MFA authorize transaction preview.
 * This is stored under the `transactionsPending3DSReview` Onyx key.
 */
type TransactionPending3DSReview = {
    /** Transaction amount in cents */
    amount?: number;

    /** Transaction currency */
    currency?: string;

    /** Merchant name */
    merchant?: string;

    /** Created date (YYYY-MM-DD HH:MM:SS) */
    created: string;

    /** Expiration date - should be exactly 8 minutes after created date */
    expires: string;

    /** Last 4 digits of the card PAN */
    lastFourPAN: string;

    /** transactionID of the pending transaction */
    transactionID: string;
};

export default TransactionPending3DSReview;
