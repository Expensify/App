import type {CompanyCardStatementCloseDate} from '@src/types/onyx/CardFeeds';

type ImportPlaidAccountsParams = {
    publicToken: string;
    feed: string;
    feedName: string;
    country: string;
    domainName: string;
    plaidAccounts: string;
    statementPeriodEndDay?: CompanyCardStatementCloseDate;
};

export default ImportPlaidAccountsParams;
