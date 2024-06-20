type SplitBillParams = {
    reportID: string;
    amount: number;
    splits: string;
    comment: string;
    currency: string;
    merchant: string;
    created: string;
    category: string;
    tag: string;
    billable: boolean;
    transactionID: string;
    reportActionID: string;
    createdReportActionID?: string;
    policyID: string | undefined;
    chatType: string | undefined;
    splitPayerAccountIDs: number[];
    taxCode: string;
    taxAmount: number;
};

export default SplitBillParams;
