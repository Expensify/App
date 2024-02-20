type ConnectBankAccountManuallyParams = {
    bankAccountID: number;
    accountNumber?: string;
    routingNumber?: string;
    plaidMask?: string;
    canUseNewVbbaFlow?: boolean;
    policyID?: string;
};
export default ConnectBankAccountManuallyParams;
