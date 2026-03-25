import {useEffect} from 'react';
import type {MultiSelectItem} from '@components/Search/FilterDropdowns/MultiSelectPopup';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import {openSearchCardFiltersPage} from '@libs/actions/Search';
import ONYXKEYS from '@src/ONYXKEYS';
import MultiSelectFilterPopup from './MultiSelectFilterPopup';

type FeedFilterPopupProps = {
    items: Array<MultiSelectItem<string>>;
    value: Array<MultiSelectItem<string>>;
    closeOverlay: () => void;
    onChangeCallback: (items: Array<MultiSelectItem<string>>) => void;
};

function FeedFilterPopup({closeOverlay, items, value, onChangeCallback}: FeedFilterPopupProps) {
    const {isOffline} = useNetwork();
    const [areCardsLoaded] = useOnyx(ONYXKEYS.IS_SEARCH_FILTERS_CARD_DATA_LOADED);

    useEffect(() => {
        if (isOffline) {
            return;
        }
        openSearchCardFiltersPage();
    }, [isOffline]);

    const shouldShowLoadingState = !areCardsLoaded && !isOffline;

    return (
        <MultiSelectFilterPopup
            items={items}
            value={value}
            loading={shouldShowLoadingState}
            translationKey="search.filters.feed"
            closeOverlay={closeOverlay}
            onChangeCallback={onChangeCallback}
        />
    );
}

export default FeedFilterPopup;
