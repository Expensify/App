import type {CompanyCardFeedWithNumber} from '@src/types/onyx/CardFeeds';

type OpenPolicyCompanyCardsFeedParams = {
    domainAccountID?: number;
    policyID: string;
    feed: CompanyCardFeedWithNumber;
};

export default OpenPolicyCompanyCardsFeedParams;
