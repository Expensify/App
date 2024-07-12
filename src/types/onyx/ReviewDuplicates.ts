/**
 * Model of review duplicates request
 */
type ReviewDuplicates = {
    /** Transactions ids which are duplicates of selected transcation */
    duplicates: string[];

    /** ID of transaction we want to keep */
    transactionID: string;

    /** Merchant which user want to keep */
    merchant: string;

    /** Category  which user want to keep */
    category: string;

    /** Tag  which user want to keep */
    tag: string;

    /** Tax code  which user want to keep */
    taxCode: string;

    /** Description  which user want to keep */
    description: string;

    /** Whether the transaction is reimbursable */
    reimbursable: boolean;

    /** Whether the transaction is billable */
    billable: boolean;
};

export default ReviewDuplicates;
