import useSearchTypeMenuSections from '@hooks/useSearchTypeMenuSections';

import type {SearchKey} from '@libs/SearchKeyUtils';
import type {SearchTypeMenuItem} from '@libs/SearchUIUtils';
import {ACCOUNTING_KEYS, REPORTS_KEYS} from '@libs/SpendNavigationGroups';

import CONST from '@src/CONST';

import {useMemo} from 'react';

type FlatNavSpendItems = {
    /** The top-level "Expenses" row, absent when the user has no expense search to show */
    expenses: SearchTypeMenuItem | undefined;

    /** Children of the "Reports" row */
    reports: SearchTypeMenuItem[];

    /** Children of the "Accounting" row */
    accounting: SearchTypeMenuItem[];
};

/**
 * Splits the Spend suggested searches into the groups the flat nav renders. The searches themselves and the
 * rules deciding which ones a user can see come from `useSearchTypeMenuSections`, so the nav and the Spend
 * page always agree on what exists.
 */
function useFlatNavSpendItems(): FlatNavSpendItems {
    const typeMenuSections = useSearchTypeMenuSections();

    return useMemo(() => {
        const itemsByKey = new Map<SearchKey, SearchTypeMenuItem>();
        for (const section of typeMenuSections) {
            for (const item of section.menuItems) {
                itemsByKey.set(item.key, item);
            }
        }

        const collect = (keys: SearchKey[]) => keys.map((key) => itemsByKey.get(key)).filter((item): item is SearchTypeMenuItem => !!item);

        return {
            expenses: itemsByKey.get(CONST.SEARCH.SEARCH_KEYS.EXPENSES),
            reports: collect(REPORTS_KEYS),
            accounting: collect(ACCOUNTING_KEYS),
        };
    }, [typeMenuSections]);
}

export default useFlatNavSpendItems;
