import {useMemo} from 'react';
import type {SearchKey} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import useOnyx from './useOnyx';

function useSearchShouldCalculateTotals(searchKey: SearchKey | undefined, searchHash: number | undefined, enabled: boolean) {
    const [savedSearches] = useOnyx(ONYXKEYS.SAVED_SEARCHES, {canBeMissing: true});

    const shouldCalculateTotals = useMemo(() => {
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
        ];

        const isSuggestedSearchWithTotals = eligibleSearchKeys.includes(searchKey);
        const isSavedSearch = searchHash !== undefined && savedSearches && !!savedSearches[searchHash];

        return isSuggestedSearchWithTotals || isSavedSearch;
    }, [enabled, savedSearches, searchKey, searchHash]);

    return shouldCalculateTotals ?? false;
}

export default useSearchShouldCalculateTotals;
