type AddPersonalBankAccountParams = {
    addressName?: string;
    routingNumber: string;
    accountNumber: string;
    isSavings?: boolean;
    setupType: string;
    bank?: string;
    plaidAccountID: string;
    plaidAccessToken: string;
    isInvoiceBankAccount?: boolean;
};

export default AddPersonalBankAccountParams;
