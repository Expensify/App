import type {ResultMetadata} from 'react-native-onyx';
import {filterInactiveCards, getCompanyFeeds, getDomainOrWorkspaceAccountID} from '@libs/CardUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {CardList, CombinedFeedKey} from '@src/types/onyx';
import useCardFeeds from './useCardFeeds';
import useOnyx from './useOnyx';
import useWorkspaceAccountID from './useWorkspaceAccountID';

/* Custom hook that retrieves a list of company cards for the given policy and selected feed. */
const useCardsList = (policyID: string | undefined, selectedFeed: CombinedFeedKey | undefined): [CardList | undefined, ResultMetadata<CardList>] => {
    const workspaceAccountID = useWorkspaceAccountID(policyID);
    const [cardFeeds] = useCardFeeds(policyID);
    const companyCards = getCompanyFeeds(cardFeeds);
    const domainOrWorkspaceAccountID = getDomainOrWorkspaceAccountID(workspaceAccountID, selectedFeed ? companyCards[selectedFeed] : undefined);
    // TODO: can be improved
    const [feed] = selectedFeed?.split('#') ?? [];
    const [cardsList, cardsListMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${domainOrWorkspaceAccountID}_${feed}`, {
        selector: filterInactiveCards,
        canBeMissing: true,
    });

    return [cardsList, cardsListMetadata];
};

export default useCardsList;
