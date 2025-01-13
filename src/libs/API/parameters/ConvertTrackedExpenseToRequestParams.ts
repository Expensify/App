type ConvertTrackedExpenseToRequestParams = {
    amount: number;
    currency: string;
    created: string;
    comment?: string;
    merchant?: string;
    payerAccountID: number;
    chatReportID: string;
    transactionID: string;
    actionableWhisperReportActionID: string;
    createdChatReportActionID: string;
    moneyRequestReportID: string;
    moneyRequestCreatedReportActionID: string;
    moneyRequestPreviewReportActionID: string;
    reportPreviewReportActionID: string;
};

export default ConvertTrackedExpenseToRequestParams;
