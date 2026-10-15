import type {FeedReimbursable} from '@src/types/onyx/CardFeeds';

type SetFeedReimbursableParams = {
    policyID: string;
    bankName: string;
    domainAccountID: number;
    forceReimbursable: Exclude<FeedReimbursable, 'none'>;
};

export default SetFeedReimbursableParams;
