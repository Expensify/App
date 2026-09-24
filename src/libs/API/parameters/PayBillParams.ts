import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';

type PayBillParams = {
    reportID: string;
    paymentMethodType: PaymentMethodType;
    bankAccountID?: number;
};

export default PayBillParams;
