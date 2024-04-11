type SendInvoiceParams = {
    senderWorkspaceID: string;
    accountID: number;
    receiverEmail?: string; // used when there is no existing room
    receiverInvoiceRoomID?: string; // optional param used only when the user sends an invoice to an existing room
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
