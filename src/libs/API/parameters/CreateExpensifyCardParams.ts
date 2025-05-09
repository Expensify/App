type CreateExpensifyCardParams = {
    assigneeEmail: string;
    limit: number;
    limitType: string;
    cardTitle: string;
    feedCountry: string;
    domainAccountID: number;
    policyID?: string;
};

export default CreateExpensifyCardParams;
