import type {PaymentMethodType} from '@libs/actions/IOU';

type PayMoneyRequestParams = {
    iouReportID: string;
    chatReportID: string;
    reportActionID: string;
    paymentMethodType: PaymentMethodType;
};

export default PayMoneyRequestParams;
