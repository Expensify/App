import type {CardFeedWithNumber} from '@src/types/onyx/CardFeeds';
import type {ZohoBooksAccount} from '@src/types/onyx/Policy';

type UpdateZohoBooksCardProgramAccountParams = {
    policyID: string;
    feedKey: CardFeedWithNumber;
    cardProgramAccountID: ZohoBooksAccount['id'];
};

export default UpdateZohoBooksCardProgramAccountParams;
