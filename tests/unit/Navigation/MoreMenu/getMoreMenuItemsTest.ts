import FLAT_NAV from '@libs/Navigation/FlatNav/FLAT_NAV';
import {FLAT_NAV_SECTION_DEFINITIONS} from '@libs/Navigation/FlatNav/FlatNavUtils';
import type {FlatNavSection, FlatNavSectionID} from '@libs/Navigation/FlatNav/types';
import getMoreMenuItems from '@libs/Navigation/MoreMenu/getMoreMenuItems';
import type {GetMoreMenuItemsParams} from '@libs/Navigation/MoreMenu/getMoreMenuItems';
import MORE_MENU from '@libs/Navigation/MoreMenu/MORE_MENU';

import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

/** The items of a section do not matter here, only whether the section is visible. */
function createSections(ids: FlatNavSectionID[]): FlatNavSection[] {
    return FLAT_NAV_SECTION_DEFINITIONS.filter((definition) => ids.includes(definition.id)).map(({id, translationPath, iconName}) => ({id, translationPath, iconName, items: []}));
}

const ALL_SECTIONS = createSections([FLAT_NAV.SECTION.EXPENSES, FLAT_NAV.SECTION.REPORTS, FLAT_NAV.SECTION.ACCOUNTING, FLAT_NAV.SECTION.SAVED]);

function getSection(id: FlatNavSectionID): FlatNavSection {
    const section = ALL_SECTIONS.find((visibleSection) => visibleSection.id === id);
    if (!section) {
        throw new Error(`No ${id} section`);
    }
    return section;
}

function getItems(overrides: Partial<GetMoreMenuItemsParams> = {}) {
    return getMoreMenuItems({sections: ALL_SECTIONS, focusedTabRouteName: SCREENS.HOME, activeFlatNavSectionID: undefined, ...overrides});
}

function getActiveItemIDs(overrides: Partial<GetMoreMenuItemsParams>) {
    return getItems(overrides)
        .filter((item) => item.isActive)
        .map((item) => item.id);
}

function getWorkspacesItem(overrides: Partial<GetMoreMenuItemsParams>) {
    return getItems(overrides).find((item) => item.id === MORE_MENU.ITEM.WORKSPACES);
}

describe('getMoreMenuItems', () => {
    it('should list Accounting, Saved, Insights and Workspaces in order', () => {
        // Given a user who can see every More destination
        // When the More entries are built
        const items = getItems();

        // Then they come in the order of the design, labelled and drawn like their flat nav sections and tabs
        expect(items.map((item) => item.id)).toEqual([MORE_MENU.ITEM.ACCOUNTING, MORE_MENU.ITEM.SAVED, MORE_MENU.ITEM.INSIGHTS, MORE_MENU.ITEM.WORKSPACES]);
        expect(items.at(0)).toMatchObject({translationPath: 'search.tabs.accounting', iconName: 'Connect'});
        expect(items.at(1)).toMatchObject({translationPath: 'search.savedSearchesMenuItemTitle', iconName: 'Bookmark'});
        expect(items.at(2)).toMatchObject({translationPath: 'common.insights', iconName: 'PieChart'});
        expect(items.at(3)).toMatchObject({translationPath: 'common.workspacesTabTitle', iconName: 'Buildings'});
    });

    it('should carry the section and its badge on the section entries', () => {
        // Given an Accounting section with a todo count and a Saved section without one
        const accountingSection: FlatNavSection = {...getSection(FLAT_NAV.SECTION.ACCOUNTING), badgeText: '3'};
        const savedSection = getSection(FLAT_NAV.SECTION.SAVED);

        // When the More entries are built
        const items = getItems({sections: [accountingSection, savedSection]});

        // Then each section entry holds the section it opens and copies its badge, so the menu can navigate and show the count without looking the section up again
        expect(items.at(0)).toMatchObject({id: MORE_MENU.ITEM.ACCOUNTING, section: accountingSection, badgeText: '3'});
        expect(items.at(1)).toMatchObject({id: MORE_MENU.ITEM.SAVED, section: savedSection, badgeText: undefined});
    });

    it('should drop Accounting and Saved when their sections are not visible', () => {
        // Given a user without workspaces or saved searches, so the flat nav model has neither section
        // When the More entries are built
        const items = getItems({sections: createSections([FLAT_NAV.SECTION.EXPENSES, FLAT_NAV.SECTION.REPORTS])});

        // Then only the destinations that always exist are listed, so More never offers an empty section
        expect(items.map((item) => item.id)).toEqual([MORE_MENU.ITEM.INSIGHTS, MORE_MENU.ITEM.WORKSPACES]);
    });

    it('should draw the Workspaces dot with the color the tab bar uses', () => {
        // Given the Workspaces dot color the tab bar draws, and no dot at all
        // When the Workspaces entry is built for each
        const withDot = getWorkspacesItem({workspacesDotColor: 'red'});
        const withoutDot = getWorkspacesItem({});

        // Then the entry repeats the tab bar dot, so moving Workspaces under More keeps its status visible
        expect(withDot?.indicatorColor).toBe('red');
        expect(withoutDot?.indicatorColor).toBeUndefined();
    });

    it.each([
        [SCREENS.INSIGHTS, MORE_MENU.ITEM.INSIGHTS],
        [NAVIGATORS.WORKSPACE_NAVIGATOR, MORE_MENU.ITEM.WORKSPACES],
    ])('should mark %s as active while its tab is focused', (focusedTabRouteName, itemID) => {
        // Given the tab of a More destination is focused, with an Accounting section left over in Search
        // When the More entries are built
        const activeItemIDs = getActiveItemIDs({focusedTabRouteName, activeFlatNavSectionID: FLAT_NAV.SECTION.ACCOUNTING});

        // Then only the focused destination is active, since the leftover search is not on screen
        expect(activeItemIDs).toEqual([itemID]);
    });

    it.each([
        [FLAT_NAV.SECTION.ACCOUNTING, MORE_MENU.ITEM.ACCOUNTING],
        [FLAT_NAV.SECTION.SAVED, MORE_MENU.ITEM.SAVED],
    ])('should mark the %s section as active while Search shows it', (activeFlatNavSectionID, itemID) => {
        // Given Search is focused on a search of a section that lives behind More
        // When the More entries are built
        const activeItemIDs = getActiveItemIDs({focusedTabRouteName: NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR, activeFlatNavSectionID});

        // Then that section is active, so the menu shows which of its entries put More in the highlighted slot
        expect(activeItemIDs).toEqual([itemID]);
    });

    it.each([
        ['Search on Expenses', NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR, FLAT_NAV.SECTION.EXPENSES],
        ['Search outside every visible section', NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR, undefined],
        ['Home', SCREENS.HOME, undefined],
        ['Account', NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR, undefined],
        ['no focused route', undefined, FLAT_NAV.SECTION.SAVED],
    ] as const)('should mark nothing as active on %s', (_description, focusedTabRouteName, activeFlatNavSectionID) => {
        // Given a screen that has its own slot in the bar, or none at all
        // When the More entries are built
        const activeItemIDs = getActiveItemIDs({focusedTabRouteName, activeFlatNavSectionID});

        // Then no More entry is active, because More is not the highlighted slot there
        expect(activeItemIDs).toEqual([]);
    });
});
