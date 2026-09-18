type SetRuleParams = {
    /** What kind of entity the rule is scoped to. Merchant rules are always scoped to a policy */
    scope: string;

    /** The ID of the scoped entity, i.e. the policyID for policy-scoped rules */
    scopeID: string;

    /** The ID of the rule being written. A new rule uses an optimistic `rand64()` value */
    ruleID: string;

    /** Determines the order rules are applied in when more than one matches */
    priority: number;

    /** The `{filters, triggers, actions}` body of the rule, stringified */
    value: string;

    /** Whether to apply the rule to the transactions that already match it */
    shouldUpdateMatchingTransactions: boolean;
};

export default SetRuleParams;
