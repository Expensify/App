import type {CompanyCardFeedWithNumber} from '@src/types/onyx/CardFeeds';

type SearchCompanyCardByNumberParams = {
    policyID: string;
    cardNumber: string;
    feed: CompanyCardFeedWithNumber;
    domainAccountID: number;
};

export default SearchCompanyCardByNumberParams;
