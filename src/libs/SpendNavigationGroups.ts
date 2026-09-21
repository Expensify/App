import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';

import type {SearchKey} from './SearchKeyUtils';

import {searchKeyToSavedSearchID} from './SearchKeyUtils';

/**
 * How the Spend searches are grouped in navigation. The global navigation bar renders a group as a parent row with
 * its searches nested under it; the narrow layout renders one group at a time as a row of tabs.
 */

/** The single key the "Expenses" entry stands for. A list so every group has one shape. */
const EXPENSES_KEYS: SearchKey[] = [CONST.SEARCH.SEARCH_KEYS.EXPENSES];

/** Keys under "Reports", in the order navigation renders them. */
const REPORTS_KEYS: SearchKey[] = [CONST.SEARCH.SEARCH_KEYS.REPORTS, CONST.SEARCH.SEARCH_KEYS.SUBMIT, CONST.SEARCH.SEARCH_KEYS.APPROVE, CONST.SEARCH.SEARCH_KEYS.PAY];

/** Keys under "Accounting", in the order navigation renders them. */
const ACCOUNTING_KEYS: SearchKey[] = [
    CONST.SEARCH.SEARCH_KEYS.EXPORT,
    CONST.SEARCH.SEARCH_KEYS.UNAPPROVED_CASH,
    CONST.SEARCH.SEARCH_KEYS.UNAPPROVED_CARD,
    CONST.SEARCH.SEARCH_KEYS.STATEMENTS,
    CONST.SEARCH.SEARCH_KEYS.RECONCILIATION,
];

/** Saved searches have no fixed key list, so their group needs an id of its own. */
const SAVED_SEARCHES_GROUP_ID = 'savedSearches';

/** Group id for the Accounting searches. Matches what getSpendGroupID returns for any of its keys. */
const ACCOUNTING_GROUP_ID: TranslationPaths = 'search.tabs.accounting';

const GROUPS: Array<{keys: SearchKey[]; translationPath: TranslationPaths}> = [
    {keys: EXPENSES_KEYS, translationPath: 'search.tabs.expenses'},
    {keys: REPORTS_KEYS, translationPath: 'common.reports'},
    {keys: ACCOUNTING_KEYS, translationPath: 'search.tabs.accounting'},
];

/**
 * Labels a search as it reads inside its own group. "Reports" is the group's name, so its broadest search spells out
 * that it holds all of them rather than repeating the group's label.
 */
const GROUPED_TRANSLATION_PATH_OVERRIDES: Partial<Record<SearchKey, TranslationPaths>> = {
    [CONST.SEARCH.SEARCH_KEYS.REPORTS]: 'search.tabs.allReports',
};

/** The searches that sit alongside `searchKey` in navigation, or undefined when it doesn't belong to a group. */
function getSpendGroupKeys(searchKey: SearchKey | undefined): SearchKey[] | undefined {
    return GROUPS.find((group) => group.keys.some((key) => key === searchKey))?.keys;
}

/** Stable id for the group a search belongs to, for recording where the user last was inside it. */
function getSpendGroupID(searchKey: SearchKey | undefined): string | undefined {
    if (searchKeyToSavedSearchID(searchKey)) {
        return SAVED_SEARCHES_GROUP_ID;
    }
    return GROUPS.find((group) => group.keys.some((key) => key === searchKey))?.translationPath;
}

/** The label for a search shown among its group's siblings. Falls back to the search's own label. */
function getGroupedSearchTranslationPath(searchKey: SearchKey, fallback: TranslationPaths): TranslationPaths {
    return GROUPED_TRANSLATION_PATH_OVERRIDES[searchKey] ?? fallback;
}

/**
 * Whether the narrow layout's tab row is hidden for this search. A group holding a single search has nothing to
 * switch between, so it shows no tabs. This is derived from the key alone so the page's layout offsets and the tab
 * row itself always agree.
 */
function shouldHideSpendTabRow(searchKey: SearchKey | undefined): boolean {
    return getSpendGroupKeys(searchKey)?.length === 1;
}

/** The group's own label, used where the page should read as the group rather than the individual search. */
function getSpendGroupTranslationPath(searchKey: SearchKey | undefined): TranslationPaths | undefined {
    // Saved searches are a group too, but keyed by prefix rather than a fixed list.
    if (searchKeyToSavedSearchID(searchKey)) {
        return 'search.savedSearchesMenuItemTitle';
    }
    return GROUPS.find((group) => group.keys.some((key) => key === searchKey))?.translationPath;
}

export {
    ACCOUNTING_GROUP_ID,
    ACCOUNTING_KEYS,
    EXPENSES_KEYS,
    getGroupedSearchTranslationPath,
    getSpendGroupID,
    getSpendGroupKeys,
    getSpendGroupTranslationPath,
    REPORTS_KEYS,
    SAVED_SEARCHES_GROUP_ID,
    shouldHideSpendTabRow,
};
