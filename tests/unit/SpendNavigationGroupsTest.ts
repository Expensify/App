import {savedSearchIDToSearchKey} from '@libs/SearchKeyUtils';
import {getSpendGroupTabs, isSearchBehindMore} from '@libs/SpendNavigationGroups';

import CONST from '@src/CONST';

const SAVED_SEARCH_KEY = savedSearchIDToSearchKey('1');

const TABS = [
    {key: CONST.SEARCH.SEARCH_KEYS.EXPENSES},
    {key: CONST.SEARCH.SEARCH_KEYS.REPORTS},
    {key: CONST.SEARCH.SEARCH_KEYS.APPROVE},
    {key: CONST.SEARCH.SEARCH_KEYS.EXPORT},
    {key: SAVED_SEARCH_KEY},
];

describe('SpendNavigationGroups', () => {
    it('puts Accounting, Insights and saved searches behind More, and keeps Expenses and Reports on their own tabs', () => {
        // Given searches from every Spend group

        // When it is decided which of them live behind the narrow More tab
        // Then only the groups without a tab of their own do, so the More tab stays lit while one of them is open
        expect(isSearchBehindMore(CONST.SEARCH.SEARCH_KEYS.EXPORT)).toBe(true);
        expect(isSearchBehindMore(CONST.SEARCH.SEARCH_KEYS.TOP_SPENDERS)).toBe(true);
        expect(isSearchBehindMore(SAVED_SEARCH_KEY)).toBe(true);
        expect(isSearchBehindMore(CONST.SEARCH.SEARCH_KEYS.EXPENSES)).toBe(false);
        expect(isSearchBehindMore(CONST.SEARCH.SEARCH_KEYS.APPROVE)).toBe(false);
    });

    it('shows only the tabs of the active search group', () => {
        // Given a tab row holding searches from several groups

        // When the active search belongs to Reports, or is a saved search
        const reportsTabs = getSpendGroupTabs(TABS, CONST.SEARCH.SEARCH_KEYS.APPROVE);
        const savedTabs = getSpendGroupTabs(TABS, SAVED_SEARCH_KEY);

        // Then the row keeps only that group, matching the rows the wide bar nests under the same parent
        expect(reportsTabs.map((tab) => tab.key)).toEqual([CONST.SEARCH.SEARCH_KEYS.REPORTS, CONST.SEARCH.SEARCH_KEYS.APPROVE]);
        expect(savedTabs.map((tab) => tab.key)).toEqual([SAVED_SEARCH_KEY]);
    });
});
