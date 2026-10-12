import type {CardFeedWithNumber} from '@src/types/onyx/CardFeeds';
import type {CampfireAccount} from '@src/types/onyx/Policy';

type UpdateCampfireCardProgramAccountParams = {
    policyID: string;
    feedKey: CardFeedWithNumber;
    cardProgramAccountID: CampfireAccount['id'];
};

export default UpdateCampfireCardProgramAccountParams;
