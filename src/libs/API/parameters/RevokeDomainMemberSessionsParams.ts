type RevokeDomainMemberSessionsParams = {
    domainAccountID: number;

    /** Comma-separated account IDs of the members to sign out */
    accountIDList: string;
};

export default RevokeDomainMemberSessionsParams;
