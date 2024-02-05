import type CONST from '@src/CONST';
import type DeepValueOf from '@src/types/utils/DeepValueOf';

type PayMoneyRequestParams = {
    iouReportID: string;
    chatReportID: string;
    reportActionID: string;
    paymentMethodType: DeepValueOf<typeof CONST.IOU.PAYMENT_TYPE>;
};

export default PayMoneyRequestParams;
