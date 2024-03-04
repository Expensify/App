import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';

type PayMoneyRequestParams = {
    iouReportID: string;
    chatReportID: string;
    reportActionID: string;
    paymentMethodType: PaymentMethodType;
};

export default PayMoneyRequestParams;
