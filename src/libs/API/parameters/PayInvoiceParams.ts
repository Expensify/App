import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';

type PayInvoiceParams = {
    reportID: string;
    reportActionID: string;
    paymentMethodType: PaymentMethodType;
    payAsBusiness: boolean;
    policyID?: string;
    announceChatReportID?: string;
    adminsChatReportID?: string;
    expenseChatReportID?: string;
    announceCreatedReportActionID?: string;
    adminsCreatedReportActionID?: string;
    expenseCreatedReportActionID?: string;
};

export default PayInvoiceParams;
