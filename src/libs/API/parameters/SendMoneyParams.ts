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
};

export default SendMoneyParams;
