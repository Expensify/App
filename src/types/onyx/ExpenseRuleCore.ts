/** Model of tax rate on a policy rule */
type PolicyRuleTaxRate = {
    /** The tax ID */
    externalID: string;

    /** The tax rate */
    value: string;

    /** The name of the tax rate */
    name: string;
};

// eslint-disable-next-line import/prefer-default-export -- Preserve the named type API used by ExpenseRule.
export type {PolicyRuleTaxRate};
