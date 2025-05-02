import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';

type SendMoneyParams = {
    iouReportID: string;
    chatReportID: string;
    reportActionID: string;
    paymentMethodType: PaymentMethodType;
    transactionID: string;
    newIOUReportDetails: string;
    createdReportActionID: string | undefined;
    reportPreviewReportActionID: string;
    createdIOUReportActionID: string;
    transactionThreadReportID: string;
    createdReportActionIDForThread: string | undefined;
};

export default SendMoneyParams;
