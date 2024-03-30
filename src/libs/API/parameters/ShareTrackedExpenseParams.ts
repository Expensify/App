type ShareTrackedExpenseParams = {
    policyID: string;
    transactionID: string;
    moneyRequestPreviewReportActionID: string;
    moneyRequestReportID: string;
    moneyRequestCreatedReportActionID: string;
    actionableWhisperReportActionID: string;
    // making it optional for now
    modifiedExpenseReportActionID?: string;
};

export default ShareTrackedExpenseParams;
