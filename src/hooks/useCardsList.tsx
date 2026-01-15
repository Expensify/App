import type {ResultMetadata} from 'react-native-onyx';
import {filterInactiveCards, splitCompanyCardFeedWithDomainID} from '@libs/CardUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {CompanyCardFeedWithDomainID, WorkspaceCardsList} from '@src/types/onyx';
import useOnyx from './useOnyx';

/* Custom hook that retrieves a list of company cards for the given selected feed. */
const useCardsList = (selectedFeed: CompanyCardFeedWithDomainID | undefined): [WorkspaceCardsList | undefined, ResultMetadata<WorkspaceCardsList>] => {
    const {feedName, domainID} = splitCompanyCardFeedWithDomainID(selectedFeed);
    const [cardsList, cardsListMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${domainID}_${feedName}`, {
        selector: filterInactiveCards,
        canBeMissing: true,
    });

    return [cardsList, cardsListMetadata];
};

export default useCardsList;
