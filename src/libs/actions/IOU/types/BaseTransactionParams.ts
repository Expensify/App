type BaseTransactionParams = {
    amount: number;
    modifiedAmount?: number;
    currency: string;
    created: string;
    merchant: string;
    comment: string;
    category?: string;
    tag?: string;
    taxCode?: string;
    taxAmount?: number;
    taxValue?: string;
    billable?: boolean;
    reimbursable?: boolean;
    customUnitRateID?: string;
    isFromGlobalCreate?: boolean;
};

export default BaseTransactionParams;
