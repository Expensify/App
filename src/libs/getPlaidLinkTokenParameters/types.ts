type PlaidLinkTokenParameters = {
    androidPackage?: string;
    redirectURI?: string;
    allowDebit?: boolean;
    bankAccountID?: number;
};

type GetPlaidLinkTokenParameters = (isPersonalBankAccount?: boolean) => PlaidLinkTokenParameters;

export default GetPlaidLinkTokenParameters;
