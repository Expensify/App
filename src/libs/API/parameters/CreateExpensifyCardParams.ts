type CreateExpensifyCardParams = {
    policyID: string;
    assigneeEmail: string;
    limit: number;
    limitType: string;
    cardTitle: string;
    feedCountry: string;
    domainAccountID: number;
};

export default CreateExpensifyCardParams;
