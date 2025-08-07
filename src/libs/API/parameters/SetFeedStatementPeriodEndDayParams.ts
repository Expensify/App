import type {StatementPeriodEnd, StatementPeriodEndDay} from '@src/types/onyx/CardFeeds';

type SetFeedStatementPeriodEndDayParams = {
    authToken: string | null | undefined;
    policyID: string;
    bankName: string;
    domainAccountID: number;
    statementPeriodEnd: StatementPeriodEnd | undefined;
    statementPeriodEndDay: StatementPeriodEndDay | undefined;
};

export default SetFeedStatementPeriodEndDayParams;
