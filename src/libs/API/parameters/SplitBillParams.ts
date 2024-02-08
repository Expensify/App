type SplitBillParams = {
    reportID: string;
    amount: number;
    splits: string;
    comment: string;
    created: string;
    currency: string;
    merchant: string;
    category: string;
    tag: string;
    billable: boolean;
    transactionID: string;
    reportActionID: string;
    createdReportActionID?: string;
    policyID?: string;
};

export default SplitBillParams;
