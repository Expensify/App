import type {ResultMetadata} from 'react-native-onyx';
import {filterInactiveCards, getCompanyFeeds} from '@libs/CardUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {CardList, CompanyCardFeed} from '@src/types/onyx';
import useCardFeeds from './useCardFeeds';
import useOnyx from './useOnyx';
import useWorkspaceAccountID from './useWorkspaceAccountID';

const useCardsList = (policyID: string | undefined, selectedFeed: CompanyCardFeed | undefined): [CardList | undefined, ResultMetadata<CardList>] => {
    const workspaceAccountID = useWorkspaceAccountID(policyID);
    const [cardFeeds] = useCardFeeds(policyID);
    const companyCards = getCompanyFeeds(cardFeeds);
    const selectedFeedData = selectedFeed && companyCards[selectedFeed];
    const [cardsList, cardsListMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${selectedFeedData?.domainID ?? workspaceAccountID}_${selectedFeed}`, {
        selector: filterInactiveCards,
        canBeMissing: true,
    });

    return [cardsList, cardsListMetadata];
};

export default useCardsList;
