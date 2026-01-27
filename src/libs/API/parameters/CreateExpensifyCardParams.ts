type CreateExpensifyCardParams = {
    assigneeEmail: string;
    limit: number;
    limitType: string;
    cardTitle: string;
    feedCountry: string;
    domainAccountID: number;
    policyID?: string;
    validFrom?: string;
    validThru?: string;
};

export default CreateExpensifyCardParams;
