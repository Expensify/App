import {useMemo} from 'react';
import type {SearchKey} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import useOnyx from './useOnyx';

function useSearchShouldCalculateTotals(searchKey: SearchKey | undefined, queryHash: number | undefined, enabled: boolean) {
    const [savedSearches] = useOnyx(ONYXKEYS.SAVED_SEARCHES, {canBeMissing: true});

    const shouldCalculateTotals = useMemo(() => {
        if (!enabled) {
            return false;
        }

        if (queryHash != undefined && String(queryHash) in (savedSearches ?? {})) {
            return true;
        }

        if (!searchKey) {
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

        return eligibleSearchKeys.includes(searchKey);
    }, [enabled, savedSearches, searchKey, queryHash]);

    return shouldCalculateTotals;
}

export default useSearchShouldCalculateTotals;
