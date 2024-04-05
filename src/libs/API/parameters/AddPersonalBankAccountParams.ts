type AddPersonalBankAccountParams = {
    addressName?: string;
    routingNumber: string;
    accountNumber: string;
    isSavings?: boolean;
    setupType: string;
    bank?: string;
    plaidAccountID: string;
    plaidAccessToken: string;
};

export default AddPersonalBankAccountParams;
