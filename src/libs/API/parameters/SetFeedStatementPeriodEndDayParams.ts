import type {StatementPeriodEnd, StatementPeriodEndDay} from '@src/types/onyx/DomainSettings';

type SetFeedStatementPeriodEndDayParams = {
    authToken: string | null | undefined;
    policyID: string;
    bankName: string;
    domainAccountID: number;
    statementPeriodEnd: StatementPeriodEnd | undefined;
    statementPeriodEndDay: StatementPeriodEndDay | undefined;
};

export default SetFeedStatementPeriodEndDayParams;
