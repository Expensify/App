type ImportPlaidAccountsParams = {
    publicToken: string;
    feed: string;
    feedName: string;
    country: string;
    domainName: string;
    plaidAccounts: string;
    plaidAccessToken?: string;
};

export default ImportPlaidAccountsParams;
