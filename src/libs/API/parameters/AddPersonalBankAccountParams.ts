type AddPersonalBankAccountParams = {
    addressName?: string;
    routingNumber?: string;
    accountNumber?: string;
    isSavings?: boolean;
    setupType?: string;
    bank?: string;
    plaidAccountID?: string;
    plaidAccessToken?: string;
    policyID?: string;
    source?: string;
    phoneNumber?: string;
    legalFirstName?: string;
    legalLastName?: string;
    addressStreet?: string;
    addressCity?: string;
    addressState?: string;
    addressZip?: string;
    addressCountry?: string;
};

export default AddPersonalBankAccountParams;
