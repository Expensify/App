import type {Comment} from './Transaction';

/**
 * Model of review duplicates request
 */
type ReviewDuplicates = {
    /** Transactions ids which are duplicates of selected transcation */
    duplicates: string[];

    /** ID of transaction we want to keep */
    transactionID: string;

    /** ID of the transaction report we want to keep */
    reportID: string;

    /** Merchant which user want to keep */
    merchant: string;

    /** Category  which user want to keep */
    category: string;

    /** Tag  which user want to keep */
    tag: string;

    /** Tax code  which user want to keep */
    taxCode: string;

    /** Calculated tax amount */
    taxAmount: number;

    /** Description  which user want to keep */
    description: string;

    /** NVPs of the transaction that we want to keep */
    comment: Comment;

    /** Whether the transaction is reimbursable */
    reimbursable: boolean;

    /** Whether the transaction is billable */
    billable: boolean;
};

export default ReviewDuplicates;
