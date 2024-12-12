type TransactionMergeParams = {
    transactionID: string;
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
    reportID: string;
};

export default TransactionMergeParams;
