type SetTwoFactorAuthExemptEmailForDomainParams = {
    domainAccountID: number;
    targetEmail: string;
    enabled: boolean;
    twoFactorAuthCode?: string;
};

export default SetTwoFactorAuthExemptEmailForDomainParams;
