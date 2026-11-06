import type {CardFeedWithNumber} from '@src/types/onyx/CardFeeds';
import type {DigitsAccount} from '@src/types/onyx/Policy';

type UpdateDigitsCardProgramAccountParams = {
    policyID: string;
    feedKey: CardFeedWithNumber;
    cardProgramAccountID: DigitsAccount['id'];
};

export default UpdateDigitsCardProgramAccountParams;
