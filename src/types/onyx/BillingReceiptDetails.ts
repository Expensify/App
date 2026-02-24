/* eslint-disable jsdoc/require-jsdoc */
type BillingItem = {
    description: string;

    amount: number;

    formattedAmount: string;

    type: string;

    percentage: number;
};

type BillingReceiptDetails = {
    subtotal: number;

    receiptsWithoutDiscount: BillingItem[];

    discounts: BillingItem[];

    salesTax: BillingItem;

    billingMonth: string;

    formattedSubtotal: string;

    averageYearlyUserPrice: number;

    monthlyCorpBasePrice: number;

    monthlyTeamBasePrice: number;

    errors?: string;

    isLoading?: boolean;
};

export default BillingReceiptDetails;
