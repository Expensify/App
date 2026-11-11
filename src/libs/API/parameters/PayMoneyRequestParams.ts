import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';

type PayMoneyRequestParams = {
    iouReportID: string | undefined;
    chatReportID: string;
    reportActionID: string;
    paymentMethodType: PaymentMethodType;
    full: boolean;
    amount?: number;
    bankAccountID?: number;
    /** The Wise quote the admin confirmed, required to pay a cross-currency report through Wise */
    wiseQuoteID?: string;
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
