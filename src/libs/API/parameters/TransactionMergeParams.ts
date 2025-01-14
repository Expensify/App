type TransactionMergeParams = {
    transactionID: string | undefined;
    transactionIDList: string[];
    created: string;
    merchant: string;
    amount: number;
    currency: string;
    category: string;
    comment: string;
    billable: boolean;
    reimbursable: boolean;
    tag: string;
    receiptID: number;
    reportID: string | undefined;
    /** The reportActionID of the dismissed violation action in the kept transaction thread report */
    dismissedViolationReportActionID: string;
};

export default TransactionMergeParams;
