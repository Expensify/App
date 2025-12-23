type ToggleConsolidatedDomainBillingParams = {
    authToken?: string | null;
    domainAccountID: number;
    domainName: string;
    enabled: boolean;
};

export default ToggleConsolidatedDomainBillingParams;
