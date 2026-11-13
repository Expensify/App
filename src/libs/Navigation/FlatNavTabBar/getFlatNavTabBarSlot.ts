/**
 * Resolves the highlighted flat nav tab bar slot. The Search navigator takes the slot of its active section and falls
 * back to Expenses, the section the Search tab opens on, when its search is in no visible section.
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
    // Travel has no slot of its own, so it highlights Expenses, the section the Search tab opens on.
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
