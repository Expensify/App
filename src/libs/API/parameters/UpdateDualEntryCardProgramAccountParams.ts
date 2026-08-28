import type {CardFeedWithNumber} from '@src/types/onyx/CardFeeds';
import type {DualEntryAccount} from '@src/types/onyx/Policy';

type UpdateDualEntryCardProgramAccountParams = {
    policyID: string;
    feedKey: CardFeedWithNumber;
    accountID: DualEntryAccount['id'];
};

export default UpdateDualEntryCardProgramAccountParams;
