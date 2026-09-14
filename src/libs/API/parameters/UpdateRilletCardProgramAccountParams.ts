import type {CardFeedWithNumber} from '@src/types/onyx/CardFeeds';
import type {RilletAccount} from '@src/types/onyx/Policy';

type UpdateRilletCardProgramAccountParams = {
    policyID: string;
    feedKey: CardFeedWithNumber;
    accountCode: RilletAccount['code'];
};

export default UpdateRilletCardProgramAccountParams;
