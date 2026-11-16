/**
 * Resolves the highlighted flat nav tab bar slot. The Search navigator takes the slot of its active section and falls
 * back to Expenses, the default section of the Search tab, when its search is in no visible section.
 */
import NAVIGATION_TABS from '@components/Navigation/NavigationTabBar/NAVIGATION_TABS';
import ROUTE_TO_NAVIGATION_TAB from '@components/Navigation/NavigationTabBar/ROUTE_TO_NAVIGATION_TAB';

import FLAT_NAV from '@libs/Navigation/FlatNav/FLAT_NAV';
import type {FlatNavSectionID} from '@libs/Navigation/FlatNav/types';

import type {FlatNavTabBarSlot} from './FLAT_NAV_TAB_BAR_SLOT';
import type FlatNavTabBarFocus from './FlatNavTabBarFocus';

import FLAT_NAV_TAB_BAR_SLOT from './FLAT_NAV_TAB_BAR_SLOT';

const FLAT_NAV_TAB_BAR_SLOT_BY_SECTION: Record<FlatNavSectionID, FlatNavTabBarSlot> = {
    [FLAT_NAV.SECTION.EXPENSES]: FLAT_NAV_TAB_BAR_SLOT.EXPENSES,
    [FLAT_NAV.SECTION.REPORTS]: FLAT_NAV_TAB_BAR_SLOT.REPORTS,
    [FLAT_NAV.SECTION.ACCOUNTING]: FLAT_NAV_TAB_BAR_SLOT.MORE,
    // Travel has no slot of its own, so it highlights Expenses, the default section of the Search tab.
    [FLAT_NAV.SECTION.TRAVEL]: FLAT_NAV_TAB_BAR_SLOT.EXPENSES,
    [FLAT_NAV.SECTION.SAVED]: FLAT_NAV_TAB_BAR_SLOT.MORE,
};

function getFlatNavTabBarSlot({focusedTabRouteName, activeFlatNavSectionID}: FlatNavTabBarFocus): FlatNavTabBarSlot | undefined {
    switch (focusedTabRouteName ? ROUTE_TO_NAVIGATION_TAB[focusedTabRouteName] : undefined) {
        case NAVIGATION_TABS.HOME:
            return FLAT_NAV_TAB_BAR_SLOT.HOME;
        case NAVIGATION_TABS.INBOX:
            return FLAT_NAV_TAB_BAR_SLOT.INBOX;
        case NAVIGATION_TABS.SEARCH:
            return activeFlatNavSectionID ? FLAT_NAV_TAB_BAR_SLOT_BY_SECTION[activeFlatNavSectionID] : FLAT_NAV_TAB_BAR_SLOT.EXPENSES;
        case NAVIGATION_TABS.INSIGHTS:
        case NAVIGATION_TABS.WORKSPACES:
            return FLAT_NAV_TAB_BAR_SLOT.MORE;
        default:
            return undefined;
    }
}

export default getFlatNavTabBarSlot;
