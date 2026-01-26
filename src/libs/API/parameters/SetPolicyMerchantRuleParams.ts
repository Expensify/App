type SetPolicyMerchantRuleParams = {
    policyID: string;
    merchantToMatch: string;
    merchant?: string;
    category?: string;
    tag?: string;
    tax?: string;
    comment?: string;
    reimbursable?: boolean;
    billable?: boolean;
};

export default SetPolicyMerchantRuleParams;
