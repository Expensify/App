import TAB_SCREENS from '@libs/Navigation/AppNavigator/Navigators/TAB_SCREENS';
import FLAT_NAV from '@libs/Navigation/FlatNav/FLAT_NAV';
import {FLAT_NAV_SECTION_DEFINITIONS, getActiveFlatNavItem} from '@libs/Navigation/FlatNav/FlatNavUtils';
import type {FlatNavSection, FlatNavSectionID} from '@libs/Navigation/FlatNav/types';
import FLAT_NAV_TAB_BAR_SLOT from '@libs/Navigation/FlatNavTabBar/FLAT_NAV_TAB_BAR_SLOT';
import getFlatNavTabBarSlot from '@libs/Navigation/FlatNavTabBar/getFlatNavTabBarSlot';
import getMoreMenuItems from '@libs/Navigation/MoreMenu/getMoreMenuItems';
import type {SearchKey} from '@libs/SearchKeyUtils';
import {savedSearchIDToSearchKey} from '@libs/SearchKeyUtils';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';

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

describe('flat nav tab bar slot and More menu', () => {
    it.each(VISIBILITY_CASES)('should highlight More exactly when one More entry is active, with %s', (_description, sections) => {
        // Given every focused tab and every search the Search page can hold, with the section read from the visible sections
        const cases = FOCUSED_ROUTES.flatMap((focusedTabRouteName) =>
            SEARCH_KEYS.map((searchKey) => {
                const isSearchFocused = focusedTabRouteName === NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR;
                return {focusedTabRouteName, searchKey, activeFlatNavSectionID: isSearchFocused ? getActiveFlatNavItem(sections, searchKey)?.sectionID : undefined};
            }),
        );

        // When the slot and the More entries are built from the same focus
        const mismatches = cases.filter((focus) => {
            const isMoreHighlighted = getFlatNavTabBarSlot(focus) === FLAT_NAV_TAB_BAR_SLOT.MORE;
            const activeItemCount = getMoreMenuItems({...focus, sections}).filter((item) => item.isActive).length;
            return activeItemCount > 1 || isMoreHighlighted !== (activeItemCount === 1);
        });

        // Then More is highlighted only with exactly one active entry, so a saved search while the Saved section is hidden or an
        // Accounting search for a user without Accounting never highlights More with nothing active in its menu
        expect(mismatches).toEqual([]);
    });
});
