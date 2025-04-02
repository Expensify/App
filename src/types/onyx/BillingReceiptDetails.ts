import type * as OnyxCommon from './OnyxCommon';

/**
 * Billing item
 */
type BillingItem = {
    /** The description of the item */
    description: string;

    /** The amount associated with the item */
    amount: number;

    /** The formatted string representation of the amount */
    formattedAmount: string;

    /** The type/category of the item */
    type: string;

    /** The percentage related to the item */
    percentage: number;
};

/**
 * Billing receipt details model
 */
type BillingReceiptDetails = {
    /** The total amount before any discounts are applied */
    subtotal: number;

    /** A list of receipts that do not have discounts applied */
    receiptsWithoutDiscount: BillingItem[];

    /** A list of discounts applied to the billing */
    discounts: BillingItem[];

    /** A list of sales tax items */
    salesTax: BillingItem;

    /** The billing month, formatted as "Month YYYY" */
    billingMonth: string;

    /** The formatted string representation of the subtotal amount */
    formattedSubtotal: string;

    /** The average yearly user price */
    averageYearlyUserPrice: number;

    /** The base monthly price for corporate subscriptions */
    monthlyCorpBasePrice: number;

    /** The base monthly price for team subscriptions */
    monthlyTeamBasePrice: number;

    /** A list of errors keyed by microtime */
    errors?: OnyxCommon.Errors;

    /** Indicates whether the data is loaded or not  */
    isLoading?: boolean;
};

export default BillingReceiptDetails;
