import useSearchTypeMenuSections from '@hooks/useSearchTypeMenuSections';

import type {SearchKey} from '@libs/SearchKeyUtils';
import type {SearchTypeMenuItem} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';

import {useMemo} from 'react';

/** Keys shown under the "Reports" parent row, in the order the nav renders them. */
const REPORTS_KEYS: SearchKey[] = [CONST.SEARCH.SEARCH_KEYS.REPORTS, CONST.SEARCH.SEARCH_KEYS.SUBMIT, CONST.SEARCH.SEARCH_KEYS.APPROVE, CONST.SEARCH.SEARCH_KEYS.PAY];

/** Keys shown under the "Accounting" parent row, in the order the nav renders them. */
const ACCOUNTING_KEYS: SearchKey[] = [
    CONST.SEARCH.SEARCH_KEYS.EXPORT,
    CONST.SEARCH.SEARCH_KEYS.UNAPPROVED_CASH,
    CONST.SEARCH.SEARCH_KEYS.UNAPPROVED_CARD,
    CONST.SEARCH.SEARCH_KEYS.STATEMENTS,
    CONST.SEARCH.SEARCH_KEYS.RECONCILIATION,
];

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
export {REPORTS_KEYS, ACCOUNTING_KEYS};
