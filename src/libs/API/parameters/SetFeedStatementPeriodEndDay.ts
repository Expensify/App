import type {CompanyCardStatementCloseDate} from '@src/types/onyx/CardFeeds';

type SetFeedStatementPeriodEndDay = {
    authToken: string | null | undefined;
    policyID: string;
    bankName: string;
    domainAccountID: number;
    statementPeriodEndDay: CompanyCardStatementCloseDate;
};

export default SetFeedStatementPeriodEndDay;
