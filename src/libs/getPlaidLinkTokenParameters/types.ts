type PlaidLinkTokenParameters =
    | { android_package: string } // eslint-disable-line @typescript-eslint/naming-convention
    | { redirect_uri: string }; // eslint-disable-line @typescript-eslint/naming-convention

type GetPlaidLinkTokenParameters = () => PlaidLinkTokenParameters;

export default GetPlaidLinkTokenParameters;
