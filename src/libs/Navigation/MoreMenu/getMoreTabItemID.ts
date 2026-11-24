/**
 * The More menu entry the More item of the flat nav tab bar shows while the user is on that entry's page, so the bar tells
 * where they are. It is derived from where the user is rather than from the last entry picked, so leaving for another tab or going
 * back resets the item without any state of its own.
 */
import type {FlatNavSectionID} from '@libs/Navigation/FlatNav/types';
import type FlatNavTabBarFocus from '@libs/Navigation/FlatNavTabBar/FlatNavTabBarFocus';

import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

import type {MoreMenuItemID, MoreMenuSectionItemID} from './MORE_MENU';

import MORE_MENU from './MORE_MENU';

function isMoreMenuSectionItemID(sectionID: FlatNavSectionID | undefined): sectionID is MoreMenuSectionItemID {
    return MORE_MENU.SECTION_ITEMS.some((itemID) => itemID === sectionID);
}

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
            return isMoreMenuSectionItemID(activeFlatNavSectionID) ? activeFlatNavSectionID : undefined;
        default:
            return undefined;
    }
}

export default getMoreTabItemID;
