import React from 'react';
import MultiSelectFilterPopup from '@components/Search/SearchPageHeader/MultiSelectFilterPopup';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {getFeedOptions} from '@libs/SearchUIUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchAdvancedFiltersForm} from '@src/types/form';
import type {MultiSelectItem} from './MultiSelectPopup';

type FeedSelectPopupProps = {
    closeOverlay: () => void;
    updateFilterForm: (values: Partial<SearchAdvancedFiltersForm>) => void;
};

function FeedSelectPopup({closeOverlay, updateFilterForm}: FeedSelectPopupProps) {
    const {translate, localeCompare} = useLocalize();
    const [searchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM);
    const [allFeeds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER);
    const [allCards] = useOnyx(ONYXKEYS.CARD_LIST);

    const feedItems = getFeedOptions(allFeeds, allCards, translate, localeCompare);
    const feedFilter = searchAdvancedFiltersForm?.feed ?? [];
    const selectedFeedItems = feedItems.filter((item) => feedFilter.includes(item.value));

    const updateFeedFilterForm = (items: Array<MultiSelectItem<string>>) => {
        updateFilterForm({feed: items.map((item) => item.value)});
    };

    return (
        <MultiSelectFilterPopup
            closeOverlay={closeOverlay}
            translationKey="search.filters.feed"
            items={feedItems}
            value={selectedFeedItems}
            isSearchable={feedItems.length >= 8}
            onChangeCallback={updateFeedFilterForm}
        />
    );
}

export default FeedSelectPopup;
