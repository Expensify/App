type PlaidLinkTokenParameters = {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    android_package?: string;

    // eslint-disable-next-line @typescript-eslint/naming-convention
    redirect_uri?: string;

    allowDebit?: boolean;
    bankAccountID?: number;
};

type GetPlaidLinkTokenParameters = () => PlaidLinkTokenParameters;

export default GetPlaidLinkTokenParameters;
