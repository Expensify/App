type CreateExpensifyCardParams = {
    policyID: string | undefined;
    assigneeEmail: string;
    limit: number;
    limitType: string;
    cardTitle: string;
    feedCountry: string;
    domainAccountID: number;
};

export default CreateExpensifyCardParams;
