import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';

type PayInvoiceParams = {
    reportID: string;
    reportActionID: string;
    paymentMethodType: PaymentMethodType;
    payAsBusiness: boolean;
};

export default PayInvoiceParams;
