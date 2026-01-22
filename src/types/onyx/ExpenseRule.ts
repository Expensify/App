/** Model of tax rate */
type TaxRate = {
    /** The tax ID */
    externalID: string;

    /** The tax rate */
    value: string;
};

/** Model of expense rule */
type ExpenseRule = {
    /** Whether the transaction is set to be billable */
    billable?: 'true' | 'false';

    /** The category set by the rule */
    category?: string;

    /** The description set by the rule */
    comment?: string;

    /** Whether to create report if necessary */
    createReport?: boolean;

    /** The merchant set by the rule */
    merchant?: string;

    /** Merchant name to match to apply the rule */
    merchantToMatch: string;

    /** Whether the transaction is set to be reimbursable */
    reimbursable?: 'true' | 'false';

    /** Name of the report to add transactions to */
    report?: string;

    /** The tag set by the rule */
    tag?: string;

    /** The tax rate set by the rule */
    tax?: Record<string, TaxRate>;
};

export type {TaxRate};
export default ExpenseRule;
