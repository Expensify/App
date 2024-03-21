import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';

type PayMoneyRequestParams = {
    iouReportID: string;
    chatReportID: string;
    reportActionID: string;
    paymentMethodType: PaymentMethodType;
    full: boolean;
    amount?: number;
};

export default PayMoneyRequestParams;
