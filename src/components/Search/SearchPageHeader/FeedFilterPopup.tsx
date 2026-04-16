import React, {useEffect} from 'react';
import type {MultiSelectItem} from '@components/Search/FilterDropdowns/MultiSelectPopup';
import useFeedKeysWithAssignedCards from '@hooks/useFeedKeysWithAssignedCards';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import {openSearchCardFiltersPage} from '@libs/actions/Search';
import {getFeedOptions} from '@libs/SearchUIUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import MultiSelectFilterPopup from './MultiSelectFilterPopup';

type FeedFilterPopupProps = {
    isExpanded: boolean;
    items: Array<MultiSelectItem<string>>;
    value: Array<MultiSelectItem<string>>;
    closeOverlay: () => void;
    onChangeCallback: (items: Array<MultiSelectItem<string>>) => void;
};

function FeedFilterPopup({closeOverlay, items, value, isExpanded, onChangeCallback}: FeedFilterPopupProps) {
    const {isOffline} = useNetwork();
    const {translate, localeCompare} = useLocalize();
    const feedKeysWithCards = useFeedKeysWithAssignedCards();

    const [areCardsLoaded] = useOnyx(ONYXKEYS.IS_SEARCH_FILTERS_CARD_DATA_LOADED);
    const [allFeeds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER);
    const [personalAndWorkspaceCards] = useOnyx(ONYXKEYS.DERIVED.PERSONAL_AND_WORKSPACE_CARD_LIST);

    const feedOptions = getFeedOptions(allFeeds, personalAndWorkspaceCards, translate, localeCompare, feedKeysWithCards);

    useEffect(() => {
        if (isOffline || !isExpanded) {
            return;
        }
        openSearchCardFiltersPage();
    }, [isOffline, isExpanded]);

    const shouldShowLoadingState = !areCardsLoaded && !isOffline;

    return (
        <MultiSelectFilterPopup
            items={feedOptions}
            value={feed}
            loading={shouldShowLoadingState}
            translationKey="search.filters.feed"
            closeOverlay={closeOverlay}
            onChangeCallback={onChangeCallback}
        />
    );
}

export default FeedFilterPopup;
