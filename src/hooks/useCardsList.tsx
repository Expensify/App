import type {ResultMetadata} from 'react-native-onyx';
import {filterInactiveCards} from '@libs/CardUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {CardList, CompanyCardFeedWithDomainID} from '@src/types/onyx';
import useOnyx from './useOnyx';

/* Custom hook that retrieves a list of company cards for the given selected feed. */
const useCardsList = (selectedFeed: CompanyCardFeedWithDomainID | undefined): [CardList | undefined, ResultMetadata<CardList>] => {
    const [feed, domainOrWorkspaceAccountID] = selectedFeed?.split(CONST.COMPANY_CARD.FEED_KEY_SEPARATOR) ?? [];
    const [cardsList, cardsListMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${domainOrWorkspaceAccountID}_${feed}`, {
        selector: filterInactiveCards,
        canBeMissing: true,
    });

    return [cardsList, cardsListMetadata];
};

export default useCardsList;
