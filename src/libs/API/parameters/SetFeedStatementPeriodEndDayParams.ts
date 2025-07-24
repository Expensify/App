import type {CompanyCardStatementCloseDate} from '@src/types/onyx/CardFeeds';

type SetFeedStatementPeriodEndDayParams = {
    authToken: string | null | undefined;
    policyID: string;
    bankName: string;
    domainAccountID: number;
    statementPeriodEndDay: CompanyCardStatementCloseDate;
};

export default SetFeedStatementPeriodEndDayParams;
