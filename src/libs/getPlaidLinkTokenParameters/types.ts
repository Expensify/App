type PlaidLinkTokenParameters = {
    androidPackage?: string;
    redirectURI?: string;
    allowDebit?: boolean;
    bankAccountID?: number;
};

type GetPlaidLinkTokenParameters = () => PlaidLinkTokenParameters;

export default GetPlaidLinkTokenParameters;
