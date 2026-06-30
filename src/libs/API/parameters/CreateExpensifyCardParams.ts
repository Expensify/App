type CreateExpensifyCardParams = {
    assigneeEmail: string;
    limit: number;
    limitType: string;
    cardTitle: string;
    feedCountry?: string;
    validateCode?: string;
    domainAccountID: number;
    policyID?: string;
    validFrom?: string;
    validThru?: string;
    cardRuleID?: string;
    cardRuleValue?: string;
};

export default CreateExpensifyCardParams;
