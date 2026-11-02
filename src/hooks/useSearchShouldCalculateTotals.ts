import {searchKeyToSavedSearchID} from '@libs/SearchKeyUtils';
import type {SearchKey} from '@libs/SearchKeyUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import useOnyx from './useOnyx';

function getSearchRequestOffsetForMissingAllMatchingCount(offset: number, serverOffset: number | undefined, isAllMatchingItemsCountMissing: boolean): number {
    if (!isAllMatchingItemsCountMissing) {
        return offset;
    }
    return Math.min(offset, serverOffset ?? offset);
}

function useSearchShouldCalculateTotals(searchKey: SearchKey | undefined, enabled: boolean, areAllMatchingItemsSelected = false) {
    const [savedSearches] = useOnyx(ONYXKEYS.SAVED_SEARCHES);

    let shouldCalculateTotals;
    // All-matching selections need the server-computed count/total, including for ad-hoc queries.
    // The caller enables this only while the initial offset is active or the count is still missing,
    // so later pagination requests can avoid recalculating totals.
    if (areAllMatchingItemsSelected) {
        shouldCalculateTotals = enabled;
    } else if (!enabled) {
        shouldCalculateTotals = false;
    } else if (!Object.keys(savedSearches ?? {}).length && !searchKey) {
        shouldCalculateTotals = false;
    } else {
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
            CONST.SEARCH.SEARCH_KEYS.VIOLATIONS_BY_SUBMITTER,
        ];
        const isSuggestedSearchWithTotals = eligibleSearchKeys.includes(searchKey);
        const savedSearchID = searchKeyToSavedSearchID(searchKey);
        const isSavedSearch = savedSearchID !== undefined && savedSearches && !!savedSearches[savedSearchID];
        shouldCalculateTotals = isSuggestedSearchWithTotals || isSavedSearch;
    }

    return shouldCalculateTotals ?? false;
}

export default useSearchShouldCalculateTotals;
export {getSearchRequestOffsetForMissingAllMatchingCount};
