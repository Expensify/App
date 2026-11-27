/** The icon of a More menu entry, which the menu and the More item of the flat nav bar both draw. */
import type {ExpensifyIconName} from '@components/Icon/ExpensifyIconLoader';

import {FLAT_NAV_SECTION_DEFINITIONS} from '@libs/Navigation/FlatNav/FlatNavUtils';

import type {MoreMenuItemID} from './MORE_MENU';

import MORE_MENU from './MORE_MENU';

/** An entry that opens a flat nav section takes the icon of its section. */
function getMoreMenuItemIconName(itemID: MoreMenuItemID): ExpensifyIconName | undefined {
    switch (itemID) {
        case MORE_MENU.ITEM.INSIGHTS:
        case MORE_MENU.ITEM.WORKSPACES:
            return MORE_MENU.PAGE_ICON_NAMES[itemID];
        default:
            return FLAT_NAV_SECTION_DEFINITIONS.find((definition) => definition.id === itemID)?.iconName;
    }
}

export default getMoreMenuItemIconName;
