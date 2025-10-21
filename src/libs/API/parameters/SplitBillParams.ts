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
    reimbursable: boolean;
    transactionID: string;
    reportActionID: string;
    createdReportActionID?: string;
    policyID: string | undefined;
    chatType: string | undefined;
    taxCode: string;
    taxAmount: number;
    description?: string;
};

export default SplitBillParams;
