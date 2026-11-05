import type {WiseQuote} from '@src/types/onyx';
import type {Errors} from '@src/types/onyx/OnyxCommon';

/** Amounts shown for a Wise payment. The reimbursement row stores them under the same names as the quote */
type WisePaymentAmounts = Pick<WiseQuote, 'fee' | 'rate' | 'debitedAmount' | 'creditedAmount' | 'currency' | 'paymentCurrency' | 'tax'>;

type WisePaymentSummaryRow = {
    label: string;
    value: string;
};

type WisePaymentSummaryProps = {
    reportID: string | undefined;
    rows: WisePaymentSummaryRow[];

    /** Empty rows after the real ones, used to size the space a fully loaded card takes */
    placeholderRowCount?: number;

    errors?: Errors;
};

export type {WisePaymentAmounts, WisePaymentSummaryRow, WisePaymentSummaryProps};
