type MergeTransactionParams = {
    /** Transaction ID we're keeping */
    transactionID: string;

    /** ID of the transaction we're merging into that will be deleted */
    transactionIDList: string[];

    /** Created date */
    created: string;

    /** Merchant which user want to keep */
    merchant: string;

    /** Category which user want to keep */
    category: string;

    /** Tag which user want to keep */
    tag: string;

    /** Description which user want to keep */
    comment: string;

    /** Whether the transaction is reimbursable */
    reimbursable: boolean;

    /** Whether the transaction is billable */
    billable: boolean;

    /** The receiptID we want to keep */
    receiptID: number | undefined;
};

export default MergeTransactionParams;
