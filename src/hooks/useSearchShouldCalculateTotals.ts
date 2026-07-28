import type {SearchKey} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import {useMemo} from 'react';

import useOnyx from './useOnyx';

function useSearchShouldCalculateTotals(searchKey: SearchKey | undefined, searchHash: number | undefined, enabled: boolean, areAllMatchingItemsSelected = false) {
    const [savedSearches] = useOnyx(ONYXKEYS.SAVED_SEARCHES);

    const shouldCalculateTotals = useMemo(() => {
        // When the user selects all matching items we always want the server-computed count/total,
        // even for an ad-hoc query that isn't a suggested or saved search. This must bypass the
        // `enabled` (offset === 0) gate so totals are still requested when more results were loaded
        // before select-all was triggered.
        if (areAllMatchingItemsSelected) {
            return true;
        }

        if (!enabled) {
            return false;
        }

        if (!Object.keys(savedSearches ?? {}).length && !searchKey) {
            return false;
        }

        const eligibleSearchKeys: Partial<SearchKey[]> = [
            CONST.SEARCH.SEARCH_KEYS.SUBMIT,
            CONST.SEARCH.SEARCH_KEYS.APPROVE,
            CONST.SEARCH.SEARCH_KEYS.PAY,
            CONST.SEARCH.SEARCH_KEYS.EXPORT,
            CONST.SEARCH.SEARCH_KEYS.STATEMENTS,
            CONST.SEARCH.SEARCH_KEYS.UNAPPROVED_CASH,
            CONST.SEARCH.SEARCH_KEYS.UNAPPROVED_CARD,
            CONST.SEARCH.SEARCH_KEYS.RECONCILIATION,
            CONST.SEARCH.SEARCH_KEYS.TOP_CATEGORIES,
            CONST.SEARCH.SEARCH_KEYS.TOP_MERCHANTS,
            CONST.SEARCH.SEARCH_KEYS.TOP_SPENDERS,
            CONST.SEARCH.SEARCH_KEYS.SPEND_OVER_TIME,
        ];

        const isSuggestedSearchWithTotals = eligibleSearchKeys.includes(searchKey);
        const isSavedSearch = searchHash !== undefined && savedSearches && !!savedSearches[searchHash];

        return isSuggestedSearchWithTotals || isSavedSearch;
    }, [enabled, savedSearches, searchKey, searchHash, areAllMatchingItemsSelected]);

    return shouldCalculateTotals ?? false;
}

export default useSearchShouldCalculateTotals;
