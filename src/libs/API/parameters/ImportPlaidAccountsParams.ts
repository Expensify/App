import type {StatementPeriodEnd, StatementPeriodEndDay} from '@src/types/onyx/CardFeeds';

type ImportPlaidAccountsParams = {
    publicToken: string;
    feed: string;
    feedName: string;
    country: string;
    domainName: string;
    plaidAccounts: string;
    statementPeriodEnd?: StatementPeriodEnd;
    statementPeriodEndDay?: StatementPeriodEndDay;
    plaidAccessToken?: string;
};

export default ImportPlaidAccountsParams;
