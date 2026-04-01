import {buildFeedKeysWithAssignedCards} from '@selectors/Card';
import {useCallback} from 'react';
import type {OnyxCollection} from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {WorkspaceCardsList} from '@src/types/onyx';
import useOnyx from './useOnyx';

type FeedKeysWithAssignedCards = Record<string, true>;

function useFeedKeysWithAssignedCards(): FeedKeysWithAssignedCards | undefined {
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const feedKeysWithCardsSelector = useCallback((allWorkspaceCards: OnyxCollection<WorkspaceCardsList>) => buildFeedKeysWithAssignedCards(allWorkspaceCards, betas), [betas]);
    const [feedKeysWithCards] = useOnyx(ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST, {
        selector: feedKeysWithCardsSelector,
    });

    return feedKeysWithCards;
}

export default useFeedKeysWithAssignedCards;
export type {FeedKeysWithAssignedCards};
