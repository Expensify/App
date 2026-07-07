type ResetDomainMemberTwoFactorAuth = {
    domainAccountID: number;
    targetAccountID: number;
    targetEmail: string;
    twoFactorAuthCode: string;
};

export default ResetDomainMemberTwoFactorAuth;
