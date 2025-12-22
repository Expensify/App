type ToggleTwoFactorAuthRequiredForDomainParams = {
    authToken?: string | null;
    domainAccountID: number;
    domainName: string;
    enabled: boolean;
};

export default ToggleTwoFactorAuthRequiredForDomainParams;
