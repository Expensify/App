import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';

type SendMoneyParams = {
    iouReportID: string;
    chatReportID: string;
    reportActionID: string;
    paymentMethodType: PaymentMethodType;
    transactionID: string;
    newIOUReportDetails: string;
    createdReportActionID: string;
    reportPreviewReportActionID: string;
    transactionThreadReportID: string;
    createdReportActionIDForThread: string;
};

export default SendMoneyParams;
