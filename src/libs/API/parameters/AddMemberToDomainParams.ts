type AddMemberToDomainParams = {
    authToken?: string | null;
    emailList: string[];
    domainAccountID: number;
    defaultSecurityGroupID?: string;
};

export default AddMemberToDomainParams;
