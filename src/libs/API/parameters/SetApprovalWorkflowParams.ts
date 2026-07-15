type SetApprovalWorkflowParams = {
    /** The policy ID whose approval-workflow rules are being mutated. */
    policyID: string;

    /**
     * JSON-stringified object keyed by ruleID
     */
    rules: string;
};

export default SetApprovalWorkflowParams;
