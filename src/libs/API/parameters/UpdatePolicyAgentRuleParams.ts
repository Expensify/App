type UpdatePolicyAgentRuleParams = {
    policyID: string;
    agentRuleID: string;
    prompt: string;
    applyRetroactively?: boolean;
};

export default UpdatePolicyAgentRuleParams;
