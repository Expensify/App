type AddPersonalBankAccountParams = {
    addressName?: string;
    routingNumber: string;
    accountNumber: string;
    isSavings?: boolean;
    setupType: string;
    bank?: string;
    plaidAccountID: string;
    plaidAccessToken: string;
    policyID?: string;
    source?: string;
};

export default AddPersonalBankAccountParams;
