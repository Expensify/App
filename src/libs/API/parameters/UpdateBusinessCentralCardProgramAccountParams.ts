import type {CardFeedWithNumber} from '@src/types/onyx/CardFeeds';
import type {BusinessCentralBankAccount} from '@src/types/onyx/Policy';

type UpdateBusinessCentralCardProgramAccountParams = {
    policyID: string;
    feedKey: CardFeedWithNumber;

    /** An empty ID clears the feed's override, so the feed exports to the workspace's company card account */
    cardProgramAccountID: BusinessCentralBankAccount['id'];
};

export default UpdateBusinessCentralCardProgramAccountParams;
