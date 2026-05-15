type CreateDomainSecurityGroupParams = {
    /** Account ID of the domain */
    domainAccountID: number;

    /** Security group key, prefixed with the domain security group prefix */
    name: string;

    /** Stringified JSON of the new security group */
    value: string;

    /** Whether to set the newly created group as the default security group */
    shouldSetAsDefaultGroup: boolean;
};

export default CreateDomainSecurityGroupParams;
