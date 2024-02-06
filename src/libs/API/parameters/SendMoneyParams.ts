import type CONST from '@src/CONST';
import type DeepValueOf from '@src/types/utils/DeepValueOf';

type SendMoneyParams = {
    iouReportID: string;
    chatReportID: string;
    reportActionID: string;
    paymentMethodType: DeepValueOf<typeof CONST.IOU.PAYMENT_TYPE>;
    transactionID: string;
    newIOUReportDetails: string;
    createdReportActionID: string;
    reportPreviewReportActionID: string;
    transactionThreadReportID: string;
    createdReportActionIDForThread: string;
};

export default SendMoneyParams;
