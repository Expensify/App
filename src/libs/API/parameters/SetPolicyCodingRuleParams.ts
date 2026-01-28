type SetPolicyCodingRuleParams = {
    /** The policy ID that the rule will be created or updated for */
    policyID: string;

    /** The existing codingRuleID, or an optimistic one to create the rule */
    codingRuleID: string;

    /** The JSON value of the merchant rule, stringified */
    codingRuleValue: string;

    /** Whether to update the transactions that match the rule */
    shouldUpdateMatchingTransactions: boolean;
};

export default SetPolicyCodingRuleParams;
