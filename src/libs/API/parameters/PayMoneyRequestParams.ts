import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';

type PayMoneyRequestParams = {
    iouReportID: string;
    chatReportID: string;
    reportActionID: string;
    paymentMethodType: PaymentMethodType;
    full: boolean;
    amount?: number;
    optimisticHoldReportID?: string;
    optimisticHoldActionID?: string;
};

export default PayMoneyRequestParams;
