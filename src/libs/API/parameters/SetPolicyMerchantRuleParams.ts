type PolicyRuleTaxRate = {
    /** The tax ID */
    externalID: string;

    /** The tax rate */
    value: string;

    /** The name of the tax rate */
    name: string;
};

type SetPolicyMerchantRuleParams = {
    policyID: string;
    merchantToMatch: string;
    merchant?: string;
    category?: string;
    tag?: string;
    tax?: PolicyRuleTaxRate;
    comment?: string;
    reimbursable?: boolean;
    billable?: boolean;
};

export type {PolicyRuleTaxRate};
export default SetPolicyMerchantRuleParams;