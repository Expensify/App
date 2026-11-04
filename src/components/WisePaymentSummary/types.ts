import type {WiseQuote} from '@src/types/onyx';

/** Amounts shown for a Wise payment. The reimbursement row stores them under the same names as the quote */
type WisePaymentAmounts = Pick<WiseQuote, 'fee' | 'rate' | 'debitedAmount' | 'creditedAmount' | 'currency' | 'paymentCurrency' | 'tax'>;

type WisePaymentSummaryRow = {
    label: string;
    value: string;
};

type WisePaymentSummaryProps = {
    reportID: string | undefined;
    rows: WisePaymentSummaryRow[];
};

export type {WisePaymentAmounts, WisePaymentSummaryRow, WisePaymentSummaryProps};
