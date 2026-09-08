type ImportPlaidAccountsParams = {
    publicToken: string;
    feed: string;
    feedName: string;
    country: string;
    domainName: string;
    plaidAccounts: string;
    plaidAccessToken?: string;
    domainAccountID?: string;
};

export default ImportPlaidAccountsParams;
