type OpenPlaidBankLoginParams = {
    redirectURI: string | undefined;
    androidPackage?: string;
    allowDebit: boolean;
    bankAccountID: number;
};

export default OpenPlaidBankLoginParams;
