type OpenPlaidBankLoginParams = {
    redirectURI: string | undefined;
    allowDebit: boolean;
    bankAccountID: number;
};

export default OpenPlaidBankLoginParams;
