/**
 * Resolves which of the five flat nav tab bar slots is highlighted for the focused tab route. It is platform neutral,
 * meant for both the native and the mWeb bar, and takes the same `FlatNavTabBarFocus` as `getMoreMenuItems` so More is
 * never highlighted with no active entry in its menu.
 *
 * The Search navigator takes the slot of its active visible section. A search outside every visible section falls back
 * to Expenses, which the Search tab opens on: that covers Insights chart searches such as topSpenders, a search of a
 * section the user cannot see (a saved search while the Saved section is hidden, an Accounting deep link for a user
 * without Accounting), and no search at all. Account has no slot, so it resolves to undefined.
 */
import FLAT_NAV from '@libs/Navigation/FlatNav/FLAT_NAV';
import type {FlatNavSectionID} from '@libs/Navigation/FlatNav/types';

import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

import type {FlatNavTabBarSlot} from './FLAT_NAV_TAB_BAR_SLOT';
import type FlatNavTabBarFocus from './FlatNavTabBarFocus';

import FLAT_NAV_TAB_BAR_SLOT from './FLAT_NAV_TAB_BAR_SLOT';

const FLAT_NAV_TAB_BAR_SLOT_BY_SECTION: Record<FlatNavSectionID, FlatNavTabBarSlot> = {
    [FLAT_NAV.SECTION.EXPENSES]: FLAT_NAV_TAB_BAR_SLOT.EXPENSES,
    [FLAT_NAV.SECTION.REPORTS]: FLAT_NAV_TAB_BAR_SLOT.REPORTS,
    [FLAT_NAV.SECTION.ACCOUNTING]: FLAT_NAV_TAB_BAR_SLOT.MORE,
    // Where Travel sits in the mobile bar is not decided yet, so it stays with Expenses, the Search tab's default.
    [FLAT_NAV.SECTION.TRAVEL]: FLAT_NAV_TAB_BAR_SLOT.EXPENSES,
    [FLAT_NAV.SECTION.SAVED]: FLAT_NAV_TAB_BAR_SLOT.MORE,
};

function getFlatNavTabBarSlot({focusedTabRouteName, activeFlatNavSectionID}: FlatNavTabBarFocus): FlatNavTabBarSlot | undefined {
    switch (focusedTabRouteName) {
        case SCREENS.HOME:
            return FLAT_NAV_TAB_BAR_SLOT.HOME;
        case NAVIGATORS.REPORTS_SPLIT_NAVIGATOR:
            return FLAT_NAV_TAB_BAR_SLOT.INBOX;
        case NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR:
            return activeFlatNavSectionID ? FLAT_NAV_TAB_BAR_SLOT_BY_SECTION[activeFlatNavSectionID] : FLAT_NAV_TAB_BAR_SLOT.EXPENSES;
        case SCREENS.INSIGHTS:
        case NAVIGATORS.WORKSPACE_NAVIGATOR:
            return FLAT_NAV_TAB_BAR_SLOT.MORE;
        default:
            return undefined;
    }
}

export default getFlatNavTabBarSlot;
