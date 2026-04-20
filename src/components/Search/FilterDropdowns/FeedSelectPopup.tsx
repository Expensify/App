import React, {useEffect} from 'react';
import useFilterFeedData from '@components/Search/hooks/useFilterFeedData';
import MultiSelectFilterPopup from '@components/Search/SearchPageHeader/MultiSelectFilterPopup';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import {openSearchCardFiltersPage} from '@libs/actions/Search';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchAdvancedFiltersForm} from '@src/types/form';

type FeedSelectPopupProps = {
    isExpanded: boolean;
    closeOverlay: () => void;
    updateFilterForm: (values: Partial<SearchAdvancedFiltersForm>) => void;
};

function FeedSelectPopup({isExpanded, updateFilterForm, closeOverlay}: FeedSelectPopupProps) {
    const {isOffline} = useNetwork();
    const [areCardsLoaded] = useOnyx(ONYXKEYS.IS_SEARCH_FILTERS_CARD_DATA_LOADED);
    const {feedOptions, feedValue} = useFilterFeedData();

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
            value={feedValue}
            loading={shouldShowLoadingState}
            translationKey="search.filters.feed"
            closeOverlay={closeOverlay}
            onChangeCallback={(items) => updateFilterForm({feed: items.map((item) => item.value)})}
        />
    );
}

export default FeedSelectPopup;
