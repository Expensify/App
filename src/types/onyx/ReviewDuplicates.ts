type ReviewDuplicates = {
    /** Transactions ids which are duplicates of selected transcation */
    duplicates: string[];

    /** ID of transaction we want to keep */
    transactionID: string;

    merchant: string;
    category: string;
    tag: string;
    taxCode: string;
    description: string;
    reimbursable: boolean;
    billable: boolean;
};

export default ReviewDuplicates;
