import {buildFeedKeysWithAssignedCards} from '@selectors/Card';
import ONYXKEYS from '@src/ONYXKEYS';
import useOnyx from './useOnyx';

type FeedKeysWithAssignedCards = Record<string, true>;

function useFeedKeysWithAssignedCards(): FeedKeysWithAssignedCards | undefined {
    const [feedKeysWithCards] = useOnyx(ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST, {selector: buildFeedKeysWithAssignedCards});

    return feedKeysWithCards;
}

export default useFeedKeysWithAssignedCards;
export type {FeedKeysWithAssignedCards};
