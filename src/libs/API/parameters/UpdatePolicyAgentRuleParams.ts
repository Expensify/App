type UpdatePolicyAgentRuleParams = {
    policyID: string;
    agentRuleID: string;
    prompt: string;
    applyToExistingExpenses?: boolean;
};

export default UpdatePolicyAgentRuleParams;
