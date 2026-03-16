import type {StatementPeriodEnd, StatementPeriodEndDay} from '@src/types/onyx/CardFeeds';

type SetFeedStatementPeriodEndDayParams = {
    policyID: string;
    bankName: string;
    domainAccountID: number;
    statementPeriodEnd: StatementPeriodEnd | undefined;
    statementPeriodEndDay: StatementPeriodEndDay | undefined;
};

export default SetFeedStatementPeriodEndDayParams;
