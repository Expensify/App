import type {ResultMetadata} from 'react-native-onyx';
import {filterInactiveCards, splitCardFeedWithDomainID} from '@libs/CardUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {CardFeedWithDomainID, WorkspaceCardsList} from '@src/types/onyx';
import useOnyx from './useOnyx';

/* Custom hook that retrieves a list of company cards for the given selected feed. */
const useCardsList = (selectedFeed: CardFeedWithDomainID | undefined): [WorkspaceCardsList | undefined, ResultMetadata<WorkspaceCardsList>] => {
    const splitFeedName = splitCardFeedWithDomainID(selectedFeed);

    const [cardsList, cardsListMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${splitFeedName?.domainID}_${splitFeedName?.feedName}`, {
        selector: filterInactiveCards,
        canBeMissing: true,
    });

    return [cardsList, cardsListMetadata];
};

export default useCardsList;
