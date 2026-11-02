import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';

type PayMoneyRequestParams = {
    iouReportID: string | undefined;
    /** Bills have no policy expense chat, so they may omit it */
    chatReportID: string | undefined;
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
