type AddTrackedExpenseToPolicyParams = {
    amount: number;
    currency: string;
    created: string;
    comment?: string;
    merchant?: string;
    category: string | undefined;
    tag: string | undefined;
    taxCode: string;
    taxAmount: number;
    billable: boolean | undefined;
    policyID: string | undefined;
    transactionID: string;
    actionableWhisperReportActionID: string;
    moneyRequestReportID: string;
    reportPreviewReportActionID: string;
};

export default AddTrackedExpenseToPolicyParams;
