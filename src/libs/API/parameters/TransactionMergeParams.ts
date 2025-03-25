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
};

export default TransactionMergeParams;
