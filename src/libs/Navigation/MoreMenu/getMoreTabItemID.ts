/**
 * The More menu entry the More item of the flat nav tab bar shows while the user is on that entry's page, so the bar tells
 * where they are. It is derived from where the user is rather than from the last entry picked, so leaving for another tab or going
 * back resets the item without any state of its own.
 */
import FLAT_NAV from '@libs/Navigation/FlatNav/FLAT_NAV';
import type FlatNavTabBarFocus from '@libs/Navigation/FlatNavTabBar/FlatNavTabBarFocus';

import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

import type {MoreMenuItemID} from './MORE_MENU';

import MORE_MENU from './MORE_MENU';

/**
 * Returns undefined when the More item is not highlighted. The section is taken from the focus as given, so a search in
 * a section the More menu does not list, such as Accounting opened from a shared link, still shows that section.
 */
function getMoreTabItemID({focusedTabRouteName, activeFlatNavSectionID}: FlatNavTabBarFocus): MoreMenuItemID | undefined {
    switch (focusedTabRouteName) {
        case SCREENS.INSIGHTS:
            return MORE_MENU.ITEM.INSIGHTS;
        case NAVIGATORS.WORKSPACE_NAVIGATOR:
            return MORE_MENU.ITEM.WORKSPACES;
        case NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR:
            return activeFlatNavSectionID === FLAT_NAV.SECTION.ACCOUNTING || activeFlatNavSectionID === FLAT_NAV.SECTION.SAVED ? activeFlatNavSectionID : undefined;
        default:
            return undefined;
    }
}

export default getMoreTabItemID;
