import type {SearchKey} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import {useMemo, useState} from 'react';

import useOnyx from './useOnyx';

/**
 * @param shouldKeepTotalsUntilQueryChanges Opt-in for callers that drive the search *request* rather than
 * just rendering totals. See the latch below for why the request side needs it and the display side doesn't.
 */
function useSearchShouldCalculateTotals(
    searchKey: SearchKey | undefined,
    searchHash: number | undefined,
    enabled: boolean,
    areAllMatchingItemsSelected = false,
    shouldKeepTotalsUntilQueryChanges = false,
) {
    const [savedSearches] = useOnyx(ONYXKEYS.SAVED_SEARCHES);

    const [latchedHash, setLatchedHash] = useState<number | undefined>(undefined);
    let nextLatchedHash: number | undefined;
    if (areAllMatchingItemsSelected) {
        nextLatchedHash = searchHash;
    } else if (latchedHash === searchHash) {
        nextLatchedHash = latchedHash;
    }
    // Leaving `nextLatchedHash` undefined above drops the latch once we move to a different query, so an
    // unrelated ad-hoc search doesn't inherit it.
    if (shouldKeepTotalsUntilQueryChanges && nextLatchedHash !== latchedHash) {
        setLatchedHash(nextLatchedHash);
    }
    const wasAllMatchingItemsSelectedForQuery = shouldKeepTotalsUntilQueryChanges && nextLatchedHash !== undefined && nextLatchedHash === searchHash;

    const shouldCalculateTotals = useMemo(() => {
        // When the user selects all matching items we always want the server-computed count/total,
        // even for an ad-hoc query that isn't a suggested or saved search. This must bypass the
        // `enabled` (offset === 0) gate so totals are still requested when more results were loaded
        // before select-all was triggered.
        if (areAllMatchingItemsSelected || wasAllMatchingItemsSelectedForQuery) {
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
    }, [enabled, savedSearches, searchKey, searchHash, areAllMatchingItemsSelected, wasAllMatchingItemsSelectedForQuery]);

    return shouldCalculateTotals ?? false;
}

export default useSearchShouldCalculateTotals;
