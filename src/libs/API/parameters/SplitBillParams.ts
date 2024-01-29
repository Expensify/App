type SplitBillParams = {
    reportID: string;
    amount: number;
    splits: string;
    comment: string;
    currency: string;
    merchant: string;
    category: string;
    tag: string;
    transactionID: string;
    reportActionID: string;
    createdReportActionID?: string;
    policyID?: string;
};

export default SplitBillParams;
