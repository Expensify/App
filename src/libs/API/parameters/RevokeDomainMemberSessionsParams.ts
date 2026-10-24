type RevokeDomainMemberSessionsParams = {
    domainAccountID: number;
    targetAccountID: number;
    shouldRetry: false;
    skipReauthentication: true;
};

export default RevokeDomainMemberSessionsParams;
