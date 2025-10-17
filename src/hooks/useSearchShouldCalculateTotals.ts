import {useMemo} from 'react';
import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';
import type {SearchKey} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import useOnyx from './useOnyx';

function useSearchShouldCalculateTotals(searchKey: SearchKey | undefined, similarSearchHash: number | undefined, enabled: boolean) {
    const [savedSearches] = useOnyx(ONYXKEYS.SAVED_SEARCHES, {canBeMissing: true});

    const shouldCalculateTotals = useMemo(() => {
        if (!enabled) {
            return false;
        }

        const savedSearchValues = Object.values(savedSearches ?? {});

        if (!savedSearchValues.length && !searchKey) {
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

        if (eligibleSearchKeys.includes(searchKey)) {
            return true;
        }

        for (const savedSearch of savedSearchValues) {
            const searchData = buildSearchQueryJSON(savedSearch.query);
            if (searchData && searchData.similarSearchHash === similarSearchHash) {
                return true;
            }
        }

        return false;
    }, [enabled, savedSearches, searchKey, similarSearchHash]);

    return shouldCalculateTotals;
}

export default useSearchShouldCalculateTotals;
