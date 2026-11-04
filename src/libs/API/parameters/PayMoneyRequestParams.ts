import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';

type PayMoneyRequestParams = {
    iouReportID: string | undefined;
    /** A bill has no parent chat, so payBill sends it only when the bill has one */
    chatReportID?: string;
    reportActionID: string;
    paymentMethodType: PaymentMethodType;
    full: boolean;
    amount?: number;
    bankAccountID?: number;
    optimisticHoldReportID?: string;
    optimisticHoldActionID?: string;
    /**
     * Stringified JSON object with type of following structure:
     * Array<{
     *   optimisticReportActionID: string;
     *   oldReportActionID: string;
     * }>
     */
    optimisticHoldReportExpenseActionIDs?: string;
};

export default PayMoneyRequestParams;
