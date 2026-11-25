/**
 * Pure builders for the flat nav sections: which Spend searches sit under which section, which of them the user can
 * see, their badges, and which section and item a search key belongs to. Hooks in this folder feed it Onyx data.
 */
import type {TodoCounts} from '@hooks/useTodoCounts';

import {searchKeyToSavedSearchID} from '@libs/SearchKeyUtils';
import type {SearchKey} from '@libs/SearchKeyUtils';
import type {SearchTypeMenuItem} from '@libs/SearchSuggestionUtils';
import {formatBadgeText, getItemBadgeText, isTodoSearchKey} from '@libs/SearchUIUtils';
import type {SearchTypeMenuSection} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';

import type {
    ActiveFlatNavItem,
    FlatNavCannedSearchItem,
    FlatNavCannedSearchKey,
    FlatNavItem,
    FlatNavSavedSearchItem,
    FlatNavSection,
    FlatNavSectionDefinition,
    FlatNavSectionID,
    FlatNavSubnavGroup,
    FlatNavSubnavGroupDefinition,
    FlatNavSubnavRowHeights,
} from './types';

import FLAT_NAV from './FLAT_NAV';

const SAVED_SEARCHES_TRANSLATION_PATH = 'search.savedSearchesMenuItemTitle' satisfies TranslationPaths;

/**
 * The flat nav sections in render order. Insights has no section: only users without the Insights page reach those
 * charts as searches, and Spend navigation already hides them.
 */
const FLAT_NAV_SECTION_DEFINITIONS: readonly FlatNavSectionDefinition[] = [
    {
        id: FLAT_NAV.SECTION.EXPENSES,
        translationPath: 'search.tabs.expenses',
        iconName: 'Receipt',
        searchKeys: [CONST.SEARCH.SEARCH_KEYS.EXPENSES],
    },
    {
        id: FLAT_NAV.SECTION.REPORTS,
        translationPath: 'common.reports',
        iconName: 'Document',
        searchKeys: [
            CONST.SEARCH.SEARCH_KEYS.REPORTS,
            CONST.SEARCH.SEARCH_KEYS.SUBMIT,
            CONST.SEARCH.SEARCH_KEYS.APPROVE,
            CONST.SEARCH.SEARCH_KEYS.PAY,
            CONST.SEARCH.SEARCH_KEYS.REJECTED,
            CONST.SEARCH.SEARCH_KEYS.HELD,
        ],
    },
    {
        id: FLAT_NAV.SECTION.ACCOUNTING,
        translationPath: 'search.tabs.accounting',
        iconName: 'Connect',
        searchKeys: [
            CONST.SEARCH.SEARCH_KEYS.EXPORT,
            CONST.SEARCH.SEARCH_KEYS.UNAPPROVED_CASH,
            CONST.SEARCH.SEARCH_KEYS.UNAPPROVED_CARD,
            CONST.SEARCH.SEARCH_KEYS.STATEMENTS,
            CONST.SEARCH.SEARCH_KEYS.RECONCILIATION,
        ],
    },
    {
        id: FLAT_NAV.SECTION.TRAVEL,
        translationPath: 'search.tabs.travel',
        iconName: 'LuggageWithLines',
        searchKeys: [CONST.SEARCH.SEARCH_KEYS.TRIPS],
    },
    {
        id: FLAT_NAV.SECTION.SAVED,
        translationPath: SAVED_SEARCHES_TRANSLATION_PATH,
        iconName: 'Bookmark',
        searchKeys: [],
    },
];

/** Labels a search as it reads inside its own section, where repeating the section's label would say nothing. */
const IN_SECTION_TRANSLATION_PATH_OVERRIDES: Partial<Record<SearchKey, TranslationPaths>> = {
    [CONST.SEARCH.SEARCH_KEYS.REPORTS]: 'search.tabs.myReports',
};

type BuildFlatNavSectionsParams = {
    /** The Spend sections with insights omitted and travel gated by the travelApproval beta, ensuring all Spend visibility rules apply */
    typeMenuSections: SearchTypeMenuSection[];

    /** Already sorted */
    savedSearchItems: FlatNavSavedSearchItem[];

    todoCounts: TodoCounts;
};

/**
 * The section a search key belongs to, whether or not the section is visible to the user.
 */
function getFlatNavSectionIDForSearchKey(searchKey: SearchKey | undefined): FlatNavSectionID | undefined {
    if (!searchKey) {
        return undefined;
    }
    if (searchKeyToSavedSearchID(searchKey)) {
        return FLAT_NAV.SECTION.SAVED;
    }
    return FLAT_NAV_SECTION_DEFINITIONS.find((definition) => definition.searchKeys.some((key) => key === searchKey))?.id;
}

function getFlatNavSectionBadgeText(items: FlatNavItem[], todoCounts: TodoCounts): string | undefined {
    const todoSearchKeys = items.map((item) => item.key).filter(isTodoSearchKey);
    if (todoSearchKeys.length === 0) {
        return undefined;
    }
    const total = todoSearchKeys.reduce((sum, searchKey) => sum + todoCounts[searchKey], 0);
    return formatBadgeText(total) || undefined;
}

function buildCannedSearchItem(searchKey: FlatNavCannedSearchKey, menuItem: SearchTypeMenuItem, sectionID: FlatNavSectionID, todoCounts: TodoCounts): FlatNavCannedSearchItem {
    return {
        type: FLAT_NAV.ITEM_TYPE.CANNED_SEARCH,
        key: searchKey,
        sectionID,
        translationPath: IN_SECTION_TRANSLATION_PATH_OVERRIDES[searchKey] ?? menuItem.translationPath,
        spendColumnTranslationPath: menuItem.translationPath,
        iconName: menuItem.icon,
        searchQuery: menuItem.searchQuery,
        badgeText: getItemBadgeText(searchKey, todoCounts) || undefined,
    };
}

/**
 * Builds the sections the user can see. Visibility is not decided here: a search is shown when the Spend menu shows
 * it, so flat nav never disagrees with it.
 */
function buildFlatNavSections({typeMenuSections, savedSearchItems, todoCounts}: BuildFlatNavSectionsParams): FlatNavSection[] {
    const menuItemsByKey = new Map<SearchKey, SearchTypeMenuItem>();
    let hasSavedSearchesSection = false;
    for (const typeMenuSection of typeMenuSections) {
        hasSavedSearchesSection ||= typeMenuSection.translationPath === SAVED_SEARCHES_TRANSLATION_PATH;
        for (const menuItem of typeMenuSection.menuItems) {
            menuItemsByKey.set(menuItem.key, menuItem);
        }
    }

    const sections: FlatNavSection[] = [];
    for (const definition of FLAT_NAV_SECTION_DEFINITIONS) {
        let items: FlatNavItem[];
        if (definition.id === FLAT_NAV.SECTION.SAVED) {
            // The Spend menu drops the Saved section when every saved search is pending delete and the user is online.
            items = hasSavedSearchesSection ? savedSearchItems : [];
        } else {
            items = definition.searchKeys.flatMap((searchKey) => {
                const menuItem = menuItemsByKey.get(searchKey);
                return menuItem ? [buildCannedSearchItem(searchKey, menuItem, definition.id, todoCounts)] : [];
            });
        }

        if (items.length === 0) {
            continue;
        }
        sections.push({
            id: definition.id,
            translationPath: definition.translationPath,
            iconName: definition.iconName,
            items,
            badgeText: getFlatNavSectionBadgeText(items, todoCounts),
        });
    }
    return sections;
}

/**
 * Finds where a search key sits in the visible sections. A search that belongs to a visible section but has no row,
 * such as a deleted saved search, still highlights the section.
 */
function getActiveFlatNavItem(sections: FlatNavSection[], searchKey: SearchKey | undefined): ActiveFlatNavItem | undefined {
    const sectionID = getFlatNavSectionIDForSearchKey(searchKey);
    const section = sections.find((visibleSection) => visibleSection.id === sectionID);
    if (!searchKey || !section) {
        return undefined;
    }
    return {sectionID: section.id, itemKey: section.items.some((item) => item.key === searchKey) ? searchKey : undefined};
}

/** The item a section opens when its row is pressed: the first one that can be opened. */
function getFlatNavSectionDefaultItem(section: FlatNavSection): FlatNavItem | undefined {
    return section.items.find((item) => item.type === FLAT_NAV.ITEM_TYPE.CANNED_SEARCH || !item.isDisabled);
}

/**
 * The headers of the Spend subnav in render order. Expenses and Reports sit under one header because the Spend column lists them together.
 * The headers follow the order of the flat navigation bar sections, so Accounting comes before Travel even though the Spend column lists Travel first.
 */
const FLAT_NAV_SUBNAV_GROUP_DEFINITIONS: readonly FlatNavSubnavGroupDefinition[] = [
    {
        id: FLAT_NAV.SUBNAV_GROUP.EXPENSE_REPORTS,
        translationPath: 'search.tabs.expenseReports',
        sectionIDs: [FLAT_NAV.SECTION.EXPENSES, FLAT_NAV.SECTION.REPORTS],
        // Under its own section Reports reads "My reports". Next to Expenses it is the whole list of reports.
        shouldUseSpendColumnLabels: true,
    },
    {
        id: FLAT_NAV.SUBNAV_GROUP.ACCOUNTING,
        translationPath: 'search.tabs.accounting',
        sectionIDs: [FLAT_NAV.SECTION.ACCOUNTING],
    },
    {
        id: FLAT_NAV.SUBNAV_GROUP.TRAVEL,
        translationPath: 'search.tabs.travel',
        sectionIDs: [FLAT_NAV.SECTION.TRAVEL],
    },
    {
        id: FLAT_NAV.SUBNAV_GROUP.SAVED,
        translationPath: SAVED_SEARCHES_TRANSLATION_PATH,
        sectionIDs: [FLAT_NAV.SECTION.SAVED],
    },
];

type BuildFlatNavSubnavGroupsParams = {
    sections: FlatNavSection[];

    /** Offline, a saved search pending delete stays listed. Online it is dropped so every row has the same height. */
    isOffline: boolean;
};

/** Arranges the visible sections under the headers of the Spend subnav. A header with nothing under it is left out. */
function buildFlatNavSubnavGroups({sections, isOffline}: BuildFlatNavSubnavGroupsParams): FlatNavSubnavGroup[] {
    const groups: FlatNavSubnavGroup[] = [];
    for (const definition of FLAT_NAV_SUBNAV_GROUP_DEFINITIONS) {
        const items = definition.sectionIDs
            .flatMap((sectionID) => sections.find((section) => section.id === sectionID)?.items ?? [])
            .filter((item) => item.type === FLAT_NAV.ITEM_TYPE.CANNED_SEARCH || isOffline || !item.isDisabled)
            .map((item): FlatNavItem =>
                item.type === FLAT_NAV.ITEM_TYPE.CANNED_SEARCH && definition.shouldUseSpendColumnLabels ? {...item, translationPath: item.spendColumnTranslationPath} : item,
            );

        if (items.length > 0) {
            groups.push({
                id: definition.id,
                translationPath: definition.translationPath,
                items,
            });
        }
    }
    return groups;
}

/**
 * Where the marker of the active row starts, counted from the top of the subnav. Undefined when no row is active.
 * Rows have fixed heights, so this is a sum rather than a measurement.
 */
function getFlatNavSubnavMarkerTop(groups: FlatNavSubnavGroup[], activeItemKey: SearchKey | undefined, rowHeights: FlatNavSubnavRowHeights): number | undefined {
    if (!activeItemKey) {
        return undefined;
    }
    let rowTop = 0;
    for (const group of groups) {
        rowTop += rowHeights.header;
        for (const item of group.items) {
            if (item.key === activeItemKey) {
                return rowTop + (rowHeights.item - rowHeights.marker) / 2;
            }
            rowTop += rowHeights.item;
        }
    }
    return undefined;
}

export {
    buildFlatNavSections,
    buildFlatNavSubnavGroups,
    FLAT_NAV_SECTION_DEFINITIONS,
    getActiveFlatNavItem,
    getFlatNavSectionBadgeText,
    getFlatNavSectionDefaultItem,
    getFlatNavSectionIDForSearchKey,
    getFlatNavSubnavMarkerTop,
};
export type {BuildFlatNavSectionsParams};
