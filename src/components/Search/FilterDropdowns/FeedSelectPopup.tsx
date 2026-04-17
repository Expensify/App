import React, {useEffect} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import MultiSelectFilterPopup from '@components/Search/SearchPageHeader/MultiSelectFilterPopup';
import useFeedKeysWithAssignedCards from '@hooks/useFeedKeysWithAssignedCards';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import {openSearchCardFiltersPage} from '@libs/actions/Search';
import {getFeedOptions} from '@libs/SearchUIUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchAdvancedFiltersForm} from '@src/types/form';

type FeedSelectPopupProps = {
    isExpanded: boolean;
    closeOverlay: () => void;
    updateFilterForm: (values: Partial<SearchAdvancedFiltersForm>) => void;
};

function filterFeedSelector(searchAdvancedFiltersForm: OnyxEntry<SearchAdvancedFiltersForm>) {
    return searchAdvancedFiltersForm?.feed;
}

function FeedSelectPopup({isExpanded, updateFilterForm, closeOverlay}: FeedSelectPopupProps) {
    const {isOffline} = useNetwork();
    const {translate, localeCompare} = useLocalize();
    const [areCardsLoaded] = useOnyx(ONYXKEYS.IS_SEARCH_FILTERS_CARD_DATA_LOADED);
    const [allFeeds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER);
    const [personalAndWorkspaceCards] = useOnyx(ONYXKEYS.DERIVED.PERSONAL_AND_WORKSPACE_CARD_LIST);
    const [feed] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM, {selector: filterFeedSelector});

    const feedKeysWithCards = useFeedKeysWithAssignedCards();

    const feedOptions = getFeedOptions(allFeeds, personalAndWorkspaceCards, translate, localeCompare, feedKeysWithCards);
    const feedValue = feed ? feedOptions.filter((option) => feed.includes(option.value)) : [];

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
