import useFeedKeysWithAssignedCards from '@hooks/useFeedKeysWithAssignedCards';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {getCardFeedsForDisplay} from '@libs/CardFeedUtils';
import type {SearchFilter} from '@libs/SearchUIUtils';
import ONYXKEYS from '@src/ONYXKEYS';

function useFilterFeedValue(feedIDs: SearchFilter['value']): string {
    const {translate} = useLocalize();
    const feedKeysWithCards = useFeedKeysWithAssignedCards();
    const [personalAndWorkspaceCards] = useOnyx(ONYXKEYS.DERIVED.PERSONAL_AND_WORKSPACE_CARD_LIST);
    const [allFeeds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER);

    if (!Array.isArray(feedIDs)) {
        return '';
    }

    const feedsForDisplay = getCardFeedsForDisplay(allFeeds, personalAndWorkspaceCards, translate, feedKeysWithCards);
    return feedIDs.reduce((acc, feedID) => {
        const feedName = feedsForDisplay[feedID]?.name;
        if (!feedName) {
            return acc;
        }
        if (!acc) {
            return feedName;
        }
        return `${acc}, ${feedName}`;
    }, '');
}

export default useFilterFeedValue;
