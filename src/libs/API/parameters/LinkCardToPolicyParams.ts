import type {CardFeedWithNumber} from '@src/types/onyx/CardFeeds';

type LinkCardToPolicyParams = {
    domainAccountID: number;
    policyID: string;
    feedName?: CardFeedWithNumber;
    feedType: string;
    feedCountry?: string;
};

export default LinkCardToPolicyParams;
