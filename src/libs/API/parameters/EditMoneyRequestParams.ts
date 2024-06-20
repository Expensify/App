type EditMoneyRequestParams = {
    transactionID: string;
    reportActionID: string;
    created?: string;
    amount?: number;
    currency?: string;
    comment?: string;
    merchant?: string;
    category?: string;
    billable?: boolean;
    tag?: string;
};

export default EditMoneyRequestParams;
