import type * as OnyxCommon from './OnyxCommon';

/** Model of tax rate on a personal rule */
type PersonalRuleTaxRate = {
    /** The tax ID */
    externalID: string;

    /** The tax rate */
    value: string;
};

/** Model of tax rate on a policy rule */
type PolicyRuleTaxRate = {
    /** The tax ID */
    externalID: string;

    /** The tax rate */
    value: string;

    /** The name of the tax rate */
    name: string;
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
    tax?: Record<string, PersonalRuleTaxRate>;

    /** The pending action for offline support */
    pendingAction?: OnyxCommon.PendingAction;

    /** Error messages for the rule */
    errors?: OnyxCommon.Errors;
};

export type {PersonalRuleTaxRate, PolicyRuleTaxRate};
export default ExpenseRule;
