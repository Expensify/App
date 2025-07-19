import type {CompanyCardStatementCloseDate} from '@src/types/onyx/CardFeeds';

type SetFeedStatementEndDay = {
    authToken: string | null | undefined;
    policyID: string;
    bankName: string;
    domainAccountID: number;
    statementEndDay: CompanyCardStatementCloseDate;
};

export default SetFeedStatementEndDay;
