import type {SelectableFeedReimbursable} from '@src/types/onyx/CardFeeds';

type SetFeedReimbursableParams = {
    policyID: string;
    bankName: string;
    domainAccountID: number;
    forceReimbursable: SelectableFeedReimbursable;
};

export default SetFeedReimbursableParams;
