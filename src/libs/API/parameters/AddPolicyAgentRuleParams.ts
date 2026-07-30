type AddPolicyAgentRuleParams = {
    policyID: string;
    agentRuleID: string;
    prompt: string;
    applyToExistingExpenses?: boolean;
};

export default AddPolicyAgentRuleParams;
