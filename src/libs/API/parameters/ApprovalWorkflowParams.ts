type SetApprovalWorkflowParams = {
    /** The policy ID whose approval-workflow rules are being mutated. */
    policyID: string;

    /**
     * JSON-stringified object keyed by ruleID, mapping to either:
     * - a full `ApprovalWorkflowRule` to add or replace, or
     * - `null` / `{}` to remove the rule from the policy.
     */
    rules: string;
};

export type {SetApprovalWorkflowParams};
