type ToggleTwoFactorAuthRequiredForDomainParams = {
    domainAccountID: number;
    domainName: string;
    enabled: boolean;
    twoFactorAuthCode?: string;
};

export default ToggleTwoFactorAuthRequiredForDomainParams;
