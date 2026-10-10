import {openSearchCardFiltersPage} from '@libs/actions/Search';

import ONYXKEYS from '@src/ONYXKEYS';

import {useEffect, useRef} from 'react';

import useNetwork from './useNetwork';
import useOnyx from './useOnyx';

/**
 * Loads every card the user owns or administers, since Search opens with only a subset. `areCardsLoaded` turns true
 * only once a response arrives, so a failed request leaves it false and the next mount asks again.
 */
function useLoadSearchCardData() {
    const {isOffline} = useNetwork();
    const [areCardsLoaded = false] = useOnyx(ONYXKEYS.IS_SEARCH_FILTERS_CARD_DATA_LOADED);
    const [isLoadingCards] = useOnyx(ONYXKEYS.RAM_ONLY_IS_LOADING_SEARCH_FILTERS_CARD_DATA);
    const hasRequestedCardDataRef = useRef(false);

    useEffect(() => {
        if (isLoadingCards) {
            hasRequestedCardDataRef.current = true;
            return;
        }

        // The ref stops a failure from looping, since the loading flag clears on failure too. A later mount retries.
        if (isOffline || areCardsLoaded || hasRequestedCardDataRef.current) {
            return;
        }

        hasRequestedCardDataRef.current = true;
        openSearchCardFiltersPage();
    }, [areCardsLoaded, isLoadingCards, isOffline]);

    const isLoadingInitialCards = !areCardsLoaded && !isOffline && isLoadingCards !== false;

    return {areCardsLoaded, isLoadingInitialCards};
}

export default useLoadSearchCardData;
