type SendInvoiceParams = {
    senderWorkspaceID: string;
    accountID: number;
    receiverEmail?: string;
    receiverInvoiceRoomID?: string;
    amount: number;
    currency: string;
    merchant: string;
    date: string;
    category?: string;
    optimisticInvoiceRoomID?: string;
    optimisticCreatedChatReportActionID: string;
    optimisticInvoiceReportID: string;
    optimisticReportPreviewReportActionID: string;
    optimisticTransactionID: string;
    optimisticTransactionThreadReportID: string;
};

export default SendInvoiceParams;
