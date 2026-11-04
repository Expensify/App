import type {TodoCounts} from '@hooks/useTodoCounts';

import FLAT_NAV from '@libs/Navigation/FlatNav/FLAT_NAV';
import type {BuildFlatNavSectionsParams} from '@libs/Navigation/FlatNav/FlatNavUtils';
import {
    buildFlatNavSections,
    FLAT_NAV_SECTION_DEFINITIONS,
    getActiveFlatNavItem,
    getFlatNavSectionBadgeText,
    getFlatNavSectionDefaultItem,
    getFlatNavSectionIDForSearchKey,
} from '@libs/Navigation/FlatNav/FlatNavUtils';
import type {FlatNavSavedSearchItem, FlatNavSection} from '@libs/Navigation/FlatNav/types';
import type {SearchKey} from '@libs/SearchKeyUtils';
import {savedSearchIDToSearchKey} from '@libs/SearchKeyUtils';
import {getSuggestedSearches} from '@libs/SearchSuggestionUtils';
import type {SearchTypeMenuSection} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';

const {SEARCH_KEYS} = CONST.SEARCH;
const ACCOUNT_ID = 1;
const SAVED_SEARCHES_TRANSLATION_PATH = 'search.savedSearchesMenuItemTitle';
const suggestedSearches = getSuggestedSearches(ACCOUNT_ID);

const createTodoCounts = (overrides: Partial<TodoCounts> = {}): TodoCounts => ({
    [SEARCH_KEYS.SUBMIT]: 0,
    [SEARCH_KEYS.APPROVE]: 0,
    [SEARCH_KEYS.PAY]: 0,
    [SEARCH_KEYS.EXPORT]: 0,
    ...overrides,
});

/** Mirrors what the Spend menu hands over: one section per group, holding only the searches the user can see. */
function createTypeMenuSections(keys: SearchKey[], {hasSavedSearchesSection = false}: {hasSavedSearchesSection?: boolean} = {}): SearchTypeMenuSection[] {
    const sections: SearchTypeMenuSection[] = [{translationPath: 'search.tabs.expenseReports', menuItems: keys.map((key) => suggestedSearches[key])}];
    if (hasSavedSearchesSection) {
        sections.push({translationPath: SAVED_SEARCHES_TRANSLATION_PATH, menuItems: []});
    }
    return sections;
}

function createSavedSearchItem(savedSearchID: string, overrides: Partial<FlatNavSavedSearchItem> = {}): FlatNavSavedSearchItem {
    return {
        type: FLAT_NAV.ITEM_TYPE.SAVED_SEARCH,
        key: savedSearchIDToSearchKey(savedSearchID),
        sectionID: FLAT_NAV.SECTION.SAVED,
        savedSearchID,
        name: `Saved ${savedSearchID}`,
        title: `Saved ${savedSearchID}`,
        query: 'type:expense',
        iconName: 'Bookmark',
        isDisabled: false,
        ...overrides,
    };
}

function getSection(sections: FlatNavSection[], id: FlatNavSection['id']) {
    return sections.find((section) => section.id === id);
}

function getRequiredSection(sections: FlatNavSection[], id: FlatNavSection['id']): FlatNavSection {
    const section = getSection(sections, id);
    if (!section) {
        throw new Error(`Expected the ${id} section to be visible`);
    }
    return section;
}

describe('FlatNavUtils', () => {
    describe('FLAT_NAV_SECTION_DEFINITIONS', () => {
        it('should list the sections in render order', () => {
            // Given the section definitions
            // When we read their ids
            const ids = FLAT_NAV_SECTION_DEFINITIONS.map((definition) => definition.id);

            // Then the order is the one the bars render: Saved comes after Accounting and Travel
            expect(ids).toEqual([FLAT_NAV.SECTION.EXPENSES, FLAT_NAV.SECTION.REPORTS, FLAT_NAV.SECTION.ACCOUNTING, FLAT_NAV.SECTION.TRAVEL, FLAT_NAV.SECTION.SAVED]);
        });

        it('should not list a search key under two sections', () => {
            // Given the search keys of every section
            const allKeys = FLAT_NAV_SECTION_DEFINITIONS.flatMap((definition) => definition.searchKeys);

            // When we look for repeated keys
            const repeatedKeys = allKeys.filter((key, index) => allKeys.indexOf(key) !== index);

            // Then there are none, otherwise a search would highlight two sections
            expect(repeatedKeys).toEqual([]);
        });

        it('should not list the Insights searches', () => {
            // Given the search keys of every section
            const allKeys = FLAT_NAV_SECTION_DEFINITIONS.flatMap((definition) => definition.searchKeys);

            // When we check the Insights keys
            // Then none of them has a section, since flat nav leaves Insights to its own page
            expect(allKeys).not.toContain(SEARCH_KEYS.SPEND_OVER_TIME);
            expect(allKeys).not.toContain(SEARCH_KEYS.TOP_SPENDERS);
            expect(allKeys).not.toContain(SEARCH_KEYS.TOP_CATEGORIES);
            expect(allKeys).not.toContain(SEARCH_KEYS.TOP_MERCHANTS);
            expect(allKeys).not.toContain(SEARCH_KEYS.VIOLATIONS_BY_SUBMITTER);
        });

        it('should cover every canned search key except Insights', () => {
            // Given all canned search keys defined in SEARCH_KEYS and the Insights keys handled outside flat nav
            const allCannedKeys = Object.values(SEARCH_KEYS);
            const insightKeys = new Set<SearchKey>([
                SEARCH_KEYS.SPEND_OVER_TIME,
                SEARCH_KEYS.TOP_SPENDERS,
                SEARCH_KEYS.TOP_CATEGORIES,
                SEARCH_KEYS.TOP_MERCHANTS,
                SEARCH_KEYS.VIOLATIONS_BY_SUBMITTER,
            ]);
            const expectedKeys = allCannedKeys.filter((key) => !insightKeys.has(key)).sort();

            // When we collect all keys configured across the section definitions
            const configuredKeys = FLAT_NAV_SECTION_DEFINITIONS.flatMap((definition) => definition.searchKeys).sort();

            // Then every non-Insight canned search key belongs to exactly one section
            expect(configuredKeys).toEqual(expectedKeys);
        });
    });

    describe('getFlatNavSectionIDForSearchKey', () => {
        it.each([
            [SEARCH_KEYS.EXPENSES, FLAT_NAV.SECTION.EXPENSES],
            [SEARCH_KEYS.REPORTS, FLAT_NAV.SECTION.REPORTS],
            [SEARCH_KEYS.SUBMIT, FLAT_NAV.SECTION.REPORTS],
            [SEARCH_KEYS.APPROVE, FLAT_NAV.SECTION.REPORTS],
            [SEARCH_KEYS.PAY, FLAT_NAV.SECTION.REPORTS],
            [SEARCH_KEYS.EXPORT, FLAT_NAV.SECTION.ACCOUNTING],
            [SEARCH_KEYS.UNAPPROVED_CASH, FLAT_NAV.SECTION.ACCOUNTING],
            [SEARCH_KEYS.UNAPPROVED_CARD, FLAT_NAV.SECTION.ACCOUNTING],
            [SEARCH_KEYS.STATEMENTS, FLAT_NAV.SECTION.ACCOUNTING],
            [SEARCH_KEYS.RECONCILIATION, FLAT_NAV.SECTION.ACCOUNTING],
            [SEARCH_KEYS.TRIPS, FLAT_NAV.SECTION.TRAVEL],
        ])('should map %s to the %s section', (searchKey, expectedSectionID) => {
            // Given a canned search key
            // When we resolve its section
            // Then it is the section that lists it, whether or not that section is visible
            expect(getFlatNavSectionIDForSearchKey(searchKey)).toBe(expectedSectionID);
        });

        it('should map a saved search key to the Saved section', () => {
            // Given the key of a saved search
            const searchKey = savedSearchIDToSearchKey('123');

            // When we resolve its section
            // Then it is Saved, even though no section definition lists saved search keys
            expect(getFlatNavSectionIDForSearchKey(searchKey)).toBe(FLAT_NAV.SECTION.SAVED);
        });

        it('should return undefined for an Insights key and for no key', () => {
            // Given a key flat nav has no section for, and no key at all
            // When we resolve their sections
            // Then neither has one, because Insights is handled outside flat nav and undefined is not a search key
            expect(getFlatNavSectionIDForSearchKey(SEARCH_KEYS.TOP_SPENDERS)).toBeUndefined();
            expect(getFlatNavSectionIDForSearchKey(undefined)).toBeUndefined();
        });
    });

    describe('buildFlatNavSections', () => {
        it('should show only Expenses and Reports to a user without workspaces', () => {
            // Given the Spend menu of a user who only sees the searches every user has
            const typeMenuSections = createTypeMenuSections([SEARCH_KEYS.EXPENSES, SEARCH_KEYS.REPORTS]);

            // When we build the sections
            const params: BuildFlatNavSectionsParams = {typeMenuSections, savedSearchItems: [], todoCounts: createTodoCounts()};
            const sections = buildFlatNavSections(params);

            // Then Accounting, Travel and Saved are left out, and Reports holds just its own search
            expect(sections.map((section) => section.id)).toEqual([FLAT_NAV.SECTION.EXPENSES, FLAT_NAV.SECTION.REPORTS]);
            expect(getSection(sections, FLAT_NAV.SECTION.REPORTS)?.items.map((item) => item.key)).toEqual([SEARCH_KEYS.REPORTS]);
        });

        it('should show only submit under Reports for a submitter without approval rights', () => {
            // Given the Spend menu of a user who only submits reports
            const typeMenuSections = createTypeMenuSections([SEARCH_KEYS.EXPENSES, SEARCH_KEYS.REPORTS, SEARCH_KEYS.SUBMIT]);

            // When we build the sections
            const sections = buildFlatNavSections({typeMenuSections, savedSearchItems: [], todoCounts: createTodoCounts({[SEARCH_KEYS.SUBMIT]: 3})});

            // Then Reports contains only My reports and Drafts (submit), with the badge counting only drafts
            expect(getSection(sections, FLAT_NAV.SECTION.REPORTS)?.items.map((item) => item.key)).toEqual([SEARCH_KEYS.REPORTS, SEARCH_KEYS.SUBMIT]);
            expect(getSection(sections, FLAT_NAV.SECTION.REPORTS)?.badgeText).toBe('3');
        });

        it('should order the items by section definition rather than by the order of the Spend menu', () => {
            // Given a Spend menu that lists the todo searches before the others
            const typeMenuSections = createTypeMenuSections([SEARCH_KEYS.PAY, SEARCH_KEYS.APPROVE, SEARCH_KEYS.SUBMIT, SEARCH_KEYS.REPORTS, SEARCH_KEYS.EXPENSES]);

            // When we build the sections
            const params: BuildFlatNavSectionsParams = {typeMenuSections, savedSearchItems: [], todoCounts: createTodoCounts()};
            const sections = buildFlatNavSections(params);

            // Then the Reports items follow the definition so every bar renders the same order
            expect(getSection(sections, FLAT_NAV.SECTION.REPORTS)?.items.map((item) => item.key)).toEqual([SEARCH_KEYS.REPORTS, SEARCH_KEYS.SUBMIT, SEARCH_KEYS.APPROVE, SEARCH_KEYS.PAY]);
        });

        it('should list all the Accounting searches for an admin with an integration and cards', () => {
            // Given the Spend menu of an admin who sees every Accounting search
            const typeMenuSections = createTypeMenuSections([
                SEARCH_KEYS.EXPENSES,
                SEARCH_KEYS.REPORTS,
                SEARCH_KEYS.EXPORT,
                SEARCH_KEYS.UNAPPROVED_CASH,
                SEARCH_KEYS.UNAPPROVED_CARD,
                SEARCH_KEYS.STATEMENTS,
                SEARCH_KEYS.RECONCILIATION,
            ]);

            // When we build the sections
            const params: BuildFlatNavSectionsParams = {typeMenuSections, savedSearchItems: [], todoCounts: createTodoCounts()};
            const sections = buildFlatNavSections(params);

            // Then Accounting holds all five, in the order of its definition
            expect(getSection(sections, FLAT_NAV.SECTION.ACCOUNTING)?.items.map((item) => item.key)).toEqual([
                SEARCH_KEYS.EXPORT,
                SEARCH_KEYS.UNAPPROVED_CASH,
                SEARCH_KEYS.UNAPPROVED_CARD,
                SEARCH_KEYS.STATEMENTS,
                SEARCH_KEYS.RECONCILIATION,
            ]);
        });

        it('should drop the workflow searches when the Spend menu does not show them', () => {
            // Given the Spend menu of a track-intent user with workflows disabled
            const typeMenuSections = createTypeMenuSections([SEARCH_KEYS.EXPENSES, SEARCH_KEYS.REPORTS, SEARCH_KEYS.STATEMENTS]);

            // When we build the sections
            const params: BuildFlatNavSectionsParams = {typeMenuSections, savedSearchItems: [], todoCounts: createTodoCounts()};
            const sections = buildFlatNavSections(params);

            // Then flat nav does not add them back, and Accounting keeps only what the menu showed
            const itemKeys = sections.flatMap((section) => section.items.map((item) => item.key));
            expect(itemKeys).not.toContain(SEARCH_KEYS.SUBMIT);
            expect(itemKeys).not.toContain(SEARCH_KEYS.APPROVE);
            expect(itemKeys).not.toContain(SEARCH_KEYS.PAY);
            expect(itemKeys).not.toContain(SEARCH_KEYS.EXPORT);
            expect(getSection(sections, FLAT_NAV.SECTION.ACCOUNTING)?.items.map((item) => item.key)).toEqual([SEARCH_KEYS.STATEMENTS]);
        });

        it('should show Travel only when the Spend menu lists trips', () => {
            // Given the Spend menu with and without trips, which it lists only under the travel approval beta
            const withTrips = createTypeMenuSections([SEARCH_KEYS.EXPENSES, SEARCH_KEYS.REPORTS, SEARCH_KEYS.TRIPS]);
            const withoutTrips = createTypeMenuSections([SEARCH_KEYS.EXPENSES, SEARCH_KEYS.REPORTS]);

            // When we build the sections for both
            const sectionsWithTrips = buildFlatNavSections({typeMenuSections: withTrips, savedSearchItems: [], todoCounts: createTodoCounts()});
            const sectionsWithoutTrips = buildFlatNavSections({typeMenuSections: withoutTrips, savedSearchItems: [], todoCounts: createTodoCounts()});

            // Then Travel follows the menu
            expect(getSection(sectionsWithTrips, FLAT_NAV.SECTION.TRAVEL)?.items.map((item) => item.key)).toEqual([SEARCH_KEYS.TRIPS]);
            expect(getSection(sectionsWithoutTrips, FLAT_NAV.SECTION.TRAVEL)).toBeUndefined();
        });

        it('should show the Saved section when the Spend menu has it and there are saved searches', () => {
            // Given the Spend menu with its Saved section and two saved searches
            const typeMenuSections = createTypeMenuSections([SEARCH_KEYS.EXPENSES, SEARCH_KEYS.REPORTS], {hasSavedSearchesSection: true});
            const savedSearchItems = [createSavedSearchItem('1'), createSavedSearchItem('2')];

            // When we build the sections
            const sections = buildFlatNavSections({typeMenuSections, savedSearchItems, todoCounts: createTodoCounts()});

            // Then Saved is last and holds the saved searches in the order given
            expect(sections.at(-1)?.id).toBe(FLAT_NAV.SECTION.SAVED);
            expect(getSection(sections, FLAT_NAV.SECTION.SAVED)?.items).toEqual(savedSearchItems);
        });

        it('should drop the Saved section when the Spend menu does not have it', () => {
            // Given saved searches that are all pending delete while online, so the Spend menu leaves its Saved section out
            const typeMenuSections = createTypeMenuSections([SEARCH_KEYS.EXPENSES, SEARCH_KEYS.REPORTS]);
            const savedSearchItems = [createSavedSearchItem('1', {isDisabled: true})];

            // When we build the sections
            const sections = buildFlatNavSections({typeMenuSections, savedSearchItems, todoCounts: createTodoCounts()});

            // Then flat nav hides them too
            expect(getSection(sections, FLAT_NAV.SECTION.SAVED)).toBeUndefined();
        });

        it('should drop the Saved section when there are no saved searches', () => {
            // Given the Spend menu with its Saved section but no saved search to list
            const typeMenuSections = createTypeMenuSections([SEARCH_KEYS.EXPENSES, SEARCH_KEYS.REPORTS], {hasSavedSearchesSection: true});

            // When we build the sections
            const params: BuildFlatNavSectionsParams = {typeMenuSections, savedSearchItems: [], todoCounts: createTodoCounts()};
            const sections = buildFlatNavSections(params);

            // Then there is no empty Saved section
            expect(getSection(sections, FLAT_NAV.SECTION.SAVED)).toBeUndefined();
        });

        it('should label the reports search "My reports" inside its section and keep the other labels', () => {
            // Given the Spend menu of an approver
            const typeMenuSections = createTypeMenuSections([SEARCH_KEYS.EXPENSES, SEARCH_KEYS.REPORTS, SEARCH_KEYS.APPROVE]);

            // When we build the sections
            const params: BuildFlatNavSectionsParams = {typeMenuSections, savedSearchItems: [], todoCounts: createTodoCounts()};
            const sections = buildFlatNavSections(params);

            // Then the Reports section does not repeat its own label for the reports search, and the others keep theirs
            const reportItems = getSection(sections, FLAT_NAV.SECTION.REPORTS)?.items ?? [];
            const translationPathByKey = Object.fromEntries(reportItems.flatMap((item) => (item.type === FLAT_NAV.ITEM_TYPE.CANNED_SEARCH ? [[item.key, item.translationPath]] : [])));
            expect(translationPathByKey[SEARCH_KEYS.REPORTS]).toBe('search.tabs.myReports');
            expect(translationPathByKey[SEARCH_KEYS.APPROVE]).toBe(suggestedSearches[SEARCH_KEYS.APPROVE].translationPath);
        });

        it('should carry the default query and icon of each search', () => {
            // Given the Spend menu with the expenses search
            const typeMenuSections = createTypeMenuSections([SEARCH_KEYS.EXPENSES, SEARCH_KEYS.REPORTS]);

            // When we build the sections
            const params: BuildFlatNavSectionsParams = {typeMenuSections, savedSearchItems: [], todoCounts: createTodoCounts()};
            const sections = buildFlatNavSections(params);

            // Then the item keeps what navigation needs to open it
            const expensesItem = getSection(sections, FLAT_NAV.SECTION.EXPENSES)?.items.at(0);
            expect(expensesItem).toMatchObject({
                type: FLAT_NAV.ITEM_TYPE.CANNED_SEARCH,
                key: SEARCH_KEYS.EXPENSES,
                sectionID: FLAT_NAV.SECTION.EXPENSES,
                searchQuery: suggestedSearches[SEARCH_KEYS.EXPENSES].searchQuery,
                iconName: suggestedSearches[SEARCH_KEYS.EXPENSES].icon,
            });
        });
    });

    describe('badges', () => {
        const typeMenuSections = createTypeMenuSections([
            SEARCH_KEYS.EXPENSES,
            SEARCH_KEYS.REPORTS,
            SEARCH_KEYS.SUBMIT,
            SEARCH_KEYS.APPROVE,
            SEARCH_KEYS.PAY,
            SEARCH_KEYS.EXPORT,
            SEARCH_KEYS.STATEMENTS,
        ]);

        it('should give each todo search its own count', () => {
            // Given todo counts
            const todoCounts = {[SEARCH_KEYS.SUBMIT]: 2, [SEARCH_KEYS.APPROVE]: 0, [SEARCH_KEYS.PAY]: 7, [SEARCH_KEYS.EXPORT]: 1};

            // When we build the sections
            const sections = buildFlatNavSections({typeMenuSections, savedSearchItems: [], todoCounts});

            // Then every todo search shows its count, and none is shown for a zero count or a search without a todo
            const badgeTextByKey = Object.fromEntries(
                sections.flatMap((section) => section.items.map((item) => [item.key, item.type === FLAT_NAV.ITEM_TYPE.CANNED_SEARCH ? item.badgeText : undefined])),
            );
            expect(badgeTextByKey[SEARCH_KEYS.SUBMIT]).toBe('2');
            expect(badgeTextByKey[SEARCH_KEYS.APPROVE]).toBeUndefined();
            expect(badgeTextByKey[SEARCH_KEYS.PAY]).toBe('7');
            expect(badgeTextByKey[SEARCH_KEYS.EXPORT]).toBe('1');
            expect(badgeTextByKey[SEARCH_KEYS.EXPENSES]).toBeUndefined();
            expect(badgeTextByKey[SEARCH_KEYS.STATEMENTS]).toBeUndefined();
        });

        it('should cap a count above the maximum', () => {
            // Given a count above the badge maximum
            const todoCounts = createTodoCounts({[SEARCH_KEYS.SUBMIT]: CONST.SEARCH.TODO_BADGE_MAX_COUNT + 1});

            // When we build the sections
            const sections = buildFlatNavSections({typeMenuSections, savedSearchItems: [], todoCounts});

            // Then the badge reads "<max>+"
            expect(getSection(sections, FLAT_NAV.SECTION.REPORTS)?.items.find((item) => item.key === SEARCH_KEYS.SUBMIT)).toMatchObject({badgeText: `${CONST.SEARCH.TODO_BADGE_MAX_COUNT}+`});
        });

        it('should sum the submit, approve and pay counts for the Reports section', () => {
            // Given todo counts
            const todoCounts = createTodoCounts({[SEARCH_KEYS.SUBMIT]: 2, [SEARCH_KEYS.APPROVE]: 3, [SEARCH_KEYS.PAY]: 4, [SEARCH_KEYS.EXPORT]: 9});

            // When we build the sections
            const sections = buildFlatNavSections({typeMenuSections, savedSearchItems: [], todoCounts});

            // Then Reports shows their total, without the export count that belongs to Accounting
            expect(getSection(sections, FLAT_NAV.SECTION.REPORTS)?.badgeText).toBe('9');
        });

        it('should show the export count on the Accounting section', () => {
            // Given an export count
            const todoCounts = createTodoCounts({[SEARCH_KEYS.EXPORT]: 5});

            // When we build the sections
            const sections = buildFlatNavSections({typeMenuSections, savedSearchItems: [], todoCounts});

            // Then Accounting shows it
            expect(getSection(sections, FLAT_NAV.SECTION.ACCOUNTING)?.badgeText).toBe('5');
        });

        it('should show no section badge for a section without todo searches or without a count', () => {
            // Given a pending todo count and a saved search
            const savedTypeMenuSections = createTypeMenuSections([SEARCH_KEYS.EXPENSES, SEARCH_KEYS.REPORTS, SEARCH_KEYS.SUBMIT], {hasSavedSearchesSection: true});

            // When we build the sections with no count for the todo searches
            const sections = buildFlatNavSections({typeMenuSections: savedTypeMenuSections, savedSearchItems: [createSavedSearchItem('1')], todoCounts: createTodoCounts()});

            // Then no section has a badge: Expenses and Saved have no todo searches, and Reports has a zero count
            expect(sections.map((section) => section.badgeText)).toEqual([undefined, undefined, undefined]);
        });

        it('should not count a todo search the user cannot see', () => {
            // Given a count for approve, but a Spend menu that does not show it
            const menuWithoutApprove = createTypeMenuSections([SEARCH_KEYS.EXPENSES, SEARCH_KEYS.REPORTS, SEARCH_KEYS.SUBMIT]);
            const todoCounts = createTodoCounts({[SEARCH_KEYS.SUBMIT]: 1, [SEARCH_KEYS.APPROVE]: 10});

            // When we build the sections
            const sections = buildFlatNavSections({typeMenuSections: menuWithoutApprove, savedSearchItems: [], todoCounts});

            // Then the Reports badge counts only the search that is shown
            expect(getSection(sections, FLAT_NAV.SECTION.REPORTS)?.badgeText).toBe('1');
        });

        it('should return undefined from getFlatNavSectionBadgeText for items without a todo search', () => {
            // Given the items of the Expenses section
            const sections = buildFlatNavSections({typeMenuSections, savedSearchItems: [], todoCounts: createTodoCounts({[SEARCH_KEYS.SUBMIT]: 3})});
            const items = getSection(sections, FLAT_NAV.SECTION.EXPENSES)?.items ?? [];

            // When we compute their badge
            // Then there is none, since Expenses contains no todo searches like approve or submit
            expect(getFlatNavSectionBadgeText(items, createTodoCounts({[SEARCH_KEYS.SUBMIT]: 3}))).toBeUndefined();
        });
    });

    describe('getActiveFlatNavItem', () => {
        const savedSearchKey = savedSearchIDToSearchKey('1');
        const typeMenuSections = createTypeMenuSections([SEARCH_KEYS.EXPENSES, SEARCH_KEYS.REPORTS, SEARCH_KEYS.SUBMIT, SEARCH_KEYS.STATEMENTS], {hasSavedSearchesSection: true});
        const sections = buildFlatNavSections({typeMenuSections, savedSearchItems: [createSavedSearchItem('1')], todoCounts: createTodoCounts()});

        it('should find the section and item of a visible canned search', () => {
            // Given the search key of a visible canned search
            // When we resolve the active item
            // Then both its section and its item are found
            expect(getActiveFlatNavItem(sections, SEARCH_KEYS.SUBMIT)).toEqual({sectionID: FLAT_NAV.SECTION.REPORTS, itemKey: SEARCH_KEYS.SUBMIT});
        });

        it('should find the section and item of a visible saved search', () => {
            // Given the key of a saved search that has a row
            // When we resolve the active item
            // Then it sits in Saved
            expect(getActiveFlatNavItem(sections, savedSearchKey)).toEqual({sectionID: FLAT_NAV.SECTION.SAVED, itemKey: savedSearchKey});
        });

        it('should keep the section highlighted for a saved search that has no row', () => {
            // Given the key of a saved search that was deleted
            const deletedSearchKey = savedSearchIDToSearchKey('deleted');

            // When we resolve the active item
            // Then Saved is active without an item
            expect(getActiveFlatNavItem(sections, deletedSearchKey)).toEqual({sectionID: FLAT_NAV.SECTION.SAVED, itemKey: undefined});
        });

        it('should keep the section highlighted for a search the user cannot see', () => {
            // Given a deep link to Approve, which the Spend menu does not show this user, under a section they can see
            // When we resolve the active item
            // Then Reports is active without an item
            expect(getActiveFlatNavItem(sections, SEARCH_KEYS.APPROVE)).toEqual({sectionID: FLAT_NAV.SECTION.REPORTS, itemKey: undefined});
        });

        it('should return undefined when the section is not visible', () => {
            // Given a search key of a section the user does not see, because trips is hidden
            // When we resolve the active item
            // Then nothing is active
            expect(getActiveFlatNavItem(sections, SEARCH_KEYS.TRIPS)).toBeUndefined();
        });

        it('should return undefined for a search without a section', () => {
            // Given an Insights key, and no key at all, as when an invoice search is open
            // When we resolve the active item
            // Then nothing is active
            expect(getActiveFlatNavItem(sections, SEARCH_KEYS.TOP_SPENDERS)).toBeUndefined();
            expect(getActiveFlatNavItem(sections, undefined)).toBeUndefined();
        });
    });

    describe('getFlatNavSectionDefaultItem', () => {
        it('should return the first item of a section', () => {
            // Given the Reports section of an approver
            const sections = buildFlatNavSections({
                typeMenuSections: createTypeMenuSections([SEARCH_KEYS.EXPENSES, SEARCH_KEYS.REPORTS, SEARCH_KEYS.APPROVE]),
                savedSearchItems: [],
                todoCounts: createTodoCounts(),
            });

            // When we resolve what the section opens
            const defaultItem = getFlatNavSectionDefaultItem(getRequiredSection(sections, FLAT_NAV.SECTION.REPORTS));

            // Then it is the first item
            expect(defaultItem?.key).toBe(SEARCH_KEYS.REPORTS);
        });

        it('should skip a saved search that is pending delete', () => {
            // Given a Saved section whose first saved search is pending delete
            const sections = buildFlatNavSections({
                typeMenuSections: createTypeMenuSections([SEARCH_KEYS.EXPENSES, SEARCH_KEYS.REPORTS], {hasSavedSearchesSection: true}),
                savedSearchItems: [createSavedSearchItem('1', {isDisabled: true}), createSavedSearchItem('2')],
                todoCounts: createTodoCounts(),
            });

            // When we resolve what the section opens
            const defaultItem = getFlatNavSectionDefaultItem(getRequiredSection(sections, FLAT_NAV.SECTION.SAVED));

            // Then it is the first saved search that can be opened
            expect(defaultItem?.key).toBe(savedSearchIDToSearchKey('2'));
        });

        it('should return undefined when no item can be opened', () => {
            // Given a section with only a saved search that is pending delete
            const section: FlatNavSection = {
                id: FLAT_NAV.SECTION.SAVED,
                translationPath: SAVED_SEARCHES_TRANSLATION_PATH,
                iconName: 'Bookmark',
                items: [createSavedSearchItem('1', {isDisabled: true})],
            };

            // When we resolve what the section opens
            // Then there is nothing to open because pending delete items cannot be opened
            expect(getFlatNavSectionDefaultItem(section)).toBeUndefined();
        });
    });
});
