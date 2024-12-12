type CompleteSplitBillParams = {
    transactionID: string;
    amount?: number;
    currency?: string;
    created?: string;
    merchant?: string;
    comment?: string;
    category?: string;
    tag?: string;
    splits: string;
    taxCode?: string;
    taxAmount?: number;
    billable?: boolean;
};

export default CompleteSplitBillParams;
