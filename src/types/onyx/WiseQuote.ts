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
};

export default WiseQuote;
export type {WiseQuoteRequest};
