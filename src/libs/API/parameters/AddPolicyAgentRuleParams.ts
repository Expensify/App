type AddPolicyAgentRuleParams = {
    policyID: string;
    agentRuleID: string;
    prompt: string;
    applyRetroactively?: boolean;
};

export default AddPolicyAgentRuleParams;
