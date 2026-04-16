import React, {useEffect} from 'react';
import type {MultiSelectItem} from '@components/Search/FilterDropdowns/MultiSelectPopup';
import useFeedKeysWithAssignedCards from '@hooks/useFeedKeysWithAssignedCards';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import {openSearchCardFiltersPage} from '@libs/actions/Search';
import {getFeedOptions} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {SearchAdvancedFiltersForm} from '@src/types/form';
import MultiSelectFilterPopup from '../SearchPageHeader/MultiSelectFilterPopup';

type FeedFilterPopupProps = {
    isExpanded: boolean;
    closeOverlay: () => void;
    updateFilterForm: (values: Partial<SearchAdvancedFiltersForm>) => void;
};

function FeedSelectPopup({closeOverlay, isExpanded, updateFilterForm}: FeedFilterPopupProps) {
    const {isOffline} = useNetwork();
    const {translate, localeCompare} = useLocalize();
    const feedKeysWithCards = useFeedKeysWithAssignedCards();

    const [areCardsLoaded] = useOnyx(ONYXKEYS.IS_SEARCH_FILTERS_CARD_DATA_LOADED);
    const [allFeeds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER);
    const [searchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM);
    const [personalAndWorkspaceCards] = useOnyx(ONYXKEYS.DERIVED.PERSONAL_AND_WORKSPACE_CARD_LIST);

    const feedFilterValues = searchAdvancedFiltersForm?.[CONST.SEARCH.SYNTAX_FILTER_KEYS.FEED] ?? [];
    const feedOptions = getFeedOptions(allFeeds, personalAndWorkspaceCards, translate, localeCompare, feedKeysWithCards);
    const feed = feedFilterValues ? feedOptions.filter((option) => feedFilterValues.includes(option.value)) : [];

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
        />
    );
}

export default FeedSelectPopup;
