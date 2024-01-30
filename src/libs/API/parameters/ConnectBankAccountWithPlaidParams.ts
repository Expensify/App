type ConnectBankAccountWithPlaidParams = {
    bankAccountID: number;
    routingNumber: string;
    accountNumber: string;
    bank?: string;
    plaidAccountID: string;
    plaidAccessToken: string;
    canUseNewVbbaFlow?: boolean;
    policyID?: string;
};

export default ConnectBankAccountWithPlaidParams;
