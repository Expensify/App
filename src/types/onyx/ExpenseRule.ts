/** Model of tax rate */
type TaxRate = {
    /** The tax ID */
    externalID: string;

    /** The tax rate */
    value: string;
};

/** Model of expense rule */
type ExpenseRule = {
    /** Whether the transaction is billable */
    billable: string;

    /** The name of the category */
    category: string;

    /** The description of the rule */
    comment: string;

    /** The name of the merchant */
    merchant: string;

    /** When the merchant name contains */
    merchantToMatch: string;

    /** Whether the transaction is reimbursable */
    reimbursable: string;

    /** Add to a report named */
    report: string;

    /** The name of the tag */
    tag: string;

    /** The tax rate */
    tax: Record<string, TaxRate>;
};

export default ExpenseRule;
