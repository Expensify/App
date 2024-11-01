import type {RequireAtLeastOne} from 'type-fest';

type SendInvoiceParams = RequireAtLeastOne<
    {
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
        companyName?: string;
        companyWebsite?: string;
        createdIOUReportActionID: string;
        createdReportActionIDForThread: string;
        reportActionID: string;
    },
    'receiverEmail' | 'receiverInvoiceRoomID'
>;

export default SendInvoiceParams;
