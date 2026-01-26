import type {StatementPeriodEnd, StatementPeriodEndDay} from '@src/types/onyx/CardFeeds';

type RequestFeedSetupParams = {
    policyID: string;
    feedDetails: string;
    feedType: string;
    statementPeriodEnd?: StatementPeriodEnd;
    statementPeriodEndDay?: StatementPeriodEndDay;
};

export default RequestFeedSetupParams;
