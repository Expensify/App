import TAB_SCREENS from '@libs/Navigation/AppNavigator/Navigators/TAB_SCREENS';
import FLAT_NAV from '@libs/Navigation/FlatNav/FLAT_NAV';
import {FLAT_NAV_SECTION_DEFINITIONS, getActiveFlatNavItem} from '@libs/Navigation/FlatNav/FlatNavUtils';
import type {FlatNavSection, FlatNavSectionID} from '@libs/Navigation/FlatNav/types';
import FLAT_NAV_TAB_BAR_SLOT from '@libs/Navigation/FlatNavTabBar/FLAT_NAV_TAB_BAR_SLOT';
import getFlatNavTabBarSlot from '@libs/Navigation/FlatNavTabBar/getFlatNavTabBarSlot';
import getMoreMenuItems from '@libs/Navigation/MoreMenu/getMoreMenuItems';
import MORE_MENU from '@libs/Navigation/MoreMenu/MORE_MENU';
import type {SearchKey} from '@libs/SearchKeyUtils';
import {savedSearchIDToSearchKey} from '@libs/SearchKeyUtils';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

const MORE_MENU_ITEM_BY_SECTION: Partial<Record<FlatNavSectionID, string>> = {
    [FLAT_NAV.SECTION.ACCOUNTING]: MORE_MENU.ITEM.ACCOUNTING,
    [FLAT_NAV.SECTION.SAVED]: MORE_MENU.ITEM.SAVED,
};

function createSections(hiddenIDs: FlatNavSectionID[]): FlatNavSection[] {
    return FLAT_NAV_SECTION_DEFINITIONS.filter((definition) => !hiddenIDs.includes(definition.id)).map(({id, translationPath, iconName}) => ({id, translationPath, iconName, items: []}));
}

const VISIBILITY_CASES: Array<[string, FlatNavSection[]]> = [
    ['every section visible', createSections([])],
    ['Saved hidden', createSections([FLAT_NAV.SECTION.SAVED])],
    ['Accounting hidden', createSections([FLAT_NAV.SECTION.ACCOUNTING])],
    ['Accounting and Saved hidden', createSections([FLAT_NAV.SECTION.ACCOUNTING, FLAT_NAV.SECTION.SAVED])],
];

const SEARCH_KEYS: Array<SearchKey | undefined> = [...Object.values(CONST.SEARCH.SEARCH_KEYS), savedSearchIDToSearchKey('123'), undefined];

const FOCUSED_ROUTES: Array<string | undefined> = [...TAB_SCREENS, undefined];

/**
 * The More entries that should be active for a slot: none off More, the section's own entry when Search shows a
 * section behind More, and otherwise the entry of the focused tab.
 */
function getExpectedActiveItemIDs(slot: string | undefined, activeFlatNavSectionID: FlatNavSectionID | undefined, activeTabItemID: string | undefined) {
    if (slot !== FLAT_NAV_TAB_BAR_SLOT.MORE) {
        return [];
    }
    const sectionItemID = activeFlatNavSectionID ? MORE_MENU_ITEM_BY_SECTION[activeFlatNavSectionID] : undefined;
    return [sectionItemID ?? activeTabItemID];
}

const MORE_MENU_ITEM_BY_TAB: Partial<Record<string, string>> = {
    [SCREENS.INSIGHTS]: MORE_MENU.ITEM.INSIGHTS,
    [NAVIGATORS.WORKSPACE_NAVIGATOR]: MORE_MENU.ITEM.WORKSPACES,
};

describe('flat nav tab bar slot and More menu', () => {
    it.each(VISIBILITY_CASES)('should highlight More exactly when one More entry is active, with %s', (_description, sections) => {
        // Given every focused tab and every search the Search page can hold, read the way callers read them through useActiveFlatNavItem
        const cases = FOCUSED_ROUTES.flatMap((focusedTabRouteName) =>
            SEARCH_KEYS.map((searchKey) => {
                const isSearchFocused = focusedTabRouteName === NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR;
                return {focusedTabRouteName, searchKey, activeFlatNavSectionID: isSearchFocused ? getActiveFlatNavItem(sections, searchKey)?.sectionID : undefined};
            }),
        );

        // When the slot and the More entries are built from the same focus
        const mismatches = cases.filter(({focusedTabRouteName, activeFlatNavSectionID}) => {
            const focus = {focusedTabRouteName, activeFlatNavSectionID};
            const slot = getFlatNavTabBarSlot(focus);
            const activeItemIDs = getMoreMenuItems({...focus, sections, isInsightsAvailable: true})
                .filter((item) => item.isActive)
                .map((item) => item.id);
            const expectedItemIDs = getExpectedActiveItemIDs(slot, activeFlatNavSectionID, focusedTabRouteName ? MORE_MENU_ITEM_BY_TAB[focusedTabRouteName] : undefined);
            return JSON.stringify(activeItemIDs) !== JSON.stringify(expectedItemIDs);
        });

        // Then More is highlighted only with exactly one active entry, the one of the section or tab that put it there, so a saved search
        // while the Saved section is hidden or an Accounting deep link for a user without Accounting never highlights More with nothing active
        expect(mismatches).toEqual([]);
    });
});
