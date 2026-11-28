import type CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

/** Wise's price for paying a report through a global provider, held for 30 minutes. Amounts are in cents */
type WiseQuote = {
    /** Wise's quote UUID, sent back with Pay */
    wiseQuoteID: string;

    /** Total fees, in `currency` */
    fee: number;

    /** Units of `paymentCurrency` per one unit of `currency` */
    rate: number;

    /** Amount taken from the company's bank account, in `currency` */
    debitedAmount: number;

    /** Amount the employee receives, in `paymentCurrency` */
    creditedAmount: number;

    /** Currency of the company's bank account */
    currency: string;

    /** Currency of the employee's bank account */
    paymentCurrency: string;

    /** When the money is expected to reach the employee */
    expectedDate: string;

    /** When Wise stops honoring this price */
    expiresAt: string;

    /** Tax Wise charges on the payment in some corridors, in `currency` */
    tax?: number;
};

/** The payment a quote was asked for, kept on the device so a saved quote is reused only for the same payment */
type WiseQuoteRequest = {
    /** False when the admin pays only the expenses that are not on hold */
    full: boolean;

    /** The amount being paid, in the report currency, in cents */
    amount: number;

    /** Whether the company pays the FX conversion costs instead of the employee, which changes the fees Wise prices */
    isFXCostPaidByCompany?: boolean;
};

/** Why Wise refused to price the payment, sent by the server in place of a quote */
type WiseQuoteError = {
    /** Which of Wise's checks the payment failed */
    code: ValueOf<typeof CONST.WISE.QUOTE_ERROR_CODE>;

    /** The most or least Wise sends, in hundredths of `limitCurrency` like every amount, even in a currency without decimals. Always sent for `maxAmount`, and for `minAmount` only when Wise gives its minimum */
    limit?: number;

    /** Currency of `limit`, sent exactly when `limit` is */
    limitCurrency?: string;

    /** Currency of the employee's bank account */
    paymentCurrency: string;
};

export default WiseQuote;
export type {WiseQuoteError, WiseQuoteRequest};
