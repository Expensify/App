type RevokeAllDomainMemberSessionsParams = {
    domainAccountID: number;
    completionHandle: string;
    shouldRetry: false;
    skipReauthentication: true;
};

export default RevokeAllDomainMemberSessionsParams;
