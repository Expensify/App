type ConnectBankAccountWithPlaidParams = {
    bankAccountID: number;
    routingNumber: string;
    accountNumber: string;
    bank?: string;
    plaidAccountID: string;
    plaidAccessToken: string;
};

export default ConnectBankAccountWithPlaidParams;
