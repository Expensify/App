type SendInvoiceParams = {
    senderWorkspaceID: string;
    accountID: number;
    receiverEmail?: string;
    receiverInvoiceRoomID?: string;
    amount: number;
    currency: string;
    comment: string;
    merchant: string;
    date: string;
    category?: string;
    invoiceRoomReportID?: string;
    createdChatReportActionID: string;
    invoiceReportID: string;
    reportPreviewReportActionID: string;
    transactionID: string;
    transactionThreadReportID: string;
};

export default SendInvoiceParams;
