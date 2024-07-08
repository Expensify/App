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
