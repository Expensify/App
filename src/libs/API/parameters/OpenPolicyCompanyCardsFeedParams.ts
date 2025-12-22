import type {CompanyCardFeed} from '@src/types/onyx';

type OpenPolicyCompanyCardsFeedParams = {
    domainAccountID?: number;
    policyID: string;
    feed: CompanyCardFeed;
};

export default OpenPolicyCompanyCardsFeedParams;
