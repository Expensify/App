import {useSearchQueryContext} from '@components/Search/SearchContext';

import {searchKeyToSavedSearchID} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import useNetwork from './useNetwork';
import useOnyx from './useOnyx';

function useActiveSavedSearch() {
    const {isOffline} = useNetwork();
    const {currentSearchKey} = useSearchQueryContext();
    const [activeSavedSearch] = useOnyx(ONYXKEYS.SAVED_SEARCHES, {
        selector: (savedSearches) => {
            const activeSavedSearchID = searchKeyToSavedSearchID(currentSearchKey);
            const item = activeSavedSearchID ? savedSearches?.[activeSavedSearchID] : undefined;
            if (!item || (item.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE && !isOffline)) {
                return undefined;
            }
            return item;
        },
    });
    return activeSavedSearch;
}

export default useActiveSavedSearch;
