type ConnectBankAccountParams = {
    bankAccountID: number;
    routingNumber: string;
    accountNumber: string;
    bank?: string;
    plaidAccountID?: string;
    plaidAccessToken?: string;
    plaidMask?: string;
    isSavings?: boolean;
    policyID?: string;
};

export default ConnectBankAccountParams;
