import type {CompanyCardStatementCloseDate} from '@src/types/onyx/CardFeeds';

type RequestFeedSetupParams = {
    authToken: string;
    policyID: string;
    feedDetails: string;
    feedType: string;
    statementPeriodEndDay: CompanyCardStatementCloseDate;
};

export default RequestFeedSetupParams;
