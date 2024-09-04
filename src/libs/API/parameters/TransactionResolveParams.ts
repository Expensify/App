type TransactionResolveParams = {
    transactionIDToKeep: string;
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
    optimisticReportActionID: string;
    reportActionIDList: string[];
};

export default TransactionResolveParams;
