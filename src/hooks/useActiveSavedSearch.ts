import {useSearchQueryContext} from '@components/Search/SearchContext';

import {searchKeyToSavedSearchID} from '@libs/SearchUIUtils';

import ONYXKEYS from '@src/ONYXKEYS';

import useOnyx from './useOnyx';

function useActiveSavedSearch() {
    const {currentSearchKey} = useSearchQueryContext();
    const [activeSavedSearch] = useOnyx(ONYXKEYS.SAVED_SEARCHES, {
        selector: (savedSearches) => {
            const activeSavedSearchID = searchKeyToSavedSearchID(currentSearchKey);
            return activeSavedSearchID ? savedSearches?.[activeSavedSearchID] : undefined;
        },
    });
    return activeSavedSearch;
}

export default useActiveSavedSearch;
